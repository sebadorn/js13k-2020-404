'use strict';


/**
 * @namespace js13k.Renderer
 */
js13k.Renderer = {


	TARGET_FPS: 60,

	cnv: null,
	ctx: null,
	inputUpdateInterval: 0,
	last: 0,
	level: null,


	/**
	 *
	 * @param {js13k.Level} level
	 */
	changeLevel( level ) {
		js13k.Input.off( 'gp_connect' );
		js13k.Input.off( 'gp_disconnect' );

		this.level = level;
	},


	/**
	 * Clear the canvas.
	 */
	clear() {
		this.ctx.fillStyle = '#EEE';
		this.ctx.fillRect( 0, 0, this.cnv.width, this.cnv.height );
	},


	/**
	 * Draw to the canvas.
	 */
	draw() {
		this.clear();
		this.level && this.level.draw( this.ctx );
	},


	/**
	 * Draw the pause screen.
	 */
	drawPause() {
		this.clear();

		this.ctx.fillStyle = '#F00000';
		this.ctx.fillRect( 0, 0, window.innerWidth, window.innerHeight );

		this.ui_pause.centerX();
		this.ui_pause.y = this.centerY - 80;
		this.ui_pause.draw( this.ctx );
	},


	/**
	 * Initialize the renderer.
	 * @param {function} cb
	 */
	init( cb ) {
		this.cnv = document.getElementById( 'c' );
		this.ctx = this.cnv.getContext( '2d', { alpha: false } );

		this.ui_pause = new js13k.UI.Text(
			'PAUSED', 'bold 42px sans-serif', [255, 255, 255], 0, 0, true
		);

		this.registerEvents();
		cb();
	},


	/**
	 * Start the main loop. Update logic, render to the canvas.
	 * @param {number} [timestamp = 0]
	 */
	mainLoop( timestamp = 0 ) {
		js13k.Input.update();

		if( timestamp > 0 ) {
			const diff = timestamp - this.last; // Time that passed between frames. [ms]

			// Target speed of 60 FPS (=> 1000 / 60 ~= 16.667 [ms]).
			const dt = this.TARGET_FPS * diff / 1000;

			this.ctx.imageSmoothingEnabled = false;
			this.ctx.lineWidth = 1;
			this.ctx.textBaseline = 'alphabetic';

			if( this.isPaused ) {
				this.drawPause();
				return; // Stop the loop.
			}
			else {
				this.level && this.level.update( dt );
				this.draw( dt );
			}
		}

		this.last = timestamp;

		requestAnimationFrame( t => this.mainLoop( t ) );
	},


	/**
	 *
	 */
	registerEvents() {
		window.addEventListener( 'resize', () => this.resize() );
		this.resize();

		const keysEscape = js13k.Input.getKeysForAction( js13k.Input.ACTION.ESC );

		js13k.Input.onKeyUp( 'Escape', () => {
			if( this.isPaused ) {
				this.unpause();
			}
			else {
				this.isPaused = true;

				// Keep on updating the inputs (gamepads), but much slower.
				this.inputUpdateInterval = setInterval(
					() => {
						js13k.Input.update();

						for( const key of keysEscape.gamepad ) {
							if( js13k.Input.isPressedGamepad( key ) ) {
								this.unpause();
								return;
							}
						}
					},
					500
				);
			}
		} );
	},


	/**
	 * Resize the canvas.
	 */
	resize() {
		this.cnv.height = window.innerHeight;
		this.cnv.width = window.innerWidth;

		this.centerX = Math.round( window.innerWidth / 2 );
		this.centerY = Math.round( window.innerHeight / 2 );

		if( this.isPaused ) {
			this.drawPause();
		}
	},


	/**
	 *
	 */
	unpause() {
		if( this.isPaused ) {
			clearInterval( this.inputUpdateInterval );
			this.isPaused = false;
			this.mainLoop();
		}
	}


};
