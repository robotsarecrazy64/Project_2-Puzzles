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
var comsume;
var enemy_a;
var enemy_a_health;
var enemy_b;
var enemy_b_health;
var enemy_c;
var enemy_c_health;
var floor_map;
var hp_tag;
var ex_meter;
var added_ex_meter;
var main_map;
var guide_button;
var credit_button;
var play_button;
var menu_button;
var left_arrow_button;
var right_arrow_button;
var end_game;
var credits;
  
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
var left_door_bound = 190;
var right_door_bound = 205;
var upper_door_bound = 160;
var lower_door_bound = 280;
var exhaustion = 10;
var game_win = false;
var game_over = false;
var game_active = false;
var button_x = 265;
var button_y = 425;

function main_menu () {
	exhaustion = 10;
	game_win = false;
	game_over = false;
	game_active = false;
	current_level = 6;

	main_map = createSprite( 0, 0, max_level, max_level, "main_menu.png" );
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
	guide = createSprite( 0, 0, max_level, max_level, ( "guide" + current_guide + ".png" ) );
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
	
	if ( current_level <= 0 ) { current_level = max_level; }

	floor_map = createSprite( 0, 0, max_level, max_level, ( "floor" + current_level + ".png" ) );
	game_stage.addChild( floor_map );

	player = createSprite( start_x, start_y, 1, 1, "player1.png" );
	game_stage.addChild( player );

	enemy_a = addEnemy( 150, 39 + getRand( 250 ) );
	enemy_a.interactive = true;
	enemy_a.on('mousedown', enemyHandler);
	enemy_a_health = getRand( 4 );
	game_stage.addChild( enemy_a );
	
	enemy_b = addEnemy( 351 - getRand( 200 ), 300 );
	enemy_b.interactive = true;
	enemy_b.on('mousedown', enemyHandler);
	enemy_b_health = getRand( 4 );
	game_stage.addChild( enemy_b );

	enemy_c = addEnemy( 300, 50 + getRand( 200 ) );
	enemy_c.interactive = true;
	enemy_c.on('mousedown', enemyHandler);
	enemy_c_health = getRand( 4 );
	game_stage.addChild( enemy_c );

	hp_tag = createSprite( 0, 470, 1, 1, "hp_tag.png" );
	game_stage.addChild( hp_tag );

	hit = PIXI.audioManager.getAudio("hit.mp3");
	enter_door = PIXI.audioManager.getAudio("enter_door.mp3");
	consume = PIXI.audioManager.getAudio("nom.mp3");

	generateExMeter();

	stage.addChild( game_stage );

	document.addEventListener('keydown', keydownEventHandler);	
	update();
}

/**
	Generates Game End Screen
*/
function generateEndGame () {
	stage.removeChild( game_stage ); 
	game_active = false;

	if ( game_win ) {
		end_game = createSprite( 0, 0, max_level, max_level, "game_win.png" );
		end_stage.addChild( end_game );
	}

	else {
		end_game = createSprite( 0, 0, max_level, max_level, "game_over.png" );
		end_stage.addChild( end_game );
	
		enemy_a = addEnemy( 351 - getRand( 150 ), 35 );
		end_stage.addChild( enemy_a );
	
		enemy_b = addEnemy( 100, 300 );
		end_stage.addChild( enemy_b );
	}
	
	credit_button = createButton( button_x - step, button_y, "credit_button.png" );
	end_stage.addChild( credit_button );
	
	game_over = true;

	stage.addChild( end_stage );

}

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
		game_over = true;
		exhaustion--;
		generateEndGame();
	}

}


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
        
	if( sprite.position.x < -step ) {
		//sprite.position.x = start_x;
	}
	
	// Right Boundary
	if ( ( sprite.position.x >= right_wall )&&
	( ( sprite.position.y < left_door_bound )||( sprite.position.y > right_door_bound ) )) {
		sprite.position.x = right_wall;
	}

	if( sprite.position.x >  ( right_door + step ) ) {
		//sprite.position.x = start_x;
	}

	// Upper Boundary
	if ( ( sprite.position.y <= upper_wall )&&
	( ( sprite.position.x < upper_door_bound )||( sprite.position.x > lower_door_bound ) )) {
		sprite.position.y = upper_wall;
	}

	if( sprite.position.y < -step ) {
		//sprite.position.y = start_y;
	}


	// Lower Boundary
	if ( ( sprite.position.y >= lower_wall )&&
	( ( sprite.position.x < upper_door_bound )||( sprite.position.x > lower_door_bound ) )) {
		sprite.position.y = lower_wall;
	}
	
	if( sprite.position.y > ( lower_door + step ) ) {
		//sprite.position.y = start_y;
	}

}

/**
	Helper Method for checking if a door was entered
*/
function checkDoorEntry ( sprite, level ) {
	if ( sprite.position.x <= left_door ) {
		switch( level ) {
 	 		case 5:
    				hit.play();
				wrongDoor();
    				break;
  			case 4:
     				hit.play();
				wrongDoor();
    				break;
  			case 3:
    				enter_door.play();
				nextLevel();
    				break;
  			case 2:
    				hit.play();
				wrongDoor();
    				break;
  			case 1:
    				if ( !game_win ) {
					game_win = true;
					enter_door.play();
					generateEndGame();				
				}
				break;
		}	
	}

	if ( sprite.position.x >= right_door ) {
		switch( level ) {
 	 		case 5:
    				hit.play();
				wrongDoor();
    				break;
  			case 4:
     				hit.play();
				wrongDoor();
    				break;
  			case 3:
    				hit.play();
				wrongDoor();
    				break;
  			case 2:
    				enter_door.play();
				nextLevel();
    				break;
  			case 1:
    				hit.play();
				wrongDoor();
    				break;
		}	}

	if ( sprite.position.y <= upper_door ) {
		switch( level ) {
 	 		case 5:
    				enter_door.play();
				nextLevel();
    				break;
  			case 4:
     				hit.play();
				wrongDoor();
    				break;
  			case 3:
    				hit.play();
				wrongDoor();
    				break;
  			case 2:
    				hit.play();
				wrongDoor();
    				break;
  			case 1:
    				hit.play();
				wrongDoor();
    				break;
		}
	}

	if ( sprite.position.y >= lower_door ) {
		switch( level ) {
 	 		case 5:
    				hit.play();
				wrongDoor();
    				break;
  			case 4:
     				enter_door.play();
				nextLevel();
    				break;
  			case 3:
    				hit.play();
				wrongDoor();
    				break;
  			case 2:
    				hit.play();
				wrongDoor();
    				break;
  			case 1:
    				hit.play();
				wrongDoor();
    				break;
		}	
	}
}


/**
	Event Handler for Key events
*/
function keydownEventHandler(event) {
	var temp_x = player.position.x;
	var temp_y = player.position.y;
	game_stage.removeChild( player );
	
	if ( game_active ) {
  		if ( event.keyCode == 87 ) { // W key
			// Update the player sprite to upper facing player
			player = createSprite( temp_x, temp_y - step, 1, 1, "player4.png"  );
			game_stage.addChild( player );
  		}

  		if ( event.keyCode == 65 ) { // A key
			// Update the player sprite to left facing player
			player = createSprite( temp_x - step, temp_y, 1, 1, "player2.png"  );
			game_stage.addChild( player );
  		}
	
		if ( event.keyCode == 83 ) { // S key
			// Update the player sprite to lower facing player
			player = createSprite( temp_x, temp_y + step, 1, 1, "player3.png"  );
			game_stage.addChild( player );
	  	}
	
		if ( event.keyCode == 68 ) { // D key	
			player = createSprite( temp_x + step, temp_y, 1, 1, "player1.png"  );
			game_stage.addChild( player );
		}
	}
}

/**
	Event Handler for Button events
*/

function buttonHandler( event ) {
	clearStage();

	if ( event.target == play_button ) {
		generateLevel();
	}
	
	else if ( event.target == menu_button ) {
		main_menu();
	}

	else if ( event.target == guide_button ) {
		generateGuide();
	}
	
	else if ( event.target == credit_button ) {
		generateCredits();
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

function enemyHandler ( event ) {
	if ( event.target == enemy_a ) {
		enemy_a_health = attackSprite( player, enemy_a, enemy_a_health ); 
		if ( enemy_a_health <= 0 ) {
			consume.play();
			game_stage.removeChild( enemy_a );
			exhaustion += getRand( 2 );
		}

		else {
			moveSprite( enemy_a, fixX( getRand( 150 ) + 100 ), fixY( getRand( 150 ) + 100 ) );
		}

	}

	else if ( event.target == enemy_b ) {
		enemy_b_health = attackSprite( player, enemy_b, enemy_b_health ); 
		if ( enemy_b_health <= 0 ) {
			consume.play();
			game_stage.removeChild( enemy_b );
			exhaustion += getRand( 2 );
		}
		
		else {
			moveSprite( enemy_b, fixX( getRand( 150 ) + 100 ), fixY( getRand( 150 ) + 100 ) );
		}

	}

	else if ( event.target == enemy_c ) {
		enemy_c_health = attackSprite( player, enemy_c, enemy_c_health ); 
		if ( enemy_c_health <= 0 ) {
			consume.play();
			game_stage.removeChild( enemy_c );
			exhaustion += getRand( 2 );
		}

		else {
			moveSprite( enemy_c, fixX( getRand( 150 ) + 100 ), fixY( getRand( 150 ) + 100 ) );
		}

	}
}

function attackSprite ( sprite1, sprite2, enemy_health ) {
	var enemy_hit = getRand( 5 );

	moveSprite( sprite1, sprite2.position.x, sprite2.position.y );
	
	if ( ( enemy_hit > 3 ) && ( enemy_health > 0 ) ) {
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
	var button = createSprite( x, y, 3, 3, image );
	button.interactive = true;
	button.on('mousedown', buttonHandler );
	return button;

}

function createSprite (x, y, scale_x, scale_y, image ) {
	var sprite = new PIXI.Sprite( PIXI.Texture.fromFrame( image ) );
	sprite.position.x = x;
	sprite.position.y = y;
	sprite.scale.x = scale_y;
	sprite.scale.y = scale_x;
	return sprite;
}

function wrongDoor() {
	exhaustion--;
	resetPosition( player );
}

/**
	Helper method for moving to the next level
*/
function nextLevel () {
	generateLevel();
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

function clearStage () {
	stage.removeChild( guide_stage );
	stage.removeChild( end_stage );
	stage.removeChild( main_stage );
	stage.removeChild( credit_stage );
	stage.removeChild( game_stage );
}

/**
	Helper function that moves a sprite
*/
function moveSprite( sprite, new_x, new_y ) {
	createjs.Tween.get( sprite.position ).to({ x: new_x, y: new_y }, 200, createjs.Ease.backOut );
}

