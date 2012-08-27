/*
 * hud.js
 *
 * Defines HUD elements.
 *
 * @author Adhesion
 */

var DeathDisplay = me.HUD_Item.extend(
{
    init: function( x, y )
    {
        //this.deathsIcon = me.loader.getImage( "hud_deaths" );
        this.parent( x, y );
        this.font = new me.BitmapFont( "16x16_font", 16 );
        this.font.set( "left", 1 );
        this.deathsIcon = me.loader.getImage( "skull" );
    },

    draw: function( context, x, y )
    {
        context.drawImage( this.deathsIcon, this.pos.x + x, this.pos.y + y );
        this.font.draw( context, "X " + me.game.deathCount,
            this.pos.x + x + 64, this.pos.y + y + 24 );
    }
});
