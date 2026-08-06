import type { TakeoffEngineOptions } from './engine';

export function pxToUnit(px: number, options: TakeoffEngineOptions): number {
	const unit = options.calibration?.unit ?? 'px';
	if (unit === 'px') return px;
	const ppm = options.calibration?.pixelsPerMm ?? 0;
	if (ppm <= 0) return px;
	const mm = px / ppm;
	switch (unit) {
		case 'cm':
			return mm / 10;
		case 'in':
			return mm / 25.4;
		case 'ft':
			return mm / 25.4 / 12;
		default:
			return mm;
	}
}

export function formatNumber(value: number, decimals = 2) {
	return Number(value).toFixed(decimals);
}
