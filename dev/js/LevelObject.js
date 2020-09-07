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
		this.type = data.t || 0;

		if( this.type === 1 ) {
			this.top = '#8f9552';
		}

		this.color = data.color || '#696a6a';

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
	}


	/**
	 *
	 * @param {CanvasRenderingContext2d} ctx
	 */
	draw( ctx ) {
		ctx.fillStyle = this.color;
		ctx.fillRect( this.x, this.y, this.w, this.h );

		if( this.top ) {
			ctx.fillStyle = this.top;
			ctx.fillRect( this.x, this.y, this.w, 6 );
		}
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
