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
		this.scenery = [];
	}


	/**
	 *
	 * @param {(js13k.Character|js13k.LevelObject)} check
	 */
	collisionDetectionUpdate( check ) {
		this.objects.forEach( o => {
			if( o === check || !o.collision ) {
				return;
			}

			if( js13k.overlapAABB( o, check ) ) {
				// Going up.
				if( check.velocityY < 0 ) {
					check.y = o.y + o.h;
				}
				// >= 0, Going down.
				else {
					check.y = o.y - check.h;
					check.isGrounded = true;
				}
			}
		} );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2d} ctx
	 */
	draw( ctx ) {
		this.objects.forEach( o => o.draw( ctx ) );
		this.scenery.forEach( o => o.draw( ctx ) );
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.objects.forEach( o => {
			o.update( dt );

			if( o.movable ) {
				this.collisionDetectionUpdate( o );
			}
		} );

		this.scenery.forEach( o => o.update( dt ) );

		if( this.player ) {
			this.player.isGrounded = false;
			this.collisionDetectionUpdate( this.player );
		}
	}


}


js13k.Level = Level;

}
