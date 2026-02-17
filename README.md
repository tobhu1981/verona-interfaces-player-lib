# Verona Interface Lib

**Es handelt sich um eine Beta-Version!**

## Installation als lokales npm-package

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

## Erprobung der Lib

[**Hier**](./PLAYER-INTEGRATION.md) ist eine Zusammenfassung zur Erprobung mit dem Speedtest-Player zu finden.

## Documentation

API Doku erzeugen: 

```bash
npm run docs
```

Die so erzeugte API-Doku wird auch auf GitHub-Pages via GitHub-Action angezeigt. 

## Versionierung

Ein erster Vorschlag zur Versionsverwaltung von Verona-Player-Spec und npm-Paket, ist [**hier**](./VERSIONING.md) zu finden.

## Lizenz

MIT

## Links

- [Verona Specification](https://verona-interfaces.github.io/)