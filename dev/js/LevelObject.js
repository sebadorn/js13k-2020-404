'use strict';


{

class LevelObject {


	/**
	 *
	 * @constructor
	 * @param {?number}  x
	 * @param {?number}  y
	 * @param {?number}  w
	 * @param {?number}  h
	 * @param {?boolean} movable
	 */
	constructor( x, y, w, h, movable ) {
		this.color = '#999';

		this.x = x || 0;
		this.y = y || 0;
		this.w = w || 0;
		this.h = h || 0;

		this.dirX = 0;
		this.dirY = 0;

		this.collision = true;

		// Unmovable objects do not need to be checked for
		// collision detection against other objects.
		// Only movable objects not position corrections
		// based on collision detection.
		this.movable = !!movable;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2d} ctx
	 */
	draw( ctx ) {
		ctx.fillStyle = this.color;
		ctx.fillRect( this.x, this.y, this.w, this.h );
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		//
	}


}


js13k.LevelObject = LevelObject;

}
