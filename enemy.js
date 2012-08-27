/* Defines the enemies.  */
var Saw = me.ObjectEntity.extend({
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.toprange = y;
		this.bottomrange = y + settings.height;

		this.changeDirection( false );
		this.flipX( settings.direction || false );

		this.animationspeed = 2;

		this.setVelocity( 0, 1.5 );
		this.gravity = 0;

		this.collidable = true;
		this.type = me.game.ENEMY_OBJECT;

		this.addAnimation( "idle", [0, 1, 2] );
		this.setCurrentAnimation( "idle" );
	},

	changeDirection: function( d ) {
		this.direction = d;
	},

	onCollision: function( res, obj ) {
		if ( obj == me.game.player ) {
			obj.hit("saw");
		}
	},

	update: function() {
		if ( !this.visible ) {
			return false;
		}

		this.parent();

		// arbitrary math
		this.vel.y = ( this.direction ? -1 : 1 ) * 1.5 * me.timer.tick;
		this.pos.add( this.vel );

		// Turn around at extents.
		if( this.bottom > this.bottomrange || this.top < this.toprange ) {
			this.changeDirection( ! this.direction );
		}
		return false;
	}

});

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
		this.collidable = false;
		this.setCurrentAnimation( "die" );
		this.setVelocity( 0, 0 );
		this.flicker( 90, function() {
			me.game.remove( this );
		});
	},

	onCollision: function( res, obj ) {
		this.collide( res, obj );
	},

	collide: function( res, obj ) {
		if ( obj == me.game.player ) {
			 if ( res.y > 0 && obj.buttStomped) {
				this.die();
			}
			else {
				obj.hit("enemy");
				this.die();
			}
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
