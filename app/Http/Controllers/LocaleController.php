<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    /**
     * Update the application locale.
     */
    public function update(Request $request, string $locale): RedirectResponse
    {
        if (! array_key_exists($locale, SetLocale::AVAILABLE_LOCALES)) {
            abort(400, 'Invalid locale');
        }

        return redirect()
            ->back()
            ->withCookie(cookie()->forever('locale', $locale));
    }
}
