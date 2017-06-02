var ez;
var FIELD_STRENGTH = 0.1;
var VISCOSITY = 0.01;
var INITIAL_SPEED = 1;
var EPSILON = 0.1;
var MAX_PARTICLES = 30;
var system;

function setup() {
  createCanvas(windowHeight, windowHeight);
  frameRate(30);

  ez = createVector(0, 0, 1);
  system = new ParticleSystem(createVector(width/2, height/2));
  system.addParticle(system.origin, p5.Vector.random2D().mult(INITIAL_SPEED));
  system.addParticle(system.origin, p5.Vector.random2D().mult(INITIAL_SPEED));
}

function draw_path(points) {
  for (var j = 1; j < points.length; ++j) {
    var val = j/points.length*204 + 51;
    stroke(val);
    line(points[j - 1].x, points[j - 1].y, points[j].x, points[j].y);
  }
}

function draw() {
  background(51);
  system.run();
}

// A simple Particle class
var Particle = function(position, velocity) {
  this.charge = random(-1, 1);
  this.mass = random(1, 5);
  this.acceleration = createVector(0, 0);
  this.velocity = velocity.copy();
  this.position = [position.copy()];
};

Particle.prototype.run = function() {
  this.update();
  this.display();
};

// Method to update position
Particle.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.position.push(this.position[this.position.length-1].copy().add(this.velocity));
};

// Method to display
Particle.prototype.display = function() {
  point(this.position.x, this.position.y);
  for (var j = 1; j < this.position.length; ++j) {
    var val = j/this.position.length*204 + 51;
    stroke(val);
    line(this.position[j - 1].x, this.position[j - 1].y, this.position[j].x, this.position[j].y);
  }
};

var ParticleSystem = function(position) {
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function(pos, vel) {
  this.particles.push(new Particle(pos, vel));
};

ParticleSystem.prototype.run = function() {
  for (var i = this.particles.length-1; i >= 0; i--) {
    var p = this.particles[i];
    var force = p.velocity.cross(ez).mult(p.charge*FIELD_STRENGTH);
    force = force.add(p.velocity.copy().mult(-VISCOSITY));
    p.acceleration = force.copy().div(p.mass);
    p.run();
    var decay_chance = random(0, 100);
    if (decay_chance <= 1 && this.particles.length < MAX_PARTICLES && p.mass > 1) {
      var mA = p.mass/random(2, 4);
      var mB = p.mass - mA;
      var angle_A = random(PI/6, 5*PI/6);
      var angle_B = random(PI/6, 5*PI/6);
      var vB = p.velocity.magSq()/mB*(p.mass - mB);
      var vA = -mB*vB/mA;
      var heading = p.velocity.heading();
      var vec_vA = p5.Vector.fromAngle(angle_A).mult(vA).add(p.velocity);
      var vec_vB = p5.Vector.fromAngle(angle_B).mult(vB).add(p.velocity);
      p.velocity = vec_vA.copy();
      p.mass = mA;
      this.addParticle(p.position[p.position.length - 1], vec_vB);
    }
  }
};
