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
        me.state.set( me.state.PLAY, new PlayScreen() );

        me.state.transition( "fade", "#000000", 150 );

        me.entityPool.add( "player", Player );

        me.entityPool.add( "rock", Rock );
        me.entityPool.add( "spikes", Spikes );
        me.entityPool.add( "balloon", Balloon );

        me.debug.renderHitBox = false;

        me.state.change( me.state.PLAY );
    }
}

var PlayScreen = me.ScreenObject.extend(
{
    init: function()
    {

    },

    restartLevel: function( level ) {
        // default to level 3 for now.
        level = level || "level3" ||  me.levelDirector.getCurrentLevelId();
        me.levelDirector.loadLevel( level );
    },

    // this will be called on state change -> this
    onResetEvent: function()
    {
		this.restartLevel( location.hash.substr(1) );
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
        if( this.counter < 130) context.drawImage( this.text_mars, 266, 317 );
        else if( this.counter < 135) context.drawImage( this.text_radmars2, 224, 317 );
        else if( this.counter < 140) context.drawImage( this.text_radmars1, 224, 317 );
        else if( this.counter < 145) context.drawImage( this.text_radmars2, 224, 317 );
        else if( this.counter < 150) context.drawImage( this.text_radmars1, 224, 317 );
        else if( this.counter < 155) context.drawImage( this.text_radmars2, 224, 317 );
        else if( this.counter < 160) context.drawImage( this.text_radmars1, 224, 317 );
        else if( this.counter < 165) context.drawImage( this.text_radmars2, 224, 317 );
        else context.drawImage( this.text_radmars1, 224, 317 );

        if( this.counter < 100) context.drawImage( this.glasses1, 249, 229*(this.counter/100) );
        else if( this.counter < 105) context.drawImage( this.glasses2, 249, 229 );
        else if( this.counter < 110) context.drawImage( this.glasses3, 249, 229 );
        else if( this.counter < 115) context.drawImage( this.glasses4, 249, 229 );
        else context.drawImage( this.glasses1, 249, 229 );
    },

    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.audio.stopTrack();
    }
});

window.onReady( function()
{
    jsApp.onload();
});
