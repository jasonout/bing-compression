
const SAFE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

// https://stackoverflow.com/questions/19213148/javascript-convert-a-52-bit-integer-to-20-bit-and-32-bit-integers#19274574
function int52_30_get_lo(i) {
	return i & 0x3fffffff;
}

function int52_30_get_hi(i) {
	return (i - (i & 0x3fffffff)) / 0x40000000;
}

function int52_30_new_safe(hi, lo) {
	return (hi & 0x3fffff) * 0x40000000 + (lo & 0x3fffffff);
}

// http://msdn.microsoft.com/en-us/library/jj158958.aspx
function compress(points) {
	let latitude = 0;
	let longitude = 0;

	let string = [];

	points.forEach(point => {
		// Fallback to .lat or .lng properties
		const newLatitude = Math.round((point[0] || point.lat) * 100000);
		const newLongitude = Math.round((point[1] || point.lng) * 100000);

		let dy = newLatitude - latitude;
		let dx = newLongitude - longitude;

		latitude = newLatitude;
		longitude = newLongitude;

		dy = (dy << 1) ^ (dy >> 31);
		dx = (dx << 1) ^ (dx >> 31);

		let index = ((dy + dx) * (dy + dx + 1) / 2) + dy;

		while (index > 0) {
			let rem = index & 31;
			index = (index - rem) / 32;

			if (index > 0) {
				rem += 32;
			}

			string.push(SAFE_CHARACTERS.charAt(rem));
		}
	});

	return string.join('');
}


// Ported from http://msdn.microsoft.com/en-us/library/dn306801.aspx
function decompress(data) {
	var points = [];
	var index = 0;
	var xsum = 0;
	var ysum = 0;

	var shift = Math.pow(2, 32);

	while (index < data.length) {
		var n = 0; // accumulator
		var n1 = 0;
		var n2 = 0;
		var ns = 0;
		var k = 0; // bit count

		while (true) {
			if (index >= data.length) {
				return false;
			}

			var b = SAFE_CHARACTERS.indexOf(data[index++]);

			if (b == -1) {
				return false;
			}

			var t = (b & 31) * Math.pow(2, k); // Janky bitwise shift
			// 30 bit OR
			n1 = int52_30_get_hi(n) | int52_30_get_hi(t);
			n2 = int52_30_get_lo(n) | int52_30_get_lo(t);
			n = int52_30_new_safe(n1, n2);

			k += 5;

			if (b < 32) {
				break;
			}
		}

		var diagonal = parseInt((Math.sqrt(n * 8 + 5) - 1) / 2, 10);
		n -= diagonal * (diagonal + 1) / 2;

		var ny = n;
		var nx = diagonal - ny;

		nx = (nx >> 1) ^ -(nx & 1);
		ny = (ny >> 1) ^ -(ny & 1);

		xsum += nx;
		ysum += ny;

		points.push(
			[ysum * 0.00001, xsum * 0.00001]
		);
	}

	return points;
};

module.exports = {
	compress,
	decompress
};
