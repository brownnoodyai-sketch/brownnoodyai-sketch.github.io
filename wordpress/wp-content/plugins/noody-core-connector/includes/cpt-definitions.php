<?php
/**
 * Custom Post Types & Taxonomies for NOODY.AI
 */

if (!defined('ABSPATH')) {
    exit;
}

function noody_register_custom_post_types() {
    // 1. Islands CPT
    register_post_type('island', [
        'labels' => [
            'name'               => __('Islands', 'noody-connector'),
            'singular_name'      => __('Island', 'noody-connector'),
            'menu_name'          => __('Islands', 'noody-connector'),
            'add_new'            => __('Add Island', 'noody-connector'),
            'edit_item'          => __('Edit Island', 'noody-connector'),
        ],
        'public'             => true,
        'has_archive'        => true,
        'show_in_rest'       => true,
        'rest_base'          => 'islands',
        'menu_icon'          => 'dashicons-palmtree',
        'supports'           => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        'rewrite'            => ['slug' => 'islands'],
    ]);

    // 2. Services CPT
    register_post_type('service', [
        'labels' => [
            'name'               => __('Services & Water Sports', 'noody-connector'),
            'singular_name'      => __('Service', 'noody-connector'),
            'menu_name'          => __('Services', 'noody-connector'),
            'add_new'            => __('Add Service', 'noody-connector'),
            'edit_item'          => __('Edit Service', 'noody-connector'),
        ],
        'public'             => true,
        'has_archive'        => true,
        'show_in_rest'       => true,
        'rest_base'          => 'services',
        'menu_icon'          => 'dashicons-tickets-alt',
        'supports'           => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        'rewrite'            => ['slug' => 'services'],
    ]);

    // Service Categories
    register_taxonomy('service_category', ['service'], [
        'labels' => [
            'name'          => __('Service Categories', 'noody-connector'),
            'singular_name' => __('Service Category', 'noody-connector'),
        ],
        'hierarchical'      => true,
        'show_in_rest'      => true,
        'rewrite'           => ['slug' => 'service-category'],
    ]);

    // 3. Products CPT
    register_post_type('product', [
        'labels' => [
            'name'               => __('Local Island Products', 'noody-connector'),
            'singular_name'      => __('Product', 'noody-connector'),
            'menu_name'          => __('Products', 'noody-connector'),
            'add_new'            => __('Add Product', 'noody-connector'),
            'edit_item'          => __('Edit Product', 'noody-connector'),
        ],
        'public'             => true,
        'has_archive'        => true,
        'show_in_rest'       => true,
        'rest_base'          => 'products',
        'menu_icon'          => 'dashicons-cart',
        'supports'           => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        'rewrite'            => ['slug' => 'products'],
    ]);

    // Product Categories
    register_taxonomy('product_category', ['product'], [
        'labels' => [
            'name'          => __('Product Categories', 'noody-connector'),
            'singular_name' => __('Product Category', 'noody-connector'),
        ],
        'hierarchical'      => true,
        'show_in_rest'      => true,
        'rewrite'           => ['slug' => 'product-category'],
    ]);

    // 4. Feedback & Reviews CPT
    register_post_type('noody_feedback', [
        'labels' => [
            'name'               => __('Customer Feedback', 'noody-connector'),
            'singular_name'      => __('Feedback', 'noody-connector'),
            'menu_name'          => __('Feedback & Reviews', 'noody-connector'),
        ],
        'public'             => false,
        'show_ui'            => true,
        'show_in_rest'       => true,
        'menu_icon'          => 'dashicons-star-filled',
        'supports'           => ['title', 'editor', 'custom-fields'],
    ]);

    // 5. Vendor Applications (Unlisted, Protected)
    register_post_type('noody_vendor_app', [
        'labels' => [
            'name'               => __('Vendor Applications', 'noody-connector'),
            'singular_name'      => __('Vendor Application', 'noody-connector'),
        ],
        'public'             => false,
        'show_ui'            => true,
        'show_in_rest'       => false,
        'menu_icon'          => 'dashicons-id-alt',
        'capabilities'       => [
            'read_post'          => 'manage_options',
            'edit_posts'         => 'manage_options',
            'delete_posts'       => 'manage_options',
        ],
        'supports'           => ['title', 'editor', 'custom-fields'],
    ]);
}
add_action('init', 'noody_register_custom_post_types');
