var Project = Project || {};

var mouseUp = false;
var reloadCommand = false;
var loadingCatapult = false;


Project.slingshot = function() {
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

    // create engine
    var engine = Engine.create(),
        world = engine.world;

    engine.timing.timeScale = 0.1;
    // engine.gravity.y = 0;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            showAngleIndicator: true, 
            showVelocity: true,
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
  
    var rock = Bodies.polygon(170, 450, 8, 20, rockOptions),
    var anchor = { x: 170, y: 450 },
    var elastic = Constraint.create({ 
      pointA: anchor, 
      bodyB: rock, 
      stiffness: 0.01
    });
  
      var pyramid = Composites.pyramid(500, 300, 9, 10, 0, 0, function(x, y) {
      return Bodies.rectangle(x, y, 25, 40); //change mass with slider
    });

    // var ground2 = Bodies.rectangle(610, 250, 200, 20, { isStatic: true, render: { fillStyle: '#060a19' } });

    // var pyramid2 = Composites.pyramid(550, 0, 5, 10, 0, 0, function(x, y) {
        // return Bodies.rectangle(x, y, 25, 40);
    // });

    Composite.add(engine.world, [ground, pyramid, rock, elastic]);

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

    Events.on(engine, "afterUpdate", function() {
      if (mouseUp && (rock.position.x > 190 || rock.position.y < 430)) {
        mouseUp = false;
        console.log(elastic.pointA)
        rock = Bodies.polygon(170, 450, 7, 20, rockOptions);
        // placeholder = Bodies.circle(elastic.pointA.x, elastic.pointA.y, 1)
        elastic.bodyB = rock;
      } else if (reloadCommand) {
        reloadCommand = false;
        if (!loadingCatapult) {
          rock = Bodies.polygon(170, 450, 7, 20, rockOptions);
          Composite.add(engine.world, rock);
          // rock.collisionFilter.mask = mouseCategory;
          elastic.bodyB = rock;
        }
      }
    });

    Events.on(mouseConstraint, "enddrag", function() {
      mouseUp = true;
      loadingCatapult = false;
    });

    Events.on(mouseConstraint, "startdrag", function() {
      loadingCatapult = true;
    });
  
    document.addEventListener("keypress", (e) => {if (e.key == "r") {reloadCommand = true}});
  
    Composite.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });

    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};

Project.slingshot.title = 'Slingshot';
Project.slingshot.for = '>=0.14.2';

// if (typeof module !== 'undefined') {
    // module.exports = Example.slingshot;
// }

Project.slingshot()