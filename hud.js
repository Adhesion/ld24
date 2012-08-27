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
    },

    draw: function( context, x, y )
    {
        this.font.draw( context, "DEATHS: " + me.game.deathCount,
            this.pos.x + x, this.pos.y + y );
    }
});
