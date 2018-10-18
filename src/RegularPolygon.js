"use strict";

var RegularPolygon;

module.exports = RegularPolygon = (function() {
	function RegularPolygon(args) {
		if (typeof args === "undefined")
			throw new Error('RegularPolygon: No args provided');
		if (typeof args.canvas === 'undefined')
			throw new Error('RegularPolygon: No target canvas provided');
		if (typeof args.sides !== 'undefined' && args.sides < 3)
			throw new Error('RegularPolygon: Sides cannot be less than 3');

		this.sides = args.sides		|| 3,
		this.size = args.size		|| 10,
		this.canvas = args.canvas	|| {};

		this.draw = function(fillColor, strokeColor, strokeWidth, offset) {
			var ctx	= this.canvas.getContext('2d'),
			cx 	= this.canvas.width / 2 || 0,
			cy 	= this.canvas.height / 2 || 0;

			ctx.beginPath();
			ctx.moveTo(cx + (this.size + offset) * Math.cos(0), cy + this.size *  Math.sin(0));
			for (var i = 1; i <= this.sides; i++) {
				ctx.lineTo(cx + (this.size + offset) * Math.cos(i * 2 * Math.PI / this.sides), cy + (this.size + offset) * Math.sin(i * 2 * Math.PI / this.sides));
			};

			ctx.fillStyle = fillColor;
			ctx.strokeStyle = strokeColor;
			ctx.lineCap = "round";
			ctx.lineWidth = strokeWidth;
			ctx.fill();
			ctx.stroke();
		};

	};
	
	return RegularPolygon;
}());
