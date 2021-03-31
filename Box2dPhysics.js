var Physics = window.Physics = function(element) {
  var gravity = new b2Vec2(0, 0); //SET THIS TO HAVE GRAVITY IN X AND Y
  this.world = new b2World(gravity, true);
  this.element = element;

  this.context = element.getContext("2d");

  this.scale = 2;
  this.dtRemaining = 0;
  this.stepAmount = 1 / 60;
  this.diffSumTol = 500;

  this.textPosX = 0.0;
  this.textPosY = 0.0;

  this.myText = "";


};


Physics.prototype.getRandomInt = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

Physics.prototype.step = function(dt, imgData, oldData) {

  this.dtRemaining += dt;
  while (this.dtRemaining > this.stepAmount) {
    this.dtRemaining -= this.stepAmount;
    this.world.Step(this.stepAmount,
      8, // velocity iterations
      3); // position iterations
    this.lastResetTime += 1;
  }
  this.RenderWorld(this.context);
  if (this.lastResetTime >= this.resetFreq) {
    this.ResetBodiesNotHit();
    this.lastResetTime = 0;
  }
}

Physics.prototype.RenderWorld = function(ctx) {
  // this.context.clearRect(0, 0, this.element.width, this.element.height);
  var wasHit = false;
  var obj = this.world.GetBodyList();

  ctx.save();
  ctx.scale(this.scale, this.scale);
  while (obj) {
    var body = obj.GetUserData();
    if (body) {
      if (body.details.type != 'static') {
        body.draw(ctx);
      }
    }
    obj = obj.GetNext();
  }
  ctx.restore();
}

Physics.prototype.weakBrownian = function() {
  var obj = this.world.GetBodyList();

  while (obj) {

    var body = obj.GetUserData();
    if (body) {
      body.body.ApplyImpulse({
        x: (this.getRandomInt(-100, 100) * this.getRandomInt(100, 300)),
        y: (this.getRandomInt(-100, 100) * this.getRandomInt(100, 300))
      }, body.body.GetWorldCenter());
      //this.SetWordSylLeft(body,sylLeft);
    }
    obj = obj.GetNext();
  }
}



Physics.prototype.click = function(callback) {
  var self = this;

  function handleClick(e) {
    e.preventDefault();
    var point = {
      x: (e.offsetX || e.layerX) / self.scale,
      y: (e.offsetY || e.layerY) / self.scale
    };
    console.log("Click point: ", point.x, point.y);
    self.world.QueryPoint(function(fixture) {
      callback(fixture.GetBody(),
        fixture,
        point);
    }, point);
  }

  this.element.addEventListener("click", handleClick);
  this.element.addEventListener("touchstart", handleClick);
};


Physics.prototype.collision = function() {
  this.listener = new Box2D.Dynamics.b2ContactListener();

  this.listener.BeginContact = function(contact) {
    var body = contact.GetFixtureB().GetBody().GetUserData();
  }

  this.world.SetContactListener(this.listener);

};