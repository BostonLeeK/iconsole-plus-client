# 🚀 FTMS Quick Reference

## Essential Info

```typescript
// Service UUID
const FTMS_SERVICE = "1826";

// 21-byte message structure
interface FTMSData {
  speed: number; // (data[2] | data[3] << 8) / 100
  cadence: number; // data[4] / 2
  distance: number; // data[6] / 1000
  resistance: number; // data[9]
  power: number; // data[11]
  calories: number; // data[13]
  heartRate: number; // data[18]
  time: number; // data[19]
}
```

## Byte Map

| Pos | Field      | Formula               | Example                      |
| --- | ---------- | --------------------- | ---------------------------- |
| 2-3 | Speed      | `(b2 + b3*256) / 100` | `(60+5*256)/100 = 13.4 km/h` |
| 4   | Cadence    | `b4 / 2`              | `72/2 = 36 RPM`              |
| 6   | Distance   | `b6 / 1000`           | `33/1000 = 0.033 km`         |
| 9   | Resistance | `b9`                  | `1`                          |
| 11  | Power      | `b11`                 | `24 watts`                   |
| 13  | Calories   | `b13`                 | `2 kcal`                     |
| 18  | Heart Rate | `b18`                 | `86 bpm`                     |
| 19  | Time       | `b19`                 | `16 seconds`                 |

## One-liner Parser

```typescript
const parse = (d: Buffer) => ({
  speed: (d[2] | (d[3] << 8)) / 100,
  rpm: Math.round(d[4] / 2),
  distance: d[6] / 1000,
  resistance: d[9],
  power: d[11],
  calories: d[13],
  heartRate: d[18],
  time: d[19],
});
```

## Validation

```typescript
// Check message
if (data.length !== 21) throw new Error("Invalid length");
if (data[0] !== 0x74 || data[1] !== 0x0b) console.warn("Unexpected flags");
```

## Typical Values

- **Speed**: 0-40 km/h
- **Cadence**: 30-100 RPM
- **Power**: 10-300 watts
- **Heart Rate**: 60-180 BPM (0 if no sensor)
- **Resistance**: 1-20 levels
