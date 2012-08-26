/* Defines the enemies.  */

var Enemy = me.ObjectEntity.extend({
	
	init: function( x, y, settings ){
		this.parent( x, y, settings );

		// Pick the starting direction
		this.changeDirection( settings.direction || 0 );

		// Starting velocity is arbitrary.
		this.setVelocity( 1, 0 );
		this.setMaxVelocity( 1, 8 );

		// Gravity is arbitrary.
		this.gravity = 0.6;

		//this.updateColRect( 8, 32, -1 );

		this.collidable = true;
		this.type = me.game.ENEMY_OBJECT;

		this.addAnimation( "idle", [0] );
		this.addAnimation( "die", [3] );
		this.addAnimation( "run", [1, 0, 2, 0] );

		this.setCurrentAnimation( "run" );
	},

	changeDirection: function( d ) {
		this.direction = d;
		this.flipX( d );
	},

	die: function() {
		this.alive = false;
		me.game.remove( this );
	},

	onCollision: function( res, obj ) {
		this.collide( res, obj );
	},

	checkCollision: function( obj ) {
		// collision optimization - this may not actually be necessary if we don't need to check enemy collision against something else
		if ( this.type == obj.type ) {
			this.changeDirection( ! this.direction );
			return null;
		}
		return this.parent( obj );
	},

	collide: function( res, obj ) {
		if ( obj == me.game.player ) {
			/*
			 if ( res.y > 0 ) {
				// kill enemies on stomp? may change later
				this.die();
				me.game.kills++;
				this.spawnParticle( this.pos.x, this.pos.y, "bloodsplat", 48, [ 0, 1, 2, 3, 4, 5, 6 ], 4 );
				me.audio.play( "stompdeath" );
			}
			*/
		}
	},

	update: function() {
		if ( !this.visible ) {
			return false;
		}

		this.parent();
		this.doWalk( this.direction );

		var collision = this.updateMovement();
		if( collision.x ) {
			this.changeDirection( ! this.direction );
		}
		return false;
	}
});
