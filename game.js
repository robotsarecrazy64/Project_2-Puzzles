var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer(400, 400, {backgroundColor: 0x330033});
gameport.appendChild(renderer.view);

var stage = new PIXI.Container();

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

PIXI.loader
  .add("assets.json")
  .load(ready);

function ready() {

  var standing = new PIXI.Sprite(PIXI.Texture.fromFrame("doctor6.png"));
  standing.scale.x = 4;
  standing.scale.y = 4;
  standing.position.x = 50;
  standing.position.y = 200;
  stage.addChild(standing);
  
  var frames = [];

  for (var i=1; i<=5; i++) {
    frames.push(PIXI.Texture.fromFrame('doctor' + i + '.png'));
  }

  runner = new PIXI.extras.MovieClip(frames);
  runner.scale.x = 4;
  runner.scale.y = 4;
  runner.position.x = 200;
  runner.position.y = 200;
  runner.animationSpeed = 0.1;
  runner.play();
  stage.addChild(runner);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(stage);
}
animate();
