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
			new js13k.LevelObject( 900, 800, 600, 1000 ),
			new js13k.LevelObject( 1200, 400, 60, 300 )
		);
	}


}


js13k.Level.Intro = Level_Intro;

}
