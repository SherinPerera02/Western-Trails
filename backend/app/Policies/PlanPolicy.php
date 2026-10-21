<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VisitPlan;
use Illuminate\Auth\Access\Response;

class PlanPolicy
{
    /**
     * Determine whether the user can view the plan.
     */
    public function view(User $user, VisitPlan $plan): Response
    {
        return $user->id === $plan->user_id
            ? Response::allow()
            : Response::denyWithStatus(404, 'Visit plan not found.');
    }

    /**
     * Determine whether the user can update the plan.
     */
    public function update(User $user, VisitPlan $plan): Response
    {
        return $user->id === $plan->user_id
            ? Response::allow()
            : Response::denyWithStatus(404, 'Visit plan not found.');
    }

    /**
     * Determine whether the user can delete the plan.
     */
    public function delete(User $user, VisitPlan $plan): Response
    {
        return $user->id === $plan->user_id
            ? Response::allow()
            : Response::denyWithStatus(404, 'Visit plan not found.');
    }
}
