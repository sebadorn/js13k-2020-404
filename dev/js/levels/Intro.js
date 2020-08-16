'use strict';


{

class Level_Intro extends js13k.Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		super();

		this.player = new js13k.Character( 200, 400, 40, 40 );

		this.objects.push(
			new js13k.LevelObject( 100, 700, 600, 1000 ),
			new js13k.LevelObject( 900, 800, 400, 1000 )
		);
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		this.player.draw( ctx );

		super.draw( ctx );
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		const dir = js13k.Input.getDirections();
		this.player.update( dt, dir );

		super.update( dt );
	}


}


js13k.Level.Intro = Level_Intro;

}
