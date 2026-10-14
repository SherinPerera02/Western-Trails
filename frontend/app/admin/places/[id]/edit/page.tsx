"use client";

import { useParams } from "next/navigation";
import PlaceForm from "@/components/admin/PlaceForm";

export default function EditPlacePage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
        Missing place identifier.
      </div>
    );
  }

  return <PlaceForm mode="edit" placeId={id} />;
}
