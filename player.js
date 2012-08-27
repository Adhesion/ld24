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

       this.addAnimation( "idle", [ 0, 1, 2, 3 ] );
       this.addAnimation( "jump", [ 4 ] );
       this.addAnimation( "jump_extra", [ 5 ] );
       this.addAnimation( "fall", [ 6 ] );
       this.addAnimation( "run", [ 7, 8, 9, 10 ] );
       this.addAnimation( "attack", [ 11 ] );
       this.addAnimation( "wallstuck", [ 12 ] );
       this.addAnimation( "buttstomp", [ 13 ] );
       this.addAnimation( "impact", [ 14 ] );
       this.addAnimation( "die", [ 15 ] );
       this.addAnimation( "swim_idle", [ 16, 17, 18, 19 ] );
       this.addAnimation( "swim", [ 20, 21, 22, 23 ] );


       var vars = {};
       var parts = window.location.href.replace(
           /[?&]+([^=&]+)=([^&]*)/gi,
           function(m,key,value) {
               vars[key] = value;
           }
       );
       function unlocked( skill ) {
           var state = me.state.current().abilities[skill] || vars[skill];
           return state;
       }

       // abilities
       this.haveDoubleJump = unlocked('doubleJump');
       this.haveRocketJump = unlocked('rocketJump');
       this.haveButtStomp = unlocked('buttStomp');
       this.haveWallStick = unlocked('wallStick');
       this.spikeHat = unlocked('spikeHat');

       //var shieldsettings = new Object();
       //shieldsettings.image = "shield";
       //shieldsettings.spritewidth = 144;

       //this.shield = new me.ObjectEntity( this.pos.x, this.pos.y,
       //    shieldsettings );
       //this.shield.animationspeed = 3;
       //var frames = [ 0, 1, 2, 3, 4, 5 ];
       //this.shield.addAnimation( "play", frames );
       //this.shield.setCurrentAnimation( "play" );

       if( unlocked('shield') ) {
           this.addShield( this.pos.x, this.pos.y, "shield", 144,
               [ 0, 1, 2, 3, 4, 5 ], 5, 5 );
       }

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
        if ( this.hp == 0 ) {
            this.setCurrentAnimation( "die" );
            this.flicker( 90, function () {
                this.die( type );
            });
        }
        else if( this.shield ) {
            this.shield.flicker( 90, function() {
                me.game.player.shield = null;
                me.game.remove( this );
                me.game.sort();
            });
        }
    },

    die: function( type )
    {
        function unlock( skill ) {
            me.state.current().abilities[skill] = true;
        }

        var skillmap = {
            fall: 'doubleJump',
            enemy: 'shield',
            spikes: 'spikeHat',
            rock: 'buttStomp',
            bomb: 'rocketJump',
            saw: 'wallStick'
        };

        if( skillmap[type] ) {
            unlock( skillmap[type] );
        }

        console.log( "player died type %s", type );
        me.game.viewport.fadeIn( '#000000', 1000, function() {
            me.levelDirector.reloadLevel();
            me.state.current().changeLevel( );
        });
    },

    update: function()
    {

        if( this.hp > 0 ) {
            this.checkInput();
        }

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
            this.wallStuck = true;
            this.wallStuckDir = envRes.x;
            this.gravity = this.wallStuckGravity;
            this.vel.y = 0.0;
            this.resetFall();
            this.buttStomped = false;
        }
        else if ( envRes.y > 0 )
        {
            if ( this.fallCounter > 130 )
            {
                this.hit( "fall" );
            }

            if ( envRes.yprop.isBreakable && this.buttStomped )
            {
                // terrible hack - can't seem to gettile from collision map so
                // indiscriminately destroy 3tiles
                for ( var i = envRes.ytile.row - 1; i <= envRes.ytile.row + 1;
                    i++ )
                {
                    me.game.currentLevel.clearTile( i, envRes.ytile.col );
                    me.game.collisionMap.clearTile( i, envRes.ytile.col );
                }
            }

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
                if ( !this.spikeHat )
                {
                    this.hit( colRes.obj.type );
                }
            }
            else if ( colRes.obj.type == "bomb" )
            {
                this.hit( colRes.obj.type );
            }
            else if ( !this.swimming && colRes.obj.type == "water" ) {
                this.vel.y *= .5;
                this.vel.x *= .5;
                this.falling = false;
                this.resetFall();
                this.swimming = true;
                this.gravity = 0;
                this.setCurrentAnimation( "swim" );
                this.animationspeed = 7;
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
                    colRes.collidable = false;
                    colRes.obj.setCurrentAnimation( "pop", function()
                        {
                            me.game.remove( this );
                            me.game.sort();
                        } );
                }
            }
        }
        else if( this.swimming ) {
            this.animationspeed = 4;
            this.swimming = false;
            this.gravity = this.origGravity;
        }
        // update animation

        // force impact frame to stay for a few frames
        if ( this.isCurrentAnimation( "buttstomp" ) && !this.falling )
        {
            this.impactCounter = 10;
            spawnParticle( this.pos.x, this.pos.y, "buttstompimpact", 144,
                [ 0, 1, 2, 3, 4 ], 3, this.z - 1 );
        }

        if( this.hp <= 0)
        {
            this.setCurrentAnimation( "die" );
        }
        else if ( this.impactCounter > 0 )
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
        else if ( this.doubleJumped && ! this.falling) {
            this.setCurrentAnimation( "jump_extra" );
        }
        else if ( this.rocketJumped && ! this.falling) {
            this.setCurrentAnimation( "jump_extra" );
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
            if(this.swimming) this.setCurrentAnimation( "swim" );
            else this.setCurrentAnimation( "run" );
        }
        else
        {
            if(this.swimming) this.setCurrentAnimation( "swim_idle" );
            else this.setCurrentAnimation( "idle" );
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
            this.shield.pos.y = this.pos.y + 15;
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
                this.resetFall();
                this.forceJump();
                this.doubleJumped = true;
                spawnParticle( this.pos.x, this.pos.y, "doublejump", 144,
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
                spawnParticle( this.pos.x, this.pos.y + 25, "explode", 144,
                    [ 0, 1, 2, 3, 4, 5, 6, 7 ], 3, this.z - 1 );
            }
        }

        if ( me.input.isKeyPressed( "buttstomp" ) && this.haveButtStomp &&
            !this.buttStomped && ( this.jumping || this.falling ) )
        {
            // see above
            this.setVelocity( 5.0, 15.0 );
            this.vel.y = 15.0;
            this.buttStomped = true;
        }
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
