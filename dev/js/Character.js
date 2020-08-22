'use strict';


{

class Character extends js13k.LevelObject {


	/**
	 *
	 * @constructor
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	constructor( x, y, w, h ) {
		super( x, y, w, h );

		this.color = '#F00';
		this.speed = 16;

		// These attributes exist, but are set in or after the collision
		// detection. Commenting it out here to save some bytes.
		//
		// this.isGrounded = false;
		// this.isOnWall = false;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		super.draw( ctx );
		// TODO:
	}


	/**
	 *
	 */
	jump() {
		if( this.isGrounded || this.isOnWall ) {
			this.velocityY -= 30;
			this.isGrounded = false;
			this.isOnWall = 0;

			if( this.isOnWall ) {
				if( this.blocks.left ) {
					this.velocityX += 30;
				}
				else if( this.blocks.right ) {
					this.velocityX -= 30;
				}
			}
		}
	}


	/**
	 *
	 * @param {number} dt
	 * @param {object} dir
	 * @param {number} dir.x
	 * @param {number} dir.y
	 */
	update( dt, dir ) {
		this.dirY = 0;

		if( typeof dir.y === 'number' && dir.y !== 0 ) {
			this.dirY = dir.y < 0 ? -1 : 1;
		}

		if( dir.x !== 0 ) {
			this.dirX = dir.x < 0 ? -1 : 1;
		}

		if( !this.isOnWall ) {
			this.velocityX = Math.round( dt * dir.x * this.speed );
		}

		if( !this.isGrounded && !this.isOnWall ) {
			this.velocityY = Math.min( Math.round( this.velocityY + dt * js13k.GRAVITY ), js13k.MAX_VELOCITY_Y );
		}

		// Do not set the position just yet. We need the current and
		// projected next position for collision detection. The collision
		// detection will then set the correct position.
		this.nextPos.x = this.x + this.velocityX;
		this.nextPos.y = this.y + this.velocityY;
	}


}


js13k.Character = Character;

}
