<?php
/**
 * Customer Feedback & Moderation Endpoint
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    // 1. Submit Feedback
    register_rest_route('noody/v1', '/feedback', [
        'methods'             => 'POST',
        'callback'            => 'noody_submit_feedback',
        'permission_callback' => '__return_true',
    ]);

    // 2. Query Approved Public Reviews
    register_rest_route('noody/v1', '/reviews', [
        'methods'             => 'GET',
        'callback'            => 'noody_get_approved_reviews',
        'permission_callback' => '__return_true',
    ]);
});

function noody_submit_feedback(WP_REST_Request $request) {
    $first_name = sanitize_text_field($request->get_param('firstName'));
    $stars      = (int) $request->get_param('stars');
    $comment    = sanitize_textarea_field($request->get_param('comment'));
    $used_on    = sanitize_text_field($request->get_param('usedOn'));
    $consent    = (bool) $request->get_param('consent');
    $item_id    = sanitize_text_field($request->get_param('itemId'));
    $item_kind  = sanitize_text_field($request->get_param('itemKind'));
    $island     = sanitize_text_field($request->get_param('island'));

    if (empty($first_name) || $stars < 1 || $stars > 5 || empty($comment) || !$consent) {
        return new WP_Error('invalid_submission', __('Please provide your name, valid star rating, review text, and publication consent.', 'noody-connector'), ['status' => 400]);
    }

    $post_id = wp_insert_post([
        'post_type'    => 'noody_feedback',
        'post_title'   => sprintf('%s - %d Stars (%s)', $first_name, $stars, $island),
        'post_status'  => 'draft', // Draft until approved by NOODY Moderator
        'post_content' => wp_kses_post($comment),
    ]);

    if (is_wp_error($post_id)) {
        return new WP_Error('db_error', __('Could not save review.', 'noody-connector'), ['status' => 500]);
    }

    update_post_meta($post_id, '_feedback_first_name', $first_name);
    update_post_meta($post_id, '_feedback_stars', $stars);
    update_post_meta($post_id, '_feedback_used_on', $used_on);
    update_post_meta($post_id, '_feedback_item_id', $item_id);
    update_post_meta($post_id, '_feedback_item_kind', $item_kind);
    update_post_meta($post_id, '_feedback_island', $island);
    update_post_meta($post_id, '_feedback_verified_customer', false);
    update_post_meta($post_id, '_feedback_moderated', false);

    return rest_ensure_response([
        'success' => true,
        'message' => __('Thank you. Your feedback has been received for review. Only approved feedback appears publicly.', 'noody-connector'),
    ]);
}

function noody_get_approved_reviews(WP_REST_Request $request) {
    $island    = sanitize_text_field($request->get_param('island') ?: 'AGATTI');
    $item_id   = sanitize_text_field($request->get_param('itemId'));
    $item_kind = sanitize_text_field($request->get_param('itemKind'));

    $meta_query = [
        ['key' => '_feedback_moderated', 'value' => true],
    ];

    if ($island) {
        $meta_query[] = ['key' => '_feedback_island', 'value' => $island];
    }
    if ($item_id) {
        $meta_query[] = ['key' => '_feedback_item_id', 'value' => $item_id];
    }

    $posts = get_posts([
        'post_type'      => 'noody_feedback',
        'post_status'    => 'publish',
        'posts_per_page' => 20,
        'meta_query'     => $meta_query,
    ]);

    $reviews = [];
    $total_stars = 0;

    foreach ($posts as $p) {
        $stars = (int) get_post_meta($p->ID, '_feedback_stars', true);
        $total_stars += $stars;
        $reviews[] = [
            'id'               => (string) $p->ID,
            'firstName'        => get_post_meta($p->ID, '_feedback_first_name', true),
            'stars'            => $stars,
            'comment'          => $p->post_content,
            'usedOn'           => get_post_meta($p->ID, '_feedback_used_on', true),
            'verifiedCustomer' => (bool) get_post_meta($p->ID, '_feedback_verified_customer', true),
            'submittedAt'      => $p->post_date_gmt,
        ];
    }

    $count = count($reviews);
    $average = $count > 0 ? round($total_stars / $count, 1) : null;

    return rest_ensure_response([
        'rating' => [
            'count'   => $count,
            'average' => $average,
            'source'  => 'VERIFIED_ORDER_REVIEWS',
        ],
        'reviews' => $reviews,
    ]);
}
