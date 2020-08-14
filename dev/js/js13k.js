'use strict';


/**
 * @namespace js13k
 */
const js13k = {


	/**
	 *
	 */
	init() {
		js13k.Input.init();

		js13k.Renderer.init( () => {
			js13k.Renderer.changeLevel( new js13k.Level.Intro() );
			js13k.Renderer.mainLoop();
		} );
	}


};


window.addEventListener( 'load', () => js13k.init() );
