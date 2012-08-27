/*
 * gameResources.js
 *
 * Defines game resources (maps, images, sounds) for the game.
 *
 * @author Adhesion
 */

var gameResources =
[
    { name: "intro_bg", type: "image", src: "data/intro_bg.png" },
    { name: "intro_glasses1", type: "image", src: "data/intro_glasses1.png" },
    { name: "intro_glasses2", type: "image", src: "data/intro_glasses2.png" },
    { name: "intro_glasses3", type: "image", src: "data/intro_glasses3.png" },
    { name: "intro_glasses4", type: "image", src: "data/intro_glasses4.png" },
    { name: "intro_mars", type: "image", src: "data/intro_mars.png" },
    { name: "intro_radmars1", type: "image", src: "data/intro_radmars1.png" },
    { name: "intro_radmars2", type: "image", src: "data/intro_radmars2.png" },

    { name: "title_bg", type: "image", src: "data/title_bg.png" },
    { name: "title_cta", type: "image", src: "data/title_cta.png" },
    { name: "title_overlay", type: "image", src: "data/title_overlay.png" },
    { name: "gameover_overlay", type: "image", src: "data/gameover_overlay.png" },

    { name: "player", type: "image", src: "data/player.png" },
    { name: "enemy", type: "image", src: "data/baddie.png" },
    { name: "saw", type: "image", src: "data/saw.png" },
    { name: "skull", type: "image", src: "data/skull.png" },
    { name: "egg", type: "image", src: "data/egg.png" },
    { name: "shield", type: "image", src: "data/shield.png" },
    { name: "buttstompimpact", type: "image", src: "data/buttstompimpact.png" },
    { name: "doublejump", type: "image", src: "data/doublejump.png" },
    { name: "explode", type: "image", src: "data/explode.png" },
    { name: "splash", type: "image", src: "data/splash.png" },

    { name: "rock", type: "image", src: "data/rock.png" },
    { name: "bomb", type: "image", src: "data/bomb.png" },
    { name: "spikes", type: "image", src: "data/spike.png" },
    { name: "balloon", type: "image", src: "data/baloon.png" },
    { name: "fruit", type: "image", src: "data/fruit.png" },
    { name: "bubble", type: "image", src: "data/bubble.png" },

    { name: "collision_tiles", type: "image", src: "data/collision_tiles.png" },
    { name: "maptile", type: "image", src: "data/maptile.png" },
	
	{ name: "forrest_bg", type: "image", src: "data/forrest_bg.png" },
	{ name: "cave_bg", type: "image", src: "data/cave_bg.png" },
	{ name: "tech_bg", type: "image", src: "data/tech_bg.png" },
	
    { name: "testlevel", type: "tmx", src: "data/testlevel.tmx" },
    { name: "level1", type: "tmx", src: "data/level1.tmx" },
    { name: "level2", type: "tmx", src: "data/level2.tmx" },
    { name: "level3", type: "tmx", src: "data/level3.tmx" },
    { name: "level4", type: "tmx", src: "data/level4.tmx" },
    { name: "level5", type: "tmx", src: "data/level5.tmx" },
    { name: "level6", type: "tmx", src: "data/level6.tmx" },
    { name: "level7", type: "tmx", src: "data/level7.tmx" },
    { name: "level8", type: "tmx", src: "data/level8.tmx" },
    { name: "level9", type: "tmx", src: "data/level9.tmx" },
    { name: "level10", type: "tmx", src: "data/level10.tmx" },
    { name: "level11", type: "tmx", src: "data/level11.tmx" },
    { name: "level12", type: "tmx", src: "data/level12.tmx" },
    { name: "level13", type: "tmx", src: "data/level13.tmx" },
    { name: "level14", type: "tmx", src: "data/level14.tmx" },
    { name: "level15", type: "tmx", src: "data/level15.tmx" },

    { name: "16x16_font", type: "image", src: "data/16x16_font.png" },
    { name: "32x32_font", type: "image", src: "data/32x32_font.png" },
    { name: "64x64_font", type: "image", src: "data/64x64_font.png" },

    { name: "radmarslogo", type: "audio", src: "data/", channels : 2 },
    { name: "theme", type: "audio", src: "data/", channels : 2 },
    { name: "forest", type: "audio", src: "data/", channels : 2 },
    { name: "cave", type: "audio", src: "data/", channels : 2 },
    { name: "tech", type: "audio", src: "data/", channels : 2 },
    { name: "drown", type: "audio", src: "data/", channels : 2 },

    { name: "attack", type: "audio", src: "data/", channels : 2 },
    { name: "balloonpop", type: "audio", src: "data/", channels : 2 },
    { name: "bubble", type: "audio", src: "data/", channels : 2 },
    { name: "buttstomp", type: "audio", src: "data/", channels : 2 },
    { name: "die", type: "audio", src: "data/", channels : 2 },
    { name: "doublejump", type: "audio", src: "data/", channels : 2 },
    { name: "eat", type: "audio", src: "data/", channels : 2 },
    { name: "enemydeath", type: "audio", src: "data/", channels : 2 },
    { name: "explosion", type: "audio", src: "data/", channels : 2 },
    { name: "hit", type: "audio", src: "data/", channels : 2 },
    { name: "jump", type: "audio", src: "data/", channels : 2 },
    { name: "saw", type: "audio", src: "data/", channels : 2 },
    { name: "spawn", type: "audio", src: "data/", channels : 2 },
    { name: "splash", type: "audio", src: "data/", channels : 2 },
    { name: "splashout", type: "audio", src: "data/", channels : 2 },
    { name: "step", type: "audio", src: "data/", channels : 2 },
    { name: "wallstick", type: "audio", src: "data/", channels : 2 },
    { name: "watersaw", type: "audio", src: "data/", channels : 2 }
];
