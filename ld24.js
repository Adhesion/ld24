/*
 * ld24.js
 *
 * Main file for LD24 entry.
 *
 * @author Adhesion
 */

var jsApp =
{
    onload: function()
    {
        if ( !me.video.init( 'game', 800, 600 ) )
        {
            alert( "Sorry, it appears your browser does not support HTML5." );
            return;
        }

        me.audio.init( "mp3,ogg" );

        me.loader.onload = this.loaded.bind( this );
        me.loader.preload( gameResources );

        me.state.change( me.state.LOADING );
    },

    loaded: function()
    {
        me.state.set( me.state.INTRO, new RadmarsScreen() );
        me.state.set( me.state.MENU, new TitleScreen() );
        me.state.set( me.state.PLAY, new PlayScreen() );
        me.state.set( me.state.GAMEOVER, new GameOverScreen() );

        me.state.transition( "fade", "#000000", 150 );

        me.entityPool.add( "player", Player );
        me.entityPool.add( "enemy", Enemy );
        me.entityPool.add( "Saw", Saw );
        me.entityPool.add( "water", Water );
        me.entityPool.add( "rock", Rock );
        me.entityPool.add( "bomb", Bomb );
        me.entityPool.add( "spikes", Spikes );
        me.entityPool.add( "balloon", Balloon );
        me.entityPool.add( "StoryNode", StoryNode );
        me.entityPool.add( "LevelChanger", LevelChanger );

        me.game.deathCount = 0;

        me.debug.renderHitBox = false;

        me.state.change( me.state.INTRO);
    }
}

var PlayScreen = me.ScreenObject.extend(
{
    /** Session persistence for unlocked abilities. */
    abilities: {
    },

    init: function()
    {
        this.storyDisplay = new StoryDisplay();
        this.levelDisplay = new LevelDisplay();
        this.skillDisplay = new SkillDisplay();

        this.music = "";
    },

    showStoryText: function( text )
    {
        this.storyDisplay.setText( 'storyDisplay', text );
    },

    getLevel: function()
    {
        return this.parseLevel( me.levelDirector.getCurrentLevelId() );
    },

    parseLevel: function( input )
    {
        var re = /level(\d+)/;
        var results = re.exec( input );
        return results[1];
    },

    /** Update the level display & music. Called on all level changes. */
    changeLevel: function( )
    {
        this.levelDisplay.reset("levelDisplay");
        this.skillDisplay.reset('skillDisplay');

        var curLevel = this.getLevel();

        this.lastMusic = this.music;
        if ( curLevel < 6 )
        {
            this.music = "forest";
        }
        else if ( curLevel < 11 )
        {
            this.music = "cave";
        }
        else
        {
            this.music = "tech";
        }

        if ( this.lastMusic != this.music )
        {
            me.audio.stopTrack();
            me.audio.playTrack( this.music );
        }
    },

    getCurrentMusic: function()
    {
        return this.music;
    },

    startLevel: function( level )
    {
        // this only gets called on start?
        me.levelDirector.loadLevel( level );
        me.game.sort();
        this.changeLevel();
    },

    // this will be called on state change -> this
    onResetEvent: function()
    {
        me.game.addHUD( 0, 0, me.video.getWidth(), me.video.getHeight() );
        me.game.HUD.addItem( "deaths", new DeathDisplay( 15, 15 ) );
        this.startLevel( location.hash.substr(1) || "level1" );
    },

    onDestroyEvent: function()
    {
        me.game.disableHUD();
        me.audio.stopTrack();
    }
});

var RadmarsScreen = me.ScreenObject.extend({
    init: function() {
        this.parent( true );
        this.counter = 0;
    },

    onResetEvent: function() {
        if( ! this.title ) {
            this.bg= me.loader.getImage("intro_bg");
            this.glasses1 = me.loader.getImage("intro_glasses1"); // 249 229
            this.glasses2 = me.loader.getImage("intro_glasses2"); // 249 229
            this.glasses3 = me.loader.getImage("intro_glasses3"); // 249 229
            this.glasses4 = me.loader.getImage("intro_glasses4"); // 249 229
            this.text_mars = me.loader.getImage("intro_mars"); // 266 317
            this.text_radmars1 = me.loader.getImage("intro_radmars1"); // 224 317
            this.text_radmars2 = me.loader.getImage("intro_radmars2");
        }

        me.input.bindKey( me.input.KEY.ENTER, "enter", true );
        me.audio.playTrack( "radmarslogo" );
    },

    update: function() {
        if( me.input.isKeyPressed('enter')) {
            me.state.change(me.state.MENU);
        }
        if ( this.counter < 350 )
        {
            this.counter++;
        }else{
            me.state.change(me.state.MENU);
        }
        // have to force redraw :(
        me.game.repaint();
    },

    draw: function(context) {
        context.drawImage( this.bg, 0, 0 );
        if( this.counter < 130) context.drawImage( this.text_mars, 266+80, 317+60 );
        else if( this.counter < 135) context.drawImage( this.text_radmars2, 224+80, 317+60 );
        else if( this.counter < 140) context.drawImage( this.text_radmars1, 224+80, 317+60 );
        else if( this.counter < 145) context.drawImage( this.text_radmars2, 224+80, 317+60 );
        else if( this.counter < 150) context.drawImage( this.text_radmars1, 224+80, 317+60 );
        else if( this.counter < 155) context.drawImage( this.text_radmars2, 224+80, 317+60 );
        else if( this.counter < 160) context.drawImage( this.text_radmars1, 224+80, 317+60 );
        else if( this.counter < 165) context.drawImage( this.text_radmars2, 224+80, 317+60 );
        else context.drawImage( this.text_radmars1, 224+80, 317+60 );

        if( this.counter < 100) context.drawImage( this.glasses1, 249+80, 229*(this.counter/100)+60 );
        else if( this.counter < 105) context.drawImage( this.glasses2, 249+80, 229+60 );
        else if( this.counter < 110) context.drawImage( this.glasses3, 249+80, 229+60 );
        else if( this.counter < 115) context.drawImage( this.glasses4, 249+80, 229+60 );
        else context.drawImage( this.glasses1, 249+80, 229+60 );
    },

    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.audio.stopTrack();
    }
});

/** WHen coliding with the end of the level do things to swap the levels. */
var LevelChanger = me.LevelEntity.extend({
    init: function( x, y, settings ) {
        this.parent( x, y, settings );

        var fruitSettings = new Object();
        fruitSettings.image = "fruit";
        fruitSettings.spritewidth = 48;

        this.fruit = new me.ObjectEntity( x, y, fruitSettings );
        this.fruit.animationspeed = 3;

        this.fruit.addAnimation( "idle", [ 0, 1, 2, 3, 4, 5 ] );
        this.fruit.addAnimation( "eat", [ 6 ] );
        this.fruit.setCurrentAnimation( "idle" );

        me.game.add( this.fruit, 5 );
        me.game.sort();
    },

    onCollision : function()
    {
        this.fruit.setCurrentAnimation( "eat" );
        // hack to stop drown sound
        if ( me.game.player.drowning )
        {
            me.audio.stop( "drown" );
            me.audio.playTrack( me.state.current().getCurrentMusic() );
        }
        return this.parent();
    },

    /** Dirty hack. I don't think they intended to expose onFadeComplete. */
    onFadeComplete : function () {
        this.parent();
        me.state.current().changeLevel( );
    },

    goTo: function ( level ) {
        // hack bad. bad hack TODO
        if ( this.gotolevel == "gameover" ) {
            me.state.change( me.state.GAMEOVER );
            return;
        }
        this.parent( level );

        // When we swap levels the correct way, we should 0 out any skills we've
        // learned.
        for( var skill in me.state.current().abilities  ) {
            me.state.current().abilities[skill] = false;
        }
    }
});

var TemporaryDisplay = me.HUD_Item.extend({
    init: function( x, y, settings ) {
        settings = settings || {};
        this.parent( x, y, settings );
        this.font = settings.font || new me.BitmapFont( "32x32_font", 32 );
        this.font.set("left", 1);
        this.timeout = 2000;
    },

    /** Adds the display and resets the object. After a X ms timeout the
     * object goes away. */
    reset: function( item ) {
        this.parent();
        // TODO might be redundant if we call this again before timeout?
        me.game.HUD.addItem( item, this );
        window.setTimeout( function() {
            me.game.HUD.removeItem( item );
        }, this.timeout );
    },

    /** This should be overwritten. */
    getText: function() {
        return '';
    },

    /** Draws the text. Newlines are split out by font size. */
    draw: function( context, x, y ) {
        var lines = this.getText().split( "\n" );
        for( var i = 0; i < lines.length; i++ ) {
            this.font.draw(
                context,
                lines[i].toUpperCase(),
                this.pos.x + x,
                this.pos.y + y + i * this.font.size.y
            );
        }
    }
});

var SkillDisplay = TemporaryDisplay.extend({
    init: function() {
        this.parent( 50, 100, {
            font: new me.BitmapFont( "16x16_font", 16),
        });
        this.text = '';
        this.timeout = 5000;
    },

    skill: function( item ) {
        if( item == 'doubleJump') return 'double jump';
        if( item == 'shield') return 'shield one hit';
        if( item == 'spikeHat') return 'poke things with your head';
        if( item == 'buttStomp' ) return 'buttstomp (press c)';
        if( item == 'rocketJump' ) return 'ride the rocket (press v)';
        if( item == 'wallStick' ) return 'claw into the wall';
        // fallback...
        return item;
    },

    getText: function() {
        var abilities = me.state.current().abilities;
        var t = '';
        for( var item in abilities ) {
            if( abilities[item] != undefined ) {
                if ( item == 'gills' )
                {
                    t += "You have ";
                    t += ( abilities[item] ? this.skill( item ) : "lungs" );
                    t += "\n";
                }
                else
                {
                    t += "You ";
                    t += ( abilities[item] ? "can " : "can't " );
                    t += this.skill( item )
                    t += "\n";
                }
            }
       }
       return t;
    }
});

/* Story display could probably go away but it just displays a single text blob
 * on events. */
var StoryDisplay = TemporaryDisplay.extend({

    init: function( ) {
        this.parent( 50, 80, {
            font: new me.BitmapFont( "16x16_font", 16),
        });
        this.text = '';
    },

    setText: function( uiname, text ) {
        this.reset( uiname );
        this.text = text;
    },

    getText: function () {
        return this.text;
    }
});

var LevelDisplay = TemporaryDisplay.extend({
    init: function( ) {
        this.parent( 50, me.video.getHeight() *0.75, {
            font: new me.BitmapFont( "64x64_font", 64),
        } );
    },
    getText: function() {
        return "LEVEL " + me.state.current().getLevel();
    }
});

var StoryNode = me.InvisibleEntity.extend({
    init: function( x, y, settings ) {
        this.parent( x, y, settings );
        this.text = settings.text;
        this.toggled = false;
    },

    // only check collision with player, & only first time - prevents other stuff from hitting it & not other things (no multiple collision)
    checkCollision: function( obj ) {
        if ( obj == me.game.player && !this.toggled ) {
            return this.parent( obj );
        }
        return null;
    },

    onCollision: function() {
        if( ! this.toggled ) {
            me.state.current().showStoryText( this.text );
            this.toggled = true;
        }
    }
});

var TitleScreen = me.ScreenObject.extend(
{
    init: function()
    {
        this.parent( true );
        this.yCounter = 0;
		this.blinkCounter = 0;
    },

    onResetEvent: function()
    {
        if ( !this.backgroundImg )
        {
            this.backgroundImg = me.loader.getImage( "title_bg" );
            this.cta = me.loader.getImage( "title_cta" );
            this.overlay = me.loader.getImage( "title_overlay" );
        }

        me.input.bindKey( me.input.KEY.ENTER, "enter", true );
        me.audio.playTrack( "theme" );
    },

    update: function()
    {
        if( me.input.isKeyPressed( 'enter' ) )
        {
            me.state.change( me.state.PLAY );
        }
        this.updateScroll();
    },

    updateScroll: function()
    {
        this.yCounter++;
        if ( this.yCounter > 1200 )
        {
            this.yCounter = 0;
        }

        me.game.repaint();
    },

    draw: function( context )
    {
        // draw 2 backgrounds to scroll properly
        context.drawImage( this.backgroundImg, 0, 0 - this.yCounter );
        context.drawImage( this.backgroundImg, 0, 0 - this.yCounter + 1200 );
        context.drawImage( this.overlay, 0, 0 );
        
		this.blinkCounter++; 
		if( this.blinkCounter > 20){
				context.drawImage( this.cta, 296, 400 - 20 );
				if(this.blinkCounter > 40) this.blinkCounter =0;
		}
		
    },

    onDestroyEvent: function()
    {
        me.input.unbindKey( me.input.KEY.ENTER );
        me.audio.stopTrack();
    }
});

var GameOverScreen = TitleScreen.extend(
{
    init: function()
    {
        this.parent( true );
        this.fontSmall = new me.BitmapFont( "16x16_font", 16 );
        this.fontSmall.set( "center", 1 );
        this.fontLarge = new me.BitmapFont( "32x32_font", 32 );
        this.fontLarge.set( "center", 1 );
    },

    update: function()
    {
        this.updateScroll();
    },

    onResetEvent: function()
    {
        if ( !this.backgroundImg )
        {
            this.backgroundImg = me.loader.getImage( "title_bg" );
            this.overlay = me.loader.getImage( "gameover_overlay" );
        }

        me.audio.playTrack( "theme" );
    },

    draw: function( context )
    {
        context.drawImage( this.backgroundImg, 0, 0 - this.yCounter );
        context.drawImage( this.backgroundImg, 0, 0 - this.yCounter + 1200 );
        context.drawImage( this.overlay, 0, 0 );
        this.fontLarge.draw( context, "CONGRATULATION!", 400, 200 );
        this.fontSmall.draw( context, "DEATHS: " + me.game.deathCount,
            400, 380 );
    }
});

function spawnParticle( x, y, sprite, spritewidth, frames, speed, z )
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

    return particle;
}

window.onReady( function()
{
    jsApp.onload();
});
