/*
*	A module that handles camera general movement
*	Don't be fooled by this module generic name: It does very specific work.
*
*/

function Cinematic() {
	StateMachine.call(this, {
		state: "unitialized",
		transitions: [
			{
				last: "unitialized",
				next: "loading",
				event: function() {
					this.periods.animation = 120;
				}
			}, {
				last: "loading",
				next: "loading-zoom",
			}, {
				last: "loading-zoom",
				next: "zoom",
				event: function() {
					this.startedAt = performance.now();
				}
			}, {
				last: "zoom",
				next: "normal",
				event: function() {
					this.periods.animation = 360;
					this.world.addMeshesFromLoadedData();
				}
			}
		]
	});

}

Cinematic.prototype = {
	constructor: Cinematic,
	periods: {
		animation: 360,
		zoomOut: 480
	},
	init: function(world, camera, scenes) {
		this.world = world;
		this.camera = camera;
		this.scenes = scenes;
		this.state = "loading";
	},
	translations: {
		ease: function(t) {
			var ts = t*t;
			var tc = tc*t;
			return ((6 * tc * ts) + (-15 * ts * ts) + (10 * tc));
		},
		bounce: function(t) {
			return FastInterpolation.any(0, 0, 0.01, -0.03, 0.99, 1.03, 1, 1).at(t)/2;
		}
	},
	onChunkAdded: function() {
		if (this.state === "loading") {
			this.state = "loading-zoom";
		}
	},
	update: function(elapsed) {
		if (this.state === "unitialized")
			return;
		var counter, t, c, s, position, focus, distance;
		position = this.camera.position;
		focus = new THREE.Vector3(0, 0, 0);
		counter = 0;
		/* Update is a Lambda Function */
		let update = (function(elapsed) {
			if (this.state === "loading-zoom") {
				counter -= elapsed*4;
			} else {
				counter -= elapsed;
			}
			if (counter <= 0) {
				counter = this.periods.animation;
				if (this.state === "loading-zoom")
					this.state = "zoom";
			}
			t = counter/this.periods.animation;
			if (this.state.substr(0,7) === "loading") {
				t = this.translations.bounce(t);
			}
			c = Math.cos(t*Math.PI*2);
			s = Math.sin(t*Math.PI*2);
			if (this.state.substr(0,7) === "loading") {
				distance = 4;
				position.set(c*distance,0,s*distance);
				focus.set(0,0,0);
			} else if (this.state === "zoom") {
				var df = (performance.now() - this.startedAt)/this.periods.zoomOut;
				(df > 1) && (df = 1) && (this.state = "normal");
				distance = FastInterpolation.any(0,4,1,22).at(df);
				position.x = c*distance;
				position.y = FastInterpolation.any(0,0,1,15).at(df);
				position.z = s*distance;
				distance = FastInterpolation.any(0,0,1,9).at(df);
				focus.x = c*distance;
				focus.y = FastInterpolation.any(0,0,1,4).at(df);
				focus.z = s*distance;
			} else if (this.state === "normal") {
				distance = 22;
				position.set(c*distance,15,s*distance);
				focus.set(c*9,4,s*9);
			}
			this.camera.lookAt(focus);
			return;
		}).bind(this);
		this.update = update;
		return update(elapsed);
	}
}