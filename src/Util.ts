import { IPoint } from "./Types";

export function getArrayIdx(x: number, y: number, width: number) {
	return y * width + x;
}

export function getXY(idx: number, width: number): IPoint {
	return {x: idx % width, y: Math.floor(idx / width)};
}

export function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}
