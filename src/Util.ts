export function getArrayIdx(x: number, y: number, width: number) {
	return y * width + x;
}

export function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}
