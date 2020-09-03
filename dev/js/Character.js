'use strict';


{

class Character extends js13k.LevelObject {


	/**
	 *
	 * @constructor
	 * @param {number} x
	 * @param {number} y
	 * @param {number} size
	 */
	constructor( x, y, size ) {
		super( x, y, 6 * size, 8 * size );

		this.size = size;
		this.speed = 12;

		this.eyeBlink = 0;
		this.frameX = 0;

		// These attributes exist, but are set in or after the collision
		// detection. Commenting it out here to save some bytes.
		//
		// this.isOnGround = false;
		// this.isOnWall = false;
		// this.isWalking = false;
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

		// Slight up-and-down bopping of
		// the torse/head for breathing.
		let yBop = 0;

		if( this.isOnGround && !this.isOnWall ) {
			yBop = Math.round( ( Math.sin( this.progress * 0.05 ) + 1 ) * s * 0.1 );
		}

		let faceToLeft = this.dirX < 0;

		if( this.isOnWall ) {
			faceToLeft = !!this.blocks.r;
		}

		// Decide if to draw the eye.
		let drawEye = true;
		const eyeOffsetY = this.dirY > 0 ? s : 0;
		const eyeOffsetX = faceToLeft ? s : s3;
		const diff = this.progress - this.eyeBlink;

		// Blinking (do not draw the eye).
		if( diff < 0.1 * js13k.TARGET_FPS ) {
			drawEye = false;
		}
		// Cooldown until next blink.
		else if( diff >= 6 * js13k.TARGET_FPS ) {
			this.eyeBlink = this.progress;
		}

		// torso/head
		ctx.fillStyle = '#df7126';
		ctx.fillRect( this.x, this.y + yBop, s6, s6 );

		// facing left
		if( faceToLeft ) {
			// legs
			if( this.isWalking ) {
				if( ~~this.frameX % 2 ) {
					// left leg
					ctx.fillRect( this.x + s5, this.y + s6, s, s2 );
					// right leg
					ctx.fillRect( this.x + s2, this.y + s6, s, s );
				}
				else {
					// left leg
					ctx.fillRect( this.x + s5, this.y + s6, s, s );
					// right leg
					ctx.fillRect( this.x + s2, this.y + s6, s, s2 );
				}
			}
			else {
				// left leg
				ctx.fillRect( this.x + s5, this.y + s6, s, s2 );
				// right leg
				ctx.fillRect( this.x + s2, this.y + s6, s, s2 );
			}
		}
		// facing right
		else {
			// legs
			if( this.isWalking ) {
				if( ~~this.frameX % 2 ) {
					// left leg
					ctx.fillRect( this.x, this.y + s6, s, s );
					// right leg
					ctx.fillRect( this.x + s3, this.y + s6, s, s2 );
				}
				else {
					// left leg
					ctx.fillRect( this.x, this.y + s6, s, s2 );
					// right leg
					ctx.fillRect( this.x + s3, this.y + s6, s, s );
				}
			}
			else {
				// left leg
				ctx.fillRect( this.x, this.y + s6, s, s2 );
				// right leg
				ctx.fillRect( this.x + s3, this.y + s6, s, s2 );
			}
		}

		// eye
		if( drawEye ) {
			ctx.fillStyle = '#fff';
			ctx.fillRect( this.x + eyeOffsetX, this.y + s + eyeOffsetY + yBop, s2, s2 );
		}
	}


	/**
	 *
	 */
	jump() {
		if( this.isOnGround || this.isOnWall ) {
			if( this.isOnWall ) {
				if( this.blocks.l ) {
					this.velocityX -= js13k.JUMP_VELOCITY;
				}
				else if( this.blocks.r ) {
					this.velocityX += js13k.JUMP_VELOCITY;
				}
			}

			this.velocityY = js13k.JUMP_VELOCITY;
			this.isOnGround = false;
			this.isOnWall = 0;
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
		super.update( dt );

		this.dirY = 0;

		if( typeof dir.y === 'number' && dir.y !== 0 ) {
			this.dirY = dir.y < 0 ? -1 : 1;
		}

		this.isOnGround = !!this.blocks.b;
		this.isWalking = false;

		if(
			!this.isOnGround &&
			( this.blocks.l || this.blocks.r )
		) {
			if( !this.isOnWall ) {
				this.isOnWall = this.progress;
				this.velocityX = 0;
				this.velocityY = 0;
			}
		}
		else {
			this.isOnWall = 0;
		}

		if( dir.x !== 0 ) {
			this.dirX = dir.x < 0 ? -1 : 1;
			this.frameX = this.frameX + dt * 0.2;

			if( this.isOnGround ) {
				this.isWalking = dir.x < 0 ? !this.blocks.l : !this.blocks.r;
			}
		}
		else {
			this.frameX = 0;
		}

		if( !this.isOnWall ) {
			this.velocityX = Math.round( dt * dir.x * this.speed );
		}

		if( !this.isOnGround && !this.isOnWall ) {
			this.velocityY = Math.min( Math.round( this.velocityY + dt * js13k.GRAVITY ), js13k.MAX_VELOCITY_Y );
		}

		if( js13k.Input.isPressedKey( 'Space', true ) ) {
			this.jump();
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
