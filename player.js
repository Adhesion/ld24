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

       this.updateColRect( 36, 72, -1 );

       this.setVelocity( 5.0, 11.0 );
       this.origGravity = 0.4;
       this.gravity = this.origGravity;
       this.setFriction( 0.2, 0.1 );

       // abilities
       this.haveDoubleJump = true;
       this.haveRocketJump = true;
       this.haveWallStick = true;
       this.haveButtStomp = true;

       // mobility stuff
       this.doubleJumped = false;
       this.rocketJumped = false;
       this.wallStuck = false;
       this.buttStomping = false;

       this.fallCounter = 0;

       me.game.viewport.follow( this.pos, me.game.viewport.AXIS.BOTH );
       me.game.viewport.setDeadzone( me.game.viewport.width / 10, 1 );

       me.input.bindKey( me.input.KEY.LEFT, "left" );
       me.input.bindKey( me.input.KEY.RIGHT, "right" );
       me.input.bindKey( me.input.KEY.X, "jump", true );
       me.input.bindKey( me.input.KEY.C, "rocket" );
       me.input.bindKey( me.input.KEY.V, "buttstomp" );
       me.input.bindKey( me.input.KEY.B, "attack" );
       me.input.bindKey( me.input.KEY.N, "shield" );
   },

    die: function()
    {
        console.log( "player died" );
    },

    update: function()
    {
        this.checkInput();

        if ( this.falling )
        {
            this.fallCounter++;
        }

        var envRes = this.updateMovement();

        if ( ( this.jumping || this.falling ) &&
            envRes.x != 0 && envRes.y == 0 )
        {
            console.log( "wall?" );
            if ( this.haveWallStick )
            {
                console.log( "wallstuck" );
                this.wallStuck = true;
                //this.gravity = 0.0;
            }
        }
        else if ( envRes.y > 0 )
        {
            //console.log( "floor?" );
            this.rocketJumped = false;
            this.doubleJumped = false;
            this.buttStomping = false;
        }
        else if ( envRes.y < 0 )
        {
            console.log( "ceiling?" );
        }

        if ( this.vel.x != 0 || this.vel.y != 0 )
        {
            this.parent( this );
            return true;
        }
        return false;
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
                this.vel.y = -30.0;
                this.rocketJumped = true;
            }
        }
        if ( me.input.isKeyPressed( "buttstomp" ) && this.haveButtStomp &&
            !this.buttStomping )
        {
            this.vel.y = 25.0;
            this.buttStomping = true;
        }
    }
});
