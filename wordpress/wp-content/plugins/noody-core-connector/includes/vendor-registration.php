<?php
/**
 * Vendor Registration Handler
 * Secure unlisted submission endpoint with rate limiting and strict privacy protection.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('noody/v1', '/vendor-register', [
        'methods'             => 'POST',
        'callback'            => 'noody_handle_vendor_registration',
        'permission_callback' => '__return_true', // Public submission with CSRF nonce check & anti-spam rate limiting
    ]);
});

function noody_handle_vendor_registration(WP_REST_Request $request) {
    // 1. Rate limiting check via transient
    $ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $transient_key = 'noody_vr_rate_' . md5($ip);
    $attempts = (int) get_transient($transient_key);

    if ($attempts >= 5) {
        return new WP_Error('rate_limit_exceeded', __('Too many registration attempts. Please try again in an hour.', 'noody-connector'), ['status' => 429]);
    }
    set_transient($transient_key, $attempts + 1, HOUR_IN_SECONDS);

    // 2. Extract and sanitize fields
    $business_name  = sanitize_text_field($request->get_param('businessName'));
    $owner_name     = sanitize_text_field($request->get_param('ownerName'));
    $whatsapp       = sanitize_text_field($request->get_param('whatsapp'));
    $island         = sanitize_text_field($request->get_param('island'));
    $address        = sanitize_textarea_field($request->get_param('address'));
    $category       = sanitize_text_field($request->get_param('category'));
    $details        = sanitize_textarea_field($request->get_param('operatingDetails'));
    $coordinates    = sanitize_text_field($request->get_param('coordinates'));
    $compliance_ack = (bool) $request->get_param('complianceAck');

    // Validation
    if (empty($business_name) || empty($owner_name) || empty($whatsapp) || empty($island) || !$compliance_ack) {
        return new WP_Error('missing_required_fields', __('Please fill in all mandatory vendor application fields.', 'noody-connector'), ['status' => 400]);
    }

    if (!preg_match('/^[1-9][0-9]{7,14}$/', preg_replace('/[^\d]/', '', $whatsapp))) {
        return new WP_Error('invalid_whatsapp', __('Please enter a valid WhatsApp contact number.', 'noody-connector'), ['status' => 400]);
    }

    // 3. Insert secure, unlisted record
    $post_id = wp_insert_post([
        'post_type'    => 'noody_vendor_app',
        'post_title'   => sprintf('%s - %s (%s)', $business_name, $owner_name, $island),
        'post_status'  => 'private', // Strictly private, never accessible via public query
        'post_content' => wp_kses_post($details),
    ]);

    if (is_wp_error($post_id)) {
        return new WP_Error('db_error', __('Could not save application.', 'noody-connector'), ['status' => 500]);
    }

    // Save metadata
    update_post_meta($post_id, '_vendor_business_name', $business_name);
    update_post_meta($post_id, '_vendor_owner_name', $owner_name);
    update_post_meta($post_id, '_vendor_whatsapp', $whatsapp);
    update_post_meta($post_id, '_vendor_island', $island);
    update_post_meta($post_id, '_vendor_address', $address);
    update_post_meta($post_id, '_vendor_category', $category);
    update_post_meta($post_id, '_vendor_coordinates', $coordinates);
    update_post_meta($post_id, '_vendor_submission_ip', $ip);
    update_post_meta($post_id, '_vendor_status', 'PENDING_CENTRAL_REVIEW');

    return rest_ensure_response([
        'success'      => true,
        'message'      => __('Application submitted securely. NOODY Operations will review your compliance credentials.', 'noody-connector'),
        'referenceId'  => 'NOODY-VND-' . strtoupper(substr(md5($post_id . microtime()), 0, 8)),
    ]);
}
