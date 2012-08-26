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

       this.origVelocity = new me.Vector2d( 5.0, 11.0 );
       this.setVelocity( this.origVelocity.x, this.origVelocity.y );
       this.origGravity = 0.4;
       this.gravity = this.origGravity;
       this.setFriction( 0.2, 0.1 );

       this.wallStuckGravity = 0.0;

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
       this.haveButtStomp = true;
       this.haveWallStick = true;
       this.spikeHat = true;

       //var shieldsettings = new Object();
       //shieldsettings.image = "shield";
       //shieldsettings.spritewidth = 144;

       //this.shield = new me.ObjectEntity( this.pos.x, this.pos.y,
       //    shieldsettings );
       //this.shield.animationspeed = 3;
       //var frames = [ 0, 1, 2, 3, 4, 5 ];
       //this.shield.addAnimation( "play", frames );
       //this.shield.setCurrentAnimation( "play" );

       this.addShield( this.pos.x, this.pos.y, "shield", 144,
           [ 0, 1, 2, 3, 4, 5 ], 5, 5 );

       // mobility stuff
       this.doubleJumped = false;
       this.rocketJumped = false;
       this.buttStomped = false;
       this.wallStuck = false;
       this.wallStuckDir = 0.0;
       this.wallStuckCounter = 0;

       this.fallCounter = 0;
       this.impactCounter = 0;

       this.hp = 1;
       if ( this.shield )
       {
           this.hp++;
       }

       this.centerOffsetX = 72;
       this.centerOffsetY = 72;

       this.followPos = new me.Vector2d( this.pos.x + this.centerOffsetX,
           this.pos.y + this.centerOffsetY );

       me.game.viewport.follow( this.followPos, me.game.viewport.AXIS.BOTH );
       me.game.viewport.setDeadzone( me.game.viewport.width / 10, 1 );

       me.input.bindKey( me.input.KEY.UP, "up" );
       me.input.bindKey( me.input.KEY.DOWN, "down" );
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
        else
        {
            this.shield.flicker( 90,
                function()
                {
                    me.game.player.shield = null;
                    //me.game.player.shield.die();
                    me.game.remove( this );
                    me.game.sort();
                } );
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

        if (
            this.haveWallStick &&
            ( this.jumping || this.falling && ! this.swimming) &&
            envRes.x != 0 &&
            envRes.y == 0 &&
            envRes.xtile != null &&
            !envRes.xprop.isPlatform &&
            !envRes.xprop.isSlope
        )
        {
            if ( envRes.xtile.isCollisionMap )
            {
                console.log( "colmap" );
            }
            //console.log( "wallstuck" );
            this.wallStuck = true;
            this.wallStuckDir = envRes.x;
            this.gravity = this.wallStuckGravity;
            this.vel.y = 0.0;
            this.resetFall();
            this.buttStomped = false;
        }
        else if ( envRes.y > 0 )
        {
            //console.log( envRes.tileId );
            if ( this.fallCounter > 130 )
            {
                this.hit( "fall" );
                console.log( "falldeath" );
            }
            //console.log( "floor?" );
            this.rocketJumped = false;
            this.doubleJumped = false;
            this.buttStomped = false;
            this.resetFall();
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
            else if ( !this.swimming && colRes.obj.type == "water" ) {
                this.vel.y *= .5;
                this.vel.x *= .5;
                this.falling = false;
                this.resetFall();
                this.swimming = true;
                this.gravity = 0;
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
        else if( this.swimming ) {
            this.swimming = false;
            this.gravity = this.origGravity;
        }
        // update animation

        // force impact frame to stay for a few frames
        if ( this.isCurrentAnimation( "buttstomp" ) && !this.falling )
        {
            this.impactCounter = 10;
            this.spawnParticle( this.pos.x, this.pos.y, "buttstompimpact", 144,
                [ 0, 1, 2, 3, 4 ], 3, this.z - 1 );
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
        else if (
            me.input.isKeyPressed( "left" ) || me.input.isKeyPressed( "right" )
            || ( this.swimming && ( me.input.isKeyPressed( "up" ) || me.input.isKeyPressed( "down" ) ) ) )
        {
            this.setCurrentAnimation( "run" );
        }
        else
        {
            this.setCurrentAnimation( "idle" );
        }

        if ( this.impactCounter > 0 ) --this.impactCounter;
        if ( this.wallStuckCounter > 0 ) --this.wallStuckCounter;

        // update cam follow position
        this.followPos.x = this.pos.x + this.centerOffsetX;
        this.followPos.y = this.pos.y + this.centerOffsetY;

        // update shield
        if ( this.shield )
        {
            this.shield.pos.x = this.pos.x;
            this.shield.pos.y = this.pos.y;
        }

        this.parent( this );
        return true;
    },

    resetFall: function()
    {
        this.fallCounter = 0;
        this.setVelocity( this.origVelocity.x, this.origVelocity.y );
    },

    checkInput: function()
    {
        if ( this.wallStuck )
        {
            if ( me.input.isKeyPressed( "jump" ) )
            {
                this.gravity = this.origGravity;
                this.forceJump();
                this.wallStuck = false;
                this.vel.x = this.wallStuckDir * -10.0;
                //this.vel.y = -20.0;
                this.wallStuckCounter = 15;
            }
            return;
        }

        if ( this.swimming ) {
            // Arbitrary. Friction would be better than changing velocity.
            // Someone should fix this.
            movespeed = this.accel.x * me.timer.tick * .8;
            if( me.input.isKeyPressed( "up" ) )
            {
                this.vel.y = -movespeed * .75;
            }
            if ( me.input.isKeyPressed( "down" ) )
            {
                this.vel.y = movespeed * .75;
            }
            if ( me.input.isKeyPressed( "left" ) )
            {
                this.flipX( true );
                this.vel.x = -movespeed;
            }
            if ( me.input.isKeyPressed( "right" ) )
            {
                this.flipX( false );
                this.vel.x = movespeed;
            }

            // TODO Ugly hacks
            if ( me.input.isKeyPressed( "jump" ) ) {
                this.doJump();
            }
            return;
        }

        // only able to run if we're not right after a walljump
        if ( this.wallStuckCounter == 0 )
        {
            if ( me.input.isKeyPressed( "left" ) )
            {
                this.doWalk( true );
            }
            else if ( me.input.isKeyPressed( "right" ) )
            {
                this.doWalk( false );
            }
        }

        if ( me.input.isKeyPressed( "jump" ) )
        {
            if ( !this.jumping && !this.falling )
            {
                this.doJump();
            }
            // double jump
            else if ( this.haveDoubleJump && !this.doubleJumped )
            {
                console.log( "double jump" );
                this.resetFall();
                this.forceJump();
                this.doubleJumped = true;
                this.spawnParticle( this.pos.x, this.pos.y, "doublejump", 144,
                    [ 0, 1, 2, 3, 4, 5 ], 3, this.z - 1 );
            }
        }

        if ( me.input.isKeyPressed( "rocket" ) && this.haveRocketJump &&
            !this.rocketJumped )
        {
            if ( !this.rocketJumped )
            {
                // bit of a hack here, have to set vel to allow vel to go higher
                // (maxvel not working?)
                // gets reset on fall/wallstick
                this.resetFall();
                this.setVelocity( 5.0, 15.0 );
                this.vel.y = -15.0;
                this.rocketJumped = true;
                this.spawnParticle( this.pos.x, this.pos.y + 25, "explode", 144,
                    [ 0, 1, 2, 3, 4, 5, 6, 7 ], 3, this.z - 1 );
            }
        }

        if ( me.input.isKeyPressed( "buttstomp" ) && this.haveButtStomp &&
            !this.buttStomped )
        {
            // see above
            this.setVelocity( 5.0, 15.0 );
            this.vel.y = 15.0;
            this.buttStomped = true;
        }
    },

    spawnParticle: function( x, y, sprite, spritewidth, frames, speed, z )
    {
        var settings = new Object();
        settings.image = sprite;
        settings.spritewidth = spritewidth;

        var particle = new me.ObjectEntity( x, y, settings );
        particle.animationspeed = speed;
        particle.addAnimation( "play", frames );
        particle.setCurrentAnimation( "play",
            function() { me.game.remove( particle ) } );
        me.game.add( particle, z );
        me.game.sort();
        console.log( particle.pos.x );
        console.log( particle.pos.y );
    },

    // TODO this code is redundant and terrible. why does the commented one not
    // work :(

    addShield: function( x, y, sprite, spritewidth, frames, speed, z )
    {
        var settings = new Object();
        settings.image = sprite;
        settings.spritewidth = spritewidth;

        this.shield = new me.ObjectEntity( x, y, settings );
        this.shield.animationspeed = speed;
        this.shield.addAnimation( "play", frames );
        this.shield.setCurrentAnimation( "play" );
        me.game.add( this.shield, z );
        me.game.sort();
    }

    /*addShieldBad: function()
    {
        console.log( "addshield" );
        var settings = new Object();
        settings.image = "shield";
        settings.spritewidth = 144;

        var shield = new me.ObjectEntity( this.pos.x, this.pos.y, settings );
        shield.animationspeed = 3;
        shield.addAnimation( "play", [ 0, 1, 2, 3, 4, 5 ] );
        shield.setCurrentAnimation( "play" );
        me.game.add( shield, this.z );
        me.game.sort();
        console.log( shield.pos.x );
        console.log( shield.pos.y );
    }*/
});
