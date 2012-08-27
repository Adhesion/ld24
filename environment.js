/*
 * player.js
 *
 * Defines various environmental objects.
 *
 * @author Adhesion
 */

/** Water is just a colision object to enable mode changes. */
var Water = me.InvisibleEntity.extend({
    init: function( x, y, settings ) {
        this.parent( x, y, settings );
        this.gravity = 0.0;
        this.collidable = true;
        this.type = 'water';
    }
});

var Rock = me.ObjectEntity.extend(
{
    init: function( x, y, settings )
    {
        this.parent( x, y, settings );
        this.gravity = 0.0;
        this.collidable = true;
        this.type = "rock";
    },

    update: function()
    {
        if ( !this.visible )
        {
            return;
        }

        if ( Math.abs( this.pos.x - me.game.player.getCenter().x ) < 50 )
        {
            this.gravity = 0.9;
        }
        var envRes = this.updateMovement();
        // remove rock after hitting ground
        if ( envRes.y > 0 && this.collidable )
        {
            me.audio.play( "hit" );
            this.die();
        }
        this.parent( this );
        return true;
    },

    die: function()
    {
        this.collidable = false;
        this.flicker( 60,
            function() { me.game.remove( this ); me.game.sort(); } );
    },

    checkCollision: function( obj )
    {
        // rocks should go away after they hit another object as well
        var retVal = this.parent( obj );
        if ( retVal )
        {
            this.die();
        }
        return retVal;
    }
});

var Bubble = me.ObjectEntity.extend(
{
    init: function( x, y, z, settings )
    {
        this.parent( x, y, settings );
        this.gravity = 0.0;
        this.vel.y = -0.5;
        this.collidable = false;
        this.addAnimation( "idle", [ 0, 1, 2, 3, 4, 5, 6 ] );
        this.setCurrentAnimation( "idle",
            function() { me.game.remove( this ) } );
        this.animationSpeed = 3;
        me.audio.play( "bubble" );
        this.z = z;
    },

    update: function()
    {
        // TODO for some reason this didn't work as an anonymous function?
        // (parent)
        this.updateMovement();
        this.parent( this );
        return true;
    }
});

// TODO same as bubble, super redundant :(
var Egg = me.ObjectEntity.extend(
    {
        init: function( x, y, z, settings )
        {
            this.parent( x, y, settings );
            this.gravity = me.game.player.gravity;
            this.friction = me.game.player.friction;
            this.collidable = false;
            this.addAnimation( "idle", [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ] );
            this.setCurrentAnimation( "idle",
                function() { me.game.remove( this ) } );
            //this.setCurrentAnimation( "idle", function() { this.setCurrentAnimation( "broken", function() {
            //    this.flicker( 60,
            //        function() { me.game.remove( this ) } ) } ) } );
            //;
            this.animationSpeed = 7;
            this.z = z;
        },

        update: function()
        {
            this.updateMovement();
            this.parent( this );
            return true;
        }
    });

// TODO these might not have to be classes, maybe just entity props in map?

var Spikes = me.ObjectEntity.extend(
{
    init: function( x, y, settings )
    {
        this.parent( x, y, settings );
        this.gravity = 0.0;
        this.collidable = true;
        this.type = "spikes";
    }
});

var Balloon = me.ObjectEntity.extend(
{
    init: function( x, y, settings )
    {
        this.parent( x, y, settings );
        this.gravity = 0.0;
        this.collidable = true;
        this.type = "balloon";

        this.addAnimation( "idle", [ 0 ] );
        this.addAnimation( "pop", [ 1, 2, 3 ] );
        this.setCurrentAnimation( "idle" );
    }
});
