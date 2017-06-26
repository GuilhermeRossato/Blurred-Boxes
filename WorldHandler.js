function WorldHandler(imageList) {
	this.imageList = imageList;
	this.geometry = new THREE.BoxGeometry(1,1,1);
	this.middle = new THREE.Vector2(0,0);
	this.look = new THREE.Vector3(0,0);
	this.loaded = false;
}

WorldHandler.prototype = {
	constructor: WorldHandler,
	init: function(camera, scenes) {
		this.loaded = false;
		this.camera = camera;
		this.scenes = scenes;
		var geometry = this.geometry;
		var material = this.createMaterial("planks_spruce.png");
		this.loadMeshes = scenes.map(scene => new THREE.Mesh(geometry, material));
		this.loadMeshes.forEach((mesh, i) => (mesh.position.y = 1.5) && (scenes[i].add(mesh)));
		var minDist = -5, maxDist = 50;
		//this.df = FastInterpolation.any(minDist*minDist, 0, maxDist*maxDist, this.scenes.length);
		/* Transform Squared into Index */
		this.getIndex = function(d) {
			//return (FastInterpolation.any(0,0,60,this.scenes.length, Math.sqrt(d)))|0;
			if (d < 40)
				return 0;
			else if (d < 103)
				return 1;
			else if (d < 270)
				return 2;
			else if (d < 670)
				return 3;
			else if (d < 899)
				return 4;
			else if (d < 1295)
				return 5;
			else if (d < 1763)
				return 6;
			else if (d < 2303)
				return 7;
			else if (d < 2915)
				return 8;
			else
				return 9;
			//Generated using   var maxValue = 10, maxDistance = 60, myStr = ""; for (var value = 0; value < maxValue; value++) myStr+=(value===0?"if":"else if")+" (d < "+(Math.pow(FastInterpolation.any(0,0,maxValue,maxDistance,value+0.99999),2)|0)+")\n\treturn "+value+";\n"; myStr;
		}
		this.clampSquaredSize = function(d) {
			(d < minDist*minDist) && (d = minDist*minDist);
			(d > maxDist*maxDist) && (d = maxDist*maxDist);
			return d;
		}
	},
	createMaterial: function(fileName) {
		var image = (this.imageList.filter(img => img.fileName === fileName))[0];
		if (!image)
			return;
		var texture = new THREE.Texture();
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.LinearFilter;
		texture.image = image;
		texture.needsUpdate = true;
		texture.anisotropy = 0; // Proven to be unnecessary at the time
		var material = new THREE.MeshLambertMaterial({
			map: texture,
			color: 0x282828
			//opacity: 0.5,
			//transparent: true
		});
		return material;
	}, addChunk: function(chunk) {
		if (this.loaded)
			return console.warn("Unexpected World Load");
		if (!this.chunks)
			this.chunks = []
		this.chunks.push(chunk);
	},
	addMeshesFromLoadedData: function() {
		var x, y, z, i, j, jm, data, offsetX, offsetY, offsetZ;
		/* Remove past element */
		var mesh = this.loadMeshes[0];
		this.loadMeshes.forEach(mesh => mesh.parent.remove(mesh));
		jm = this.scenes.length;
		this.chunks.forEach(chunk => {
			/* Fill world with blocks */
			data = chunk.data;
			offsetX = (chunk.offset[0]-0.5)*chunkSize;
			offsetY = (chunk.offset[1]-1.1)*chunkSize;
			offsetZ = (chunk.offset[2]-0.5)*chunkSize;
			i = data.getCount();
			for (y = 0; y < chunkSize; y++)
				for (z = 0; z < chunkSize; z++)
					for (x = 0; x < chunkSize; x++) {
						if ((y != 2 || offsetY > -18) && (data.get(x,y,z) > 0)) {
							for (j = 0 ; j < jm; j++) {
								mesh.position.set(x+offsetX, y+offsetY, z+offsetZ);
								this.scenes[j].add(mesh.clone());
							}
							if (!(i=i-1))
								break;
						}
					}
		});
		this.loadedData = undefined;
		this.loadMeshes = undefined;
	}, reset: function() {
		this.counter = undefined;
	}, iterateLoading: function() {
		this.fillerIndex = {
			chunk: 0,
			px: 0,
			py: 0,
			pz: 0,
			count: 0
		}
		return (this.iterateLoading = (function() {
			if (this.fillerIndex.x >= chunkSize) {
				this.fillerIndex.x = 0;
				this.fillerIndex.z++;
			}
			if (this.fillerIndex.z >= chunkSize) {
				this.fillerIndex.z = 0;
				this.fillerIndex.y++;
			}
			if (this.fillerIndex.chunk >=his.chunks.length) {
				return;
			}
			if (this.fillerIndex.y >= chunkSize || this.fillerIndex.count === 0) {
				this.fillerIndex.x = 0;
				this.fillerIndex.y = 0;
				this.fillerIndex.z = 0;
				if (this.fillerIndex.chunk < this.chunks.length) {
					this.fillerIndex.chunk++;
					if (this.fillerIndex.chunk < this.chunks.length) {
						this.fillerIndex.count = this.chunks[this.fillerIndex.chunk];
					}
				}
			}

			for (var c = this.fillerIndex.chunk;c < this.chunks.length;c++)
				for (var y = this.fillerIndex.y;y < chunkSize;y++)
					for (var z = this.fillerIndex.z;z < chunkSize;z++)
						for (var x = this.fillerIndex.x;x < chunkSize;x++)
							if ((y != 2 || offsetY > -18) && (data.get(x,y,z) > 0)) {
								this.fillerIndex.x = x+1;
								this.fillerIndex.y = y;
								this.fillerIndez.z = z;
								this.fillerIndex.count--;
								return
							}
			this.fillerIndex.chunk = this.chunks.length;
		}).bind(this))();
	}, update: function(frames) {
		(this.finishedLoading === false) && (this.iterateLoading()) && (this.finishedLoading = true);
		this.look = this.camera.position;
		var len = this.scenes[0].children.length;
		var lx, ly, lz;
		lx = this.look.x;
		ly = this.look.y;
		lz = this.look.z;
		var elem, ex, ey, ez, i, j;
		for (i = 4 ; i < len; i++) {
			elem = this.scenes[0].children[i];
			if (elem instanceof THREE.Mesh) {
				ex = elem.position.x;
				ey = elem.position.y;
				ez = elem.position.z;
				//var d = this.clampSquaredSize((this.look.x-elem.position.x)*(this.look.x-elem.position.x)+(this.look.y-elem.position.y)*(this.look.y-elem.position.y)+(this.look.z-elem.position.z)*(this.look.z-elem.position.z));
				//var id = this.df.at(d)|0;
				var id = this.getIndex((lx-ex)*(lx-ex)+(ly-ey)*(ly-ey)+(lz-ez)*(lz-ez));
				//(id < 0) && (id = 0) || (id >= this.scenes.length) && (id = this.scenes.length-1);
				for (j = 0 ; j < this.scenes.length; j++) {
					this.scenes[j].children[i].visible = (id === j);
				}
			}
		}
	}
}