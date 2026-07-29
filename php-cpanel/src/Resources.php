<?php
declare(strict_types=1);

final class Resources
{
    private const MAP = [
        'products' => [
            'table' => 'products', 'label' => 'Productos', 'singular' => 'producto',
            'order' => 'updated_at DESC',
            'fields' => ['sku','name','slug','category_id','short_description','description','price_cents','compare_at_cents','stock','image_url','gallery_json','technical_sheet_url','benefits_json','uses','whatsapp_message','is_active','is_featured'],
        ],
        'categories' => [
            'table' => 'categories', 'label' => 'Categorías', 'singular' => 'categoría',
            'order' => 'sort_order,name',
            'fields' => ['name','slug','description','image_url','sort_order','is_active'],
        ],
        'pages' => [
            'table' => 'pages', 'label' => 'Páginas', 'singular' => 'página',
            'order' => 'title', 'fields' => ['slug','title','status','seo_title','seo_description'],
        ],
        'content' => [
            'table' => 'content_blocks', 'label' => 'Contenido', 'singular' => 'bloque',
            'order' => 'page_id,sort_order',
            'fields' => ['page_id','block_key','type','title','body','config_json','sort_order','is_active'],
        ],
        'slides' => [
            'table' => 'carousel_slides', 'label' => 'Carruseles', 'singular' => 'diapositiva',
            'order' => 'sort_order',
            'fields' => ['name','eyebrow','title','body','image_url','image_url_mobile','button_label','button_url','sort_order','is_active'],
        ],
        'faqs' => [
            'table' => 'faqs', 'label' => 'Preguntas frecuentes', 'singular' => 'pregunta',
            'order' => 'sort_order', 'fields' => ['question','answer','sort_order','is_active'],
        ],
        'branches' => [
            'table' => 'branches', 'label' => 'Sucursales', 'singular' => 'sucursal',
            'order' => 'name',
            'fields' => ['name','address','city','state','postal_code','phone','whatsapp','map_url','schedule','is_pickup_enabled','is_active'],
        ],
        'orders' => [
            'table' => 'orders', 'label' => 'Pedidos', 'singular' => 'pedido',
            'order' => 'created_at DESC', 'fields' => ['status','payment_status','notes'],
        ],
        'settings' => [
            'table' => 'site_settings', 'label' => 'Configuración', 'singular' => 'ajuste',
            'order' => '`key`', 'fields' => ['value_json'], 'primary' => 'key',
        ],
        'media' => [
            'table' => 'media', 'label' => 'Multimedia', 'singular' => 'archivo',
            'order' => 'created_at DESC', 'fields' => ['alt_text'],
        ],
    ];

    public static function get(string $name): ?array
    {
        return self::MAP[$name] ?? null;
    }

    public static function publicMap(): array
    {
        return array_map(static fn(array $resource) => [
            'label' => $resource['label'],
            'singular' => $resource['singular'],
            'fields' => $resource['fields'],
        ], self::MAP);
    }
}
