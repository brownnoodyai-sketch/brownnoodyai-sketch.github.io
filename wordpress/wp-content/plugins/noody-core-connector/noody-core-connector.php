<?php
/**
 * Plugin Name: NOODY.AI Core Connector
 * Plugin URI: https://brownnoodyai-sketch.github.io/
 * Description: Secure connectivity layer between WordPress and the authoritative NOODY Core API, PostgreSQL backend, and Meta WhatsApp Business API.
 * Version: 1.0.0
 * Author: NOODY.AI Platform Architecture
 * Author URI: https://noody.ai/
 * License: Proprietary
 * Text Domain: noody-connector
 */

if (!defined('ABSPATH')) {
    exit;
}

define('NOODY_CONNECTOR_VERSION', '1.0.0');
define('NOODY_CONNECTOR_PATH', plugin_dir_path(__FILE__));
define('NOODY_CONNECTOR_URL', plugin_dir_url(__FILE__));

// Load includes
require_once NOODY_CONNECTOR_PATH . 'includes/cpt-definitions.php';
require_once NOODY_CONNECTOR_PATH . 'includes/api-client.php';
require_once NOODY_CONNECTOR_PATH . 'includes/vendor-registration.php';
require_once NOODY_CONNECTOR_PATH . 'includes/feedback-moderation.php';
require_once NOODY_CONNECTOR_PATH . 'includes/static-exporter.php';

/**
 * Initialize Plugin Settings
 */
function noody_connector_admin_menu() {
    add_menu_page(
        __('NOODY Core Sync', 'noody-connector'),
        __('NOODY Core', 'noody-connector'),
        'manage_options',
        'noody-settings',
        'noody_connector_render_admin_page',
        'dashicons-cloud',
        30
    );
}
add_action('admin_menu', 'noody_connector_admin_menu');

function noody_connector_register_settings() {
    register_setting('noody_settings_group', 'noody_api_origin', [
        'type' => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default' => 'https://noody-ai-production.up.railway.app'
    ]);
    register_setting('noody_settings_group', 'noody_whatsapp_number', [
        'type' => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default' => '919446944562'
    ]);
    register_setting('noody_settings_group', 'noody_active_phase_island', [
        'type' => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default' => 'AGATTI'
    ]);
}
add_action('admin_init', 'noody_connector_register_settings');

function noody_connector_render_admin_page() {
    $api_origin = get_option('noody_api_origin', 'https://noody-ai-production.up.railway.app');
    $whatsapp = get_option('noody_whatsapp_number', '919446944562');
    $phase = get_option('noody_active_phase_island', 'AGATTI');
    ?>
    <div class="wrap">
        <h1><?php _e('NOODY.AI Core API & WhatsApp Operations', 'noody-connector'); ?></h1>
        <p><?php _e('WordPress serves as the visual and content presentation layer. NOODY Core remains the authoritative business system.', 'noody-connector'); ?></p>
        <form method="post" action="options.php">
            <?php settings_fields('noody_settings_group'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><?php _e('NOODY Core API Origin', 'noody-connector'); ?></th>
                    <td>
                        <input type="url" name="noody_api_origin" value="<?php echo esc_attr($api_origin); ?>" class="regular-text" />
                        <p class="description"><?php _e('Default: https://noody-ai-production.up.railway.app', 'noody-connector'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php _e('Meta WhatsApp Operations Number', 'noody-connector'); ?></th>
                    <td>
                        <input type="text" name="noody_whatsapp_number" value="<?php echo esc_attr($whatsapp); ?>" class="regular-text" />
                        <p class="description"><?php _e('Include country code without + (e.g., 919446944562)', 'noody-connector'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php _e('Phase 1 Active Island', 'noody-connector'); ?></th>
                    <td>
                        <select name="noody_active_phase_island">
                            <option value="AGATTI" <?php selected($phase, 'AGATTI'); ?>>Agatti (Phase 1 Live)</option>
                            <option value="KADMAT" <?php selected($phase, 'KADMAT'); ?>>Kadmat (Preview)</option>
                            <option value="KAVARATTI" <?php selected($phase, 'KAVARATTI'); ?>>Kavaratti (Preview)</option>
                            <option value="KALPENI" <?php selected($phase, 'KALPENI'); ?>>Kalpeni (Preview)</option>
                        </select>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
