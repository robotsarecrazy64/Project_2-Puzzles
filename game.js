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
var enemy_a;
var enemy_b;
var enemy_c;
var floor_map;

/**
Possible Obstacles:
Add Sleeping snakes that randomly change position per level
Exhaustion (slowly drains per wrong door until GAME OVER)
*/
  
// Variables to improve readability
var current_level = 6;
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
var game_win = false;
var game_over = false;

update();

/**
	Initializes the Game Elements
*/
function init() {
	current_level--;
	if ( current_level <= 0 ) {
		current_level = max_level;
	}

	floor_map = new PIXI.Sprite( PIXI.Texture.fromFrame( "floor" + current_level + ".png" ) );
	floor_map.position.x = 0;
	floor_map.position.y = 0;
	floor_map.scale.x = 5;
	floor_map.scale.y = 5;
	stage.addChild( floor_map );

	player = new PIXI.Sprite( PIXI.Texture.fromFrame( "floor6.png" ) );
	resetPosition( player );
	stage.addChild( player );

	enemy_a = addEnemy( 100, 100 );
	enemy_a.play();
	stage.addChild( enemy_a );
	
	enemy_b = addEnemy( 250, 250 );
	enemy_b.play();
	stage.addChild( enemy_b );


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
	checkDoorEntry( player, current_level );

	//Check for enemy collision
	

	// Update renderer
	requestAnimationFrame( update );
	renderer.render( stage );
}

/**
	Event Handler for Key events
*/
function keydownEventHandler(event) {
	if ( !game_win ) {
  		if ( event.keyCode == 87 ) { // W key
			// Update the player sprite to upper facing player
			var temp_x = player.position.x;
			var temp_y = player.position.y;
			stage.removeChild( player );
			player = new PIXI.Sprite( PIXI.Texture.fromFrame( "floor9.png" ) );
			player.position.x = temp_x;
			player.position.y = temp_y;
			stage.addChild( player );
			movePlayer( temp_x, temp_y - step );		
			update();
  		}

  		if ( event.keyCode == 65 ) { // A key
			// Update the player sprite to left facing player
			var temp_x = player.position.x;
			var temp_y = player.position.y;
			stage.removeChild( player );
			player = new PIXI.Sprite( PIXI.Texture.fromFrame( "floor7.png" ) );
			player.position.x = temp_x;
			player.position.y = temp_y;
			stage.addChild( player );
			movePlayer( temp_x - step, temp_y );		
			update();
  		}
	
		if ( event.keyCode == 83 ) { // S key
			// Update the player sprite to lower facing player
			var temp_x = player.position.x;
			var temp_y = player.position.y;
			stage.removeChild( player );
			player = new PIXI.Sprite( PIXI.Texture.fromFrame( "floor8.png" ) );
			player.position.x = temp_x;
			player.position.y = temp_y;
			stage.addChild( player );
			movePlayer( temp_x, temp_y + step );		
			update();
	  	}
	
		if ( event.keyCode == 68 ) { // D key	
			var temp_x = player.position.x + step;
			var temp_y = player.position.y;
			stage.removeChild( player );
			player = new PIXI.Sprite( PIXI.Texture.fromFrame( "floor6.png" ) );
			player.position.x = temp_x - step;
			player.position.y = temp_y;
				stage.addChild( player );
			movePlayer( temp_x, temp_y );		
			update();
  		}
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
	( ( sprite.position.x < upper_door_bound )||( sprite.position.x > lower_door_bound ) )) {
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
function checkDoorEntry ( sprite, level ) {
	if ( sprite.position.x < left_door ) {
		switch( level ) {
 	 		case 5:
    				resetPosition( sprite );
    				break;
  			case 4:
     				resetPosition( sprite );
    				break;
  			case 3:
    				nextLevel();
    				break;
  			case 2:
    				resetPosition( sprite );
    				break;
  			case 1:
    				if ( !game_win ) {
					game_win = true;
					stage.removeChild( player );
					alert("Outside");				
				}
				break;
		}	
	}

	if ( sprite.position.x > right_door ) {
		switch( level ) {
 	 		case 5:
    				resetPosition( sprite );
    				break;
  			case 4:
     				resetPosition( sprite );
    				break;
  			case 3:
    				resetPosition( sprite );
    				break;
  			case 2:
    				nextLevel();
    				break;
  			case 1:
    				resetPosition( sprite );
				break;
		}	}

	if ( sprite.position.y < upper_door ) {
		switch( level ) {
 	 		case 5:
    				nextLevel();
    				break;
  			case 4:
     				resetPosition( sprite );
    				break;
  			case 3:
    				resetPosition( sprite );
    				break;
  			case 2:
    				resetPosition( sprite );
    				break;
  			case 1:
    				resetPosition( sprite );
				break;
		}
	}

	if ( sprite.position.y > lower_door ) {
		switch( level ) {
 	 		case 5:
    				resetPosition( sprite );
    				break;
  			case 4:
     				nextLevel();
    				break;
  			case 3:
    				resetPosition( sprite );
    				break;
  			case 2:
    				resetPosition( sprite );
    				break;
  			case 1:
    				resetPosition( sprite );
				break;
		}	
	}
}

function resetPosition( sprite ) {
	sprite.position.x = start_x;
	sprite.position.y = start_y;

}

/**
	Helper function that returns a random number from 1 to max
*/
function getRand( max ) {
	return Math.floor(( Math.random() * max ) + 1 );
}

/**
	Helper function that returns a random enemy at a specified location
*/
function addEnemy( x, y ) {
	var bat = createMovieClip( 10, 11 );
	var snake = createMovieClip( 12, 15 );
	var rand_num = getRand( 2 ); // get a random number (1 or 2)
	
	
	if ( rand_num == 1 ) { // adds a bat
		bat.position.x = x;
	  	bat.position.y = y;
		bat.animationSpeed = 0.1;
		return bat;
	}
	
	else { // adds a snake
		snake.scale.x = 1.5;
		snake.scale.y = 1.5;
		snake.position.x = x;
	  	snake.position.y = y;
		snake.animationSpeed = 0.1;
		return snake;
	}
}

/**
	Helper function that returns a movie clip
*/

function createMovieClip ( low, high ) {
	var clips = [];
	for ( var i = low; i <= high; i++ ) {
    		clips.push( PIXI.Texture.fromFrame( 'floor' + i + '.png' ) );
  	}

  	return new PIXI.extras.MovieClip( clips );
}


