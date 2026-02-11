# Versionierungs-Guide Vorabversion

**Nachfolgend wird beschrieben, wie eine Versionierung bzgl. **npm-package-Version** und **Verona-Lib-Spezifikation** durchgeführt werden könnte. Über die Eignung einer solchen Vorgehensweise muss diskutiert werden.**

## NPM-Paket-Versionierung

Diese Library folgt [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH
1.2.3
│ │ │
│ │ └─── PATCH: Bugfixes (backward-compatible)
│ └───── MINOR: Neue Features (backward-compatible)
└─────── MAJOR: Breaking Changes (inkl. Spec-Updates)
```

## Spec-Version-Tracking

Jede Library-Version hat einen **harten Verweis** auf die Verona Spec-Version:

```typescript
// In src/constants.ts
export const VERONA_SPEC_VERSION = '4.0.0';
```

```json
// In package.json
{
  "keywords": ["verona-spec-4.0.0"]
}
```

## Versionierungs-Workflows

### 1. Bugfix (1.0.0 → 1.0.1)

**Wann:** Fehler beheben, keine neuen Features, gleiche Spec

```bash
# 1. Bugfix implementieren
# 2. Tests prüfen
npm test

# 3. Version bumpen
npm version patch

# Das macht automatisch:
# - package.json: "version": "1.0.1"
# - npm run build
# - git commit
# - git tag v1.0.1

# 4. Publishen
npm publish

# Tags werden automatisch gepusht (postversion script)
```

### 2. Neues Feature (1.0.0 → 1.1.0)

**Wann:** Neue Funktionalität, backward-compatible, gleiche Spec

```bash
# 1. Feature implementieren
# z.B. neue Utility-Funktion

# 2. Tests prüfen
npm test

# 3. Version bumpen
npm version minor

# 4. CHANGELOG aktualisieren
# CHANGELOG.md:
## [1.1.0] - 2024-02-10
### Added
- New utility function: xyz()

# 5. Publishen
npm publish
```

### 3. Spec-Update (1.0.0 → 2.0.0)

**Wann:** Verona Spec ändert sich (4.0.0 → 4.1.0)

```bash
# 1. Code an neue Spec anpassen
# - src/types/operations.ts
# - src/types/payloads.ts
# - src/types/values.ts
# - src/types/schemas.ts

# 2. Spec-Version aktualisieren
# src/constants.ts:
export const VERONA_SPEC_VERSION = '4.1.0';

# package.json:
{
  "keywords": ["verona", "verona-spec-4.1.0", ...]
}

# 3. Tests prüfen
npm test

# 4. MAJOR Version bump
npm version major  # 1.0.0 → 2.0.0

# 5. CHANGELOG aktualisieren
# CHANGELOG.md:
## [2.0.0] - 2024-02-10
### Breaking Changes
- Updated to Verona Spec 4.1.0
- Added new operation type XYZ
- Changed payload structure for ABC

### Migration Guide
Users need to update...

# 6. Publishen
npm publish
```

## Versions-Übersicht

| Library Version | Spec Version | Änderungstyp | Beispiel |
|----------------|--------------|--------------|----------|
| 1.0.0 → 1.0.1  | 4.0.0        | Bugfix       | Encoding-Fehler behoben |
| 1.0.0 → 1.1.0  | 4.0.0        | Feature      | Neue Utility-Funktion |
| 1.0.0 → 2.0.0  | 4.1.0        | Breaking     | Spec-Update |
| 2.0.0 → 2.0.1  | 4.1.0        | Bugfix       | TypeScript-Fehler fix |

## Version prüfen

### Im Code (zur Laufzeit)

```typescript
import { VERONA_SPEC_VERSION } from '@verona-interfaces/player';

console.log('Spec Version:', VERONA_SPEC_VERSION);  // '4.0.0'
```

### In package.json

```bash
npm info @verona-interfaces/player version
npm info @verona-interfaces/player keywords
```

### Via npm list

```bash
# Im Projekt das die Library verwendet
npm list @verona-interfaces/player
```

## Kompatibilität kommunizieren

### In README.md

```markdown
## Compatibility

| Library Version | Verona Spec | Status |
|----------------|-------------|--------|
| 2.x.x          | 4.1.0       | ✅ Current |
| 1.x.x          | 4.0.0       | ⚠️ Outdated |
```

### In CHANGELOG.md

Jeder Release dokumentiert die Spec-Version:

```markdown
## [2.0.0] - 2024-02-10
### Supported
- Verona Specification: 4.1.0
```

## Automatisierung

### NPM Scripts (bereits konfiguriert)

```json
{
  "scripts": {
    "version": "npm run build && git add -A",
    "postversion": "git push && git push --tags"
  }
}
```

**Was passiert bei `npm version patch`:**
1. `version` script läuft: Build + Git add
2. package.json wird aktualisiert
3. Git commit wird erstellt
4. Git tag wird erstellt
5. `postversion` script läuft: Push + Push tags

### GitHub Actions (optional)

Automatisches Publishing bei Git Tags:

```yaml
# .github/workflows/publish.yml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Checkliste für neuen Release

- [ ] Code-Änderungen implementiert
- [ ] Tests laufen durch (`npm test`)
- [ ] Dokumentation aktualisiert
- [ ] CHANGELOG.md aktualisiert
- [ ] Spec-Version korrekt? (bei Spec-Updates)
- [ ] `npm version [patch|minor|major]`
- [ ] `npm publish`
- [ ] GitHub Release erstellen (optional)

## FAQ

**Q: Wann ist ein Spec-Update ein Breaking Change?**  
A: Immer! Auch wenn die Spec backward-compatible ist, solltest du MAJOR bumpen, damit Nutzer wissen, dass sich die zugrunde liegende Spec geändert hat.

**Q: Kann ich Spec 4.0.0 und 4.1.0 gleichzeitig unterstützen?**  
A: Technisch ja, aber nicht empfohlen. Besser: Eine Library-Version pro Spec-Version.

**Q: Was wenn ich nur die Dokumentation ändere?**  
A: Patch-Version reicht (`npm version patch`).

**Q: Muss ich bei jeder Änderung publishen?**  
A: Nein! Du kannst auch mehrere Changes sammeln und dann publishen.

## Weiterführende Links

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [NPM Version Command](https://docs.npmjs.com/cli/v9/commands/npm-version)