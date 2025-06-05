# 🚴 iConsole+ FTMS Data Parsing Documentation

## Overview

This document describes the complete FTMS (Fitness Machine Service) data parsing implementation for iConsole+ exercise bikes. Through extensive reverse engineering and testing, we've successfully mapped all workout parameters from the 21-byte FTMS Indoor Bike Data messages.

## 📊 FTMS Protocol Details

### Connection Info

- **Service UUID**: `1826` (FTMS - Fitness Machine Service)
- **Device Pattern**: `iConsole+XXXX` (e.g., `iConsole+0051`)
- **Message Format**: 21-byte Indoor Bike Data packets
- **Update Frequency**: ~2-3 seconds

### Message Structure

```
Byte Position | Data Type    | Description              | Scaling Factor
--------------|--------------|--------------------------|---------------
0-1           | Flags        | FTMS Flags (0x74 0x0b)  | -
2-3           | Speed        | 16-bit Little Endian    | ÷ 100 (km/h)
4             | Cadence      | Raw RPM value            | ÷ 2 (realistic RPM)
5             | Reserved     | Usually 0                | -
6             | Distance     | Cumulative distance      | ÷ 1000 (km)
7             | Reserved     | Usually 0                | -
8             | Reserved     | Usually 0                | -
9             | Resistance   | Resistance level         | Raw value
10            | Reserved     | Usually 0                | -
11            | Power        | Instantaneous power      | Raw value (watts)
12            | Reserved     | Usually 0                | -
13            | Calories     | Total calories           | Raw value (kcal)
14-17         | Reserved     | Usually 0                | -
18            | Heart Rate   | BPM (when available)     | Raw value (bpm)
19            | Time         | Elapsed time             | Raw value (seconds)
20            | Reserved     | Usually 0                | -
```

## 🔧 Implementation

### TypeScript Implementation

```typescript
interface WorkoutData {
  time: number; // seconds
  speed: number; // km/h
  rpm: number; // revolutions per minute
  distance: number; // kilometers
  calories: number; // kcal
  heartRate: number; // bpm
  watt: number; // watts
  resistance: number; // resistance level
}

function parseFTMSData(data: Buffer): WorkoutData {
  // Validate message length
  if (data.length !== 21) {
    throw new Error("Invalid FTMS message length");
  }

  // Extract time from position 19
  const timeInSeconds = data[19] || 0;

  // Extract speed from positions 2-3 (16-bit little endian)
  const speedRaw = data[2] | (data[3] << 8);

  return {
    time: timeInSeconds,
    speed: speedRaw ? speedRaw / 100 : 0, // Convert to km/h
    rpm: data[4] ? Math.round(data[4] / 2) : 0, // Realistic cadence
    distance: data[6] ? data[6] / 1000 : 0, // Convert to km
    calories: data[13] || 0, // Direct value
    heartRate: data[18] || 0, // Direct value (when available)
    watt: data[11] || 0, // Direct value
    resistance: data[9] || 0, // Direct value
  };
}
```

## 📈 Example Data Flow

### Typical Workout Session Data

```
Time: 15s  | Speed: 13.0 km/h | RPM: 35  | Distance: 0.033 km | Calories: 2 kcal | Power: 24W
Time: 16s  | Speed: 13.4 km/h | RPM: 36  | Distance: 0.037 km | Calories: 2 kcal | Power: 24W
Time: 17s  | Speed: 13.4 km/h | RPM: 36  | Distance: 0.041 km | Calories: 2 kcal | Power: 24W
```

### Raw Data Example

```
Hex: 0x74 0x0b 0x3c 0x05 0x48 0x00 0x21 0x00 0x00 0x01 0x00 0x18 0x00 0x02 0x00 0x00 0x00 0x00 0x56 0x10 0x00
Dec: 116  11   60   5    72   0    33   0    0    1    0    24   0    2    0    0    0    0    86   16   0

Parsed:
- Speed: (60 + 5*256) / 100 = 13.4 km/h
- Cadence: 72 / 2 = 36 RPM
- Distance: 33 / 1000 = 0.033 km
- Resistance: 1
- Power: 24 watts
- Calories: 2 kcal
- Heart Rate: 86 bpm (when sensor connected)
- Time: 16 seconds
```

## 🔍 Key Discoveries

### Cadence Scaling

- **Raw values**: 70-140 RPM (unrealistic for casual cycling)
- **Solution**: Divide by 2 for realistic values (35-70 RPM)
- **Validation**: Matches typical exercise bike cadence ranges

### Distance Accumulation

- **Format**: Cumulative distance in meters
- **Scaling**: Divide by 1000 for kilometers
- **Growth**: Increases linearly with speed and time

### Heart Rate Availability

- **Position 18**: Shows BPM when heart rate sensor is connected
- **Fallback**: Shows 0 when no sensor detected
- **Range**: 60-180 BPM when active

### Power Correlation

- **Position 11**: Real-time power output in watts
- **Range**: 10-100+ watts depending on intensity
- **Correlation**: Increases with speed and resistance

## ⚠️ Important Notes

### Message Validation

1. **Length Check**: Always verify 21-byte message length
2. **Flags Validation**: Typical flags are `0x74 0x0b`
3. **Zero Handling**: Many positions contain 0 when not active

### Scaling Factors Summary

- **Speed**: Raw value ÷ 100 = km/h
- **Cadence**: Raw value ÷ 2 = realistic RPM
- **Distance**: Raw value ÷ 1000 = kilometers
- **Others**: Direct raw values (power, calories, resistance, heart rate, time)

### Connection Requirements

- Use **FTMS service UUID 1826** (not the proprietary fff0 service)
- Enable notifications on the indoor bike data characteristic
- Handle both 3-byte response messages and 21-byte data messages

## 🐛 Troubleshooting

### Common Issues

1. **No Data Received**

   - Verify connection to FTMS service (UUID 1826)
   - Check characteristic notifications are enabled
   - Ensure device is actively pedaling

2. **Unrealistic Values**

   - Check scaling factors are applied correctly
   - Verify 16-bit little endian parsing for speed
   - Confirm cadence division by 2

3. **Missing Heart Rate**
   - Heart rate requires separate sensor connection
   - Position 18 will show 0 without sensor
   - Consider external heart rate monitor integration

### Debug Logging

```typescript
console.log(
  "Raw FTMS data:",
  Array.from(data)
    .map((b) => `0x${b.toString(16)}`)
    .join(" ")
);
console.log("Parsed workout data:", workoutData);
```

## 📚 Related Documentation

- [FTMS Specification](https://www.bluetooth.com/specifications/specs/fitness-machine-service-1-0/)
- [Bluetooth LE GATT Services](https://www.bluetooth.com/specifications/assigned-numbers/)
- [iConsole+ Device Manual](link-to-manual)

## 🤝 Contributing

This parsing implementation was developed through extensive testing and reverse engineering. If you discover additional parameters or improvements, please contribute back to help other developers.

---

**Last Updated**: December 2024  
**Tested Device**: iConsole+0051  
**Protocol Version**: FTMS 1.0

## 🎛️ Resistance Control

### Dual Protocol Support

iConsole+ bikes support both proprietary and FTMS standard resistance control:

#### Proprietary Protocol (Primary)

- **Service UUID**: `fff0` (Proprietary control service)
- **Characteristic**: Write characteristic for commands
- **Command Format**: `[0xf0, 0xa6, 0x01, 0x01, level+1, checksum]`
- **Resistance Range**: 1-20 levels
- **Checksum**: XOR of all bytes except checksum

```typescript
function sendProprietaryResistance(level: number): void {
  if (level < 1 || level > 20) {
    throw new Error("Resistance level must be between 1 and 20");
  }

  const command = [0xf0, 0xa6, 0x01, 0x01, level + 1];
  const checksum = command.reduce((xor, byte) => xor ^ byte, 0);
  const fullCommand = [...command, checksum];

  // Send via fff0 service write characteristic
}
```

#### FTMS Standard Protocol (Alternative)

- **Service UUID**: `1826` (FTMS service)
- **Characteristic**: `2ad9` (FTMS Control Point)
- **Command Format**: `[0x04, resistanceValue & 0xff, (resistanceValue >> 8) & 0xff]`
- **Resistance Scaling**: level \* 10 (0.1% resolution)
- **Prerequisite**: Must send Request Control command first

```typescript
function sendFTMSResistance(level: number): void {
  // First, request control
  const requestControl = [0x00];
  // Send to control point and wait for indication

  // Then send resistance command
  const resistanceValue = level * 10; // 0.1% resolution
  const command = [
    0x04, // Set Target Resistance Level opcode
    resistanceValue & 0xff,
    (resistanceValue >> 8) & 0xff,
  ];

  // Send via 1826 service control point characteristic
}
```

### Implementation Strategy

Use dual-service architecture for optimal compatibility:

```typescript
class BikeController {
  private dataService: BluetoothRemoteGATTService; // 1826 for data
  private controlService: BluetoothRemoteGATTService; // fff0 for control

  async setResistance(level: number): Promise<void> {
    try {
      // Try proprietary protocol first (more reliable)
      await this.sendProprietaryCommand(level);
    } catch (error) {
      // Fallback to FTMS standard
      await this.sendFTMSCommand(level);
    }
  }
}
```

### Service Separation

**Critical**: Maintain strict separation between data and control services:

- **Data Reception**: Use FTMS service (1826) characteristic 2ad2
- **Resistance Control**: Use proprietary service (fff0)
- **Never mix**: Avoid sending commands through data service
