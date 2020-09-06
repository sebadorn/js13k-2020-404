'use strict';


{

class Level_Intro extends js13k.Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		super();

		this.player = new js13k.Character( this, 370, 560, 3 );

		this.objects.push(
			new js13k.LevelObject( this, 0, 600, 400, 300, null, '#8f9552' ),
			new js13k.LevelObject( this, 680, 480, 320, 120, null, '#8f9552' ),
			new js13k.LevelObject( this, 1200, 400, 350, 100, null, '#8f9552' )
		);

		this.scenery.push(
			new js13k.LevelObject( this, 230, 200, 300, 600, '#a7b9c8' ),
			new js13k.LevelObject( this, 900, 370, 420, 600, '#a7b9c8' )
		);

		this.goal = [1450, 370, 100, 30];
	}


}


js13k.Level.Intro = Level_Intro;

}
