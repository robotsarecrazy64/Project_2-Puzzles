// Renderer
var gameport = document.getElementById( "gameport" );
var renderer = PIXI.autoDetectRenderer( 500, 500, {backgroundColor: 0x330033} );
gameport.appendChild( renderer.view );

// Containers
var stage = new PIXI.Container();

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// Loads the assets from the sprite sheet
PIXI.loader
  .add( "assets.json" )
  .load( init );
  
// Assets
var player;
var floor_map;

/**
Possible Obstacles:
Add Sleeping snakes that randomly change position per level
Exhaustion (slowly drains per wrong door until GAME OVER)
*/
  
// Variables to improve readability
var current_level = 0;
var max_level = 5
var step = 25;
var start_x = 200;
var start_y = 200;
var end_of_map = 500;
var left_wall = 40;
var left_door = left_wall - ( step * 2 );
var right_wall = 360;
var right_door = right_wall + ( step * 2 );
var upper_wall = 25;
var upper_door = upper_wall - ( step * 2 );
var lower_wall = 335;
var lower_door = lower_wall + ( step * 2 );
var top_of_door = 185;
var left_door_bound = 185;
var right_door_bound = 205;
var upper_door_bound = 180;
var lower_door_bound = 250;

update();

/**
	Initializes the Game Elements
*/
function init() {
	if ( current_level == 0 ) {
		current_level = max_level;
	}

	current_level--;
	floor_map = new PIXI.Sprite( PIXI.Texture.fromFrame( "floor" + current_level + ".png" ) );
	floor_map.position.x = 0;
	floor_map.position.y = 0;
	floor_map.scale.x = 5;
	floor_map.scale.y = 5;
	stage.addChild( floor_map );

	player = new PIXI.Sprite.fromImage( "Player.png" );
	player.scale.x = 2;
	player.scale.y = 2;
	player.position.x = start_x;
	player.position.y = start_y;
	stage.addChild( player );
  
	document.addEventListener('keydown', keydownEventHandler);	
	requestAnimationFrame( update );
}

/**
	Update function to animate game assets
*/
function update() {
	//Check Boundary for player
	correctPosition( player );
	//Check if player entered a door
	checkDoorEntry( player );

	// Update renderer
	requestAnimationFrame( update );
	renderer.render( stage );
}

/**
	Event Handler for Key events
*/
function keydownEventHandler(event) {
  	if ( event.keyCode == 87 ) { // W key
		movePlayer( player.position.x, player.position.y - step );	
  	}

  	if ( event.keyCode == 65 ) { // A key
		movePlayer( player.position.x - step, player.position.y );
  	}
	
	if ( event.keyCode == 83 ) { // S key
		movePlayer( player.position.x, player.position.y + step );
  	}
	
	if ( event.keyCode == 68 ) { // D key
		movePlayer( player.position.x + step, player.position.y );
  	}
}

/**
	Helper function that moves the player
*/
function movePlayer( new_x, new_y ) {
	createjs.Tween.get( player.position ).to({ x: new_x, y: new_y }, 250, createjs.Ease.backOut );
}

/**
	Helper method to keep sprites from going out of bounds
*/
function correctPosition( sprite ) {
	if ( ( sprite.position.x <= left_wall )&&
	( ( sprite.position.y < left_door_bound )||( sprite.position.y > right_door_bound ) )) {
		sprite.position.x = left_wall;
	}

	if ( ( sprite.position.x >= right_wall )&&
	( ( sprite.position.y < left_door_bound )||( sprite.position.y > right_door_bound ) )) {
		sprite.position.x = right_wall;
	}

	if ( ( sprite.position.y <= upper_wall )&&
	( ( sprite.position.x < upper_door_bound )||( sprite.position.x > lower_door_bound50 ) )) {
		sprite.position.y = upper_wall;
	}

	if ( ( sprite.position.y >= lower_wall )&&
	( ( sprite.position.x < upper_door_bound )||( sprite.position.x > lower_door_bound ) )) {
		sprite.position.y = lower_wall;
	}
}

/**
	Helper method for moving to the next level
*/
function nextLevel () {
	init();
}

/**
	Helper Method for checking if a door was entered
*/
function checkDoorEntry ( sprite ) {
	if ( sprite.position.x < left_door ) { 
		nextLevel();
	}

	if ( sprite.position.x > right_door ) {
		nextLevel();
	}

	if ( sprite.position.y < upper_door ) {
		nextLevel();
	}

	if ( sprite.position.y > lower_door ) {
		nextLevel();
	}

}

