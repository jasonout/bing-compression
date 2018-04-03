
const {
	compress,
	decompress
} = require('../index');

const expected = 'vx1vilihnM6hR7mEl2Q';
const points = [
	[35.894309002906084,-110.72522000409663],
	[35.893930979073048,-110.72577999904752],
	[35.893744984641671,-110.72606003843248],
	[35.893366960808635,-110.72661500424147]
];

console.log(expected);
console.log(compress(points));

console.log(decompress(compress(points)));

console.log(decompress(expected));
