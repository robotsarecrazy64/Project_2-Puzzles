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
var credit_stage = new PIXI.Container();
var difficulty_stage = new PIXI.Container();

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// Loads the assets from the sprite sheet
PIXI.loader
  .add( "assets.json" )
  .add("hit.mp3")
  .add("nom.mp3")
  .add("enter_door.mp3")
  .load( main_menu );
  
// Assets
var player;
var hit;
var enter_door;
var consume;
var enemy_a;
var enemy_a_health;
var enemy_b;
var enemy_b_health;
var enemy_c;
var enemy_c_health;
var floor_map;
var floor_code;
var hp_tag;
var ex_meter;
var added_ex_meter;
var main_map;
var difficulty_map;
var normal_button;
var impossible_button;
var guide_button;
var credit_button;
var play_button;
var menu_button;
var left_arrow_button;
var right_arrow_button;
var end_game;
var credits;
var blood;
  
// Variables to improve readability
var current_level = 6;
var current_guide = 0;
var max_level = 5
var step = 20;
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
var left_door_bound = 180;
var right_door_bound = 205;
var upper_door_bound = 180;
var lower_door_bound = 250;
var exhaustion = 10;
var game_win = false;
var game_over = false;
var game_active = false;
var impossible_mode = false;
var left_button_x = -45;
var right_arrow_button_x = 125;
var button_x = 265;
var button_y = 425;
var hp_tag_y = 470;
var left_position = 100;
var right_position = 300;

/**
	Generates Main Menu Screen
*/
function main_menu () {
	// Resets Game Variables
	resetGameValues();

	hit = PIXI.audioManager.getAudio("hit.mp3");
	enter_door = PIXI.audioManager.getAudio("enter_door.mp3");
	consume = PIXI.audioManager.getAudio("nom.mp3");

	main_map = createSprite( 0, 0, max_level, max_level, "main_menu.png" );
	main_stage.addChild( main_map );
	
	play_button = createButton( button_x, button_y, "play_button.png" );
	main_stage.addChild( play_button );

	guide_button = createButton( left_button_x, button_y, "guide_button.png" );
	main_stage.addChild( guide_button );
	
	stage.addChild( main_stage );

	update();
}

/**
	Generates Guide Screen
*/
function generateGuide() {
	if( current_guide >= 3 ) { current_guide = 0; }

	if( current_guide < 0 ) { current_guide = 2; }

	current_guide++;
	guide = createSprite( 0, 0, max_level, max_level, ( "guide" + current_guide + ".png" ) );
	guide_stage.addChild( guide );
	
	
	left_arrow_button = createButton( 0, button_y, "left_arrow_button.png" );
	guide_stage.addChild( left_arrow_button );

	right_arrow_button = createButton( right_arrow_button_x, button_y, "right_arrow_button.png" );
	guide_stage.addChild( right_arrow_button );

	menu_button = createButton( button_x - step, button_y, "menu_button.png" );
	guide_stage.addChild( menu_button );

	stage.addChild( guide_stage );
	update();

}

/**
	Generates Diffculty Screen
*/
function difficulty () {
	difficulty_map = createSprite( 0, 0, max_level, max_level, "difficulty.png" );
	difficulty_stage.addChild( difficulty_map );
	
	normal_button = createButton( 100, 225, "normal_button.png" );
	difficulty_stage.addChild( normal_button );

	impossible_button = createButton( 100, 325, "impossible_button.png" );
	difficulty_stage.addChild( impossible_button );

	menu_button = createButton( button_x - step, button_y, "menu_button.png" );
	difficulty_stage.addChild( menu_button );
	
	stage.addChild( difficulty_stage );

	update();
}


/**
	Initializes the Game Elements
*/
function generateLevel() {	
	game_active = true;
	current_level--;
	
	if ( current_level <= 0 ) { current_level = max_level; }

	if ( floor_map != null ) {
		delete floor_map;
	}
	
	floor_map = createSprite( 0, 0, max_level, max_level, ( "floor" + current_level + ".png" ) );
	game_stage.addChild( floor_map );

	// Generate Door code
	floor_code = generateDoorCode();

	if ( player != null ) {
		delete player;
	}
	
	player = createSprite( start_x, start_y, 1, 1, "player1.png" );
	game_stage.addChild( player );

	if ( enemy_a != null ) {
		delete enemy_a;
	}
	
	enemy_a = addEnemy( upper_door_bound, left_wall + getRand( right_position ) );
	enemy_a.interactive = true;
	enemy_a.on('mousedown', enemyHandler);
	enemy_a_health = getRand( 4 );
	game_stage.addChild( enemy_a );
	
	if ( enemy_b != null ) {
		delete enemy_b;
	}

	enemy_b = addEnemy( right_wall - getRand( start_x ), right_position );
	enemy_b.interactive = true;
	enemy_b.on('mousedown', enemyHandler);
	enemy_b_health = getRand( 4 );
	game_stage.addChild( enemy_b );

	if ( enemy_c != null ) {
		delete enemy_c;
	}

	enemy_c = addEnemy( left_position, ( upper_wall * 2 ) + getRand( start_x ) );
	enemy_c.interactive = true;
	enemy_c.on('mousedown', enemyHandler);
	enemy_c_health = getRand( 4 );
	game_stage.addChild( enemy_c );

	if ( impossible_mode ) {
		enemy_a_health *= 2;
		enemy_b_health *= 2;
		enemy_c_health *= 2;
	}

	if ( hp_tag != null ) {
		delete hp_tag;
	}

	hp_tag = createSprite( 0, hp_tag_y, 1, 1, "hp_tag.png" );
	game_stage.addChild( hp_tag );

	if ( ex_meter != null ) {
		delete ex_meter;
	}

	generateExMeter();

	stage.addChild( game_stage );

	document.addEventListener('keydown', keydownEventHandler);	
	update();
}

/**
	Generates Game End Screen
*/
function generateEndGame () {
	game_active = false;

	if ( game_win ) {
		end_game = createSprite( 0, 0, max_level, max_level, "game_win.png" );
		end_stage.addChild( end_game );

		player = createMovieClip(  50, 350, 1, 1, "player", 1, 4 );
		end_stage.addChild( player );
	}

	else {
		end_game = createSprite( 0, 0, max_level, max_level, "game_over.png" );
		end_stage.addChild( end_game );
	
		enemy_a = addEnemy( right_wall - getRand( upper_door_bound ), left_wall );
		end_stage.addChild( enemy_a );
	
		enemy_b = addEnemy( left_position + getRand( upper_door_bound ), right_position + 10 );
		end_stage.addChild( enemy_b );
	}
	
	credit_button = createButton( button_x - step, button_y, "credit_button.png" );
	end_stage.addChild( credit_button );
	
	game_over = true;

	stage.addChild( end_stage );

}

/**
	Generates Credits Screen
*/
function generateCredits() {
	credits = createSprite( 0, 0, max_level, max_level, "credits.png" );
	credit_stage.addChild( credits );

	menu_button = createButton( button_x - step, button_y, "menu_button.png" );
	credit_stage.addChild( menu_button );

	stage.addChild( credit_stage );
}


/**
	Update function to animate game assets
*/
function update() {
	if ( !game_over && game_active ) {
		//Check Boundary for player
		correctPosition( player );
			
		//Check if player entered a door
		checkDoorEntry( player, current_level );
		
		//Checks Exhaustion
		generateExMeter();
		checkExhaustion();
	}
	
	// Update renderer
	requestAnimationFrame( update );
	renderer.render( stage );
}

/**
	Checks for Game Losing Condition
*/
function checkExhaustion () {
	if ( exhaustion == 0 ) {
		stage.removeChild( game_stage ); 
		consume.play();
		game_over = true;
		exhaustion--;
		generateEndGame();
	}

}

/**
	Helper function that displays the exhaustion meter
*/
function generateExMeter () {
	if ( exhaustion < 0 ) { exhaustion = 0; }

	if ( exhaustion > 10 ) { exhaustion = 10; }

	ex_meter = new createSprite( 30, 470, 1, 1, ( "ex_meter" + exhaustion + ".png" ) );
	
	game_stage.addChild( ex_meter );
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
	Helper Method for checking if a door was entered
*/
function checkDoorEntry ( sprite, level ) {
	if ( sprite.position.x <= left_door ) {
		openDoor( 0 );	
	}

	if ( sprite.position.x >= right_door ) {
		openDoor( 1 );	
	}

	if ( sprite.position.y <= upper_door ) {
		openDoor( 2 );		
	}

	if ( sprite.position.y >= lower_door ) {
		openDoor( 3 );	
	}	
}

/**
	Helper function that opens the door at the specified position and checks if the door is correct
*/
function openDoor( door_position ) {
	if ( floor_code[ door_position ] == 1 ) { // correct door choice
		if ( !game_win && ( current_level == 1 ) ) { // Last level (Game Win)
			game_win = true;
			enter_door.play();
			generateEndGame();				
		}
	
		else { // Move to the next level
			enter_door.play();
			nextLevel();
			return true;
		}
	}
	
	else if ( impossible_mode ) {
		hit.play();
		resetLevel();
		return false;
	}

	else { // wrong door choice
		hit.play();
		wrongDoor();
		return false;
	}
}

/**
	Event Handler for Key events (Player movement)
*/
function keydownEventHandler( event ) {	
	if ( game_active ) {
		var temp_x = player.position.x;
		var temp_y = player.position.y;

  		if ( event.keyCode == 87 ) { // W key
			// Update the player sprite to upper facing player
			swapPlayer( temp_x, temp_y - step, 1, 1, "player4.png"  );
  		}

  		if ( event.keyCode == 65 ) { // A key
			// Update the player sprite to left facing player
			swapPlayer( temp_x - step, temp_y, 1, 1, "player2.png"  );
  		}
	
		if ( event.keyCode == 83 ) { // S key
			// Update the player sprite to lower facing player
			swapPlayer( temp_x, temp_y + step, 1, 1, "player3.png"  );
	  	}
	
		if ( event.keyCode == 68 ) { // D key
			// Update the player sprite to right facing player
			swapPlayer( temp_x + step, temp_y, 1, 1, "player1.png"  );
		}
	}
}

/**
	Event Handler for Button events
*/
function buttonHandler( event ) {
	clearStage(); // clears the stage
	
	switch( event.target ) {
		case play_button :
			difficulty(); // load difficulty screen
			break;

		case normal_button :
			generateLevel(); // load game screen
			break;

		case impossible_button :
			impossible_mode = true;
			generateLevel(); // load game screen
			break;
		
		case menu_button: 
			main_menu(); // load menu screen
			break;

		case guide_button:
			generateGuide(); // load guide screen
			break;

		case credit_button: 
			generateCredits(); // load credits screen
			break;

		case right_arrow_button:
			generateGuide(); // navigate guide screen right
			break;

		case left_arrow_button:
			current_guide--;
			current_guide--;
			generateGuide(); // navigate guide screen left
			break;
	}
}

/**
	Manages enemy click events for each enemy in the level
*/
function enemyHandler ( event ) {
	var temp_x;
	var temp_y;
	//var blood;
	if ( event.target == enemy_a ) {
		enemy_a_health = attackSprite( player, enemy_a, enemy_a_health ); // engage enemy
		if ( enemy_a_health <= 0 ) { // enemy dies and gives random xp
			consume.play();
			temp_x = enemy_a.position.x;
			temp_y = enemy_a.position.y;
			game_stage.removeChild( enemy_a );
			blood = createSprite( temp_x, temp_y, 1, 1, "blood.png" );
			game_stage.addChild( blood );
			exhaustion += getRand( 2 );
		}

		else { // run away
			moveSprite( enemy_a, fixX( getRand( upper_door_bound ) + left_position ), fixY( getRand( upper_door_bound ) + left_position ) );
		}

	}

	else if ( event.target == enemy_b ) {
		enemy_b_health = attackSprite( player, enemy_b, enemy_b_health ); // engage enemy
		if ( enemy_b_health <= 0 ) { // enemy dies and gives random xp
			consume.play();
			temp_x = enemy_b.position.x;
			temp_y = enemy_b.position.y;
			game_stage.removeChild( enemy_b );
			blood = createSprite( temp_x, temp_y, 1, 1, "blood.png" );
			game_stage.addChild( blood );
			exhaustion += getRand( 2 );
		}
		
		else { // run away
			moveSprite( enemy_b, fixX( getRand( upper_door_bound ) + left_position ), fixY( getRand( upper_door_bound ) + left_position ) );
		}

	}

	else if ( event.target == enemy_c ) { 
		enemy_c_health = attackSprite( player, enemy_c, enemy_c_health ); // engage enemy
		if ( enemy_c_health <= 0 ) { // enemy dies and gives random xp
			consume.play();
			temp_x = enemy_c.position.x;
			temp_y = enemy_c.position.y;
			game_stage.removeChild( enemy_c );
			blood = createSprite( temp_x, temp_y, 1, 1, "blood.png" );
			game_stage.addChild( blood );
			exhaustion += getRand( 2 );
		}

		else { // run away 
			moveSprite( enemy_c, fixX( getRand( upper_door_bound ) + left_position ), fixY( getRand( upper_door_bound ) + left_position ) );
		}

	}
}

/**
	Helper function that attacks the enemy sprite
*/
function attackSprite ( sprite1, sprite2, enemy_health ) {
	var enemy_hit = getRand( 5 );

	moveSprite( sprite1, sprite2.position.x, sprite2.position.y );
	
	if ( ( enemy_hit > 3 ) && ( enemy_health > 0 ) ) { // 2/5 chance to hit the player back
		hit.play();
		moveSprite( sprite2, sprite1.position.x, sprite1.position.y );
		exhaustion--;
	}

	enemy_health--;
	
	return enemy_health;
}

/**
	Helper function that returns a random enemy at a specified location
*/
function addEnemy( x, y ) {
	var bat = createMovieClip( x, y, 1, 1, "bat", 1, 2 );
	var snake = createMovieClip(  x - 15, y, 1.5, 1.5, "snake", 1, 4 );
	var rand_num = getRand( 2 ); // get a random number (1 or 2)
	
	if ( rand_num == 1 ) { // adds a bat
		return bat;
	}
	
	else { // adds a snake
		return snake;
	}
}

/**
	Helper function that returns a movie clip
*/
function createMovieClip ( x, y, scale_x, scale_y, image, low, high ) {
	var clips = [];
	for ( var i = low; i <= high; i++ ) {
    		clips.push( PIXI.Texture.fromFrame( image + i + '.png' ) );
  	}
	
	var movie_clip = new PIXI.extras.MovieClip( clips );
	movie_clip.scale.x = scale_x;
	movie_clip.scale.y = scale_y;
	movie_clip.position.x = fixX( x );
	movie_clip.position.y = fixY ( y );
	movie_clip.animationSpeed = 0.1;
	movie_clip.play();	
  	return movie_clip;
}

/**
	Helper function that restricts the enemy spawn location
*/
function fixX ( x ) {
	if ( ( x >= left_door_bound ) && ( x <= right_door_bound ) ) {
		return fixX ( getRand( upper_door_bound ) );
	}
	
	return x;
}

/**
	Helper function that restricts the enemy spawn location
*/
function fixY ( y ) {
	if ( ( y >= upper_door_bound ) && ( y <= lower_door_bound ) ) {
		return fixY ( getRand( upper_door_bound ) );
	}
	
	return y;

}

/**
	Helper function that creates a button
*/
function createButton ( x, y, image ) {
	var button = createSprite( x, y, 3, 3, image );
	button.interactive = true;
	button.on('mousedown', buttonHandler );
	return button;

}

/**
	Helper function that creates a sprite
*/
function createSprite (x, y, scale_x, scale_y, image ) {
	var sprite = new PIXI.Sprite( PIXI.Texture.fromFrame( image ) );
	sprite.position.x = x;
	sprite.position.y = y;
	sprite.scale.x = scale_y;
	sprite.scale.y = scale_x;
	return sprite;
}

/**
	Helper function that evaluates bad door choices
*/
function wrongDoor() {
	exhaustion--;
	player.position.x = start_x;
	player.position.y = start_y;
}

function resetLevel () {
	exhaustion--;
	current_level = 6;
	generateLevel();
}

/**
	Helper method for moving to the next level
*/
function nextLevel () {
	generateLevel();
}

/**
	Helper function that returns a random number from 1 to max
*/
function getRand( max ) {
	return Math.floor(( Math.random() * max ) + 1 );
}

/**
	Helper function that clears all children from the main stage
*/
function clearStage () {
	stage.removeChild( guide_stage );
	stage.removeChild( end_stage );
	stage.removeChild( main_stage );
	stage.removeChild( credit_stage );
	stage.removeChild( game_stage );
	stage.removeChild( difficulty_stage );
}

/**
	Helper function that moves a sprite
*/
function moveSprite( sprite, new_x, new_y ) {
	createjs.Tween.get( sprite.position ).to({ x: new_x, y: new_y }, 200, createjs.Ease.backOut );
}

/**
	Helper function that generates an array of numbers containing exactly one 1
*/
function generateDoorCode() {
	var door_array = [];
	var door_code = getRand( 4 );

	for ( var value = 1; value < max_level; value++ ) {
		if( value == door_code ) {
			door_array.push( 1 );
		}
    		door_array.push( 0 );
	}
	
	return door_array;
}

/**
	Helper function that swaps the player sprite
*/
function swapPlayer ( x, y, scale_x, scale_y, image ) {
	game_stage.removeChild( player );
	player = createSprite( x, y, scale_x, scale_y, image );
	game_stage.addChild( player );
}

/**
	Helper function to reset game values
*/
function resetGameValues () {
	exhaustion = 10;
	game_win = false;
	game_over = false;
	game_active = false;
	impossible_mode = false;
	current_level = 6;
}