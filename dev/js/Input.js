'use strict';


/**
 * @namespace js13k.Input
 */
js13k.Input = {


	ACTION: {
		PAUSE: 1,
		JUMP: 2,
		RESPAWN: 3,

		LEFT: 10,
		UP: 11,
		RIGHT: 12,
		DOWN: 13
	},

	// 1: Keyboard
	// 2: Playstation Controller
	// 3: XBox Controller
	PROMPTS: 1,

	_gpButtons: {},
	_ignoreUntilReleased: {},
	_on: {
		gp_connect: [],
		gp_disconnect: []
	},
	_onKeyDown: {},
	_onKeyUp: {},

	gamepads: {},
	isLinuxFirefox: false,
	keystate: {},
	numGamepads: 0,


	/**
	 *
	 */
	buildActionKeyMap() {
		this.ACTION_KEY_MAP = {
			[this.ACTION.PAUSE]: {
				keyboard: ['Escape'],
				gamepad: [9]
			},
			[this.ACTION.UP]: {
				keyboard: ['ArrowUp', 'KeyW', 'KeyZ'], // Z: French layout
				gamepad: [12]
			},
			[this.ACTION.LEFT]: {
				keyboard: ['ArrowLeft', 'KeyA', 'KeyQ'], // Q: French layout
				gamepad: [14]
			},
			[this.ACTION.DOWN]: {
				keyboard: ['ArrowDown', 'KeyS'],
				gamepad: [13]
			},
			[this.ACTION.RIGHT]: {
				keyboard: ['ArrowRight', 'KeyD'],
				gamepad: [15]
			},
			[this.ACTION.JUMP]: {
				keyboard: ['Space', 'Enter'],
				gamepad: [0]
			},
			[this.ACTION.RESPAWN]: {
				keyboard: ['Backspace'],
				gamepad: [this.isLinuxFirefox ? 2 : 3]
			}
		};
	},


	/**
	 *
	 * @return {object}
	 */
	getDirections() {
		let x = 0;
		let y = 0;

		if( this.isPressed( this.ACTION.LEFT ) ) {
			x = -1;
		}
		else if( this.isPressed( this.ACTION.RIGHT ) ) {
			x = 1;
		}

		if( this.isPressed( this.ACTION.UP ) ) {
			y = -1;
		}
		else if( this.isPressed( this.ACTION.DOWN ) ) {
			y = 1;
		}

		if( !x || !y ) {
			const threshold = 0.3;

			for( const index in this.gamepads ) {
				const gp = this.gamepads[index];

				if( gp.axes[0] && Math.abs( gp.axes[0] ) > threshold ) {
					x = ( gp.axes[0] > 0 ) ? 1 : -1;
				}
				else if( gp.axes[2] && Math.abs( gp.axes[2] ) > threshold ) {
					x = ( gp.axes[2] > 0 ) ? 1 : -1;
				}

				if( gp.axes[1] && Math.abs( gp.axes[1] ) > threshold ) {
					y = ( gp.axes[1] > 0 ) ? 1 : -1;
				}
				else if( gp.axes[3] && Math.abs( gp.axes[3] ) > threshold ) {
					y = ( gp.axes[3] > 0 ) ? 1 : -1;
				}
			}
		}

		return { x, y };
	},


	/**
	 * Get the keyboard key codes and gamepad
	 * button codes for a certain action.
	 * @param  {number} action
	 * @return {object}
	 */
	getKeysForAction( action ) {
		return this.ACTION_KEY_MAP[action];
	},


	/**
	 * Initialize the input handler.
	 */
	init() {
		// There is gamepad bug in Firefox on Linux, but not Windows, maybe macOS.
		const ua = String( navigator.userAgent ).toLowerCase();
		this.isLinuxFirefox = ua.includes( 'linux' ) && ua.includes( 'firefox' );

		this.buildActionKeyMap();
		this.registerEvents();
	},


	/**
	 *
	 * @param  {number}   action
	 * @param  {?boolean} forget
	 * @return {boolean}
	 */
	isPressed( action, forget ) {
		const keys = this.getKeysForAction( action );

		for( const key of keys.keyboard ) {
			if( this.isPressedKey( key, forget ) ) {
				return true;
			}
		}

		for( const key of keys.gamepad ) {
			if( this.isPressedGamepad( key, forget ) ) {
				return true;
			}
		}

		// Also check axes.
		// Has to be done as workaround for Firefox.
		// @see https://bugzilla.mozilla.org/show_bug.cgi?id=1464940
		if( action === this.ACTION.LEFT ) {
			for( const index in this.gamepads ) {
				const gp = this.gamepads[index];

				if( gp.axes[6] && gp.axes[6] <= -0.2 ) {
					if( this._ignoreUntilReleased['axis6-'] ) {
						return false;
					}

					if( forget ) {
						this._ignoreUntilReleased['axis6-'] = true;
					}

					return true;
				}
			}
		}
		else if( action === this.ACTION.RIGHT ) {
			for( const index in this.gamepads ) {
				const gp = this.gamepads[index];

				if( gp.axes[6] && gp.axes[6] >= 0.2 ) {
					if( this._ignoreUntilReleased['axis6+'] ) {
						return false;
					}

					if( forget ) {
						this._ignoreUntilReleased['axis6+'] = true;
					}

					return true;
				}
			}
		}
		else if(
			action === this.ACTION.UP ||
			action === this.ACTION.JUMP
		) {
			for( const index in this.gamepads ) {
				const gp = this.gamepads[index];

				if( gp.axes[7] && gp.axes[7] <= -0.2 ) {
					if( this._ignoreUntilReleased['axis7-'] ) {
						return false;
					}

					if( forget ) {
						this._ignoreUntilReleased['axis7-'] = true;
					}

					return true;
				}
			}
		}
		else if( action === this.ACTION.DOWN ) {
			for( const index in this.gamepads ) {
				const gp = this.gamepads[index];

				if( gp.axes[7] && gp.axes[7] >= 0.2 ) {
					if( this._ignoreUntilReleased['axis7+'] ) {
						return false;
					}

					if( forget ) {
						this._ignoreUntilReleased['axis7+'] = true;
					}

					return true;
				}
			}
		}

		return false;
	},


	/**
	 * Check if a button is currently being pressed.
	 * @param  {number}  code   - Button code.
	 * @param  {boolean} forget
	 * @return {boolean}
	 */
	isPressedGamepad( code, forget ) {
		for( const index in this.gamepads ) {
			const buttons = this.gamepads[index].buttons;
			const button = buttons[code];

			if( button && button.pressed ) {
				if( this._ignoreUntilReleased[code] ) {
					return false;
				}

				if( forget ) {
					this._ignoreUntilReleased[code] = true;
				}

				return true;
			}
		}

		return false;
	},


	/**
	 * Check if a key is currently being pressed.
	 * @param  {number}  code   - Key code.
	 * @param  {boolean} forget
	 * @return {boolean}
	 */
	isPressedKey( code, forget ) {
		const ks = this.keystate[code];

		if( ks && ks.time ) {
			if( forget ) {
				ks.time = 0;
				ks.waitForReset = true;
			}

			return true;
		}

		return false;
	},


	/**
	 * Remove an event listener.
	 * @param {string}    type
	 * @param {?function} cb
	 */
	off( type, cb ) {
		if( typeof cb !== 'function' ) {
			this._on[type] = [];
			return;
		}

		const pos = this._on[type].indexOf( cb );

		if( pos >= 0 ) {
			this._on[type].splice( pos, 1 );
		}
	},


	/**
	 * Add an event listener.
	 * @param {string}   type
	 * @param {function} cb
	 */
	on( type, cb ) {
		this._on[type].push( cb );
	},


	/**
	 * Add a listener for the keydown event.
	 * @param {string}   code - Key code.
	 * @param {function} cb   - Callback.
	 */
	onKeyDown( code, cb ) {
		const list = this._onKeyDown[code] || [];
		list.push( cb );
		this._onKeyDown[code] = list;
	},


	/**
	 * Add a listener for the keyup event.
	 * @param {string}   code - Key code.
	 * @param {function} cb   - Callback.
	 */
	onKeyUp( code, cb ) {
		const list = this._onKeyUp[code] || [];
		list.push( cb );
		this._onKeyUp[code] = list;
	},


	/**
	 *
	 */
	registerEvents() {
		document.body.onkeydown = ev => {
			const ks = this.keystate[ev.code];

			if( !ks || !ks.waitForReset ) {
				this.keystate[ev.code] = {
					time: Date.now()
				};

				if( this._onKeyDown[ev.code] ) {
					this._onKeyDown[ev.code].forEach( cb => cb() );
				}
			}

			if( ev.code === 'Digit1' ) {
				this.PROMPTS = 1;
			}
			else if( ev.code === 'Digit2' ) {
				this.PROMPTS = 2;
			}
			else if( ev.code === 'Digit3' ) {
				this.PROMPTS = 3;
			}
		};

		document.body.onkeyup = ev => {
			this.keystate[ev.code] = {
				time: 0
			};

			if( this._onKeyUp[ev.code] ) {
				this._onKeyUp[ev.code].forEach( cb => cb() );
			}
		};

		window.addEventListener( 'gamepadconnected', ev => {
			const id = String( ev.gamepad.id ).toLowerCase();

			if(
				id.includes( 'sony' ) ||
				id.includes( 'dualshock' ) ||
				id.includes( 'playstation' ) ||
				id.includes( 'ps3' )
			) {
				this.PROMPTS = 2;
			}
			else if(
				id.includes( 'xbox' ) ||
				id.includes( 'microsoft' )
			) {
				this.PROMPTS = 3;
			}

			this.numGamepads++;
			this.gamepads[ev.gamepad.index] = ev.gamepad;

			this._on.gp_connect.forEach( cb => cb() );
		} );

		window.addEventListener( 'gamepaddisconnected', ev => {
			this.PROMPTS = 1;

			this.numGamepads--;
			delete this.gamepads[ev.gamepad.index];

			this._on.gp_disconnect.forEach( cb => cb() );
		} );
	},


	/**
	 * Update gamepad data.
	 */
	update() {
		const gamepads = navigator.getGamepads();

		for( const gamepad of gamepads ) {
			// Chromium has 4 indices, but they may be null as value.
			if( !gamepad ) {
				continue;
			}

			this.gamepads[gamepad.index] = gamepad;

			for( const code in this._ignoreUntilReleased ) {
				if( code === 'axis6-' || code === 'axis6+' ) {
					if( !gamepad.axes[6] ) {
						delete this._ignoreUntilReleased[code];
					}
				}
				else if( code === 'axis7-' || code === 'axis7+' ) {
					if( !gamepad.axes[7] ) {
						delete this._ignoreUntilReleased[code];
					}
				}
				else if( gamepad.buttons[code] && !gamepad.buttons[code].pressed ) {
					delete this._ignoreUntilReleased[code];
				}
			}
		}
	}


};
