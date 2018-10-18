"use strict";

var Utils = {
	interpolateColor: function interpolateColor(minColor, maxColor, maxDepth, depth) {
		function d2h(d) {return d.toString(16);}
		function h2d(h) {return parseInt(h,16);}

		if (depth == 0)
			return minColor;
		if (depth >= maxDepth)
			return maxColor;

		var color = "#";
		for (var i = 1; i <= 6; i += 2) {
			var minVal = new Number(h2d(minColor.substr(i,2)));
			var maxVal = new Number(h2d(maxColor.substr(i,2)));
			var nVal = minVal + (maxVal - minVal) * (depth / maxDepth);
			var val = d2h(Math.floor(nVal));
			while(val.length < 2){
				val = "0"+val;
			}
			color += val;
		};
		return color;
	},
	getJSON: function getJSON(url, callback) {
		var xhr = typeof XMLHttpRequest != 'undefined'
		? new XMLHttpRequest()
		: new ActiveXObject('Microsoft.XMLHTTP');
		xhr.open('get', url, true);
		xhr.onreadystatechange = function() {
			var status, data;
			if (xhr.readyState == 4) {
				status = xhr.status;
				if (status == 200) {
					data = JSON.parse(xhr.responseText);
					callback && callback(data);
				} else
					console.error("Error: " + status);
			}
		};
		xhr.send();
	},
	arrayAvg: function arrayAvg(a) {
		var sum = 0;
		for (var i = a.length - 1; i >= 0; i--) {
			sum += a[i];
		};
		return sum / a.length;
	}
};

module.exports = Utils;
