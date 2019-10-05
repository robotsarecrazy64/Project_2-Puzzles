// Renderer
var gameport = document.getElementById( "gameport" );
var renderer = PIXI.autoDetectRenderer( 500, 500, {backgroundColor: 0x330033} );
gameport.appendChild( renderer.view );

// Containers
var game_stage  = new PIXI.Container();
var main_stage = new PIXI.Container();
var stage = new PIXI.Container();
var end_stage = new PIXI.Container();
var guide_stage = new PIXI.Container();

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// Loads the assets from the sprite sheet
PIXI.loader
  .add( "assets.json" )
  .load( main_menu );
  
// Assets
var player;
var enemy_a;
var enemy_b;
var enemy_c;
var floor_map;
var main_map;
var guide_button;
var play_button;
var menu_button;
var left_arrow_button;
var right_arrow_button;
var end_game;
  
// Variables to improve readability
var current_level = 6;
var current_guide = 0;
var max_level = 5
var step = 25;
var start_x = 200;
var start_y = 200;
var end_of_map = 500;
var left_wall = 40;
var left_door = left_wall - step ;
var right_wall = 360;
var right_door = right_wall + step;
var upper_wall = 25;
var upper_door = upper_wall - step;
var lower_wall = 335;
var lower_door = lower_wall +  step;
var top_of_door = 185;
var left_door_bound = 185;
var right_door_bound = 205;
var upper_door_bound = 180;
var lower_door_bound = 250;
var exhaustion = max_level * 2;
var game_win = false;
var game_over = false;
var game_active = false;
var button_x = 265;
var button_y = 425;

function main_menu () {
	exhaustion = max_level * 2;
	game_win = false;
	game_over = false;
	game_active = false;
	current_level = 6;

	main_map = new PIXI.Sprite( PIXI.Texture.fromFrame( "main_menu.png" ) );
	main_map.position.x = 0;
	main_map.position.y = 0;
	main_map.scale.x = 5;
	main_map.scale.y = 5;
	main_stage.addChild( main_map );
	
	play_button = createButton( button_x, button_y, "play_button.png" );
	main_stage.addChild( play_button );

	guide_button = createButton( -45, button_y, "guide_button.png" );
	main_stage.addChild( guide_button );
	
	stage.addChild( main_stage );

	update();
}

function generateGuide() {
	if( current_guide >= 3 ) {
		current_guide = 0;
	}

	if( current_guide < 0 ) {
		current_guide = 2;
	}

	current_guide++;
	guide = new PIXI.Sprite( PIXI.Texture.fromFrame( "guide" + current_guide + ".png" ) );
	guide.position.x = 0;
	guide.position.y = 0;
	guide.scale.x = 5;
	guide.scale.y = 5;
	guide_stage.addChild( guide );
	
	left_arrow_button = createButton( 0, button_y, "left_arrow_button.png" );
	guide_stage.addChild( left_arrow_button );

	right_arrow_button = createButton( 125, button_y, "right_arrow_button.png" );
	guide_stage.addChild( right_arrow_button );

	menu_button = createButton( button_x - step, button_y, "menu_button.png" );
	guide_stage.addChild( menu_button );

	stage.addChild( guide_stage );
	update();

}


/**
	Initializes the Game Elements
*/
function generateLevel() {	
	game_active = true;
	current_level--;
	if ( current_level <= 0 ) {
		current_level = max_level;
	}

	floor_map = new PIXI.Sprite( PIXI.Texture.fromFrame( "floor" + current_level + ".png" ) );
	floor_map.position.x = 0;
	floor_map.position.y = 0;
	floor_map.scale.x = 5;
	floor_map.scale.y = 5;
	game_stage.addChild( floor_map );

	player = new PIXI.Sprite( PIXI.Texture.fromFrame( "player1.png" ) );
	resetPosition( player );
	game_stage.addChild( player );
	
	

	enemy_a = addEnemy( 100, 39 + getRand( 250 ) );
	game_stage.addChild( enemy_a );
	
	enemy_b = addEnemy( 351 - getRand( 200 ), 300 );
	game_stage.addChild( enemy_b );

	enemy_c = addEnemy( 300, 50 + getRand( 200 ) );
	game_stage.addChild( enemy_c );

	
	stage.addChild( game_stage );

	document.addEventListener('keydown', keydownEventHandler);	
	update();
}

/**
	Generates Game Win Condition
*/

function generateWinScreen () {
	stage.removeChild( game_stage ); 
	
	end_game = new PIXI.Sprite( PIXI.Texture.fromFrame( "game_win.png" ) );
	end_game.position.x = 0;
	end_game.position.y = 0;		
	end_game.scale.x = 5;
	end_game.scale.y = 5;
	end_stage.addChild( end_game );

	menu_button = createButton( button_x - step, button_y, "menu_button.png" );
	end_stage.addChild( menu_button );

	game_over = true;
	stage.addChild( end_stage );
}

/**
	Checks for Game Losing Condition
*/
function checkExhaustion () {
	if ( exhaustion == 0 ) {
		stage.removeChild( game_stage ); 
		
		end_game = new PIXI.Sprite( PIXI.Texture.fromFrame( "game_over.png" ) );
		end_game.position.x = 0;
		end_game.position.y = 0;
		end_game.scale.x = 5;
		end_game.scale.y = 5;
		end_stage.addChild( end_game );

		enemy_a = addEnemy( 351 - getRand( 150 ), 35 );
		end_stage.addChild( enemy_a );
	
		enemy_b = addEnemy( 100, 300 );
		end_stage.addChild( enemy_b );
		
		menu_button = createButton( button_x - step, button_y, "menu_button.png" );
		end_stage.addChild( menu_button );
	
		stage.addChild( end_stage );

		game_over = true;
		exhaustion--;
	}

}


/**
	Update function to animate game assets
*/
function update() {
	if ( !game_over && game_active ) {
		//Checks Exhaustion
		checkExhaustion();
		
		//Check Boundary for player
		correctPosition( player );

		//Check if player entered a door
		checkDoorEntry( player, current_level );
	}
	
	// Update renderer
	requestAnimationFrame( update );
	renderer.render( stage );
}

/**
	Event Handler for Key events
*/
function keydownEventHandler(event) {
	if ( game_active ) {
  		if ( event.keyCode == 87 ) { // W key
			// Update the player sprite to upper facing player
			var temp_x = player.position.x;
			var temp_y = player.position.y;
			game_stage.removeChild( player );
			player = new PIXI.Sprite( PIXI.Texture.fromFrame( "player4.png" ) );
			player.position.x = temp_x;
			player.position.y = temp_y;
			game_stage.addChild( player );
			movePlayer( temp_x, temp_y - step );
  		}

  		if ( event.keyCode == 65 ) { // A key
			// Update the player sprite to left facing player
			var temp_x = player.position.x;
			var temp_y = player.position.y;
			game_stage.removeChild( player );
			player = new PIXI.Sprite( PIXI.Texture.fromFrame( "player2.png" ) );
			player.position.x = temp_x;
			player.position.y = temp_y;
			game_stage.addChild( player );
			movePlayer( temp_x - step, temp_y );	
  		}
	
		if ( event.keyCode == 83 ) { // S key
			// Update the player sprite to lower facing player
			var temp_x = player.position.x;
			var temp_y = player.position.y;
			game_stage.removeChild( player );
			player = new PIXI.Sprite( PIXI.Texture.fromFrame( "player3.png" ) );
			player.position.x = temp_x;
			player.position.y = temp_y;
			game_stage.addChild( player );
			movePlayer( temp_x, temp_y + step );
	  	}
	
		if ( event.keyCode == 68 ) { // D key	
			var temp_x = player.position.x;
			var temp_y = player.position.y;
			game_stage.removeChild( player );
			player = new PIXI.Sprite( PIXI.Texture.fromFrame( "player1.png" ) );
			player.position.x = temp_x;
			player.position.y = temp_y;
			game_stage.addChild( player );
			movePlayer( temp_x + step, temp_y );  
		}
	}
}

/**
	Event Handler for Button events
*/

function buttonHandler( event ) {
	if ( event.target == play_button ) {
		stage.removeChild( guide_stage );
		stage.removeChild( end_stage );
		stage.removeChild( main_stage );
		generateLevel();
	}
	
	else if ( event.target == menu_button ) {
		stage.removeChild( guide_stage );
		stage.removeChild( end_stage );
		stage.removeChild( game_stage );
		main_menu();
	}

	else if ( event.target == guide_button ) {
		stage.removeChild( main_stage );
		stage.removeChild( game_stage );
		generateGuide();
	}
	
	else if ( event.target == right_arrow_button ) {
		generateGuide();
	}

	else if ( event.target == left_arrow_button ) {
		current_guide--;
		current_guide--;
		generateGuide();
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
	// Left Boundary
	if ( ( sprite.position.x <= left_wall )&&
	( ( sprite.position.y < left_door_bound )||( sprite.position.y > right_door_bound ) )) {
		sprite.position.x = left_wall;
	}
	
	// Right Boundary
	if ( ( sprite.position.x >= right_wall )&&
	( ( sprite.position.y < left_door_bound )||( sprite.position.y > right_door_bound ) )) {
		sprite.position.x = right_wall;
	}

	// Upper Boundary
	if ( ( sprite.position.y <= upper_wall )&&
	( ( sprite.position.x < upper_door_bound )||( sprite.position.x > lower_door_bound ) )) {
		sprite.position.y = upper_wall;
	}

	// Lower Boundary
	if ( ( sprite.position.y >= lower_wall )&&
	( ( sprite.position.x < upper_door_bound )||( sprite.position.x > lower_door_bound ) )) {
		sprite.position.y = lower_wall;
	}
}

/**
	Helper method for moving to the next level
*/
function nextLevel () {
	generateLevel();
}

/**
	Helper Method for checking if a door was entered
*/
function checkDoorEntry ( sprite, level ) {
	if ( sprite.position.x <= left_door ) {
		switch( level ) {
 	 		case 5:
    				resetPosition( sprite );
				exhaustion--;
    				break;
  			case 4:
     				resetPosition( sprite );
    				exhaustion--;
    				break;
  			case 3:
    				nextLevel();
    				break;
  			case 2:
    				resetPosition( sprite );
    				exhaustion--;
    				break;
  			case 1:
    				if ( !game_win ) {
					game_win = true;
					generateWinScreen();				
				}
				break;
		}	
	}

	if ( sprite.position.x >= right_door ) {
		switch( level ) {
 	 		case 5:
    				resetPosition( sprite );
				exhaustion--;
    				break;
  			case 4:
     				resetPosition( sprite );
				exhaustion--;
    				break;
  			case 3:
    				resetPosition( sprite );
    				exhaustion--;
    				break;
  			case 2:
    				nextLevel();
    				break;
  			case 1:
    				resetPosition( sprite );
    				exhaustion--;
    				break;
		}	}

	if ( sprite.position.y <= upper_door ) {
		switch( level ) {
 	 		case 5:
    				nextLevel();
    				break;
  			case 4:
     				resetPosition( sprite );
    				exhaustion--;
    				break;
  			case 3:
    				resetPosition( sprite );
    				exhaustion--;
    				break;
  			case 2:
    				resetPosition( sprite );
    				exhaustion--;
    				break;
  			case 1:
    				resetPosition( sprite );
    				exhaustion--;
    				break;
		}
	}

	if ( sprite.position.y >= lower_door ) {
		switch( level ) {
 	 		case 5:
    				resetPosition( sprite );
				exhaustion--;
    				break;
  			case 4:
     				nextLevel();
    				break;
  			case 3:
    				resetPosition( sprite );
    				exhaustion--;
    				break;
  			case 2:
    				resetPosition( sprite );
    				exhaustion--;
    				break;
  			case 1:
    				resetPosition( sprite );
    				exhaustion--;
    				break;
		}	
	}
}

/**
	Helper function to reset the position of the given sprite
*/
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
	var bat = createMovieClip( "bat", 1, 2 );
	var snake = createMovieClip( "snake", 1, 4 );
	var rand_num = getRand( 2 ); // get a random number (1 or 2)
	
	
	if ( rand_num == 1 ) { // adds a bat
		bat.position.x = fixX( x );
	  	bat.position.y = fixY ( y );
		bat.animationSpeed = 0.1;
		bat.play();
		return bat;
	}
	
	else { // adds a snake
		snake.scale.x = 1.5;
		snake.scale.y = 1.5;
		snake.position.x = fixX( x - 15 );
	  	snake.position.y = fixY( y );
		snake.animationSpeed = 0.1;
		snake.play();
		return snake;
	}
}

/**
	Helper function that returns a movie clip
*/
function createMovieClip ( image, low, high ) {
	var clips = [];
	for ( var i = low; i <= high; i++ ) {
    		clips.push( PIXI.Texture.fromFrame( image + i + '.png' ) );
  	}

  	return new PIXI.extras.MovieClip( clips );
}


function fixX ( x ) {
	if ( ( x >= left_door_bound ) && ( x <= right_door_bound ) ) {
		return fixX ( getRand( 150 ) );
	}
	
	return x;
}


function fixY ( y ) {
	if ( ( y >= upper_door_bound ) && ( y <= lower_door_bound ) ) {
		return fixY ( getRand( 150 ) );
	}
	
	return y;

}

function createButton ( x, y, image ) {
	var button = new PIXI.Sprite( PIXI.Texture.fromFrame( image ) );
	button.position.x = x;
	button.position.y = y;
	button.scale.x = 3;
	button.scale.y = 3;
	button.interactive = true;
	button.on('mousedown', buttonHandler );
	return button;

}

