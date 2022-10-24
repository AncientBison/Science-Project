var Project = Project || {};

var mouseUp = false;
var reloadCommand = false;
var loadingCatapult = false;
var createStackAndClear = false;
var loaded = true;
const DEFAULT_PYRAMID_SIZE = 9;


var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Composites = Matter.Composites,
  Events = Matter.Events,
  Constraint = Matter.Constraint,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Composite = Matter.Composite,
  Bodies = Matter.Bodies;

var debris = Matter.Composite.create();

// create engine
var engine = Engine.create(),
  world = engine.world;

// engine.timing.timeScale = 0.1;

// engine.gravity.y = 0;

// create renderer
var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    showAngleIndicator: true,
    showVelocity: true,
    pixelRatio: 2
  }
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

var defaultCategory = 0x0001,
  mouseCategory = 0x0002;

// add bodies
var ground = Bodies.rectangle(395, 600, 815, 50, { isStatic: true, render: { fillStyle: '#060a19' } });

var rockOptions = {
  // density: 0.004,
  density: 0.01,
  airFriction: 0.005,
  collisionFilter: {
    category: mouseCategory
  }
};

var rock = Bodies.polygon(170, 450, 8, 20, rockOptions);

var anchor = { x: 170, y: 450 };

var elastic = Constraint.create({
  pointA: anchor,
  bodyB: rock,
  stiffness: 0.01
});

function createPyramid(size) {
  let pyramid = Composites.pyramid(500, 300, size, size, 0, 0, function (x, y) {
    // return Bodies.rectangle(x, y, 25, 40);
    return Bodies.polygon(x, y, 8, 15);
  });

  Composite.add(engine.world, pyramid);
  Composite.add(debris, pyramid);
}

function createStack(row, col) {
  let pyramid = Composites.stack(500, 300, row, col, 0, 0, function (x, y) {
    // return Bodies.rectangle(x, y, 25, 40);
    return Bodies.polygon(x, y, 8, 15);
  });

  Composite.add(engine.world, pyramid);
  Composite.add(debris, pyramid);
}

// var ground2 = Bodies.rectangle(610, 250, 200, 20, { isStatic: true, render: { fillStyle: '#060a19' } });

// var pyramid2 = Composites.pyramid(550, 0, 5, 10, 0, 0, function(x, y) {
// return Bodies.rectangle(x, y, 25, 40);
// });

Composite.add(engine.world, [ground, rock, elastic]);
createStack(9, 9);

// add mouse control
var mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false
      }
    },
  });

mouseConstraint.collisionFilter.mask = mouseCategory;

const fireRadius = 20;

Events.on(engine, "afterUpdate", function () {
  if (mouseUp && Math.abs(elastic.pointA.x - rock.position.x) < fireRadius && Math.abs(elastic.pointA.y - rock.position.y) < fireRadius) {
    mouseUp = false;
    console.log(elastic.pointA)
    // rock = Bodies.polygon(170, 450, 7, 20, rockOptions);
    placeholder = Bodies.circle(elastic.pointA.x, elastic.pointA.y, 1)
    // Composite.add(engine.world, placeholder);
    elastic.bodyB = placeholder;
    Composite.add(debris, rock);
    loaded = false;
  } else if (reloadCommand) {
    reloadCommand = false;
    if (!loadingCatapult && !loaded) {
      loaded = true;
      rock = Bodies.polygon(170, 450, 7, 20, rockOptions);
      Composite.add(engine.world, rock);
      // rock.collisionFilter.mask = mouseCategory;
      elastic.bodyB = rock;
    }
  }

  if (createStackAndClear) {
    reloadCommand = true;

    for (let body of Composite.allComposites(debris)) {
      console.log(body);
      Composite.remove(world, body);
    }

    for (let body of Composite.allBodies(debris)) {
      console.log(body);
      Composite.remove(world, body);
    }

    console.log(debris);
    Composite.clear(debris);
    createStack(DEFAULT_PYRAMID_SIZE, DEFAULT_PYRAMID_SIZE);
    createStackAndClear = false;
  }
});

Events.on(mouseConstraint, "enddrag", function () {
  mouseUp = true;
  loadingCatapult = false;
});

Events.on(mouseConstraint, "startdrag", function () {
  loadingCatapult = true;
});

document.addEventListener("keypress", (e) => { if (e.key == "r") { reloadCommand = true } else if (e.key == "b") { createStackAndClear = true } });

Composite.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: 800, y: 600 }
});

document.getElementById("start").addEventListener("click", () => {

  console.log("hi");

  render.canvas.requestFullscreen().then(function() {
    console.log("Fullscreen")
    // veiwBounds = Matter.Bounds.create([{x: 0, y: 0}, {x: window.innerWidth, y: window.innerHeight}]);
    // render.bounds = veiwBounds;
    // initGame();
  }).catch(function(error) {
    console.error(error);
  });

});

// render.options.hasBounds = true;

// veiwBounds = Matter.Bounds.create([{x: 0, y: 0}, {x: 1600, y: 1200}]);

// render.bounds = veiwBounds;

// window.addEventListener("resize", () => {
//   render.canvas.width = window.innerWidth;
//   render.canvas.height = window.innerHeight;
// });

console.log("Hi! If you're looking at this you must be either really confused, or just think that I'm a bad coder :).");