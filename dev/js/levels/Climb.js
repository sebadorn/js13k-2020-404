'use strict';


{

class Level_Climb extends js13k.Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		super();

		this.VIEWPORT_MAX_HEIGHT = 1080;
		this.VIEWPORT_MAX_WIDTH = 1200;

		js13k.Renderer.resize( this.VIEWPORT_MAX_WIDTH, this.VIEWPORT_MAX_HEIGHT );

		const vpW = this.VIEWPORT_MAX_WIDTH;
		const vpH = js13k.Renderer.cnv.height;

		this.player = new js13k.Character( this, 632, 0, 3 );
		this.player.y = vpH - 128 - this.player.h;
		this.player.isOnGround = true;

		const c = Math.round( vpW / 2 );

		// Because of the stone tile, width and height have to be multiples of 64.
		const objects = [
			// Start pillar
			{ x: c - 128, y: 128, w: 256, h: 128, t: 2 },
			// Bottom
			{ x:       -4, y: 256, w:  64, h: 260, spikes: 'r' },
			{ x: vpW - 68, y: 256, w:  64, h: 260, spikes: 'l' },
			// Stairs
			{ x: c - 320, y: 224, w: 128, h: 64 },
			{ x: c + 192, y: 224, w: 128, h: 64 },
			{ x: c - 448, y: 288, w: 128, h: 64 },
			{ x: c + 320, y: 288, w: 128, h: 64 },
			// Walls
			// left
			{ x: c - 512, y:  544, w:  64, h: 256 },
			{ x: c - 512, y:  736, w:  64, h: 192 },
			{ x: c - 512, y:  928, w:  64, h: 192 },
			{ x: c - 512, y: 1128, w:  64, h: 192, spikes: 't' },
			{ x: c - 448, y: 1184, w: 256, h:  64 },
			// right
			{ x: c + 448, y:  544, w:  64, h: 256 },
			{ x: c + 448, y:  736, w:  64, h: 192 },
			{ x: c + 448, y:  928, w:  64, h: 192 },
			{ x: c + 448, y: 1128, w:  64, h: 192, spikes: 't' },
			{ x: c + 192, y: 1184, w: 256, h:  64 },
			// middle
			{ x: c - 256, y:  672, w:  64, h: 192 },
			{ x: c - 256, y:  872, w:  64, h: 192, spikes: 't' },
			{ x: c - 196, y:  864, w: 128, h: 128 },
			{ x: c + 192, y:  672, w:  64, h: 192 },
			{ x: c + 192, y:  872, w:  64, h: 192, spikes: 't' },
			{ x: c +  68, y:  864, w: 128, h: 128 },
			{ x: c - 192, y: 1120, w:  64, h:  64 },
			{ x: c + 128, y: 1120, w:  64, h:  64 },
			{ x: c -  32, y: 1152, w:  64, h: 192 },
			{ x: c -  32, y: 1388, w:  64, h: 128, spikes: 't' },

			// Check point
			{ x: c - 68, y: 864, w: 136, h: 160, t: 2 },
			// Steps
			{ x: c - 290, y: 1408, w: 576, h: 32 },
			// left
			{ x: c - 512, y: 1248, w: 192, h: 32 },
			{ x: c - 592, y: 1312, w: 128, h: 32 },
			{ x: c - 592, y: 1504, w: 192, h: 32 },
			{ x: c - 252, y: 1572, w: 192, h: 32 },
			// right
			{ x: c + 320, y: 1248, w: 192, h: 32 },
			{ x: c + 464, y: 1312, w: 128, h: 32 },
			{ x: c + 400, y: 1504, w: 192, h: 32 },
			{ x: c +  60, y: 1572, w: 192, h: 32 },

			// Check point
			{ x: c - 64, y: 1636, w: 128, h: 64, t: 2 },
			{ x: c - 64, y: 1572, w: 128, h: 32 },
			// Last steps
			{ x: c - 320, y: 1892, w: 128, h: 192 },
			{ x: c - 448, y: 2084, w: 128, h: 128 },
			{ x: c + 192, y: 1892, w: 128, h: 192 },
			{ x: c + 320, y: 2084, w: 128, h: 128 },
			{ x: c -  32, y: 1860, w:  64, h: 128 },
			{ x: c - 128, y: 2084, w: 256, h:  64 },
			{ x: c -  32, y: 2164, w:  64, h:  32 }
		];

		objects.forEach( o => {
			o.y = vpH - o.y;
			const lo = new js13k.LevelObject( this, o );
			this.objects.push( lo );
		} );

		this.goal = [0, vpH - 2324, this.VIEWPORT_MAX_WIDTH, 60];
		this.limitsX = [0, this.VIEWPORT_MAX_WIDTH];
		this.limitsY = [vpH - 2324, 0];
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
		const offsetY = cnvHeight - tileH;

		let repeat = Math.ceil( cnvWidth / tileW );

		while( repeat-- ) {
			ctx.drawImage(
				js13k.Renderer.sprite_m,
				0, 0, 32, 16,
				repeat * tileW, offsetY, tileW, tileH
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

		const goalY = this.goal[1];
		const goalH = this.goal[3];

		if(
			goalY > areaY + areaHeight || // outside the viewport to the bottom
			goalY + goalH < areaY // outside the viewport to the top
		) {
			return;
		}

		const alpha = ctx.globalAlpha;

		ctx.globalAlpha = 0.4;
		ctx.fillStyle = 'rgba(144,192,224)';

		for( let i = 0; i < 7; i++ ) {
			ctx.globalAlpha -= 0.05;
			ctx.fillRect( this.goal[0], goalY + i * 16, this.goal[2], 16 );
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
			o.y > areaY + areaHeight || // outside the viewport to the bottom
			o.ye < areaY // outside the viewport to the top
		) {
			return;
		}

		o.draw( ctx );
	}


	/**
	 *
	 * @param  {number} cnvWidth
	 * @param  {number} cnvHeight
	 * @return {number[]}
	 */
	getViewportOffset( cnvWidth, cnvHeight ) {
		const halfWidth = Math.round( cnvWidth / 2 );
		const halfHeight = Math.round( cnvHeight / 2 );

		const offsetX = Math.min(
			this.limitsX[0],
			Math.max( -( this.limitsX[1] - cnvWidth ), halfWidth - this.player.x )
		);

		const offsetY = Math.min(
			-this.limitsY[0],
			Math.max( this.limitsY[1], halfHeight - this.player.y )
		);

		return [offsetX, offsetY];
	}


	/**
	 *
	 */
	onGoal() {
		js13k.Renderer.changeLevel( new js13k.Level.Outro() );
	}


}


js13k.Level.Climb = Level_Climb;

}
