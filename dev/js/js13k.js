'use strict';


/**
 * @namespace js13k
 */
const js13k = {


	GRAVITY: 1,
	MAX_VELOCITY_Y: 12,


	/**
	 *
	 */
	init() {
		js13k.Input.init();

		js13k.Renderer.init( () => {
			js13k.Renderer.changeLevel( new js13k.Level.Intro() );
			js13k.Renderer.mainLoop();
		} );
	},


	/**
	 * Check if two axis-aligned bounding boxes overlap.
	 * @param  {object} a   - An axis-aligned bounding box.
	 * @param  {number} a.h - Height.
	 * @param  {number} a.w - Width.
	 * @param  {number} a.x - Position on X axis.
	 * @param  {number} a.y - Position on Y axis.
	 * @param  {object} b   - An axis-aligned bounding box.
	 * @param  {number} b.h - Height.
	 * @param  {number} b.w - Width.
	 * @param  {number} b.x - Position on X axis.
	 * @param  {number} b.y - Position on Y axis.
	 * @return {boolean}
	 */
	overlapAABB( a, b ) {
		let overlapX = Math.min( a.x + a.w, b.x + b.w ) - Math.max( a.x, b.x );
		overlapX = ( overlapX < 0 ) ? 0 : overlapX;

		let overlapY = Math.min( a.y + a.h, b.y + b.h ) - Math.max( a.y, b.y );
		overlapY = ( overlapY < 0 ) ? 0 : overlapY;

		return ( overlapX * overlapY > 0 );
	}


};


window.addEventListener( 'load', () => js13k.init() );
