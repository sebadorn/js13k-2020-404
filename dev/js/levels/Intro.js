'use strict';


{

class Level_Intro extends js13k.Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		super();

		this.player = new js13k.Character( this, 370, 0, 3 );
		this.player.y = 601 - this.player.h;

		const objects = [
			{ x: 0, y: 600, w: 400, h: 300, t: 2 }, // start, check point 1
			{ x: 640, y: 480, w: 320, h: 120 },
			{ x: 1200, y: 420, w: 320, h: 100 },
			{ x: 1720, y: 620, w: 190, h: 60 },
			{ x: 1790, y: 80, w: 110, h: 280 }, // wall jump to pillar
			{ x: 2110, y: 200, w: 300, h: 1000, t: 2 }, // check point 2
			{ x: 2510, y: 380, w: 90, h: 200 },
			{ x: 2780, y: 160, w: 110, h: 260 },
			{ x: 2830, y: 600, w: 300, h: 110 },
			{ x: 3160, y: 610, w: 100, h: 110 },
			{ x: 3300, y: 60, w: 100, h: 520 }, // big blocking wall
			{ x: 3460, y: 580, w: 160, h: 100 },
			{ x: 3700, y: 500, w: 160, h: 100 },
			{ x: 3900, y: 400, w: 300, h: 400, t: 2 } // goal
		];

		objects.forEach( o => {
			const lo = new js13k.LevelObject( this, o );
			this.objects.push( lo );
		} );

		const scenery = [
			{ x: 230, y: 200, w: 300, h: 600, t: 3 },
			{ x: 900, y: 370, w: 420, h: 600, t: 3 }
		];

		scenery.forEach( s => {
			const so = new js13k.LevelObject( this, s );
			this.scenery.push( so );
		} );

		this.goal = [4000, 370, 200, 30];
		this.limits = [0, 4200 - js13k.Renderer.cnv.width]; // Level limits on the x axis.
	}


	/**
	 *
	 */
	onGoal() {
		js13k.Renderer.changeLevel( new js13k.Level.Outro() );
	}


}


js13k.Level.Intro = Level_Intro;

}
