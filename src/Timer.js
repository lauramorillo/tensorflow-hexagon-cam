"use strict";

var Utils	= require('./Utils');

var Timer;

module.exports = Timer = (function() {
	function Timer(args) {
		this.currentLevel = 0;
		this.levelTimings = [10, 20, 30, 45, 60];
		this.ending = this.levelTimings[this.levelTimings.length - 1];
		this.levelTexts = ["POINT", "LINE", "TRIANGLE", "SQUARE", "PENTAGON", "HEXAGON"];
		this.element;
		this.timeText;
		this.label;
		this.level;
		this.levelText;
		this.levelProgressContainer;
		this.levelProgress;
		this._hexagon = args.self || null;
		this.eventList = [];

		this.notify = null;
		if (typeof args !== 'undefined' && typeof args.url !== 'undefined')
			this.notify = new Audio(args.url);

		this.load = function(data) {
			if (typeof data === 'undefined') {
				console.error("HexagonJS @ " + url + ": Can't get data.");
				return;
			}
			if (typeof data.levels === 'undefined') {
				console.error("HexagonJS @ " + url + ": \"levels\" object not found.");
				return;
			}
			if (typeof data.levels.timings === 'undefined' ||
				typeof data.levels.texts === 'undefined') {
				console.error("HexagonJS @ " + url + ": Missing \"timings\" or \"texts\" arrays.");
				return;
			}
			if (data.levels.timings.length != data.levels.texts.length - 1) {
				console.error("HexagonJS @ " + url + ": Level timings represent the end of each level. There should be one less timings than level names since the last level lasts forever.");
				return;
			}

			this.levelTimings = data.levels.timings;
			this.ending = this.levelTimings[this.levelTimings.length - 1];
			this.levelTexts = data.levels.texts;
			this.levelText.innerHTML = this.levelTexts[0];
		};

		this.init = function(colors) {
			this.element = document.createElement('div');
			this.element.classList.add('hjs');
			this.element.classList.add('timer');
			document.getElementsByTagName('body')[0].appendChild(this.element);

			this.timeText = document.createElement('span');
			this.element.appendChild(this.timeText);

			this.label = document.createElement('div');
			this.label.classList.add('hjs');
			this.label.classList.add('label');
			this.label.innerHTML = "TIME";
			this.element.appendChild(this.label);

			this.level = document.createElement('div');
			this.level.classList.add('hjs');
			this.level.classList.add('level');
			document.getElementsByTagName('body')[0].appendChild(this.level);

			this.levelText = document.createElement('span');
			this.levelText.innerHTML = this.levelTexts[0];
			this.level.appendChild(this.levelText);

			this.levelProgressContainer = document.createElement('div');
			this.level.appendChild(this.levelProgressContainer);

			this.levelProgress = document.createElement('div');
			this.levelProgress.style.backgroundColor = colors[1];
			this.levelProgressContainer.appendChild(this.levelProgress);
			return this;
		};

		this.update = function(_frameCount, color, _timeOffset) {
			if (typeof _timeOffset === 'undefined')
				_timeOffset = 0;
			var seconds = Math.floor((_frameCount + _timeOffset) / 60);
			var dec = Math.floor((_frameCount + _timeOffset) - (seconds * 60));
			dec = ('0' + dec).slice(-2);
			this.timeText.innerHTML = seconds + ':' + dec;

			for (var i = 0; i < this.eventList.length; i++) {
				if (this.eventList[i].time === _frameCount / 60)
					this.eventList[i].callback(this._hexagon);
			}

			var percent = (_frameCount / (this.levelTimings[this.currentLevel] * 60)) * 100;
			if (this.currentLevel > 0 && this.currentLevel < this.levelTexts.length - 1)
				percent = ((_frameCount - (this.levelTimings[this.currentLevel - 1] * 60)) / ((this.levelTimings[this.currentLevel] * 60) - (this.levelTimings[this.currentLevel - 1] * 60))) * 100;
			if (this.currentLevel == this.levelTexts.length - 1)
				percent = 100;
			percent %= 101;
			this.levelProgress.style.width = percent + '%';
			this.levelProgress.style.backgroundColor = color;

			for (var i = 0; i < this.levelTimings.length; i++) {
				if (seconds == this.levelTimings[i] && this.currentLevel == i) {
					if (i < this.levelTimings.length - 1 && this.notify != null)
						this.notify.play();
					this.currentLevel++;
					this.levelText.innerHTML = this.levelTexts[this.currentLevel];
				}
			};
		};

		this.flushEvents = function() {
			this.eventList = [];
		}

		this.registerEvent = function(timing, callback) {
			for (var i = 0; i < this.eventList.length; i++) {
				if (this.eventList[i].time == timing) {
					this.eventList[i] = {
						time: timing,
						callback: callback
					};
					return;
				}
			}
			this.eventList.push({
				time: timing,
				callback: callback
			});
		};
	};

	return Timer;
}());
