'use strict';


{

class LevelObject {


	/**
	 *
	 * @constructor
	 * @param {?number} x
	 * @param {?number} y
	 * @param {?number} w
	 * @param {?number} h
	 */
	constructor( x, y, w, h ) {
		this.color = '#999';

		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.dirX = 0;
		this.dirY = 0;

		this.velocityX = 0;
		this.velocityY = 0;

		this.blocks = {};
		this.collision = true;
		this.nextPos = { x, y };
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
		// pass
	}


}


js13k.LevelObject = LevelObject;

}
