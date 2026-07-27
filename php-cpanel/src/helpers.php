<?php
declare(strict_types=1);

function e(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_input(): array
{
    $input = json_decode((string)file_get_contents('php://input'), true);
    return is_array($input) ? $input : [];
}

function request_header(string $name): string
{
    $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    return trim((string)($_SERVER[$key] ?? ''));
}

function uid(string $prefix = ''): string
{
    return $prefix . bin2hex(random_bytes(12));
}

function slugify(string $value): string
{
    $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
    $slug = strtolower((string)preg_replace('/[^a-zA-Z0-9]+/', '-', $ascii));
    return trim($slug, '-') ?: uid('item-');
}

function money(int|float|string|null $cents): string
{
    return '$' . number_format(((float)$cents) / 100, 2, '.', ',');
}

function setting(PDO $db, string $key, array $fallback = []): array
{
    $stmt = $db->prepare('SELECT value_json FROM site_settings WHERE `key`=?');
    $stmt->execute([$key]);
    $decoded = json_decode((string)($stmt->fetchColumn() ?: '{}'), true);
    return is_array($decoded) ? array_replace($fallback, $decoded) : $fallback;
}

function redirect(string $url): never
{
    header('Location: ' . $url, true, 302);
    exit;
}
