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

		// this.goal = null;
		// this.player = null;

		// Level states:
		// 0 - In play. (Pausing is handled outside in Renderer.)
		// 1 - Finished with success.
		// 2 - Finished with game over.
		//
		// this.state = 0;
	}


	/**
	 * Check if player has reached the goal.
	 */
	checkGoal() {
		if( !this.goal || this.state > 0 ) {
			return;
		}

		const goal = {
			x: this.goal[0],
			y: this.goal[1],
			w: this.goal[2],
			h: this.goal[3]
		};

		if(
			this.player.x > goal.x &&
			this.player.x + this.player.w < goal.x + goal.w &&
			js13k.overlap( this.player, goal )
		) {
			this.state = 1;
		}
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
							blocks.b = o;
							setTo.y = tYStart - subject.h;
						}
					}
					else if( p0.y > setTo.y ) {
						blocks.t = o;
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
							blocks.r = o;
							setTo.x = tXStart - subject.w;
						}
					}
					else if( p0.x > setTo.x ) {
						blocks.l = o;
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

		if( blocks.b ) {
			const bottom = blocks.b;
			const gap = bottom.y - setTo.y - subject.h;

			if(
				Math.abs( gap ) >= 1 ||
				( bottom.x > setTo.x + subject.w ) ||
				( setTo.x > bottom.x + bottom.w )
			) {
				blocks.b = null;
			}
		}

		if( blocks.t ) {
			const top = blocks.t;
			const gap = top.y + top.h - setTo.y;

			if(
				Math.abs( gap ) >= 1 ||
				( top.x > setTo.x + subject.w ) ||
				( setTo.x > top.x + top.w )
			) {
				blocks.t = null;
			}
		}

		if( blocks.l ) {
			const left = blocks.l;
			const gap = left.x + left.w - setTo.x;

			if(
				Math.abs( gap ) >= 1 ||
				( left.y > setTo.y + subject.h ) ||
				( setTo.y > left.y + left.h )
			) {
				blocks.l = null;
			}
		}

		if( blocks.r ) {
			const right = blocks.r;
			const gap = right.x - setTo.x - subject.w;

			if(
				Math.abs( gap ) >= 1 ||
				( right.y > setTo.y + subject.h ) ||
				( setTo.y > right.y + right.h )
			) {
				blocks.r = null;
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
		const width = js13k.Renderer.cnv.width;
		const height = js13k.Renderer.cnv.height;

		// Center x axis on player.
		const halfWidth = Math.round( width / 2 );
		const offsetX = Math.min( 0, halfWidth - this.player.x );

		ctx.setTransform( 1, 0, 0, 1, offsetX, 0 );

		// Background image.
		ctx.drawImage( js13k.Renderer.sprite, 0, 0, 32, 16, 0, 0, width, height );

		this.scenery.forEach( o => o.draw( ctx ) );
		this.objects.forEach( o => o.draw( ctx ) );
		this.items.forEach( o => o.draw( ctx ) );

		if( this.player ) {
			this.player.draw( ctx );
		}

		this.drawGoal( ctx );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2d} ctx
	 */
	drawGoal( ctx ) {
		if( this.goal ) {
			ctx.fillStyle = '#8BBADCA0';
			ctx.fillRect( ...this.goal );
		}
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

		if( this.state > 0 ) {
			return;
		}

		this.allPhysical = this.objects.concat( this.items );

		this.objects.forEach( o => o.update( dt ) );

		this.items.forEach( o => {
			o.update( dt );

			if( !o.isStuck ) {
				this.collisionDetection( o, o.nextPos );

				if( o.blocks.b || o.blocks.t || o.blocks.l || o.blocks.r ) {
					o.isStuck = true;
				}
			}
		} );

		this.scenery.forEach( o => o.update( dt ) );

		const dir = js13k.Input.getDirections();
		this.collisionDetection( this.player, this.player.nextPos );

		if( js13k.Input.isPressedKey( 'Enter', true ) ) {
			this.throwItem( dir );
		}

		this.player.update( dt, dir );

		if( this.player.y > 999 ) {
			this.state = 2;
		}

		this.checkGoal();
	}


}


js13k.Level = Level;

}
