'use strict';


{

class Level_Intro extends js13k.Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		super();

		this.player = new js13k.Character( 200, 300, 40, 40 );

		this.objects.push(
			new js13k.LevelObject( 100, 700, 600, 1000 ),
			new js13k.LevelObject( 900, 600, 600, 1000 ),
			new js13k.LevelObject( 1200, 140, 60, 300 )
		);

		this.scenery.push(
			new js13k.LevelObject( 200, 240, 300, 1000, '#a7b9c8' ),
			new js13k.LevelObject( 820, 360, 400, 1000, '#a7b9c8' )
		);
	}


}


js13k.Level.Intro = Level_Intro;

}
