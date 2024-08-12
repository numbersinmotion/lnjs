import { Vector } from './Vector';

export function Radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function Degrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function Median(items: number[]): number {
  const n = items.length;
  if (n === 0) {
    return 0;
  } else if (n % 2 === 1) {
    return items[Math.floor(n / 2)];
  } else {
    const a = items[n / 2 - 1];
    const b = items[n / 2];
    return (a + b) / 2;
  }
}

export function LatLngToXYZ(lat: number, lng: number, radius: number): Vector {
  [lat, lng] = [Radians(lat), Radians(lng)];
  return new Vector(
    radius * Math.cos(lat) * Math.cos(lng),
    radius * Math.cos(lat) * Math.sin(lng),
    radius * Math.sin(lat),
  );
}
