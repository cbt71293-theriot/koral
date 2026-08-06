export function hexToRgba(hex: string, alpha = 0.25) {
	const normalized = hex.replace('#', '');
	const value = Number.parseInt(normalized, 16);
	const r = (value >> 16) & 255;
	const g = (value >> 8) & 255;
	const b = value & 255;
	return `rgba(${r},${g},${b},${alpha})`;
}
