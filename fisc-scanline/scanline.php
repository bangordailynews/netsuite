<?php

if( !function_exists( 'imagecreatetruecolor' ) || !function_exists( 'imagefilledrectangle' ) || !function_exists( 'imagettftext' ) || !function_exists( 'imagepng' ) )
	die( 'Need to have the GD and TrueType libraries enabled' );

class Bdn_Scanline {
	
	function __construct() {
		$this->headers();
		$this->image();
	}
	
	function headers() {
		header( 'Content-Type: image/png' );
		header( 'Expires: Sun, 01 Jan 2014 00:00:00 GMT', true );
		header( 'Cache-Control: no-store, no-cache, must-revalidate', true );
		header( 'Cache-Control: post-check=0, pre-check=0', FALSE );
		header( 'Pragma: no-cache', true );
	}
	
	function image() {
		
		$image = imagecreatetruecolor( 740, 37 );
		imagefilledrectangle( $image, 0, 0, 739, 36, imagecolorallocate( $image, 255, 255, 255 ) );
		imagettftext( $image, 26, 0, 0, 32, imagecolorallocate( $image, 0, 0, 0 ), 'ocraextended', $this->scanline() );
		imagepng( $image );
		imagedestroy( $image );
		
	}
	
	function scanline() {
		
		//preg_replace to get rid of any non-numeric characters (keep the periods for the money fields!)
		//number_format on the money fields to force two decimals, but set the thousand and decimal field to ''
		//str_pad to make each field always the same length
		$scanline = array(
			str_pad( preg_replace('/[^0-9]/','', ( !empty( $_GET[ 'account' ] ) ? $_GET[ 'account' ] : '' ) ), 7, '0', STR_PAD_LEFT ),
			str_pad( number_format( preg_replace('/[^0-9.]/','', ( !empty( $_GET[ 'amount1' ] ) ? $_GET[ 'amount1' ] : '' ) ), 2, '', '' ), 7, '0', STR_PAD_LEFT ),
			str_pad( number_format( preg_replace('/[^0-9.]/','', ( !empty( $_GET[ 'amount2' ] ) ? $_GET[ 'amount2' ] : '' ) ), 2, '', '' ), 7, '0', STR_PAD_LEFT ),
			str_pad( number_format( preg_replace('/[^0-9.]/','', ( !empty( $_GET[ 'amount3' ] ) ? $_GET[ 'amount3' ] : '' ) ), 2, '', '' ), 7, '0', STR_PAD_LEFT ),
			str_pad( preg_replace('/[^0-9]/','', ( !empty( $_GET[ 'extra' ] ) ? $_GET[ 'extra' ] : '' ) ), 7, '0', STR_PAD_LEFT ),
		);
		
		$scanline = implode( $scanline );
		
		$checksum = str_split( $scanline );
		
		foreach( $checksum as $key => $value ) {
			$checksum[ $key ] = $value * $this->get_weight();
		}
		
		$checksum = 10 - ( array_sum( str_split( implode( '', $checksum ) ) ) % 10 );
		
		if( $checksum == 10 )
			$checksum = 0;

		$scanline .= $checksum;
		
		return $scanline;
		
	}
	
	function get_weight() {
		static $w = 0;
		$weights = array( 2 , 1 );
	
		if( !isset( $weights[ $w ] ) )
			$w = 0;
	
		$weight = $weights[ $w ];
		$w++;
	
		return $weight;
	
	}
	
}
new Bdn_Scanline;
