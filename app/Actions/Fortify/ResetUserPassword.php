<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\ResetsUserPasswords;

class ResetUserPassword implements ResetsUserPasswords
{
    use PasswordValidationRules;

    /**
     * Validate and reset the user's forgotten password.
     *
     * @param  array<string, string>  $input
     */
    public function reset(User $user, array $input): void
    {
        Validator::make($input, [
            'password' => $this->passwordRules(),
        ])->after(function ($validator) use ($user, $input) {
            // Prevent reusing the current password
            if (isset($input['password']) && is_string($input['password']) && Hash::check($input['password'], (string) $user->password)) {
                $validator->errors()->add('password', __('The new password must be different from your current password.'));
            }
        })->validate();

        $user->forceFill([
            'password' => $input['password'],
        ])->save();
    }
}
