'use strict';


{

class Level_Intro extends js13k.Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		super();

		this.hasStarted = false;

		this.player = new js13k.Character( this, 224, 0, 3 );
		this.player.y = 600 - this.player.h;
		this.player.isOnGround = true;

		// Because of the stone tile, width and height have to be multiples of 64.
		const objects = [
			// Start pillar
			{ x: -128, y: 600, w: 384, h: 300, t: 2 },
			// Bridge
			{ x:  256, y: 600, w: 128, h: 64 },
			{ x:  380, y: 600, w: 128, h: 64 },
			{ x:  504, y: 600, w: 128, h: 64 },
			{ x:  628, y: 600, w: 128, h: 64 },
			{ x:  752, y: 600, w: 128, h: 64 },
			{ x:  876, y: 600, w: 128, h: 64 },
			{ x: 1000, y: 600, w: 128, h: 64 },
			// Gaps
			{ x: 1320, y: 600, w: 128, h: 64 },
			{ x: 1640, y: 600, w: 128, h: 64 },
			{ x: 1960, y: 600, w: 128, h: 64 },
			{ x: 2280, y: 600, w: 128, h: 64 },

			// Check point
			{ x: 2600, y: 536, w: 128, h: 300, t: 2 },
			// Climb
			{ x: 2920, y: 600, w: 384, h:  64 },
			{ x: 3300, y: 408, w:  64, h: 256 },
			{ x: 3300, y: 216, w:  64, h: 192 },
			{ x: 3040, y:  32, w:  64, h: 192, spikes: 'l' },
			{ x: 3040, y: 272, w:  64, h: 128, spikes: 'l' },
			{ x: 3300, y: 152, w: 256, h:  64 },
			{ x: 3684, y: 152, w:  64, h:  64 },

			// Check point
			{ x: 3748, y: 152, w: 192, h: 1000, t: 2 },
			// Walls and platforms
			{ x: 4004, y:  500, w: 128, h:  64  },
			{ x: 4200, y:  200, w:  64, h: 320, spikes: 't' },
			{ x: 4200, y: -500, w:  64, h: 704, spikes: 't' },
			{ x: 4200, y:  528, w:  64, h: 320  },
			{ x: 4392, y:  500, w: 128, h:  64  },
			{ x: 4584, y:  400, w: 128, h:  64  },
			{ x: 4648, y:  100, w: 128, h: 128  },
			{ x: 4844, y:  500, w:  64, h:  64  },
			{ x: 4904, y: -500, w:  64, h: 1408, spikes: 't' },
			// Platforms behind wall
			{ x: 5256, y: 564, w:  64, h: 64 },
			{ x: 5416, y: 500, w: 128, h: 64 },
			{ x: 5640, y: 436, w: 256, h: 64 },

			// Check point
			{ x: 5960, y: 372, w: 192, h: 600, t: 2 },
			// Bridge
			{ x: 6216, y: 436, w: 128, h:  64, spikes: 't' },
			{ x: 6340, y: 444, w: 128, h:  64 },
			{ x: 6464, y: 436, w: 128, h:  64, spikes: 't' },
			{ x: 6588, y: 444, w: 128, h:  64 },
			{ x: 6856, y: 496, w:  64, h: 320, spikes: 't' },
			{ x: 6856, y: 244, w:  64, h: 192, spikes: 't' },
			{ x: 6712, y: 444, w: 256, h:  64 },
			{ x: 6784, y: -64, w: 128, h: 320, spikes: 'l' },
			{ x: 6964, y: 444, w: 256, h:  64 },

			// Check point / Goal
			{ x: 7676, y: 320, w: 192, h: 600, t: 2 },
			{ x: 7420, y: 384, w:  64, h:  64 },
			{ x: 7612, y: js13k.Renderer.cnv.height - 64, w:  64, h:  64 }
		];

		objects.forEach( o => {
			const lo = new js13k.LevelObject( this, o );
			this.objects.push( lo );
		} );

		this.goal = [7848, 0, 20, 320];
		this.limitsX = [0, 7868]; // Level limits on the x axis.

		// this.reachedGoal = 0;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2d} ctx
	 */
	draw( ctx ) {
		super.draw( ctx );

		if( !this.hasStarted ) {
			const centerX = js13k.Renderer.centerX;
			const centerY = js13k.Renderer.centerY;

			ctx.fillStyle = '#fff';
			ctx.font = 'bold 92px Arial, sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'alphabetic';

			js13k.Renderer.setShadowText( 8 );
			ctx.fillText( 'AND THEN IT WAS GONE', centerX, centerY );
			js13k.Renderer.resetShadow();

			// Blinking effect.
			if( ~~this.timer % 200 > 30 ) {
				ctx.font = '36px Arial, sans-serif';
				ctx.fillText( 'Press [Space] to run from a crumbling world', centerX, centerY + 58 );
			}

			// Hint to use gamepad.
			ctx.textBaseline = 'top';

			if( js13k.Input.numGamepads > 0 ) {
				ctx.font = 'bold 20px Arial, sans-serif';
				ctx.fillText( 'Gamepad connected!', centerX, 24 );
			}
			else {
				ctx.font = 'italic 20px Arial, sans-serif';
				ctx.fillText( 'No gamepad connected', centerX, 24 );
			}
		}
		else if( this.state === 1 ) {
			const cnvWidth = js13k.Renderer.cnv.width;
			const cnvHeight = js13k.Renderer.cnv.height;

			const diff = this.timer - this.reachedGoal;
			const prog = 1 - Math.min( 1, diff / ( 0.3 * js13k.TARGET_FPS ) );

			ctx.fillStyle = '#000';
			ctx.fillRect( prog * cnvWidth, 0, cnvWidth, cnvHeight );
		}
	}


	/**
	 *
	 */
	onGoal() {
		this.reachedGoal = this.timer;
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		if( this.hasStarted ) {
			super.update( dt );

			if( this.state === 1 ) {
				if( this.reachedGoal && this.timer - this.reachedGoal >= 0.45 * js13k.TARGET_FPS ) {
					js13k.Renderer.changeLevel( new js13k.Level.Climb() );
				}
			}
		}
		else {
			this.timer += dt;

			if( js13k.Input.isPressed( js13k.Input.ACTION.JUMP, true ) ) {
				this.hasStarted = true;
			}
		}
	}


}


js13k.Level.Intro = Level_Intro;

}
