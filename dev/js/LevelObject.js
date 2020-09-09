'use strict';


{

class LevelObject {


	/**
	 *
	 * @constructor
	 * @param {object}   data
	 * @param {?string}  data.color
	 * @param {?number} [data.t = 0]
	 * @param {?number} [data.x = 0]
	 * @param {?number} [data.y = 0]
	 * @param {?number} [data.w = 0]
	 * @param {?number} [data.h = 0]
	 */
	constructor( level, data ) {
		// Platform type. (If LevelObject is used as platform.)
		// 0: crumbling platform
		// 1: crumbling platform, but you cannot stand on the top area
		// 2: pillar
		// 3: scenery
		this.type = data.t || 0;

		if( this.type === 0 ) {
			this.top = '#8f9552';
		}
		else if( this.type === 2 ) {
			this.color = '#909090';
		}
		else if( this.type === 3 ) {
			this.color = '#a7b9c8';
		}

		this.color = data.color || this.color || '#696a6a';

		this.x = data.x || 0;
		this.y = data.y || 0;
		this.w = data.w || 0;
		this.h = data.h || 0;
		this.xe = this.x + this.w; // x end
		this.ye = this.y + this.h; // y end

		this.dirX = 0;
		this.dirY = 0;

		// Velocity
		this.velX = 0;
		this.velY = 0;

		this.blocks = {};
		this.collision = true;
		this.level = level;
		this.nextPos = {
			x: this.x,
			y: this.y
		};

		// this.crumbleProgress = 0;
		// this.gone = false;
		// this.isCrumbling = 0;
	}


	/**
	 *
	 */
	crumble() {
		if( this.type !== 0 && this.type !== 1 ) {
			return;
		}

		if( !this.isCrumbling ) {
			this.isCrumbling = this.level.timer;
			this.level.spawnEffect( 1, this );
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2d} ctx
	 */
	draw( ctx ) {
		if( this.gone ) {
			return;
		}

		const prog = this.crumbleProgress || 0;

		let x = this.x;
		let y = this.y;

		if( prog > 0.5 ) {
			x += Math.round( Math.random() * 4 - 2 );
			y += Math.round( Math.random() * 4 - 2 );
		}

		ctx.fillStyle = this.color;
		ctx.fillRect( x, y, this.w, this.h );

		if( this.top ) {
			ctx.fillStyle = this.top;
			ctx.fillRect( x, y, this.w, 8 );
		}
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		if( this.isCrumbling && !this.gone ) {
			const diff = this.level.timer - this.isCrumbling;
			this.crumbleProgress = diff / ( 4 * js13k.TARGET_FPS );

			if( this.crumbleProgress >= 1 ) {
				this.crumbleProgress = 1;
				this.gone = true;
			}
		}
	}


}


js13k.LevelObject = LevelObject;

}
