<?php
/**
 * NOODY.AI Oceanic Theme Functions
 *
 * @package NOODY_Oceanic
 */

if (!defined('ABSPATH')) {
    exit;
}

define('NOODY_THEME_VERSION', '1.0.0');

/**
 * Setup theme defaults and registers support for various WordPress features.
 */
function noody_oceanic_setup() {
    add_theme_support('wp-block-styles');
    add_theme_support('editor-styles');
    add_editor_style('style.css');
    add_editor_style('assets/css/noody-animations.css');
    add_theme_support('responsive-embeds');
    add_theme_support('align-wide');
    add_theme_support('custom-line-height');
    add_theme_support('custom-spacing');
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');

    // Register Navigation Menus
    register_nav_menus([
        'primary' => __('Primary Navigation', 'noody-oceanic'),
        'footer'  => __('Footer Navigation', 'noody-oceanic'),
        'legal'   => __('Legal & Policies Menu', 'noody-oceanic'),
    ]);
}
add_action('after_setup_theme', 'noody_oceanic_setup');

/**
 * Enqueue theme scripts and styles.
 */
function noody_oceanic_enqueue_scripts() {
    wp_enqueue_style(
        'noody-google-fonts',
        'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..800;1,9..40,400..800&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap',
        [],
        null
    );

    wp_enqueue_style(
        'noody-animations',
        get_template_directory_uri() . '/assets/css/noody-animations.css',
        [],
        NOODY_THEME_VERSION
    );

    wp_enqueue_script(
        'noody-runtime',
        get_template_directory_uri() . '/assets/js/noody-runtime.js',
        [],
        NOODY_THEME_VERSION,
        true
    );

    // Pass configuration variables to JavaScript
    wp_localize_script('noody-runtime', 'noodyConfig', [
        'whatsappNumber' => get_option('noody_whatsapp_number', '919446944562'),
        'apiOrigin'      => get_option('noody_api_origin', 'https://noody-ai-production.up.railway.app'),
        'defaultIsland'  => 'AGATTI',
        'restUrl'        => esc_url_raw(rest_url('noody/v1')),
        'nonce'          => wp_create_nonce('wp_rest'),
    ]);
}
add_action('wp_enqueue_scripts', 'noody_oceanic_enqueue_scripts');

/**
 * Register Custom Block Pattern Categories
 */
function noody_oceanic_register_pattern_categories() {
    $categories = [
        'noody-hero'     => ['label' => __('NOODY: Hero & Ocean Banners', 'noody-oceanic')],
        'noody-islands'  => ['label' => __('NOODY: Island Explorers', 'noody-oceanic')],
        'noody-services' => ['label' => __('NOODY: Water Sports & Services', 'noody-oceanic')],
        'noody-products' => ['label' => __('NOODY: Local Island Products', 'noody-oceanic')],
        'noody-feedback' => ['label' => __('NOODY: Verified Customer Feedback', 'noody-oceanic')],
        'noody-cta'      => ['label' => __('NOODY: Meta WhatsApp Actions', 'noody-oceanic')],
    ];

    foreach ($categories as $slug => $args) {
        register_block_pattern_category($slug, $args);
    }
}
add_action('init', 'noody_oceanic_register_pattern_categories');

/**
 * Register Post Types if plugin is not active as fallback
 */
function noody_oceanic_register_cpts() {
    if (post_type_exists('island')) {
        return;
    }

    // Islands
    register_post_type('island', [
        'labels' => [
            'name'          => __('Islands', 'noody-oceanic'),
            'singular_name' => __('Island', 'noody-oceanic'),
            'add_new_item'  => __('Add New Island', 'noody-oceanic'),
        ],
        'public'       => true,
        'has_archive'  => true,
        'show_in_rest' => true,
        'menu_icon'    => 'dashicons-palmtree',
        'supports'     => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        'rewrite'      => ['slug' => 'islands'],
    ]);

    // Services
    register_post_type('service', [
        'labels' => [
            'name'          => __('Services', 'noody-oceanic'),
            'singular_name' => __('Service', 'noody-oceanic'),
            'add_new_item'  => __('Add New Service', 'noody-oceanic'),
        ],
        'public'       => true,
        'has_archive'  => true,
        'show_in_rest' => true,
        'menu_icon'    => 'dashicons-tickets-alt',
        'supports'     => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        'rewrite'      => ['slug' => 'services'],
    ]);

    // Products
    register_post_type('product', [
        'labels' => [
            'name'          => __('Products', 'noody-oceanic'),
            'singular_name' => __('Product', 'noody-oceanic'),
            'add_new_item'  => __('Add New Product', 'noody-oceanic'),
        ],
        'public'       => true,
        'has_archive'  => true,
        'show_in_rest' => true,
        'menu_icon'    => 'dashicons-cart',
        'supports'     => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        'rewrite'      => ['slug' => 'products'],
    ]);
}
add_action('init', 'noody_oceanic_register_cpts');
