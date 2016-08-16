export function getArrayIdx(x, y, width) {
	return y * width + x;
}

export function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj));
}