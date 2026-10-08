<?php
/**
 * NOODY Core API Client
 * Connects WordPress safely to NOODY Railway API.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Noody_API_Client {

    public static function get_api_origin() {
        return get_option('noody_api_origin', 'https://noody-ai-production.up.railway.app');
    }

    /**
     * Check Central Backend Health
     */
    public static function check_health() {
        $url = self::get_api_origin() . '/health';
        $response = wp_remote_get($url, [
            'timeout' => 8,
            'headers' => ['Accept' => 'application/json']
        ]);

        if (is_wp_error($response)) {
            return [
                'status' => 'offline',
                'error'  => $response->get_error_message()
            ];
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        return [
            'status'       => ($code === 200 && ($body['status'] ?? '') === 'ok') ? 'healthy' : 'degraded',
            'http_code'    => $code,
            'dependencies' => $body['dependencies'] ?? [],
            'timestamp'    => current_time('mysql'),
        ];
    }

    /**
     * Fetch Verified Public Reviews for a listing
     */
    public static function fetch_reviews($kind, $listing_id, $island = 'AGATTI') {
        $endpoint = sprintf(
            '%s/v1/public/reviews?kind=%s&id=%s&island=%s',
            self::get_api_origin(),
            urlencode($kind),
            urlencode($listing_id),
            urlencode($island)
        );

        $response = wp_remote_get($endpoint, [
            'timeout' => 8,
            'headers' => ['Accept' => 'application/json']
        ]);

        if (is_wp_error($response)) {
            return ['rating' => ['count' => 0, 'average' => null], 'reviews' => []];
        }

        $code = wp_remote_retrieve_response_code($response);
        if ($code === 200) {
            $data = json_decode(wp_remote_retrieve_body($response), true);
            return $data ?: ['rating' => ['count' => 0, 'average' => null], 'reviews' => []];
        }

        return ['rating' => ['count' => 0, 'average' => null], 'reviews' => []];
    }
}
