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

		// Purely optical, no interaction.
		this.effects = [];
		this.scenery = [];

		this.limits = [0, Infinity];
		this.timer = 0;

		// this.checkPoint = null;
		// this.goal = null;
		// this.player = null;

		// Level states:
		// 0 - In play. (Pausing is handled outside in Renderer.)
		// 1 - Finished with success.
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

		if( js13k.overlap( this.player, goal ) ) {
			this.state = 1;
			this.onGoal();
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
		for( let i = 0; i < this.objects.length; i++ ) {
			const o = this.objects[i];

			if( o === subject || !o.collision || o.gone ) {
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
				bottom.gone ||
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
				top.gone ||
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
				left.gone ||
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
				right.gone ||
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
		const offsetX = Math.min( this.limits[0], Math.max( -this.limits[1], halfWidth - this.player.x ) );

		ctx.setTransform( 1, 0, 0, 1, offsetX, 0 );

		// Background image. Repeat as often as necessary to fill the screen.
		const tile = 752;
		const offsetTop = height - tile;
		const bgWidth = tile * 2;

		// Workaround: One more than needed, but it fixes
		// a bug where not enough background is drawn.
		let repeat = Math.ceil( width / bgWidth ) + 1;
		// This probably not quite right:
		const bgOffsetFactor = Math.floor( -offsetX / bgWidth );

		while( repeat-- >= 0 ) {
			ctx.drawImage(
				js13k.Renderer.sprite_m,
				// Part of the original image to use.
				0, 0, 32, 16,
				// Where and how big to paint it on the canvas.
				( bgOffsetFactor + repeat ) * bgWidth, offsetTop, bgWidth, tile
			);
		}

		this.scenery.forEach( o => this.drawIfVisible( ctx, -offsetX, width, o ) );
		this.objects.forEach( o => this.drawIfVisible( ctx, -offsetX, width, o ) );
		this.effects.forEach( o => this.drawIfVisible( ctx, -offsetX, width, o ) );

		if( this.player ) {
			this.player.draw( ctx );
		}

		this.drawGoal( ctx, -offsetX, width );

		ctx.setTransform( 1, 0, 0, 1, 0, 0 );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2d} ctx
	 * @param {number}                   areaX
	 * @param {number}                   areaWidth
	 */
	drawGoal( ctx, areaX, areaWidth ) {
		if( !this.goal ) {
			return;
		}

		const goalX = this.goal[0];
		const goalW = this.goal[2];

		if(
			goalX > areaX + areaWidth || // outside the viewport to the right
			goalX + goalW < areaX // outside the viewport to the left
		) {
			return;
		}

		ctx.fillStyle = '#8BBADCA0';
		ctx.fillRect( goalX, this.goal[1], goalW, this.goal[3] );
	}


	/**
	 * Draw an object only if it is inside the visible viewport area.
	 * @param {CanvasRenderingContext2d} ctx
	 * @param {number}                   areaX
	 * @param {number}                   areaWidth
	 * @param {js13k.LevelObject}        o
	 */
	drawIfVisible( ctx, areaX, areaWidth, o ) {
		if(
			o.x > areaX + areaWidth || // outside the viewport to the right
			o.xe < areaX // outside the viewport to the left
		) {
			return;
		}

		o.draw( ctx );
	}


	/**
	 * Reset the player to the last check point.
	 */
	resetToCheckPoint() {
		if( !this.checkPoint ) {
			return;
		}

		const block = this.checkPoint;
		const player = this.player;

		player.x = block.x + Math.round( block.w - player.w ) / 2;
		player.y = block.y - player.h - 1;

		player.nextPos.x = player.x;
		player.nextPos.y = player.y;

		player.velX = 0;
		player.velY = 0;

		// Reset platforms.
		this.objects.forEach( o => {
			o.crumbleProgress = 0;
			o.gone = false;
			o.isCrumbling = 0;
		} );

		this.effects = [];
	}


	/**
	 *
	 * @param {js13k.LevelObject} block
	 */
	setCheckPoint( block ) {
		if( !block || block.type !== 2 ) {
			return;
		}

		this.checkPoint = block;
	}


	/**
	 * Spawn a level effect.
	 * @param {number} type
	 * @param {*}      data
	 */
	spawnEffect( type, data ) {
		const effect = new js13k.LevelEffect( this, type, data );
		this.effects.push( effect );
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

		this.objects.forEach( o => o.update( dt ) );
		this.scenery.forEach( o => o.update( dt ) );
		this.effects.forEach( o => o.update( dt ) );

		const dir = js13k.Input.getDirections();
		this.player.update( dt, dir );

		if( this.player.nextPos.x <= this.limits[0] ) {
			this.player.nextPos.x = this.limits[0];
			this.player.isWalking = false;
		}

		this.collisionDetection( this.player, this.player.nextPos );

		// Player fell, reset to last checkpoint.
		if(
			this.player.y > js13k.MAX_CANVAS_HEIGHT + 100 ||
			this.player.isOnSpikes()
		) {
			this.resetToCheckPoint();
			return;
		}

		const blocks = this.player.blocks;

		if( this.player.isOnGround && blocks.b ) {
			this.setCheckPoint( blocks.b );
			blocks.b.crumble();
		}

		if( this.player.isOnWall ) {
			blocks.l && blocks.l.crumble();
			blocks.r && blocks.r.crumble();
		}

		this.checkGoal();
	}


}


js13k.Level = Level;

}
