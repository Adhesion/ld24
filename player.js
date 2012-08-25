/*
 * player.js
 *
 * Defines the player.
 *
 * @author Adhesion
 */

var Player = me.ObjectEntity.extend(
{
   init: function( x, y, settings )
   {
       this.parent( x, y, settings );

       this.updateColRect( 44, 88, 59, 76 );

       this.setVelocity( 5.0, 11.0 );
       this.origGravity = 0.4;
       this.gravity = this.origGravity;
       this.setFriction( 0.2, 0.1 );

       this.collidable = true;

       this.animationspeed = 4;

       this.addAnimation( "idle", [ 0 ] );
       this.addAnimation( "jump", [ 1 ] );
       this.addAnimation( "fall", [ 2 ] );
       this.addAnimation( "run", [ 3, 4, 5, 6 ] );
       this.addAnimation( "attack", [ 7 ] );
       this.addAnimation( "wallstuck", [ 8 ] );
       this.addAnimation( "buttstomp", [ 9 ] );
       this.addAnimation( "impact", [ 10 ] );

       // abilities
       this.haveDoubleJump = true;
       this.haveRocketJump = true;
       this.haveWallStick = true;
       this.haveButtStomp = true;
       this.spikeHat = true;

       // mobility stuff
       this.doubleJumped = false;
       this.rocketJumped = false;
       this.wallStuck = false;
       this.buttStomped = false;

       this.fallCounter = 0;
       this.impactCounter = 0;

       this.hp = 1;

       this.centerOffsetX = 72;
       this.centerOffsetY = 72;

       me.game.viewport.follow( this.pos, me.game.viewport.AXIS.BOTH );
       me.game.viewport.setDeadzone( me.game.viewport.width / 10, 1 );

       me.input.bindKey( me.input.KEY.LEFT, "left" );
       me.input.bindKey( me.input.KEY.RIGHT, "right" );
       me.input.bindKey( me.input.KEY.X, "jump", true );
       me.input.bindKey( me.input.KEY.C, "rocket" );
       me.input.bindKey( me.input.KEY.V, "buttstomp" );
       me.input.bindKey( me.input.KEY.B, "attack" );
       me.input.bindKey( me.input.KEY.N, "shield" );

       me.game.player = this;
   },

    getCenter: function()
    {
        return new me.Vector2d( this.pos.x + this.centerOffsetX,
            this.pos.y + this.centerOffsetY );
    },

    hit: function( type )
    {
        this.hp--;
        if ( this.hp == 0 )
        {
            this.flicker( 90, this.die( type ) );
        }
    },

    die: function( type )
    {
        console.log( "player died type %s", type );
    },

    update: function()
    {
        this.checkInput();

        if ( this.falling )
        {
            this.fallCounter++;
        }

        // check collision against environment
        var envRes = this.updateMovement();

        if ( ( this.jumping || this.falling ) &&
            envRes.x != 0 && envRes.y == 0 )
        {
            console.log( "wall?" );
            if ( this.haveWallStick )
            {
                console.log( "wallstuck" );
                //this.wallStuck = true;
                //this.gravity = 0.0;
            }
        }
        else if ( envRes.y > 0 )
        {
            //console.log( envRes.tileId );
            if ( this.fallCounter > 150 )
            {
                this.hit( "fall" );
            }
            //console.log( "floor?" );
            this.rocketJumped = false;
            this.doubleJumped = false;
            this.buttStomped = false;
            this.fallCounter = 0;
        }
        else if ( envRes.y < 0 )
        {
            //console.log( "ceiling?" );
        }
        else if ( this.falling )
        {
            this.fallCounter++;
        }

        // check collision against other objects
        var colRes = me.game.collide( this );
        if ( colRes )
        {
            if ( colRes.obj.type == "rock" )
            {
                console.log( "rock collision" );
                if ( !this.spikeHat )
                {
                    this.hit( colRes.obj.type );
                }
            }
            else if ( colRes.obj.type == "spikes" )
            {
                this.vel.y = 0;
                if ( colRes.y > 0 )
                {
                    this.hit( colRes.obj.type );
                }
            }
            else if ( colRes.obj.type == "balloon" )
            {
                this.vel.y = 0;
                if ( this.spikeHat )
                {
                    me.game.remove( colRes.obj );
                    // spawn balloon pop particle
                }
            }
        }

        // update animation

        // force impact frame to stay for a few frames
        if ( this.isCurrentAnimation( "buttstomp" ) && !this.falling )
        {
            this.impactCounter = 10;
        }

        if ( this.impactCounter > 0 )
        {
            this.setCurrentAnimation( "impact" );
        }
        else if ( this.wallStuck )
        {
            this.setCurrentAnimation( "wallstuck" );
        }
        else if ( this.buttStomped )
        {
            this.setCurrentAnimation( "buttstomp" );
        }
        else if ( this.jumping )
        {
            this.setCurrentAnimation( "jump" );
        }
        else if ( this.falling )
        {
            this.setCurrentAnimation( "fall" );
        }
        else if ( me.input.isKeyPressed( "left" ) ||
            me.input.isKeyPressed( "right") )
        {
            this.setCurrentAnimation( "run" );
        }
        else
        {
            this.setCurrentAnimation( "idle" );
        }

        if ( this.impactCounter > 0 ) --this.impactCounter;

        this.parent( this );
        return true;
    },

    checkInput: function()
    {
        if ( me.input.isKeyPressed( "left" ) )
        {
            this.doWalk( true );
        }
        else if ( me.input.isKeyPressed( "right" ) )
        {
            this.doWalk( false );
        }

        if ( me.input.isKeyPressed( "jump" ) )
        {
            if ( this.wallStuck )
            {
                this.gravity = this.origGravity;
                this.doJump();
                this.wallStuck = false;
            }
            else
            {
                if ( !this.jumping && !this.falling )
                {
                    this.doJump();
                }
                // double jump
                else if ( this.haveDoubleJump && !this.doubleJumped )
                {
                    console.log( "double jump" );
                    this.forceJump();
                    this.doubleJumped = true;
                }
            }
        }

        if ( me.input.isKeyPressed( "rocket" ) && this.haveRocketJump &&
            !this.rocketJumped )
        {
            if ( !this.rocketJumped )
            {
                this.vel.y = -35.0;
                this.rocketJumped = true;
            }
        }

        if ( me.input.isKeyPressed( "buttstomp" ) && this.haveButtStomp &&
            !this.buttStomped )
        {
            this.vel.y = 30.0;
            this.buttStomped = true;
        }
    }
});
