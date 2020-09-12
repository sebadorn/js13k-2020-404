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

		this.limitsX = [0, Infinity];
		this.timer = 0;

		this.VIEWPORT_MAX_HEIGHT = js13k.MAX_CANVAS_HEIGHT;
		this.VIEWPORT_MAX_WIDTH = js13k.MAX_CANVAS_WIDTH;

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
		const offset = this.getViewportOffset( width, height );
		const offsetX = offset[0];
		const offsetY = offset[1];

		this.drawBackground( ctx, height, width, offsetX );

		ctx.setTransform( 1, 0, 0, 1, offsetX, offsetY );

		this.scenery.forEach( o => this.drawIfVisible( ctx, -offsetX, width, -offsetY, height, o ) );
		this.objects.forEach( o => this.drawIfVisible( ctx, -offsetX, width, -offsetY, height, o ) );
		this.effects.forEach( o => this.drawIfVisible( ctx, -offsetX, width, -offsetY, height, o ) );

		if( this.player ) {
			if( !this.player.died ) {
				this.player.draw( ctx );
				this.drawGoal( ctx, -offsetX, width, -offsetY, height );
			}
			else {
				ctx.setTransform( 1, 0, 0, 1, 0, 0 );
				this.drawRespawnTransition( ctx );
			}
		}

		ctx.setTransform( 1, 0, 0, 1, 0, 0 );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2d} ctx
	 * @param {number}                   cnvHeight
	 * @param {number}                   cnvWidth
	 * @param {number}                   offsetX
	 */
	drawBackground( ctx, cnvHeight, cnvWidth, offsetX ) {
		const tileH = 752;
		const tileW = tileH * 2;
		let repeat = Math.ceil( cnvWidth / tileW );

		const levelW = this.limitsX[1] - cnvWidth - this.limitsX[0];
		const prog = ( offsetX - this.limitsX[0] ) / levelW;
		const diffW = tileW * repeat - cnvWidth;
		const x = Math.round( prog * diffW );

		while( repeat-- ) {
			ctx.drawImage(
				js13k.Renderer.sprite_m,
				// Part of the original image to use.
				0, 0, 32, 16,
				// Where and how big to paint it on the canvas.
				x + repeat * tileW, cnvHeight - tileH, tileW, tileH
			);
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2d} ctx
	 * @param {number}                   areaX
	 * @param {number}                   areaWidth
	 * @param {number}                   areaY
	 * @param {number}                   areaHeight
	 */
	drawGoal( ctx, areaX, areaWidth, areaY, areaHeight ) {
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

		const alpha = ctx.globalAlpha;

		ctx.globalAlpha = 0.4;
		ctx.fillStyle = 'rgba(144,192,224)';
		ctx.fillRect( goalX, this.goal[1], goalW, this.goal[3] );

		for( let i = 1; i < 8; i++ ) {
			ctx.globalAlpha -= 0.05;
			ctx.fillRect( goalX - i * 16, this.goal[1], 16, this.goal[3] );
		}

		ctx.globalAlpha = alpha;
	}


	/**
	 * Draw an object only if it is inside the visible viewport area.
	 * @param {CanvasRenderingContext2d} ctx
	 * @param {number}                   areaX
	 * @param {number}                   areaWidth
	 * @param {number}                   areaY
	 * @param {number}                   areaHeight
	 * @param {js13k.LevelObject}        o
	 */
	drawIfVisible( ctx, areaX, areaWidth, areaY, areaHeight, o ) {
		if(
			o.x > areaX + areaWidth || // outside the viewport to the right
			o.xe < areaX // outside the viewport to the left
		) {
			return;
		}

		o.draw( ctx );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2d} ctx
	 */
	drawRespawnTransition( ctx ) {
		const cnvWidth = js13k.Renderer.cnv.width;
		const cnvHeight = js13k.Renderer.cnv.height;
		const barH = Math.ceil( cnvHeight / 2 );

		const diff = this.timer - this.player.died;
		const halfTime = 0.1 * js13k.TARGET_FPS;
		const halfTimeWait = 0.2 * js13k.TARGET_FPS;

		let prog = 1;

		if( diff <= halfTime ) {
			prog = Math.min( 1, diff / halfTime );
		}
		else if( diff > halfTimeWait ) {
			prog = 1 - Math.min( 1, ( diff - halfTimeWait ) / halfTimeWait );
		}

		ctx.fillStyle = '#000';
		ctx.fillRect( 0, 0, cnvWidth, barH * prog );
		ctx.fillRect( 0, cnvHeight - barH * prog, cnvWidth, barH );
	}


	/**
	 *
	 * @param  {number} cnvWidth
	 * @param  {number} cnvHeight
	 * @return {number[]}
	 */
	getViewportOffset( cnvWidth, cnvHeight ) {
		const halfWidth = Math.round( cnvWidth / 2 );
		const offsetX = Math.min(
			this.limitsX[0],
			Math.max( -( this.limitsX[1] - cnvWidth ), halfWidth - this.player.x )
		);

		return [offsetX, 0];
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

		if( !this.player.died ) {
			if(
				this.checkPoint &&
				js13k.Input.isPressed( js13k.Input.ACTION.RESPAWN, true )
			) {
				this.player.died = this.timer;
				return;
			}

			const dir = js13k.Input.getDirections();
			this.player.update( dt, dir );

			// Confine player to map limits on the x axis.
			// Limit to the left.
			if( this.player.nextPos.x <= this.limitsX[0] ) {
				this.player.nextPos.x = this.limitsX[0];
				this.player.isWalking = false;
			}
			// Limit to the right.
			else if( this.player.nextPos.x + this.player.w >= this.limitsX[1] ) {
				this.player.nextPos.x = this.limitsX[1] - this.player.w;
				this.player.isWalking = false;
			}

			this.collisionDetection( this.player, this.player.nextPos );

			// Player fell, reset to last checkpoint (after a short transition effect).
			if(
				this.player.y > js13k.Renderer.cnv.height + 100 ||
				this.player.isOnSpikes()
			) {
				this.player.died = this.timer;
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
		// Player died, transition effect over.
		else if( this.timer - this.player.died >= 0.45 * js13k.TARGET_FPS ) {
			this.player.died = 0;
		}
		// Player died, transition effect.
		else if( this.timer - this.player.died >= 0.2 * js13k.TARGET_FPS ) {
			this.resetToCheckPoint();
		}
	}


}


js13k.Level = Level;

}
