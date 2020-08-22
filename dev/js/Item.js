'use strict';


{

class Item extends js13k.LevelObject {


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		if( this.isStuck ) {
			this.velocityX = 0;
			this.velocityY = 0;

			return;
		}

		// Do not set the position just yet. We need the current and
		// projected next position for collision detection. The collision
		// detection will then set the correct position.
		this.nextPos.x = this.x + this.velocityX;
		this.nextPos.y = this.y + this.velocityY;
	}


}


js13k.Item = Item;

}
