<?php
/**
 * Headless WordPress Static Exporter for GitHub Pages Deployment (Model B)
 */

if (!defined('ABSPATH')) {
    exit;
}

class Noody_Static_Exporter {

    public static function export_all_pages($output_dir) {
        if (!file_exists($output_dir)) {
            wp_mkdir_p($output_dir);
        }

        $routes = [
            'index.html'          => '/',
            'islands.html'        => '/islands/',
            'services.html'       => '/services/',
            'products.html'       => '/products/',
            'gallery.html'        => '/gallery/',
            'about.html'          => '/about/',
            'feedback.html'       => '/feedback/',
            'support.html'        => '/support/',
            'terms.html'          => '/terms/',
            'privacy.html'        => '/privacy/',
            'cancellation.html'   => '/cancellation/',
            'contact.html'        => '/contact/',
            'vendor-register.html'=> '/vendor-register/',
            'admin-status.html'   => '/admin-status/',
        ];

        $results = [];
        foreach ($routes as $file => $path) {
            $url = home_url($path);
            $response = wp_remote_get($url, ['timeout' => 15]);
            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                $html = wp_remote_retrieve_body($response);
                file_put_contents($output_dir . '/' . $file, $html);
                $results[$file] = 'OK';
            } else {
                $results[$file] = 'FAILED';
            }
        }

        return $results;
    }
}
