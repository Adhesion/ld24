/*
 * player.js
 *
 * Defines various environmental objects.
 *
 * @author Adhesion
 */

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
        if ( Math.abs( this.pos.x - me.game.player.getCenter().x ) < 50 )
        {
            this.gravity = 0.9;
        }
        var envRes = this.updateMovement();
        // remove rock after hitting ground
        if ( envRes.y > 0 && this.collidable )
        {
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

var Spikes = me.ObjectEntity.extend(
{
    init: function( x, y, settings )
    {
        this.parent( x, y, settings );
        this.gravity = 0.0;
        this.collidable = true;
    }
});
