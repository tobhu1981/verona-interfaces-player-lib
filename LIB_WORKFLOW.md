# Architektur der Verona Player Library

Diese Dokumentation beschreibt den Aufbau und die Arbeitsweise der `@verona-interfaces/player` Library.

---

## Übersicht

Die Library implementiert die **Verona Player Specification 6.1.1** und ermöglicht die bidirektionale Kommunikation zwischen einem Player (z.B. einer Aufgaben-Anwendung) und einem Host (z.B. einem Testsystem) über die **PostMessage API**.

```
┌─────────────────────────────────────────────────────────────┐
│                         Host Application                     │
│                    (z.B. Testsystem/IQB)                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ postMessage
                        │ (vopStartCommand, vopPageNavigationCommand, ...)
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Player (iframe/window)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │        @verona-interfaces/player Library               │ │
│  │                                                        │ │
│  │  • VeronaPlayerApiService (Kommunikation)             │ │
│  │  • Types (TypeScript Definitionen)                    │ │
│  │  • Utils (Encoding, Validation, Factory)              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Deine Player-Logik (z.B. Angular)           │ │
│  │                                                        │ │
│  │  • UI-Komponenten (Aufgabenanzeige)                   │ │
│  │  • State Management (Antworten, Navigation)           │ │
│  │  • Business Logic                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ postMessage
                        │ (vopReadyNotification, vopStateChangedNotification, ...)
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                         Host Application                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Verzeichnisstruktur

```
src/
├── index.ts                    # Haupteinstiegspunkt, exports
├── constants.ts                # Konstanten (VERONA_SPEC_VERSION, etc.)
│
├── types/                      # TypeScript Type Definitions
│   ├── index.ts                # Re-exports
│   ├── operations.ts           # VeronaOperations (Message-IDs)
│   ├── values.ts               # AllowedPropertiesValues (Enums)
│   ├── schemas.ts              # MainSchema & SubSchema (Datenstrukturen)
│   ├── payloads.ts             # PayloadInterfacesProperties (Message-Payloads)
│   └── messages.ts             # VeronaMessage (Basis-Interface)
│
├── services/                   # Haupt-Service-Klasse
│   └── VeronaPlayerApiService.ts
│
└── utils/                      # Hilfsfunktionen
    ├── index.ts                # Re-exports
    ├── encoding.ts             # Base64 encode/decode
    ├── factory.ts              # createLogEntry, createSharedParameter
    └── validation.ts           # isVeronaMessage, isValidISODateTime
```

---

## Kernkomponenten

### 1. Types (`src/types/`)

Die Types bilden das **Rückgrat der Library** – sie definieren alle Datenstrukturen der Verona-Spec.

#### `operations.ts` – Message-IDs

```typescript
export const VeronaOperations = {
  // Player → Host
  READY_NOTIFICATION: 'vopReadyNotification',
  STATE_CHANGED_NOTIFICATION: 'vopStateChangedNotification',
  UNIT_NAVIGATION_REQUESTED_NOTIFICATION: 'vopUnitNavigationRequestedNotification',
  // ...

  // Host → Player
  START_COMMAND: 'vopStartCommand',
  PAGE_NAVIGATION_COMMAND: 'vopPageNavigationCommand',
  // ...
} as const;

export type VeronaOperationId = typeof VeronaOperations[keyof typeof VeronaOperations];
```

**Zweck:** Verhindert Tippfehler bei Message-IDs (`'vopReadyNotification'` statt Strings).

---

#### `values.ts` – Erlaubte Werte (Enums)

```typescript
export namespace AllowedPropertiesValues {
  export type Progress = 'none' | 'some' | 'complete';
  export type LogPolicy = 'disabled' | 'lean' | 'rich' | 'debug';
  export type PagingMode = 'separate' | 'buttons' | 'concat-scroll' | 'concat-scroll-snap';
  // ...
}
```

**Zweck:** Typ-sichere Werte für Flags und Einstellungen.

---

#### `schemas.ts` – Datenstrukturen

```typescript
export namespace MainSchema {
  export interface UnitState {
    dataParts?: Record<string, string>; // base64-kodierte Responses
    presentationProgress?: Progress;
    responseProgress?: Progress;
    unitStateDataType?: string;
  }

  export interface PlayerConfig {
    unitNumber?: number;
    unitTitle?: string;
    logPolicy?: LogPolicy;
    pagingMode?: PagingMode;
    enabledNavigationTargets?: NavigationTarget[];
    // ...
  }

  export interface LogEntry {
    timeStamp: string; // ISO 8601
    key: string;
    content?: string; // base64
  }
}
```

**Zweck:** Typen für komplexe Objekte (UnitState, PlayerConfig, LogEntry, etc.).

---

#### `payloads.ts` – Message-Payloads

```typescript
export namespace PayloadInterfacesProperties {
  export namespace PlayerSend {
    export interface ReadyNotification {
      metadata: string;
    }

    export interface StateChangedNotification {
      sessionId: string;
      timeStamp: string;
      unitState?: MainSchema.UnitState;
      playerState?: MainSchema.PlayerState;
      log?: MainSchema.LogEntry[];
    }
  }

  export namespace PlayerReceive {
    export interface StartCommand {
      sessionId: string;
      unitDefinition?: string; // base64
      unitState?: MainSchema.UnitState;
      playerConfig?: MainSchema.PlayerConfig;
    }
  }
}
```

**Zweck:** Definiert die Struktur jeder einzelnen Message (was wird gesendet/empfangen?).

---

### 2. Service (`src/services/VeronaPlayerApiService.ts`)

Der **zentrale Service** für die Kommunikation.

#### Lebenszyklus

```typescript
// 1. Instanziierung
const veronaPlayer = new VeronaPlayerApiService({
  debug: true,
  allowedOrigin: '*'
});

// 2. Handler registrieren (BEVOR sendReady!)
veronaPlayer.onStartCommand((data) => {
  console.log('Received START_COMMAND:', data);
  // Aufgabe laden, State wiederherstellen, etc.
});

// 3. Ready senden → Host weiß: Player ist bereit
veronaPlayer.sendReady({
  metadata: JSON.stringify({ version: '1.0' })
});

// 4. Kommunikation läuft
veronaPlayer.sendStateChanged(unitState); // Antworten senden
veronaPlayer.sendUnitNavigationRequest('next'); // Navigation anfordern

// 5. Cleanup (z.B. in Angular ngOnDestroy)
veronaPlayer.destroy();
```

---

#### Interne Architektur

```typescript
export class VeronaPlayerApiService {
  private messageHandlers: Map<string, Set<Function>> = new Map();
  private sessionId: string | null = null;
  private targetWindow: Window; // parent window
  private messageListener: (event: MessageEvent) => void;

  constructor(options: VeronaPlayerOptions = {}) {
    this.targetWindow = window.parent;

    // Registriere globalen Message-Listener
    this.messageListener = (event: MessageEvent) => {
      this.handleMessage(event);
    };
    window.addEventListener('message', this.messageListener);
  }

  // SENDEN: Player → Host
  sendReady(data) { this.postMessage('vopReadyNotification', data); }
  sendStateChanged(unitState, playerState, log) { /* ... */ }

  // EMPFANGEN: Host → Player
  onStartCommand(callback) { this.on('vopStartCommand', callback); }
  onPageNavigationCommand(callback) { /* ... */ }

  // Interne Message-Verarbeitung
  private handleMessage(event: MessageEvent) {
    // 1. Origin-Check
    if (this.allowedOrigin !== '*' && event.origin !== this.allowedOrigin) return;

    // 2. Verona-Message?
    if (!isVeronaMessage(event.data)) return;

    // 3. SessionId-Validierung
    if (this.sessionId && event.data.sessionId !== this.sessionId) return;

    // 4. Handler aufrufen
    const handlers = this.messageHandlers.get(event.data.type);
    handlers?.forEach(handler => handler(event.data));
  }

  destroy() {
    window.removeEventListener('message', this.messageListener);
    this.messageHandlers.clear();
  }
}
```

**Wichtig:**
- **SessionId wird beim ersten `START_COMMAND` gesetzt** und bei allen nachfolgenden Messages validiert
- **Origin-Check** verhindert Cross-Origin-Angriffe (wenn `allowedOrigin` gesetzt)
- **Handler-Map** erlaubt mehrere Callbacks pro Message-Typ

---

### 3. Utils (`src/utils/`)

Hilfsfunktionen für häufige Aufgaben.

#### `encoding.ts` – Base64 Kodierung

```typescript
export function encodeBase64(data: object | string): string {
  const json = typeof data === 'string' ? data : JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(json))); // UTF-8 sicher
}

export function decodeBase64<T = any>(encoded: string): T {
  const json = decodeURIComponent(escape(atob(encoded)));
  return JSON.parse(json);
}
```

**Zweck:** Die Verona-Spec verlangt Base64-Kodierung für `dataParts` und `LogEntry.content`.

---

#### `factory.ts` – Objekt-Erzeugung

```typescript
export function createLogEntry(key: string, content?: object | string): MainSchema.LogEntry {
  return {
    timeStamp: new Date().toISOString(),
    key,
    content: content ? encodeBase64(content) : undefined
  };
}

export function createSharedParameter(key: string, value: string): MainSchema.SharedParameter {
  if (key.length < 2) throw new Error('Key must be >= 2 chars');
  return { key, value };
}
```

**Zweck:** Vereinfacht das Erstellen von validen Objekten (Timestamp automatisch, Validierung).

---

#### `validation.ts` – Runtime-Checks

```typescript
export function isVeronaMessage(data: unknown): data is VeronaMessage {
  return data !== null &&
         typeof data === 'object' &&
         'type' in data &&
         isValidOperationId(data.type);
}

export function isValidOperationId(op: unknown): op is VeronaOperationId {
  return typeof op === 'string' && 
         Object.values(VeronaOperations).includes(op as any);
}
```

**Zweck:** Type Guards für sichere Message-Verarbeitung (filtert nicht-Verona-Messages aus).

---

## Message Flow – Beispiel

### Szenario: Host startet Player mit einer Aufgabe

```
┌──────────┐                                    ┌──────────┐
│   Host   │                                    │  Player  │
└─────┬────┘                                    └────┬─────┘
      │                                              │
      │                                              │ 1. Konstruktor
      │                                              │    new VeronaPlayerApiService()
      │                                              │    ↓
      │                                              │    window.addEventListener('message', ...)
      │                                              │
      │                                              │ 2. Handler registrieren
      │                                              │    onStartCommand((data) => { ... })
      │                                              │
      │                                              │ 3. sendReady()
      │    ◄─────────────────────────────────────── │    postMessage('vopReadyNotification', ...)
      │                                              │
      │ 4. START_COMMAND                            │
      │    postMessage({                            │
      │      type: 'vopStartCommand',               │
      │      sessionId: 'abc123',                   │
      │      unitDefinition: '<base64>',            │
      │      unitState: { ... }                     │
      │    })                                       │
      │    ───────────────────────────────────────► │
      │                                              │ 5. handleMessage()
      │                                              │    ↓ Origin-Check
      │                                              │    ↓ isVeronaMessage()
      │                                              │    ↓ sessionId = 'abc123'
      │                                              │    ↓ Trigger onStartCommand-Handler
      │                                              │
      │                                              │ 6. Player lädt Aufgabe
      │                                              │    JSON.parse(unitDefinition)
      │                                              │    Restore unitState
      │                                              │
      │                                              │ 7. sendStateChanged()
      │    ◄─────────────────────────────────────── │    postMessage('vopStateChangedNotification', ...)
      │                                              │
```

---

## Wichtige Design-Entscheidungen

### 1. **Namespace-basierte Types statt globaler Interfaces**

```typescript
// ✅ So
export namespace MainSchema {
  export interface UnitState { ... }
}

// ❌ Nicht so
export interface UnitState { ... }
```

**Vorteil:** Verhindert Namenskollisionen in großen Projekten, klare Herkunft (`MainSchema.UnitState`).

---

### 2. **Handler-Registrierung als Callback-Pattern**

```typescript
veronaPlayer.onStartCommand((data) => {
  // Callback wird aufgerufen, wenn Message eintrifft
});
```

**Alternativansatz (nicht gewählt):** Observable/Subject (RxJS) oder Event Emitter.

**Begründung:** Einfacher, keine zusätzlichen Dependencies, passt zu Angular/React/Vue.

---

### 3. **SessionId-Validierung im Service**

Die SessionId wird automatisch verwaltet:
- Beim ersten `START_COMMAND` gesetzt
- Bei allen weiteren Messages validiert
- Verhindert Message-Vermischung bei mehreren Player-Instanzen

---

### 4. **Base64-Encoding in Utils, nicht automatisch**

Die Library erzwingt **keine** automatische Kodierung – du entscheidest:

```typescript
// Manuell
const encoded = encodeBase64({ answer: 42 });
veronaPlayer.sendStateChanged({
  dataParts: { 'question_1': encoded }
});

// Oder direkt JSON (wenn Host das akzeptiert)
veronaPlayer.sendStateChanged({
  dataParts: { 'question_1': JSON.stringify({ answer: 42 }) }
});
```

**Begründung:** Flexibilität – nicht alle Hosts verlangen Base64.

---

## Typische Integration (Angular-Beispiel)

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { VeronaPlayerApiService, UnitState } from '@verona-interfaces/player';

@Component({
  selector: 'app-player',
  template: `<div>{{ currentQuestion }}</div>`
})
export class PlayerComponent implements OnInit, OnDestroy {
  private veronaPlayer!: VeronaPlayerApiService;
  currentQuestion: string = '';

  ngOnInit() {
    // 1. Service initialisieren
    this.veronaPlayer = new VeronaPlayerApiService({ debug: true });

    // 2. Handler registrieren
    this.veronaPlayer.onStartCommand((data) => {
      const unit = JSON.parse(data.unitDefinition!);
      this.currentQuestion = unit.questions[0].text;

      // State wiederherstellen
      if (data.unitState?.dataParts) {
        // ... restore logic
      }
    });

    // 3. Ready senden
    this.veronaPlayer.sendReady({
      metadata: JSON.stringify({ version: '1.0' })
    });
  }

  onAnswerGiven(answer: string) {
    // State an Host senden
    const unitState: UnitState = {
      dataParts: {
        'question_1': JSON.stringify({ answer })
      },
      responseProgress: 'complete'
    };

    this.veronaPlayer.sendStateChanged(unitState);
  }

  ngOnDestroy() {
    // 4. Cleanup
    this.veronaPlayer.destroy();
  }
}
```

---

## Debugging

### Debug-Modus aktivieren

```typescript
const veronaPlayer = new VeronaPlayerApiService({ debug: true });
```

**Ausgabe:**
```
[VeronaPlayer] Sent: { type: 'vopReadyNotification', metadata: '...' }
[VeronaPlayer] Received: { type: 'vopStartCommand', sessionId: 'abc123', ... }
```

---

### Häufige Probleme

| Problem | Ursache | Lösung |
|---------|---------|--------|
| Handler wird nicht aufgerufen | Handler nach `sendReady()` registriert | Handler **vor** `sendReady()` registrieren |
| SessionId-Warnung | Host sendet falsche SessionId | Debug-Logs prüfen, Host-Config überprüfen |
| Origin-Check schlägt fehl | `allowedOrigin` stimmt nicht | `allowedOrigin: '*'` für Tests, korrekte Domain in Produktion |
| Memory Leak | `destroy()` nicht aufgerufen | In `ngOnDestroy` / `useEffect` cleanup aufrufen |

---

## Weiterführende Links

- [Verona Specification](https://verona-interfaces.github.io/)
- [Example-Speedtestplayer.md](./Example-Speedtestplayer.md) – Praxis-Beispiel
- [VERSIONING.md](./VERSIONING.md) – Versionierungs-Strategie