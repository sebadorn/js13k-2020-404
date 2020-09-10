'use strict';


{

class Level_Outro extends js13k.Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		super();

		this._hideWorld = 0;
		this._textW = 0;
		this.phase = 1;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2d} ctx
	 */
	draw( ctx ) {
		const width = js13k.Renderer.cnv.width;
		const height = js13k.Renderer.cnv.height;

		const progBg = Math.min( 1, this.timer / ( 8 * js13k.TARGET_FPS ) );
		const alpha = ctx.globalAlpha;
		ctx.globalAlpha = progBg;
		ctx.fillStyle = '#000';
		ctx.fillRect( 0, 0, width, height );
		ctx.globalAlpha = alpha;

		// Phase 1: Player floating by.
		if( this.phase === 1 ) {
			this.drawPlayer( ctx, progBg, height );
		}
		// Phase 2: Player is gone, end title.
		else if( this.phase === 2 ) {
			ctx.fillStyle = '#df7126';
			ctx.font = 'bold 128px Arial, sans-serif';
			ctx.textAlign = 'right';

			js13k.Renderer.setShadowText( 10, '#a2a2a2' );

			let text = 'WORLD NOT FOUND';

			if( !this._textW ) {
				const measured = ctx.measureText( text );
				this._textW = measured.width;
			}

			if( this._hideWorld > this.timer ) {
				text = 'NOT FOUND';
			}

			ctx.fillText( text, js13k.Renderer.centerX + Math.round( this._textW / 2 ), js13k.Renderer.centerY );
			js13k.Renderer.resetShadow();
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2d} ctx
	 * @param {number}                   prog
	 * @param {number}                   cnvHeight
	 */
	drawPlayer( ctx, prog, cnvHeight ) {
		const invProg = 1 - prog;

		const s = invProg * 10;
		const s2 = s + s;
		const s3 = s2 + s;
		const s4 = s2 + s2;
		const s5 = s3 + s2;
		const s6 = s3 + s3;

		const alpha = ctx.globalAlpha;
		const height = cnvHeight + s6 + s4 + 100;

		ctx.globalAlpha = 1 - prog;

		ctx.translate( js13k.Renderer.centerX - s3, Math.round( height * invProg ) - s6 - s4 );
		ctx.rotate( prog * 360 * Math.PI / 180 );
		ctx.translate( -s4, -s4 );

		// torso/head
		ctx.fillStyle = '#df7126';
		ctx.fillRect( 0, 0, s6, s6 );

		// left leg
		ctx.fillRect( s5, s6, s, s2 );
		// right leg
		ctx.fillRect( s2, s6, s, s2 );

		ctx.globalAlpha = alpha;

		// eye
		ctx.fillStyle = '#fff';
		ctx.fillRect( s, s, s2, s2 );

		ctx.setTransform( 1, 0, 0, 1, 0, 0 );
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;

		if( this.timer >= 9 * js13k.TARGET_FPS ) {
			this.phase = 2;

			if(
				this.timer >= 9.5 * js13k.TARGET_FPS &&
				this._hideWorld < this.timer &&
				Math.random() < 0.02
			) {
				this._hideWorld = this.timer + js13k.TARGET_FPS * Math.random();
			}
		}
	}


}


js13k.Level.Outro = Level_Outro;

}
