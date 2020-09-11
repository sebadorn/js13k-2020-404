'use strict';


{

class LevelEffect {


	/**
	 *
	 * @constructor
	 * @param  {js13k.Level} level
	 * @param  {number}      type
	 * @param  {*}           data
	 */
	constructor( level, type, data ) {
		this.data = data;
		this.level = level;

		this.timer = 0;
		this.startTime = 0;
		this.endTime = Infinity;

		this._init( type );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2d} ctx
	 */
	_drawCrumbling( ctx ) {
		if( this.timer < this.startTime ) {
			return;
		}

		const data = this.data;
		const prog = ( this.timer - this.startTime ) / ( this.endTime - this.startTime );
		const progSquare = prog * prog;
		const alpha = ctx.globalAlpha;
		const wHalf = Math.round( data.w / 2 );


		// Dust flying up.
		ctx.globalAlpha = 1 - progSquare;
		ctx.fillStyle = '#a2a2a2';
		const s = 8 * ( 1 - prog );
		const sin = Math.sin( prog * 4 * Math.PI ) * 10;

		let x = data.x - s / 2;
		ctx.fillRect(
			Math.round( x + sin ),
			data.y - Math.round( prog * 40 ),
			s, s
		);

		x += wHalf;
		ctx.fillRect(
			Math.round( x + sin ),
			data.y - Math.round( prog * 40 ),
			s, s
		);

		x += wHalf;
		ctx.fillRect(
			Math.round( x + sin ),
			data.y - Math.round( prog * 40 ),
			s, s
		);


		// Platform splits in half, falls, and vanishes.
		const leftY = data.y + progSquare * 500;
		const rightY = data.y + progSquare * 600;

		ctx.globalAlpha = 1 - progSquare;

		ctx.drawImage(
			data.cnv,
			0, 0, wHalf, data.h, // source
			data.x, leftY, wHalf, data.h // destination
		);
		ctx.drawImage(
			data.cnv,
			wHalf, 0, wHalf, data.h, // source
			data.x + wHalf, rightY, wHalf, data.h // destination
		);

		ctx.globalAlpha = alpha;
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2d} ctx
	 */
	_drawGoal( ctx ) {
		// TODO:
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2d} ctx
	 */
	_drawHangDust( ctx ) {
		// TODO:
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2d} ctx
	 */
	_drawJumpDust( ctx ) {
		let prog = this.timer / this.endTime;

		const alpha = ctx.globalAlpha;
		ctx.globalAlpha = 1 - prog * prog;

		let s = Math.round( prog * 14 );
		let sHalf = Math.round( s / 2 );

		ctx.fillStyle = '#e4bd8a';
		ctx.fillRect(
			this.data.x - sHalf,
			this.data.y - sHalf,
			s, s
		);

		if( prog > 0.3 ) {
			prog = ( prog - 0.3 ) / 0.7;
			s = Math.round( prog * 10 );
			sHalf = Math.round( s / 2 );

			ctx.fillStyle = '#ffffff50';
			ctx.fillRect(
				this.data.x - sHalf + this.data.dir * 10,
				this.data.y - sHalf,
				s, s
			);
		}

		ctx.globalAlpha = alpha;
	}


	/**
	 *
	 * @private
	 * @param {number} type
	 */
	_init( type ) {
		if( type === 1 ) {
			this.draw = this._drawCrumbling;
			this.startTime = 1 * js13k.TARGET_FPS;
			this.endTime = 2 * js13k.TARGET_FPS;

			this.x = this.data.x - 10;
			this.xe = this.data.xe + 10;
		}
		else if( type === 2 ) {
			this.draw = this._drawJumpDust;
			this.endTime = 1 * js13k.TARGET_FPS;

			this.x = this.data.x - 40;
			this.xe = this.x + 100;
		}
		else if( type === 3 ) {
			this.draw = this._drawHangDust;
			this.endTime = 4 * js13k.TARGET_FPS;

			this.x = this.data.x - 40;
			this.xe = this.x + 100;
		}
		else if( type === 4 ) {
			this.draw = this._drawGoal;

			this.x = this.data.x;
			this.xe = this.x + this.data.w;
		}
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;

		if( this.timer >= this.endTime ) {
			const index = this.level.effects.indexOf( this );

			if( index >= 0 ) {
				this.level.effects.splice( index, 1 );
			}
		}
	}


}


js13k.LevelEffect = LevelEffect;

}
