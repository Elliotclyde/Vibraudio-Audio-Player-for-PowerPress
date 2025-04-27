<?php

/*
Plugin Name: Vibraudio Audio Player for PowerPress
Plugin URI: https://github.com/Elliotclyde/Vibraudio-Audio-Player-for-PowerPress
Description: A vibrant audio embed addon for the Powerpress plugin.
Version: 1.0.0
License: GPLv2 or later 
Author: Hugh Haworth
Author URI: https://elliotclyde.nz
Requires at least: 3.6
Tested up to: 6.8
Text Domain: vibraudio 
Change Log:

Contributors:
Hugh Haworth
*/

function create_vibraudio_audio_player($episodeTitle, $audioUrl,$imageUrl,$postUrl) {
    // This function creates a vibraudio audio player from the given URL
    // You can use any audio player library or custom code here
    // For example, using HTML5 audio tag:HTML CSS JSResult Skip Results Iframe
return '<div class="vibraudio-audio-player-container" style="--bg-image: url(' . esc_url($imageUrl) . ');">
  <audio src="'  . esc_url($audioUrl) . '" preload="metadata" loop></audio>
  <img class="cover-image" src="' . esc_url($imageUrl) . '" alt="Cover Image">
  <div class="controls-wrapper"> 
  <button title="play" class="play-icon">
    <svg class="play-svg" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke-width="0" stroke="currentColor" class="size-6">
  <path stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
</svg>
<svg class="pause-svg" style="display:none;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="4.5" stroke="currentColor" class="size-6">
  <path stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
</svg>
  </button>
  <div class="episode-title">' . esc_html($episodeTitle) . '</div>
  <input type="range" class="seek-slider" max="100" value="0">
  <div class="skip-container">
    <button title="skip-back" class="skip-back-icon">
        <div>30</div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
    </button>
    <button title="skip-forward" class="skip-forward-icon">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
    </svg>
    <div>30</div>
    </button>
  </div>
  <div class="time-container">
    <span class="current-time" class="time">0:00</span> |
    <span class="duration" class="time">0:00</span>
  </div>
  </div>
  <button title="share" class="share-icon" data-url="' . esc_url($postUrl) . '" data-title="' . esc_html($episodeTitle) . '">
<svg data-url="' . esc_url($postUrl) . '" data-title="' .  esc_html($episodeTitle) . '"  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
</svg>

  </button>
</div>';
}

function add_audio_player($the_content) {
    $PowerPressSettings = get_option('powerpress_general', array());
	$FeedSettings = get_option('powerpress_feed', array() );
    $vibraudioAudioPlayerSettings = get_option('vibraudio_audioplayer_settings', array());
    if($vibraudioAudioPlayerSettings['player_on'] == 0) {
        return $the_content; // Player is off, return content as is
    }
    // get ID of current post
    global $post;
    $post_id = $post->ID;
    // get url of audio file
    
    $url = get_url($post_id, 0, true); // get first media file
    
                            if (isset($EpisodeData['image']) && $EpisodeData['image'] != '')
                                $image = $EpisodeData['image'];


    $imageUrl="http://example.com/image.jpg"; // Default image URL if not set
    $episodeImageUrl = get_powerpress_episode_image($post_id);
    if ($episodeImageUrl) {
        $imageUrl = $episodeImageUrl; // Use the episode image URL if available
    } else {
        if(isset($FeedSettings['itunes_image']) && !empty($FeedSettings['itunes_image'])) {
            $imageUrl = $FeedSettings['itunes_image'];
        }
    }                            
    if($url == "") {
         return $the_content; // No audio file found, return content as is
    }

    switch( $PowerPressSettings['display_player'] )
    {
        case 1: { // Below posts
            return $the_content . create_vibraudio_audio_player($post->post_title, $url,$imageUrl,  get_permalink($post_id)) ;
        }; break;
        case 2: { // Above posts
            return  create_vibraudio_audio_player($post->post_title, $url,$imageUrl, get_permalink($post_id)) . $the_content ;
        }; break;
    }
    return $the_content; 
}

function getPpPostMeta($post_id, $key)
{
    $pp_meta_cache = wp_cache_get($post_id, 'post_meta');
    if ( !$pp_meta_cache ) {
        update_postmeta_cache($post_id);
        $pp_meta_cache = wp_cache_get($post_id, 'post_meta');
    }

    $meta = false;
    if ( isset($pp_meta_cache[$key]) )
        $meta = $pp_meta_cache[$key][0];

    if ( is_serialized( $meta ) )
    {
        if ( false !== ( $gm = @unserialize( $meta ) ) )
            return $meta;
    }

    return $meta;
}

function get_url($post_id, $mediaNum = 0, $include_premium = false) {

    $MetaData= getPpPostMeta($post_id, 'enclosure');
    if( $MetaData)
    {
            $MetaParts = explode("\n", $MetaData, 4);
            return trim($MetaParts[0]); 
    }
    return '';

}
function get_powerpress_episode_image($post_id) {
    $MetaData= getPpPostMeta($post_id, 'enclosure');
    if( $MetaData)
    {
        $MetaParts = explode("\n", $MetaData, 4);
        $Serialized = $MetaParts[3];
        if( $Serialized )
        {
            $ExtraData = @unserialize($Serialized);
            if( $ExtraData && isset($ExtraData['itunes_image']) )
                return $ExtraData['itunes_image'];
        }
    }
    return null;
}

add_filter('the_content', 'add_audio_player');

function enqueue_audio_player_scripts() {
    // Only load on the front-end, not in admin
    if ( ! is_admin() ) {
        $plugin_url = plugin_dir_url(__FILE__);
        wp_enqueue_style('vibraudio-audio-style', $plugin_url . '/styles.css', array(),'1.0', 'all');
        wp_enqueue_script('vibraudio-audio-scripts-vibrant', $plugin_url . 'vibrant.js', array(),'1.0', true);
        wp_enqueue_script('vibraudio-audio-scripts', $plugin_url . '/scripts.js', array(),'1.0', true);
    }
}
add_action( 'wp_enqueue_scripts', 'enqueue_audio_player_scripts' );

function vibraudio_options_page_html() {

    // Handle form submission
    if ( isset( $_POST['submit'] ) && isset($_REQUEST['_wpnonce'] )) {
        $nonce = wp_unslash($_REQUEST['_wpnonce']);
        if ( ! wp_verify_nonce($nonce ) ){
	        die( __( 'Security check', 'textdomain' ) ); 
            return; // Nonce check failed, do not process the form
        }
        check_admin_referer();
        $vibraudioAudioPlayerSettings = array(
            'player_on' => isset( $_POST['player_on'] ) ? 1 : 0,
        );
        update_option( 'vibraudio_audioplayer_settings', $vibraudioAudioPlayerSettings );

        // Show success message
        add_settings_error( 'vibraudio_audioplayer_messages', 'vibraudio_audioplayer_message', __( 'Settings Saved', 'textdomain' ), 'updated' );
    }

    // Get current settings safely
    $settings = get_option( 'vibraudio_audioplayer_settings', array() );
    $player_on = isset( $settings['player_on'] ) ? $settings['player_on'] : 0;

    // Display errors/success messages
    settings_errors( 'vibraudio_audioplayer_messages' );
    ?>
	<div class="wrap">
		<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
		<form  method="post">
        <?php wp_nonce_field(); ?>
        <!-- Adds option for player_on -->
         <label for="player-on">Activate Player</label><br />
            <input id="player-on" type="checkbox" name="player_on" value="1" <?php checked( get_option('vibraudio_audioplayer_settings')['player_on'], 1 ); ?> />

			<?php
			submit_button( __( 'Save Settings', 'textdomain' ) );
			?>
		</form>
	</div>
    <?php

}

function audio_options_page()
{
    add_options_page(
	'Vibraudio Options',
        'Vibraudio', 
        'manage_options',
        'vibraudio_options',
        'vibraudio_options_page_html',
	);
}
 add_action('admin_menu', 'audio_options_page');