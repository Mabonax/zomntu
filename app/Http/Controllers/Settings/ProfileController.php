<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\WorkOS\Http\Requests\AuthKitAccountDeletionRequest;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->update(['name' => $request->name]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    public function destroy(AuthKitAccountDeletionRequest $request): SymfonyRedirectResponse
    {
        $user = $request->user();

        abort_if(
            $user instanceof User && $user->isAdministrator(),
            422,
            'Administrator accounts cannot be deleted through self-service.',
        );

        return $request->delete(
            using: fn (User $account) => $account->delete(),
        );
    }
}
