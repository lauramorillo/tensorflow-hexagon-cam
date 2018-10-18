"use strict";

var Rays;

module.exports = Rays = (function() {
	function Rays(args) {
		this.amount = typeof args.amount !== 'undefined' ? args.amount : 3;

		this.draw = function(canvas, colors) {
			var ctx = canvas.getContext('2d'),
			cx = canvas.width / 2,
			cy = canvas.height / 2,
			sz = canvas.width > canvas.height ? canvas.width : canvas.height;

			for (var i = 1; i <= this.amount; i++) {
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(cx + sz * Math.cos(i * 2 * Math.PI / this.amount), cy + sz * Math.sin(i * 2 * Math.PI / this.amount));
				ctx.lineTo(cx + sz * Math.cos((i+1)%this.amount * 2 * Math.PI / this.amount), cy + sz * Math.sin((i+1)%this.amount * 2 * Math.PI / this.amount));
				ctx.fillStyle = colors[i % 2];
				ctx.fill();
			}
		};
	};

	return Rays;
}());
