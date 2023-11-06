<?php

/*
  Plugin Name: Loan Simulator
  Description: Loan simulator plugin.
  Version: 1.0
  Author: Paul
  Author URI: https://www.udemy.com/user/bradschiff/
*/

if( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class LoanSimulator {
  function __construct() {
    add_action('init', array($this, 'adminAssets'));
  }

  function adminAssets() {
    // wp_register_style('quizeditcss', plugin_dir_url(__FILE__) . 'build/index.css');
    // wp_register_script('ournewblocktype', plugin_dir_url(__FILE__) . 'build/index.js', array('wp-blocks', 'wp-element', 'wp-editor'));
    // register_block_type('ourplugin/are-you-paying-attention', array(
    //     'editor_script' => 'ournewblocktype',
    //     'editor_style' => 'quizeditcss',
    //     'render_callback' => array($this, 'theHTML')
    // ));
    register_block_type(__DIR__, array(
        'render_callback' => array($this, 'theHTML')
    ));
  }

  function theHTML($attributes) {
    if (!is_admin()) {
        wp_enqueue_script('d3-scripts', 'https://d3js.org/d3.v5.min.js');
        wp_enqueue_script('jquery-scripts', 'https://code.jquery.com/jquery-3.5.0.min.js');
        wp_enqueue_script('jquery-ui-scripts', 'https://code.jquery.com/ui/1.13.2/jquery-ui.min.js');
        wp_enqueue_style('jquery-ui-style', '//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css');
        wp_enqueue_script('account-scripts', plugin_dir_url(__FILE__) . 'build/account.js');
        wp_enqueue_script('investment-scripts', plugin_dir_url(__FILE__) . 'build/investment.js');
        wp_enqueue_script('loan-scripts', plugin_dir_url(__FILE__) . 'build/loan.js');
        wp_enqueue_script('utils-scripts', plugin_dir_url(__FILE__) . 'build/utils.js');
        wp_enqueue_script('loanSimulatorFrontend', plugin_dir_url(__FILE__) . 'build/frontend.js', array('wp-element'), '1.0', true);
        //wp_enqueue_style('attentionFrontendStyle', plugin_dir_url(__FILE__) . 'build/frontend.css');
        
    }
    ob_start(); ?>
    <div class="loan-simulator-update-me"><pre style="display: none"><?php echo wp_json_encode($attributes) ?></pre></div>
    <?php return ob_get_clean();
  }
}

$loanSimulator = new LoanSimulator();