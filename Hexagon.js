"use strict";

var Utils 			     = require('./src/Utils');
var RegularPolygon 	 = require('./src/RegularPolygon');
var Rays 			       = require('./src/Rays');
var Wall 			       = require('./src/Wall');
var Cursor 			     = require('./src/Cursor');
var Timer 			     = require('./src/Timer');
var Kiloton			     = require('./src/Kiloton');

var Hexagon;

module.exports = Hexagon = (function() {
	function Hexagon(args) {
		if (typeof args === 'undefined')
		throw new Error("No args provided");
		if (typeof args.canvas === 'undefined')
		throw new Error("No canvas provided");

		/* JS args */
		this.args = args;
		this.canvas = args.canvas;
		this.ctx = this.canvas.getContext('2d');

		/* JSON config */
		this.angleSpeed = 1.2;
		this.backgroundColors = [["#000000", "#000000"], ["#000000", "#000000"]];
		var _backgroundColors = this.backgroundColors;
		this.wallColors = ["#FFFFFF", "#FFFFFF"];
		var _wallColors = this.wallColors;
		this.wallSpeed = 5;
		this.rotationChance = 5;
		this.rotationFrequency = 5;

		/* Other members */
		this.walls = [null, null, null, null];
		this.currentWallColor = this.wallColors[0];
		this.currentBGC = this.backgroundColors[0];
		this.rays = new Rays({
			amount: 6
		});
		this.hexagon = new RegularPolygon({
			canvas: this.canvas,
			sides: 6,
			size: 1000
		});
		this.cursor = new Cursor({
			canvas: this.canvas,
			size: 7,
			color: this.wallColors[0],
			radius: 75,
			speed: 5
		});
		this.minDist = Math.sqrt(
			Math.pow(this.canvas.width, 2) +
			Math.pow(this.canvas.height, 2)
		) / 2;
		this.timer = new Timer({
			self: this,
			url: 'audio/rankup.ogg'
		}).init(this.wallColors);

		/* Audio */
		this.audio_bgm = null;
		this.audio_start = new Audio('audio/start.ogg');
		this.audio_die = new Audio('audio/die.ogg');
		var _audio_ctx_ = new (window.AudioContext || window.webkitAudioContext);
		var _analyser_  = _audio_ctx_.createAnalyser();
		var _audio_src_ = null;
		var _audio_data_ = [];
		var _offset_ = 0;
		var _chunk_size_ = 0;

		/* Other vars */
		var _animation_id_,
		_frameCount = 0,
		_frameCount_levelUp = 0,
		_isDead = false,
		COLOR_DARK = 0, COLOR_LIGHT = 1;
		var _start = 0;

		for (var i = 0; i < this.walls.length; i++) {
			this.walls[i] = new Wall({
				distance: this.minDist + ((this.minDist / 3) * (i + 1))
			});
			this.walls[i].generatePattern();
		};

		this.getAudioCtx = function() {return _audio_ctx_;}
		this.setAudioCtx = function(ctx) {_audio_ctx_ = ctx;}
		this.getAnalyser = function() {return _analyser_;}
		this.setAnalyser = function(a) {_analyser_ = a;}
		this.getAudioSrc = function() {return _audio_src_;}
		this.setAudioSrc = function(src) {_audio_src_ = src;}
		this.getAudioData = function() {return _audio_data_;}
		this.setAudioData = function(data) {_audio_data_ = data;}
		this.getChunkSize = function() {return _chunk_size_;}
		this.setChunkSize = function(size) {_chunk_size_ = size;}
		this.getFrameCount = function() {return _frameCount;}
		this.setFrameCount = function(c) {_frameCount = c;}
		this.getFrameCountLvUp = function() {return _frameCount_levelUp;}
		this.setFrameCountLvUp = function(c) {_frameCount_levelUp = c;}

		if (typeof this.args.config === 'string') {
			Kiloton.loadConfig(this.args.config, this, function() {
				if (this.audio_bgm)
					this.audio_bgm.play();
			}.bind(this));
		}

		this.init = function(callback) {
			if (typeof this.args.config === 'string') {
				Kiloton.loadConfig(this.args.config, this, function() {
					if (Math.floor(Date.now()) % 2 == 0)
						this.angleSpeed *= -1;
					this.play();
				}.bind(this));
			}	else {
				this.angleSpeed = 1.2;
				this.wallSpeed = 5;
				if (Math.floor(Date.now()) % 2 == 0)
					this.angleSpeed *= -1;
				this.play();
			}
			this.cursor.size = 7;
			this.timer.currentLevel = 0;
			this.timer.levelText.innerHTML = this.timer.levelTexts[0];
			_frameCount = 0;
			return this;
		};

		this.play = function() {
			var _this = this;
			_isDead = false;
			document.onkeydown = function(event) {
				var key = event.which || event.keyCode;
				if (key == 27)
				_isDead = true;
				_this.moveCursor(event);
			};
			document.onkeyup = function(event) {
				_this.stopCursor(event);
			}
			// this.audio_start.play();
			// setTimeout(function() {
			// 	if (this.audio_bgm && this.audio_bgm.paused)
			// 		this.audio_bgm.play();
			// }.bind(this), 200);
			this.canvas.classList.add('playing');
			_animation_id_ = requestAnimationFrame(_update.bind(this))
		};

		this.moveCursor = function(event) {
			var key = event.which || event.keyCode;
			if (key == 39)
			this.cursor.dir = 1;
			else if (key == 37)
			this.cursor.dir = -1;
		}

		this.stopCursor = function(event) {
			var key = event.which || event.keyCode;
			if ((key == 39 && this.cursor.dir == 1) || (key == 37 && this.cursor.dir == -1) || key === 0)
			this.cursor.dir = 0;
		}

		this.die = function() {
			setTimeout(function() {
				if (this.audio_bgm) {
					this.audio_bgm.pause();
					this.audio_bgm = null;
				}
			}.bind(this), 200);
			this.audio_die.play();
			this.hexagon.draw(this.canvas, this.currentBGC[COLOR_DARK], this.currentWallColor, 7);
			this.cursor.draw();
			this.cursor.dir = 0;
			document.onkeydown = null;
			document.onkeyup = null;
			_frameCount = 0;
			this.canvas.classList.remove('playing');
			_animation_id_ = requestAnimationFrame(_dead.bind(this));
		};

		this.getInterCoef = function(frame) {
			return (frame % 120) <= 60 ? (frame % 120) : 60 - ((frame % 120) - 60);
		};

		this.fadeInterpolate = function() {
			this.currentWallColor = Utils.interpolateColor(
				this.currentWallColor,
				this.wallColors[0],
				120,
				(_frameCount + _frameCount_levelUp) - _start
			);
			this.currentBGC = [
				Utils.interpolateColor(
					this.currentBGC[COLOR_DARK],
					this.backgroundColors[0][COLOR_DARK],
					120,
					(_frameCount + _frameCount_levelUp) - _start
				),
				Utils.interpolateColor(
					this.currentBGC[COLOR_LIGHT],
					this.backgroundColors[0][COLOR_LIGHT],
					120,
					(_frameCount + _frameCount_levelUp) - _start
				)
			];
			if ((_frameCount + _frameCount_levelUp) - _start == 120) {
				_backgroundColors = this.backgroundColors;
				_wallColors = this.wallColors;
			}
		};

		this.colorsHasChanged = function() {
			if (this.backgroundColors != _backgroundColors || this.wallColors != _wallColors)
				return true;
			return false;
		};

		this.interpolate = function() {
			var _fc_acc = this.getInterCoef(_frameCount + _frameCount_levelUp);
			if (this.colorsHasChanged()) {
				_start = _start < (_frameCount + _frameCount_levelUp) - 120 ? (_frameCount + _frameCount_levelUp) : _start;
				this.fadeInterpolate();
			} else {
				this.currentWallColor = Utils.interpolateColor(
					this.wallColors[0],
					this.wallColors[1],
					60,
					_fc_acc
				);
				this.currentBGC = [
					Utils.interpolateColor(
						this.backgroundColors[0][COLOR_DARK],
						this.backgroundColors[1][COLOR_DARK],
						60,
						_fc_acc
					),
					Utils.interpolateColor(
						this.backgroundColors[0][COLOR_LIGHT],
						this.backgroundColors[1][COLOR_LIGHT],
						60,
						_fc_acc
					)
				];
			}
		};

		this.restart = function() {
			for (var i = 0; i < this.walls.length; i++) {
				this.walls[i] = new Wall({
					distance: this.minDist + ((this.minDist / 3) * (i + 1))
				});
				this.walls[i].generatePattern();
			};
			window.onkeydown = null;
			cancelAnimationFrame(_animation_id_);
			this.init(this.play);
		}

		var _update = function() {
			if (_frameCount >= (this.timer.ending * 60) && _frameCount <= ((this.timer.ending + .3) * 60)) {
				if (_frameCount == (this.timer.ending * 60) && typeof this.args.ending === 'string') {
					this.audio_bgm.pause();
					this.audio_bgm = null;
					Kiloton.loadConfig(this.args.ending, this, function() {
						this.setFrameCountLvUp(this.getFrameCount());
						this.setFrameCount(0);
						this.audio_bgm.play();
					}.bind(this));
					for (var i = 0; i < this.walls.length; i++) {
						this.walls[i] = new Wall({
							distance: this.minDist + ((this.minDist / 3) * (i + 8))
						});
						this.walls[i].generatePattern();
					};
					this.audio_start.play();
				}
				this.ctx.fillStyle = "#FFFFFF";
				this.ctx.setTransform(1, 0, 0, 1, 0, 0);
				this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
				_frameCount++;
				_animation_id_ = requestAnimationFrame(_update.bind(this));
				return;
			}

			this.interpolate();

			if (((_frameCount + _frameCount_levelUp) % (this.rotationFrequency * 60) == 0) && (Math.floor(Math.random() * 100)) < this.rotationChance)
			this.angleSpeed *= -1;

			if (this.audio_bgm) {
				_analyser_.getByteFrequencyData(_audio_data_);
				var __TEMP__ = _audio_data_.slice(_chunk_size_, _chunk_size_ * 2);
				_offset_ = (Utils.arrayAvg(__TEMP__) / 2);
			}

			this.ctx.fillStyle = this.currentBGC[COLOR_DARK];
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			this.ctx.rotate(this.angleSpeed * Math.PI / 180);
			this.ctx.translate(- this.canvas.width / 2, - this.canvas.height / 2);
			this.rays.draw(this.canvas, [this.currentBGC[COLOR_DARK], this.currentBGC[COLOR_LIGHT]]);
			for (var i = 0; i < this.walls.length; i++) {
				this.walls[i].draw(this.canvas, this.currentWallColor, _offset_);
				this.walls[i].distance -= this.wallSpeed;
				if (this.walls[i].distance <= 0) {
					this.walls[i].distance = this.minDist + (this.minDist / 3);
					this.walls[i].generatePattern();
				}
				if (this.walls[i].checkCollision(this.cursor.getCoord(), this.canvas))
				_isDead = true;
			}
			this.cursor.color = this.currentWallColor;
			this.cursor.draw(_offset_);
			if (this.cursor.radius > 75)
			this.cursor.radius -= 25;
			if (this.cursor.size > 7)
			this.cursor.size -= 1;
			this.hexagon.draw(this.currentBGC[COLOR_DARK], this.currentWallColor, 7, _offset_);
			if (this.hexagon.size > 50)
			this.hexagon.size -= 25;
			this.timer.update(_frameCount, this.currentWallColor, _frameCount_levelUp);

			if (_isDead)
			return this.die();

			_frameCount++;
			_animation_id_ = requestAnimationFrame(_update.bind(this));
		};

		var _dead = function() {
			if (this.angleSpeed > .4) {
				this.angleSpeed -= .01;
				if (this.angleSpeed < .4)
				this.angleSpeed = .4;
			}
			else if (this.angleSpeed < -.4) {
				this.angleSpeed += .01;
				if (this.angleSpeed > -.4)
				this.angleSpeed = -.4;
			}
			if (this.wallSpeed > 0)
			this.wallSpeed = 0;

			if (_frameCount == (.5 * 60))
				this.wallSpeed = -50;
			if (_frameCount >= (.8 * 60) && this.hexagon.size < 250) {
				this.hexagon.size += 50;
				this.cursor.radius += 50;
				this.cursor.size += 1;
			}
			if (this.hexagon.size >= 250) {
				var _this = this;
				cancelAnimationFrame(_animation_id_);
				window.onkeydown = function(event) {
					var key = event.which || event.keyCode;
					if (key == 32 || key == 38) {
						// for (var i = 0; i < _this.walls.length; i++) {
						// 	_this.walls[i] = new Wall({
						// 		distance: _this.minDist + ((_this.minDist / 3) * (i + 1))
						// 	});
						// 	_this.walls[i].generatePattern();
						// };
						// window.onkeydown = null;
						// cancelAnimationFrame(_animation_id_);
						// _this.init(_this.play);
						_this.restart();
						return;
					};
				};
			}

			this.ctx.fillStyle = this.currentBGC[COLOR_DARK];
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			this.ctx.rotate(this.angleSpeed * Math.PI / 180);
			this.ctx.translate(- this.canvas.width / 2, - this.canvas.height / 2);
			this.rays.draw(this.canvas, [this.currentBGC[COLOR_DARK], this.currentBGC[COLOR_LIGHT]]);
			for (var i = 0; i < this.walls.length; i++) {
				this.walls[i].draw(this.canvas, this.currentWallColor, _offset_);
				this.walls[i].distance -= this.wallSpeed;
				if (this.walls[i].distance <= 0) {
					this.walls[i].distance = this.minDist + (this.minDist / 3);
					this.walls[i].generatePattern();
				}
			}
			this.cursor.color = (_frameCount + _frameCount_levelUp) % 6 < 3 ? this.wallColors[0] : this.wallColors[1];
			this.cursor.draw(_offset_);

			if (this.angleSpeed == 0 && _frameCount % (1 * 60) == 0) {
				_offset_ += 15;
			}

			if (_frameCount > (.6 * 60)) {
				if (_offset_ < 0) {
					_offset_ += 1;
					if (_offset_ > 0)
					_offset_ = 0;
				} else if (_offset_ > 0) {
					_offset_ -= 1;
					if (_offset_ < 0)
					_offset_ = 0;
				}
			}

			this.hexagon.draw(this.currentBGC[COLOR_DARK], this.currentWallColor, 7, _offset_);

			_frameCount++;
			_animation_id_ = requestAnimationFrame(_dead.bind(this));
		};

		return this;
	};

	return Hexagon;
}());