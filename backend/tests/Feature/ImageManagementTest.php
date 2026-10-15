<?php

namespace Tests\Feature;

use App\Models\Attraction;
use App\Models\AttractionImage;
use App\Models\Category;
use App\Models\User;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $tourist;
    private Attraction $place;
    private string $validPngBytes;
    private FilesystemAdapter $storage;

    protected function setUp(): void
    {
        parent::setUp();

        $this->storage = Storage::fake('public');

        $this->admin = User::factory()->create([
            'role'   => 'admin',
            'status' => 'active',
        ]);

        $this->tourist = User::factory()->create([
            'role'   => 'tourist',
            'status' => 'active',
        ]);

        $category = Category::factory()->create(['status' => 'active']);

        $this->place = Attraction::factory()->create([
            'status' => 'active',
        ]);
        $this->place->categories()->attach($category->id);

        // Real 1x1 PNG bytes (valid binary image that does not require GD extension)
        $this->validPngBytes = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }

    private function createRealUploadedFile(string $content, string $clientName, string $clientMime): UploadedFile
    {
        $tempPath = tempnam(sys_get_temp_dir(), 'wt_test_');
        file_put_contents($tempPath, $content);

        return new UploadedFile($tempPath, $clientName, $clientMime, null, true);
    }

    public function test_valid_image_uploads_successfully(): void
    {
        $image = $this->createRealUploadedFile($this->validPngBytes, 'coastal_sunset.png', 'image/png');

        $response = $this->actingAs($this->admin)->postJson("/api/admin/places/{$this->place->id}/images", [
            'images'   => [$image],
            'captions' => ['Stunning coastal sunset'],
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.0.caption', 'Stunning coastal sunset');
        $this->assertNotNull($response->json('data.0.url'));
        $this->assertStringStartsWith('http', $response->json('data.0.url'));

        // Database row created
        $dbImage = AttractionImage::where('attraction_id', $this->place->id)->first();
        $this->assertNotNull($dbImage);
        $this->assertStringStartsWith("places/{$this->place->id}/", $dbImage->image_path);

        // File exists on public storage
        $this->storage->assertExists($dbImage->image_path);
    }

    public function test_non_image_file_renamed_to_jpg_is_rejected(): void
    {
        // 1. PHP script disguised with .jpg extension
        $fakePhpScript = $this->createRealUploadedFile("<?php phpinfo(); ?>", 'malicious.jpg', 'image/jpeg');

        $responsePhp = $this->actingAs($this->admin)->postJson("/api/admin/places/{$this->place->id}/images", [
            'images' => [$fakePhpScript],
        ]);

        $responsePhp->assertStatus(422);
        $responsePhp->assertJsonValidationErrors(['images.0']);

        // 2. Binary executable disguised with .jpg extension
        $fakeExe = $this->createRealUploadedFile("MZ\x90\x00\x03\x00\x00\x00This program cannot be run in DOS mode.", 'trojan.jpg', 'image/jpeg');

        $responseExe = $this->actingAs($this->admin)->postJson("/api/admin/places/{$this->place->id}/images", [
            'images' => [$fakeExe],
        ]);

        $responseExe->assertStatus(422);
        $responseExe->assertJsonValidationErrors(['images.0']);
    }

    public function test_oversized_file_rejected(): void
    {
        // 2.5 MB file exceeds the 2 MB limit (2048 KB)
        $largeContent = str_repeat('A', (int) (2.5 * 1024 * 1024));
        $largeImage = $this->createRealUploadedFile($largeContent, 'large_photo.png', 'image/png');

        $response = $this->actingAs($this->admin)->postJson("/api/admin/places/{$this->place->id}/images", [
            'images' => [$largeImage],
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['images.0']);
    }

    public function test_delete_removes_file_and_db_record(): void
    {
        $imagePath = "places/{$this->place->id}/test_image.jpg";
        $this->storage->put($imagePath, 'dummy-image-bytes');

        $image = AttractionImage::factory()->create([
            'attraction_id' => $this->place->id,
            'image_path'    => $imagePath,
            'caption'       => 'To be deleted',
        ]);

        $this->storage->assertExists($imagePath);

        $response = $this->actingAs($this->admin)->deleteJson("/api/admin/places/{$this->place->id}/images/{$image->id}");

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Image deleted successfully.']);

        // DB record removed
        $this->assertDatabaseMissing('attraction_images', ['id' => $image->id]);

        // File deleted from storage
        $this->storage->assertMissing($imagePath);
    }

    public function test_tourist_and_guest_cannot_manage_images(): void
    {
        $image = AttractionImage::factory()->create([
            'attraction_id' => $this->place->id,
        ]);

        // Guest rejected with 401
        $this->postJson("/api/admin/places/{$this->place->id}/images", [])->assertStatus(401);
        $this->deleteJson("/api/admin/places/{$this->place->id}/images/{$image->id}")->assertStatus(401);

        // Tourist rejected with 403
        $this->actingAs($this->tourist)->postJson("/api/admin/places/{$this->place->id}/images", [])->assertStatus(403);
        $this->actingAs($this->tourist)->deleteJson("/api/admin/places/{$this->place->id}/images/{$image->id}")->assertStatus(403);
    }
}
