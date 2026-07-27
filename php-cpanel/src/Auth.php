<?php
declare(strict_types=1);

final class Auth
{
    public static function attempt(array $config, string $username, string $password): bool
    {
        $expectedUser = mb_strtolower(trim((string)(
            $config['security']['admin_user']
            ?? $config['security']['admin_email']
            ?? ''
        )));
        $hash = (string)($config['security']['admin_password_hash'] ?? '');
        if (mb_strtolower(trim($username)) !== $expectedUser || !password_verify($password, $hash)) {
            return false;
        }
        session_regenerate_id(true);
        $_SESSION['admin'] = ['username' => $expectedUser, 'logged_at' => time()];
        return true;
    }

    public static function check(): bool
    {
        return isset($_SESSION['admin']['username']) || isset($_SESSION['admin']['email']);
    }

    public static function requireApi(): void
    {
        if (!self::check()) {
            json_response(['error' => 'Tu sesión expiró. Inicia sesión nuevamente.'], 401);
        }
        if (!hash_equals($_SESSION['csrf'] ?? '', request_header('X-CSRF-Token'))) {
            json_response(['error' => 'La sesión de seguridad no es válida. Recarga la página.'], 419);
        }
    }

    public static function csrf(): string
    {
        if (empty($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(24));
        }
        return $_SESSION['csrf'];
    }

    public static function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], '', true, true);
        }
        session_destroy();
    }
}
