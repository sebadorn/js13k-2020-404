'use strict';


{

class LevelObject {


	/**
	 *
	 * @constructor
	 * @param {object}   data
	 * @param {?string}  data.color
	 * @param {?string}  data.spikes
	 * @param {?number} [data.t = 0]
	 * @param {?number} [data.x = 0]
	 * @param {?number} [data.y = 0]
	 * @param {?number} [data.w = 0]
	 * @param {?number} [data.h = 0]
	 */
	constructor( level, data ) {
		// Platform type. (If LevelObject is used as platform.)
		// -1: character
		//  0: crumbling platform
		//  2: pillar
		this.type = data.t || 0;

		if( this.type === 0 ) {
			this.top = '#70a030';
		}
		else if( this.type === 2 ) {
			this.color = '#f0f0f0';
		}

		this.color = data.color || this.color || '#404047';
		this.spikes = {};

		if( data.spikes ) {
			this.spikes.l = data.spikes.includes( 'l' );
			this.spikes.r = data.spikes.includes( 'r' );
			this.spikes.t = data.spikes.includes( 't' );
		}

		this.x = 0;
		this.y = 0;
		this.w = data.w || 0;
		this.h = data.h || 0;

		let h = this.h;
		let w = this.w;

		if( this.spikes.t ) {
			h += 8;
		}
		if( this.spikes.l ) {
			w += 8;
		}
		if( this.spikes.r ) {
			w += 8;
		}

		// Velocity
		this.velX = 0;
		this.velY = 0;

		this.blocks = {};
		this.collision = true;
		this.level = level;

		if( this.type >= 0 ) {
			this.cnv = js13k.Renderer.toOffscreenCanvas( this, h, w );
		}

		this.x = data.x || 0;
		this.y = data.y || 0;
		this.xe = this.x + this.w; // x end
		this.ye = this.y + this.h; // y end

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

		if( this.cnv ) {
			ctx.drawImage( this.cnv, x, y );
			return;
		}

		if( this.spikes.t ) {
			y += 8;
		}
		if( this.spikes.l ) {
			x += 8;
		}

		ctx.fillStyle = this.color;
		ctx.fillRect( x, y, this.w, this.h );

		if( this.type === 0 ) {
			const pattern = ctx.createPattern( js13k.Renderer.sprite_s, 'repeat' );
			ctx.fillStyle = pattern;

			// Figuring out why there was a strange
			// offset in the pattern was painful.
			let offsetX = 0;
			let offsetY = 0;

			if( this.spikes.t ) {
				offsetY += 8;
			}
			if( this.spikes.l ) {
				offsetX += 8;
			}

			// Fill with the pattern.
			ctx.translate( offsetX, offsetY );
			ctx.fillRect( x - offsetX, y - offsetY, this.w, this.h );
			ctx.translate( -offsetX, -offsetY );

			// Border to enclose the pattern.
			ctx.strokeStyle = '#838383';
			ctx.lineWidth = 4;
			ctx.strokeRect( x + 2, y + 2, this.w - 4, this.h - 4 );

			// Spikes.
			ctx.fillStyle = '#fff';

			if( this.spikes.t ) {
				this.top = null;

				const steps = this.w / 4;

				for( let i = 0; i < steps; i += 2 ) {
					const tx = x + i * 4;
					ctx.beginPath();
					ctx.moveTo( tx,     y     );
					ctx.lineTo( tx + 8, y     );
					ctx.lineTo( tx + 4, y - 8 );
					ctx.fill();
				}
			}

			if( this.spikes.l ) {
				const steps = this.h / 4;

				for( let i = 0; i < steps; i += 2 ) {
					const ty = y + i * 4;
					ctx.beginPath();
					ctx.moveTo( x,     ty     );
					ctx.lineTo( x,     ty + 8 );
					ctx.lineTo( x - 8, ty + 4 );
					ctx.fill();
				}
			}

			if( this.spikes.r ) {
				const w = this.w;
				const steps = this.h / 4;

				for( let i = 0; i < steps; i += 2 ) {
					const ty = y + i * 4 + 8;
					ctx.beginPath();
					ctx.moveTo( x + w,     ty     );
					ctx.lineTo( x + w,     ty - 8 );
					ctx.lineTo( x + w + 8, ty - 4 );
					ctx.fill();
				}
			}
		}
		else if( this.type === 2 ) {
			y += 12;
			ctx.fillStyle = '#e0e0e0';
			ctx.fillRect( x + 8, y, 6, this.h );
			ctx.fillRect( x + 22, y, 6, this.h );
			ctx.fillRect( x + 36, y, 6, this.h );
			ctx.fillRect( x + this.w - 14, y, 6, this.h );
			ctx.fillRect( x + this.w - 28, y, 6, this.h );
			ctx.fillRect( x + this.w - 42, y, 6, this.h );
		}

		if( this.top ) {
			ctx.fillStyle = this.top;
			ctx.fillRect( x, y, this.w, 4 );

			for( let i = 0; i < this.w / 16; i++ ) {
				ctx.fillRect( x + i * 16, y + 4, 8, 4 );
			}
		}
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		if( this.isCrumbling && !this.gone ) {
			const diff = this.level.timer - this.isCrumbling;
			this.crumbleProgress = diff / ( 1 * js13k.TARGET_FPS );

			if( this.crumbleProgress >= 1 ) {
				this.crumbleProgress = 1;
				this.gone = true;
			}
		}
	}


}


js13k.LevelObject = LevelObject;

}
