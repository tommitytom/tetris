"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getArrayIdx = getArrayIdx;
exports.deepClone = deepClone;
function getArrayIdx(x, y, width) {
	return y * width + x;
}

function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj));
}