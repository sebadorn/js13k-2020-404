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

		const objects = [
			{ x: 0, y: 600, w: 400, h: 300, t: 2 }, // start
			{ x: 680, y: 480, w: 320, h: 120 },
			{ x: 1200, y: 420, w: 320, h: 100 },
			{ x: 1720, y: 620, w: 190, h: 60 },
			{ x: 1790, y: 80, w: 110, h: 280 }, // wall jump to pillar
			{ x: 2110, y: 200, w: 300, h: 1000, t: 2 },
			{ x: 2510, y: 380, w: 90, h: 200 },
			{ x: 2780, y: 160, w: 110, h: 260 }
		];

		objects.forEach( o => {
			const lo = new js13k.LevelObject( this, o );
			this.objects.push( lo );
		} );

		const scenery = [
			{ x: 230, y: 200, w: 300, h: 600, color: '#a7b9c8' },
			{ x: 900, y: 370, w: 420, h: 600, color: '#a7b9c8' }
		];

		scenery.forEach( s => {
			const so = new js13k.LevelObject( this, s );
			this.scenery.push( so );
		} );

		// TODO:
		// this.goal = [1450, 370, 100, 30];
	}


}


js13k.Level.Intro = Level_Intro;

}
