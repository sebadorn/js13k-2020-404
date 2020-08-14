'use strict';


{

class Character {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		this.dirX = 0;
		this.dirY = 0;
		this.lastDir = 0;
		this.progress = 0;
		this.speed = 8;
		this.x = 0;
		this.y = 0;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		const size = 40;

		ctx.fillStyle = '#FF0000';
		ctx.fillRect( this.x, this.y + size, size, size );
	}


	/**
	 *
	 * @param {number} dt
	 * @param {object} dir
	 * @param {number} dir.x
	 * @param {number} dir.y
	 */
	update( dt, dir ) {
		this.progress += dt;
		this.dirY = 0;

		if( typeof dir.y === 'number' && dir.y !== 0 ) {
			this.dirY = ( dir.y < 0 ) ? -1 : 1;
		}

		if( dir.x !== 0 ) {
			this.dirX = ( dir.x < 0 ) ? -1 : 1;
		}

		this.lastDir = dir.x;
		this.x += Math.round( dir.x * this.speed );
	}


}


js13k.Character = Character;

}
