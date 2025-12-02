<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Available locales for the application.
     */
    public const AVAILABLE_LOCALES = [
        'en' => 'English',
        'vi' => 'Tiếng Việt',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->cookie('locale', config('app.locale'));

        if (array_key_exists($locale, self::AVAILABLE_LOCALES)) {
            App::setLocale($locale);
        }

        return $next($request);
    }
}
