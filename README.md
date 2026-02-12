# @verona/interfaces

TypeScript library for Verona Player and Editor interfaces.

## Installation als lokales npm-package

Solange die Lib noch nicht auf npm veröffentlicht, muss diese lokal in den jeweiligen Player eingebunden werden:

**In der Library**

```bash
npm run build
```

**Im Player**

Zuvor in `package.json` Pfad zur Lib angegeben.
Hier ein Beispiel:

 `"@verona-interfaces/player": "file:../verona-interfaces-player-lib"`


```bash
npm install @verona-interfaces/player
```

## Quick Start

### Player Implementation

```typescript
import { VeronaPlayer, VeronaOperations, encodeBase64, createLogEntry } from '@verona/interfaces';

// Create player instance
const player = new VeronaPlayer({
  debug: true,
  allowedOrigin: '*'
});

// Register event handlers
player.onStartCommand((data) => {
  console.log('Session started:', data.sessionId);
  // Initialize your player
});

player.onPageNavigationCommand((data) => {
  console.log('Navigate to:', data.target);
  // Handle navigation
});

// Send ready notification
player.sendReady({
  metadata: JSON.stringify({
    '@context': 'https://w3id.org/iqb/metadata',
    type: 'player',
    version: '1.0.0'
  })
});

// Send state updates
player.sendStateChanged(
  {
    dataParts: { response: encodeBase64({ answer: 'A' }) },
    presentationProgress: 'complete',
    responseProgress: 'some'
  },
  {
    currentPage: 'page-1'
  },
  [createLogEntry('USER_ACTION', { action: 'submit' })]
);
```

[**Hier**](./Example-Speedtestplayer.md) ist auch eine beispielhafte Einbindung dieser Lib in den Speedtestplayer in `app.components.ts` zu sehen. Diese Einbindung wurde im Testcenter getestet. Send `vopReadyNotification`, receive `vopStartCommand` hat funktioniert, die Aufgaben wurden wiedergegeben. Die Navigation zur nächsten Speedtestaufgabe hat funktioniert (send `vopStateChangedNotification`).

## API Reference

### Classes

#### VeronaPlayer

Main class for implementing Verona players.

**Constructor:**
```typescript
new VeronaPlayer(options?: VeronaPlayerOptions)
```

**Options:**
- `debug?: boolean` - Enable debug logging
- `allowedOrigin?: string` - Allowed origin for postMessage (default: '*')

**Sending Messages:**
- `sendReady(data)` - Announce player is ready
- `sendStateChanged(unitState?, playerState?, log?)` - Report state changes
- `sendUnitNavigationRequest(target)` - Request navigation
- `sendRuntimeError(code, message?)` - Report errors
- `sendWidgetCall(widgetType, params?, state?, callId?)` - Call widget
- `sendWindowFocusChanged(hasFocus)` - Report focus changes

**Event Handlers:**
- `onStartCommand(callback)` - Handle start command
- `onPageNavigationCommand(callback)` - Handle page navigation
- `onNavigationDenied(callback)` - Handle navigation denial
- `onPlayerConfigChanged(callback)` - Handle config updates
- `onWidgetReturn(callback)` - Handle widget results

### Utilities

#### Encoding

```typescript
import { encodeBase64, decodeBase64 } from '@verona/interfaces';

// Encode data
const encoded = encodeBase64({ key: 'value' });

// Decode data
const data = decodeBase64<{ key: string }>(encoded);
```

#### Factory Functions

```typescript
import { createLogEntry, createSharedParameter } from '@verona/interfaces';

// Create log entry with timestamp
const log = createLogEntry('ACTION', { detail: 'clicked' });

// Create shared parameter
const param = createSharedParameter('KEY', 'value');
```

#### Validation

```typescript
import { isValidISODateTime, isVeronaMessage } from '@verona/interfaces';

// Validate ISO datetime
if (isValidISODateTime(timestamp)) { /* ... */ }

// Validate Verona message
if (isVeronaMessage(data)) { /* ... */ }
```

### Types

All Verona types are fully typed and available:

```typescript
import {
  VeronaOperations,
  MainSchema,
  PayloadInterfacesProperties,
  AllowedPropertiesValues
} from '@verona/interfaces';

// Use operation constants
const op = VeronaOperations.START_COMMAND;

// Type-safe data structures
const unitState: MainSchema.UnitState = {
  dataParts: { response: 'encoded' },
  presentationProgress: 'complete',
  responseProgress: 'some'
};
```

## Documentation

Generate full API documentation:

```bash
npm run docs
```

View documentation locally:

```bash
npm run docs:serve
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch mode (rebuild on changes)
npm run dev

# Type checking
npm run typecheck

# Clean build artifacts
npm run clean
```

## Project Structure

```
src/
├── index.ts              # Main exports
├── constants.ts          # Constants
├── types/                # Type definitions
│   ├── operations.ts     # VeronaOperations
│   ├── schemas.ts        # MainSchema, SubSchema
│   ├── payloads.ts       # PayloadInterfacesProperties
│   └── values.ts         # AllowedPropertiesValues
├── player/               # Player implementation
│   └── VeronaPlayer.ts   # VeronaPlayer class
└── utils/                # Utility functions
    ├── encoding.ts       # Base64 encoding/decoding
    ├── factory.ts        # Factory functions
    └── validation.ts     # Validation utilities
```

## Versioning

This library follows Semantic Versioning and explicitly tracks the Verona Specification version it implements.

### Current Version

```typescript
import { VERONA_SPEC_VERSION } from '@verona-interfaces/player';
console.log(VERONA_SPEC_VERSION);  // '4.0.0'
```

### Compatibility Matrix

| Library Version | Verona Spec | Status |
|----------------|-------------|--------|
| 1.x.x          | 4.0.0       | ✅ Current |

### Version Guidelines

- **PATCH** (1.0.0 → 1.0.1): Bug fixes
- **MINOR** (1.0.0 → 1.1.0): New features (backward-compatible)
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes or Spec updates

**For detailed versioning workflows and guidelines, see [here](./VERSIONING.md)**

## License

MIT

## Links

- [Verona Specification](https://verona-interfaces.github.io/)
- [Documentation](./docs/)