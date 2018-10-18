"use strict";

var Utils = require('./Utils');

var Kiloton = {
	loadConfig: function loadConfig(url, _this, callback) {
		var data = Utils.getJSON(url, function(data) {

			if (typeof data === 'undefined') {
				console.error("HexagonJS @ " + url + ": Can't get data.");
				return;
			}

			if (typeof data.game === 'undefined') {
				console.error("HexagonJS @ " + url + ": \"game\" object not found.");
				return;
			}

			if (typeof data.game.music !== 'undefined') {
				if (!_this.audio_bgm && typeof data.game.music === 'string') {
					_this.audio_bgm = new Audio(data.game.music);
					_this.audio_bgm.volume = 0.6;
					_this.setAudioSrc(_this.getAudioCtx().createMediaElementSource(_this.audio_bgm));
					_this.getAudioSrc().connect(_this.getAnalyser());
					_this.getAudioSrc().connect(_this.getAudioCtx().destination);
					_this.setAudioData(new Uint8Array(_this.getAnalyser().frequencyBinCount));
					_this.setChunkSize(~~(_this.getAudioData().length / 3));
				} else
					console.error("HexagonJS @ " + url + ": \"music\" must be a string.");
			}

			if (typeof data.game.musicStart === 'number') {
				if (data.game.musicStart >= 0) {
					_this.audio_bgm.currentTime = data.game.musicStart;
				} else {
					console.error("HexagonJS @ " + url + ": \"musicStart\" must be positive.");
				}
			}

			if (typeof data.game.angleSpeed !== 'undefined') {
				if (typeof data.game.angleSpeed === 'number')
					_this.angleSpeed = data.game.angleSpeed;
				else
					console.error("HexagonJS @ " + url + ": \"angleSpeed\" must be a number.");
			}

			if (typeof data.game.wallSpeed !== 'undefined') {
				if (typeof data.game.wallSpeed === 'number') {
					if (data.game.wallSpeed >= 0)
						_this.wallSpeed = data.game.wallSpeed;
					else
						console.error("HexagonJS @ " + url + ": \"wallSpeed\" must be a positive number.");
				} else
				console.error("HexagonJS @ " + url + ": \"wallSpeed\" must be a number.");
			}

			if (typeof data.game.cursorSpeed !== 'undefined') {
				if (typeof data.game.cursorSpeed === 'number') {
					if (data.game.cursorSpeed > 0)
						_this.cursor.speed = data.game.cursorSpeed;
					else
						console.error("HexagonJS @ " + url + ": \"cursorSpeed\" must be a not null positive number.");
				} else
				console.error("HexagonJS @ " + url + ": \"cursorSpeed\" must be a number.");
			}

			if (typeof data.game.rotationChance !== 'undefined') {
				if (typeof data.game.rotationChance === 'number') {
					if (data.game.rotationChance >= 0)
						_this.rotationChance = data.game.rotationChance;
					else
						console.error("HexagonJS @ " + url + ": \"rotationChance\" must be a positive number.");
				} else
				console.error("HexagonJS @ " + url + ": \"rotationChance\" must be a number.");
			}

			if (typeof data.game.rotationFrequency !== 'undefined') {
				if (typeof data.game.rotationFrequency === 'number') {
					if (data.game.rotationFrequency > 0)
						_this.rotationFrequency = data.game.rotationFrequency;
					else
						console.error("HexagonJS @ " + url + ": \"rotationFrequency\" must be a not null positive number.");
				} else
				console.error("HexagonJS @ " + url + ": \"rotationFrequency\" must be a number.");
			}

			if (typeof data.game.backgroundColors !== 'undefined') {
				if (typeof data.game.backgroundColors === 'object') {
					if (data.game.backgroundColors.length == 2) {
						if (typeof data.game.backgroundColors[0] === 'object' &&
							typeof data.game.backgroundColors[1] === 'object') {
							if (data.game.backgroundColors[0].length != 2 ||
								data.game.backgroundColors[1].length != 2 ||
								typeof data.game.backgroundColors[0][0] !== 'string' ||
								typeof data.game.backgroundColors[0][1] !== 'string' ||
								typeof data.game.backgroundColors[1][0] !== 'string' ||
								typeof data.game.backgroundColors[1][1] !== 'string')
								console.error("HexagonJS @ " + url + ": \"backgroundColors\" must contain two arrays containing two strings.");
							else
								_this.backgroundColors = data.game.backgroundColors;
						} else
						console.error("HexagonJS @ " + url + ": \"backgroundColors\" must contain arrays of strings.");
					} else
					console.error("HexagonJS @ " + url + ": \"backgroundColors\" must contain two values.");
				} else
				console.error("HexagonJS @ " + url + ": \"backgroundColors\" must be an array of arrays of strings.");
			}

			if (typeof data.game.wallColors !== 'undefined') {
				if (typeof data.game.wallColors === 'object') {
					if (data.game.wallColors.length == 2) {
						if (typeof data.game.wallColors[0] === 'string' &&
							typeof data.game.wallColors[1] === 'string')
								_this.wallColors = data.game.wallColors;
						else
							console.error("HexagonJS @ " + url + ": \"wallColors\" must contain strings.");
					} else
					console.error("HexagonJS @ " + url + ": \"wallColors\" must contain two values.");
				} else
				console.error("HexagonJS @ " + url + ": \"wallColors\" must be an array of strings.");
			}

			if (typeof data.game.patterns === 'object') {
				for (var i = 0; i < data.game.patterns.length; i++) {
					if (typeof data.game.patterns[i] != 'object' || data.game.patterns[i].length != 6)
						console.error("HexagonJS @ " + url + ": \"patterns\" must be an array of arrays of 6 booleans.");
				}

				for (var i = _this.walls.length - 1; i >= 0; i--) {
					_this.walls[i].setPatterns(data.game.patterns);
					_this.walls[i].generatePattern();
				};
			}

			if (typeof data.events === 'object') {
				_this.timer.flushEvents();
				for (var i = 0; i < data.events.length; i++) {
					var body = 'try{';
					for (var evact in data.events[i]) {
						if (data.events[i].hasOwnProperty(evact) && evact !== 'time') {
							if (typeof data.events[i][evact] === 'object') {
								if (evact === 'backgroundColors') {
									var tmp = '[["';
									tmp += data.events[i][evact][0].join('","');
									tmp += '"],["';
									tmp += data.events[i][evact][1].join('","');
									tmp += '"]]';
									body += 'target["' + evact + '"]=' + tmp + ';';
								} else if (evact === 'patterns') {
									body += 'for(var i=0;i<target.walls.length;i++){'
									body += 'target.walls[i].setPatterns('
									body += '[[' + data.events[i][evact].join('],[') + ']]);};'
								} else {
									var tmp = '["' + data.events[i][evact].join('","') + '"]';
									body += 'target["' + evact + '"]=' + tmp + ';';
								}
							} else
								body += 'target["' + evact + '"]=' + data.events[i][evact] + ';';
						}
					};
					body += '}catch(e){console.warn("Timed event '+data.events[i].time+' : " + e);}';
					var eventCallback = Function('target', body);
					_this.timer.registerEvent(data.events[i].time, eventCallback);
				}
			};

			if (typeof data.levels !== 'undefined')
				_this.timer.load(data);

			if (typeof callback === 'function')
				callback();
		});
	}
};

module.exports = Kiloton;
