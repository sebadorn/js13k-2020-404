'use strict';


{

class Character extends js13k.LevelObject {


	/**
	 *
	 * @constructor
	 * @param {number} x
	 * @param {number} y
	 */
	constructor( x, y ) {
		super( x, y, 6 * 3, 8 * 3 );

		this.size = 3;
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
		const s = this.size;
		const s2 = s + s;
		const s3 = s2 + s;
		const s5 = s3 + s2;
		const s6 = s3 + s3;

		// torso/head
		ctx.fillStyle = '#df7126';
		ctx.fillRect( this.x, this.y, s6, s6 );

		// facing left
		if( this.dirX < 0 ) {
			// legs
			ctx.fillRect( this.x + s5, this.y + s6, s, s2 );
			ctx.fillRect( this.x + s2, this.y + s6, s, s2 );
			// eye
			ctx.fillStyle = '#fff';
			ctx.fillRect( this.x + s, this.y + s, s2, s2 );
		}
		// facing right
		else {
			// legs
			ctx.fillRect( this.x, this.y + s6, s, s2 );
			ctx.fillRect( this.x + s3, this.y + s6, s, s2 );
			// eye
			ctx.fillStyle = '#fff';
			ctx.fillRect( this.x + s3, this.y + s, s2, s2 );
		}
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
