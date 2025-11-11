import { Transform } from 'class-transformer';

export function Trim() {
  return Transform(({ value }) => {
    if (Array.isArray(value)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value.map((v) => (typeof v === 'string' ? v.trim() : v));
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return typeof value === 'string' ? value.trim() : value;
  });
}
