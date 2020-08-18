'use strict';


{

class Character {


	/**
	 *
	 * @constructor
	 * @param {?number} x
	 * @param {?number} y
	 * @param {?number} w
	 * @param {?number} h
	 */
	constructor( x, y, w, h ) {
		this.dirX = 0;
		this.dirY = 0;
		this.progress = 0;
		this.speed = 16;
		this.velocityX = 0;
		this.velocityY = 0;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.nextPos = {}; // x, y will be set in update().

		// These attributes exist, but are set in or after the collision
		// detection. Commenting it out here to save some bytes.
		//
		// this.blocks = {};
		// this.isGrounded = false;
		// this.isOnWall = false;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		ctx.fillStyle = '#FF0000';
		ctx.fillRect( this.x, this.y, this.w, this.h );
	}


	/**
	 *
	 * @param {number} dt
	 * @param {object} dir
	 * @param {number} dir.x
	 * @param {number} dir.y
	 */
	update( dt, dir ) {
		this.progress += dt;
		this.dirY = 0;

		if( typeof dir.y === 'number' && dir.y !== 0 ) {
			this.dirY = ( dir.y < 0 ) ? -1 : 1;

			if( this.isGrounded ) {
				this.velocityY += dt * dir.y * 40;
				this.isGrounded = false;
			}
		}

		if( dir.x !== 0 ) {
			this.dirX = ( dir.x < 0 ) ? -1 : 1;
		}

		if( this.isGrounded ) {
			this.velocityY = 0;
		}
		else {
			this.velocityY = Math.min( Math.round( this.velocityY + dt * js13k.GRAVITY ), js13k.MAX_VELOCITY_Y );
		}

		// Do not set the position just yet. We need the current and
		// projected next position for collision detection. The collision
		// detection will then set the correct position.
		this.nextPos.x = this.x + Math.round( dt * dir.x * this.speed );
		this.nextPos.y = this.y + this.velocityY;
	}


}


js13k.Character = Character;

}
