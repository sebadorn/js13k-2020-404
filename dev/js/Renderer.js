'use strict';


/**
 * @namespace js13k.Renderer
 */
js13k.Renderer = {


	cnv: null,
	ctx: null,
	last: 0,
	level: null,
	sprite: null,


	/**
	 *
	 * @param {js13k.Level} level
	 */
	changeLevel( level ) {
		this.level = level;
	},


	/**
	 * Clear the canvas.
	 */
	clear() {
		this.ctx.fillStyle = '#cbdbfc';
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
		this.ctx.fillStyle = '#111';
		this.ctx.fillRect( 0, 0, this.cnv.width, this.cnv.height );

		this.ctx.fillStyle = 'rgba(162, 162, 162)';
		this.ctx.font = 'bold 128px sans-serif';
		this.ctx.textAlign = 'center';
		this.ctx.fillText( 'PAUSED', this.centerX, this.centerY );
	},


	/**
	 * Initialize the renderer.
	 * @param {function} cb
	 */
	init( cb ) {
		this.cnv = document.getElementById( 'c' );
		this.ctx = this.cnv.getContext( '2d', { alpha: false } );

		this.registerEvents();
		this.loadSprite( cb );
	},


	/**
	 * Load images for use on the canvas.
	 * @param {function} cb
	 */
	loadSprite( cb ) {
		const img = new Image();
		img.onload = () => {
			this.sprite = img;
			cb();
		};
		img.src = 's.gif';
	},


	/**
	 * Start the main loop. Update logic, render to the canvas.
	 * @param {number} [timestamp = 0]
	 */
	mainLoop( timestamp = 0 ) {
		js13k.Input.update();

		if( timestamp && this.last ) {
			const timeElapsed = timestamp - this.last; // Time that passed between frames. [ms]

			// Target speed of 60 FPS (=> 1000 / 60 ~= 16.667 [ms]).
			const dt = timeElapsed / ( 1000 / js13k.TARGET_FPS );

			this.ctx.imageSmoothingEnabled = false;
			this.ctx.lineWidth = 1;
			this.ctx.textBaseline = 'alphabetic';

			this.ctx.setTransform( 1, 0, 0, 1, 0, 0 );

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
	pause() {
		this.isPaused = true;
	},


	/**
	 *
	 */
	registerEvents() {
		window.addEventListener( 'resize', ev => this.resize( ev ) );
		this.resize();

		const keys = js13k.Input.getKeysForAction( js13k.Input.ACTION.PAUSE );

		setInterval(
			() => {
				// Inputs are not updated if main loop is not running.
				if( this.isPaused ) {
					js13k.Input.update();
				}

				keys.gamepad.forEach( key => {
					if( js13k.Input.isPressedGamepad( key, true ) ) {
						this.togglePause();
					}
				} );
			},
			100
		);

		const cbPause = () => this.togglePause();
		keys.keyboard.forEach( key => js13k.Input.onKeyUp( key, cbPause ) );

		js13k.Input.on( 'gp_disconnect', () => this.pause() );
	},


	/**
	 * Resize the canvas.
	 * @param {?Event} ev
	 */
	resize( ev ) {
		if( ev ) {
			this.pause();
		}

		this.cnv.height = Math.min( window.innerHeight, js13k.MAX_CANVAS_HEIGHT );
		this.cnv.width = window.innerWidth;

		this.centerX = Math.round( this.cnv.width / 2 );
		this.centerY = Math.round( this.cnv.height / 2 );

		if( this.isPaused ) {
			clearTimeout( this._timeoutDrawPause );
			this._timeoutDrawPause = setTimeout( () => this.drawPause(), 100 );
		}
	},


	/**
	 *
	 */
	togglePause() {
		if( this.isPaused ) {
			this.unpause();
		}
		else {
			this.pause();
		}
	},


	/**
	 *
	 */
	unpause() {
		if( this.isPaused ) {
			this.isPaused = false;
			this.mainLoop();
		}
	}


};
