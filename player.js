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
       this.haveGills = unlocked('gills');

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
       this.maxBreath = 1200;
       this.breath = this.maxBreath;
       this.drowning = false;
       this.swimming = false;

       this.fallCounter = 0;
       this.impactCounter = 0;
       this.bubbleCounter = 0;

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
       me.input.bindKey( me.input.KEY.V, "rocket" );
       me.input.bindKey( me.input.KEY.C, "buttstomp" );
       //me.input.bindKey( me.input.KEY.B, "attack" );
       //me.input.bindKey( me.input.KEY.N, "shield" );
       me.input.bindKey( me.input.KEY.A, "abilities" );

       me.game.player = this;

       // TODO hack: z not set yet so do constant z
       //var egg = spawnParticle( this.pos.x, this.pos.y, "egg", 144,
       //    [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ], 7, 10 );
       var eggsettings = new Object();
       eggsettings.image = "egg";
       eggsettings.spritewidth = 144;
       var egg = new Egg( this.pos.x, this.pos.y, 10, eggsettings );
       me.game.add( egg );
       me.game.sort();
       me.audio.play( "spawn" );
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
            me.audio.play( "hit" );
            this.setCurrentAnimation( "die" );
            me.audio.play( "die" );
            this.flicker( 90, function () {
                this.die( type );
            });
        }
        else if( this.shield ) {
            // TODO maybe different sound for shield
            me.audio.play( "hit" );
            this.shield.flicker( 90, function() {
                me.game.player.shield = null;
                me.game.remove( this );
                me.game.sort();
            });
            if ( type == 'drown' )
            {
                // give some extra time
                this.breath += 120;
            }
        }
    },

    die: function( type )
    {
        me.game.deathCount++;

        function unlock( skill ) {
            me.state.current().abilities[skill] = true;
        }
        function toggle( skill ) {
            me.state.current().abilities[skill] =
                !me.state.current().abilities[skill];
        }

        var skillmap = {
            fall: 'doubleJump',
            enemy: 'shield',
            spikes: 'spikeHat',
            rock: 'buttStomp',
            bomb: 'rocketJump',
            saw: 'wallStick',
            drown: 'gills'
        };

        if( skillmap[type] ) {
            // have to do special case for gills toggle
            if ( skillmap[type] == 'gills' )
            {
                toggle( skillmap[type] );
            }
            else
            {
                unlock( skillmap[type] );
            }
        }

        console.log( "player died type %s", type );
        me.game.viewport.fadeIn( '#000000', 1000, function() {
            me.levelDirector.reloadLevel();
            me.state.current().changeLevel( );
        });

        // have to force restart on music
        if ( type == "drown" || this.drowning )
        {
            if ( this.drowning )
            {
                me.audio.stop( "drown" );
            }
            me.audio.playTrack( me.state.current().getCurrentMusic() );
        }
    },

    update: function()
    {
        if( this.hp > 0 ) {
            this.checkInput();
        }

        function canBreatheWater( gills )
        {
            return ( gills == undefined ? false : gills );
        }

        // check breath
        // can't do != due to undefined, no XOR... BOO JAVASCRIPT
        if ( this.swimming != canBreatheWater( this.haveGills ) )
        {
            this.breath--;
            if ( this.breath % 60 == 0 )
                console.log( "held breath (swimming %i, gills %i)", this.swimming, canBreatheWater( this.haveGills ) );

            // 11 seconds for drown sound
            if ( this.breath < 660 && !this.drowning )
            {
                me.audio.stopTrack();
                me.audio.play( "drown" );
                console.log( "!!!! drowning" );
                this.drowning = true;
            }
            if ( this.breath == 0 )
            {
                this.hit( "drown" );
            }
        }

        var lastFalling = this.falling;

        // check collision against environment
        var envRes = this.updateMovement();

        if ( this.falling && !this.wallStuck && !this.swimming &&
             this.vel.y > 1.0 )
        {
            this.fallCounter++;
        }

        if (
            this.haveWallStick &&
            ( ( this.jumping || this.falling ) && ! this.swimming ) &&
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
            me.audio.play( "wallstick" );
        }
        else if ( envRes.y > 0 )
        {
            if ( this.fallCounter > 65 )
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

            if ( lastFalling && !this.falling )
            {
                this.rocketJumped = false;
                this.doubleJumped = false;
                this.buttStomped = false;
                this.resetFall();
                me.audio.play( "step" );
            }
        }
        else if ( envRes.y < 0 )
        {
            //console.log( "ceiling?" );
        }

        // check collision against other objects
        var colRes = me.game.collide( this );
        if ( colRes )
        {
            if ( colRes.obj.type == "rock" )
            {
                this.hit( colRes.obj.type );
            }
            else if ( colRes.obj.type == "bomb" )
            {
                this.hit( colRes.obj.type );
            }
            else if ( !this.swimming && colRes.obj.type == "water" )
            {
                console.log( "into water" );
                this.vel.y *= .5;
                this.vel.x *= .5;
                this.falling = false;
                this.jumping = false;
                this.resetFall();
                this.swimming = true;
                this.gravity = 0;
                this.setCurrentAnimation( "swim" );
                this.animationspeed = 7;
                spawnParticle( this.pos.x, colRes.obj.pos.y - 192, "splash", 144,
                    [ 0, 1, 2, 3, 4, 5, 6, 7 ], 3, this.z + 1 );
                me.audio.play( "splash" );
                if ( this.haveGills )
                {
                    console.log( "into water with gills, resetting breath" );
                    this.resetBreath();
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
                    colRes.obj.collidable = false;
                    me.audio.play( "balloonpop" );
                    colRes.obj.setCurrentAnimation( "pop", function()
                        {
                            me.game.remove( this );
                            me.game.sort();
                        } );
                }
            }
        }
        // set swimming false if not colliding with anything & swimming
        else if( this.swimming )
        {
            console.log( "out of water" );
            this.animationspeed = 4;
            this.swimming = false;
            this.gravity = this.origGravity;
            me.audio.play( "splashout" );
            if ( !this.haveGills )
            {
                console.log( "out of water, lungs, resetting breath" );
                this.resetBreath();
            }
        }

        // update animation

        // force impact frame to stay for a few frames
        if ( this.isCurrentAnimation( "buttstomp" ) && !this.falling )
        {
            this.impactCounter = 10;
            spawnParticle( this.pos.x, this.pos.y, "buttstompimpact", 144,
                [ 0, 1, 2, 3, 4 ], 3, this.z + 1 );
            me.audio.play( "buttstomp" );
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
        else if ( this.jumping && !this.swimming )
        {
            this.setCurrentAnimation( "jump" );
        }
        else if ( this.falling && !this.swimming )
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

        // hack to get current frame
        if ( this.isCurrentAnimation( "run" ) )
        {
            if ( this.current.idx == 0 )
            {
                this.stepped = false;
            }
            else if ( this.current.idx == 2 && !this.stepped )
            {
                me.audio.play( "step" );
                this.stepped = true;
            }
        }

        // bubble spawn if swimming
        if ( this.swimming )
        {
            this.bubbleCounter++;

            if ( this.bubbleCounter == 150 )
            {
                var xPos = this.pos.x;
                // hack of a method to check for flip
                if ( this.scale.x > 0 )
                {
                    xPos += 120;
                }
                var blebsettings = new Object();
                blebsettings.image = "bubble";
                blebsettings.spritewidth = 24;

                var bleb = new Bubble( xPos, this.pos.y + 76, this.z + 1,
                    blebsettings );
                bleb.setCurrentAnimation( "idle",
                    function() { me.game.remove( this ) } );
                me.game.add( bleb );
                me.game.sort();

                this.bubbleCounter = 0;
            }
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

    resetBreath: function()
    {
        if ( this.drowning )
        {
            me.audio.stop( "drown" );
            me.audio.playTrack( me.state.current().getCurrentMusic() );
            this.drowning = false;
        }
        this.breath = this.maxBreath;
    },

    checkInput: function()
    {
        if ( me.input.isKeyPressed( "abilities" ) )
        {
            if ( me.state.current().skillDisplay )
            {
                // TODO this is broken atm
                // me.state.current().skillDisplay.reset( "skillDisplay" );
            }
        }

        if ( this.wallStuck )
        {
            // TODO why do i need to do this? (iskeypressed fails second time)
            var jumpkey = me.input.isKeyPressed( "jump" );
            if ( jumpkey || me.input.isKeyPressed( "down") )
            {
                this.gravity = this.origGravity;
                this.wallStuck = false;
                this.wallStuckCounter = 15;
                //this.vel.y = -20.0;

                if ( jumpkey )
                {
                    this.flipX( this.wallStuckDir > 0 );
                    this.forceJump();
                    me.audio.play( "jump" );
                    this.vel.x = this.wallStuckDir * -10.0;
                }
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
                //this.doJump();
                this.vel.y = -movespeed * 1.5;
                me.audio.play( "jump" );
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
                me.audio.play( "jump" );
            }
            // double jump
            else if ( this.haveDoubleJump && !this.doubleJumped )
            {
                this.resetFall();
                this.forceJump();
                this.doubleJumped = true;
                spawnParticle( this.pos.x, this.pos.y, "doublejump", 144,
                    [ 0, 1, 2, 3, 4, 5 ], 3, this.z + 1 );
                me.audio.play( "doublejump" );
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
                    [ 0, 1, 2, 3, 4, 5, 6, 7 ], 3, this.z + 1 );
                me.audio.play( "explosion" );
            }
        }

        if ( me.input.isKeyPressed( "buttstomp" ) && this.haveButtStomp &&
            !this.buttStomped && ( this.jumping || this.falling ) )
        {
            // see above
            this.setVelocity( 5.0, 15.0 );
            this.vel.y = 15.0;
            this.buttStomped = true;
            me.audio.play( "attack" );
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
