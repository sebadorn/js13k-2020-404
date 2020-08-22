'use strict';


{

class Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		// Objects have physic and/or can be interacted with.
		this.objects = [];

		// Items have to be drawn behind objects and have physics.
		this.items = [];

		// Purely optical, no interaction.
		this.scenery = [];

		this.timer = 0;
	}


	/**
	 * Collision detection.
	 *
	 * There is a bit of a story here. Luckily, this is old code I could reuse.
	 * I once started writing a JavaScript 2D game. Figuring out good collision
	 * detection was a lot of work and not that easy. The game – at least in its
	 * JavaScript-based state – is abandonded/canceled.
	 * But now I found a use for part of it! \o/
	 *
	 * @param {object} subject
	 * @param {number} subject.h
	 * @param {number} subject.w
	 * @param {number} subject.x
	 * @param {number} subject.y
	 * @param {object} nextPos
	 * @param {number} nextPos.x
	 * @param {number} nextPos.y
	 */
	collisionDetection( subject, nextPos ) {
		// current position
		const p0 = {
			x: subject.x,
			y: subject.y
		};

		// position after moving
		const q0 = {
			x: nextPos.x,
			y: nextPos.y
		};

		const setTo = {
			x: q0.x,
			y: q0.y
		};

		// The sidepoints of the rectangular area
		// that would be covered by the movement.
		let sXStart = Math.min( p0.x, q0.x );
		let sXEnd = Math.max( p0.x, q0.x ) + subject.w;
		let sYStart = Math.min( p0.y, q0.y );
		let sYEnd = Math.max( p0.y, q0.y ) + subject.h;

		const sXEndPreMove = p0.x + subject.w;
		const sYEndPreMove = p0.y + subject.h;

		// Start off with the current block situation.
		// A block connection may not be found again
		// for the next frame, because of a perfect alignment.
		// But it is still the direct neighbour.
		const blocks = subject.blocks;

		// Iterate all objects.
		for( let i = 0; i < this.allPhysical.length; i++ ) {
			const o = this.allPhysical[i];

			if( o === subject || !o.collision ) {
				continue;
			}

			let tXStart = o.x;
			let tXEnd = tXStart + o.w;
			let tYStart = o.y;
			let tYEnd = tYStart + o.h;

			const collisionAbove = ( tYEnd > sYStart && tYEnd < sYEnd );
			const collisionBelow = ( tYStart > sYStart && tYStart < sYEnd );

			// Check for collision: Y axis.
			if( collisionAbove || collisionBelow ) {
				if(
					( tXStart < sXEndPreMove && tXEnd >= sXEndPreMove ) ||
					( tXStart <= p0.x && tXEnd > p0.x ) ||
					( tXStart >= p0.x && tXEnd <= sXEndPreMove )
				) {
					if( collisionBelow ) {
						if( p0.y < setTo.y ) {
							blocks.bottom = o;
							setTo.y = tYStart - subject.h;
						}
					}
					else if( p0.y > setTo.y ) {
						blocks.top = o;
						setTo.y = tYEnd;
					}

					q0.y = setTo.y;
					sYStart = Math.min( p0.y, q0.y );
					sYEnd = Math.max( p0.y, q0.y ) + subject.h;
				}
			}

			let collisionLeft = ( tXEnd > sXStart && tXEnd < sXEnd );
			let collisionRight = ( tXStart > sXStart && tXStart < sXEnd );

			// Check for collision: X axis.
			if( collisionLeft || collisionRight ) {
				if(
					( tYStart < sYEndPreMove && tYEnd >= sYEndPreMove ) ||
					( tYStart <= p0.y && tYEnd > p0.y ) ||
					( tYStart >= p0.y && tYEnd <= sYEndPreMove )
				) {
					if( collisionRight ) {
						if( p0.x < setTo.x ) {
							blocks.right = o;
							setTo.x = tXStart - subject.w;
						}
					}
					else if( p0.x > setTo.x ) {
						blocks.left = o;
						setTo.x = tXEnd;
					}

					q0.x = setTo.x;
					sXStart = Math.min( p0.x, q0.x );
					sXEnd = Math.max( p0.x, q0.x ) + subject.w;
				}
			}
		}


		// Check again if the subject is still touching the
		// found blocks after all position corrections are done.

		if( blocks.bottom ) {
			const bottom = blocks.bottom;
			const gap = bottom.y - setTo.y - subject.h;

			if( Math.abs( gap ) >= 1 ) {
				blocks.bottom = null;
			}
		}

		if( blocks.top ) {
			const top = blocks.top;
			const gap = top.y + top.h - setTo.y;

			if( Math.abs( gap ) >= 1 ) {
				blocks.top = null;
			}
		}

		if( blocks.left ) {
			const left = blocks.left;
			const gap = left.x + left.w - setTo.x;

			if( Math.abs( gap ) >= 1 ) {
				blocks.left = null;
			}
		}

		if( blocks.right ) {
			const right = blocks.right;
			const gap = right.x - setTo.x - subject.w;

			if( Math.abs( gap ) >= 1 ) {
				blocks.right = null;
			}
		}

		subject.x = setTo.x;
		subject.y = setTo.y;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2d} ctx
	 */
	draw( ctx ) {
		this.objects.forEach( o => o.draw( ctx ) );
		this.items.forEach( o => o.draw( ctx ) );

		if( this.player ) {
			this.player.draw( ctx );
		}

		this.scenery.forEach( o => o.draw( ctx ) );
	}


	/**
	 *
	 * @param {object} dir
	 * @param {number} dir.x
	 * @param {number} dir.y
	 */
	throwItem( dir ) {
		const item = new js13k.Item( this.player.x, this.player.y, 40, 14 );
		item.color = '#F90';

		if( dir.x === 0 && dir.y === 0 ) {
			dir.x = this.player.dirX || 1;
		}

		item.velocityX += dir.x * 20;
		item.velocityY += dir.y * 20;

		this.items.push( item );
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;
		this.allPhysical = this.objects.concat( this.items );

		this.objects.forEach( o => o.update( dt ) );

		this.items.forEach( o => {
			o.update( dt );

			if( !o.isStuck ) {
				this.collisionDetection( o, o.nextPos );

				if( o.blocks.bottom || o.blocks.top || o.blocks.left || o.blocks.right ) {
					o.isStuck = true;
				}
			}
		} );

		this.scenery.forEach( o => o.update( dt ) );

		if( this.player ) {
			const dir = js13k.Input.getDirections();

			this.collisionDetection( this.player, this.player.nextPos );
			this.player.isGrounded = !!this.player.blocks.bottom;

			if(
				!this.player.isGrounded &&
				( this.player.blocks.left || this.player.blocks.right )
			) {
				this.player.isOnWall = this.timer;

				this.player.velocityX = 0;
				this.player.velocityY = 0;
			}

			if( js13k.Input.isPressedKey( 'Space', true ) ) {
				this.player.jump();
			}

			if( js13k.Input.isPressedKey( 'Enter', true ) ) {
				this.throwItem( dir );
			}

			this.player.update( dt, dir );
		}
	}


}


js13k.Level = Level;

}
