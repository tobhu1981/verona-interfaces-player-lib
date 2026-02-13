# Verona Interface Lib

## Erprobung in Verona Module Speedtest

Es handelt sich hier um eine erste Version. Bisherige Tests nur mit dem **Verona Modul Speedtest**.

**Folgende Handshakes zwischen Player und Host wurden bisher getestet:**

**`vopReadyNotification`**

* `metadata`

**`vopStartCommand`**

* `sessionId`
* `unitDefinition` -> Aufgaben werden wiedergegeben
* `unitDefinitionType` -> wird im Speedtest-Player nicht benutzt
* `unitState` 
    * `dataParts` -> Wiederherstellung einer bereits abgespielten Aufgabe konnte im Speedtest-Player nicht ausreichend getestet werden 
    * `presentationProgress`, `responseProgress` -> wurde im Speedtest-Player zwar entsprechend gesetzt, müsste aber in Aspect-Aufgaben noch ausführlich geprüft werden
    * `unitStateDataType` -> Wird, soweit ich das sehe, im Speedtest-Player nicht verwendet.
* `playerConfig` -> wird im Speedtest-Player nicht abgerufen

**`vopStateChangedNotification`**

* `sessionId`
* `timeStamp`
* `unitState` 
    * `dataParts` -> Responses und Logs werden genau so geschrieben, wie im Speedtest-Player Code ohne die neue Lib
    * `presentationProgress`, `responseProgress` -> wurde im Speedtest-Player zwar entsprechend gesetzt, müsste aber in Aspect-Aufgaben noch ausführlich geprüft 
    * `unitStateDataType`
* * `playerConfig` -> wird im Speedtest-Player nicht gesendet

**Es wurde noch nicht getestet:**

* `vopPageNavigationCommand`
* `vopUnitNavigationRequestedNotification`
* `vopNavigationDeniedNotification`
* `vopPlayerConfigChangedNotification`
* `vopRuntimeErrorNotification`
* `vopWidgetCall`
* `vopWidgetReturn`
* `vopWindowFocusChangedNotification`

[**Hier**](./Example-Speedtestplayer.md) ist auch eine beispielhafte Einbindung dieser Lib in den Speedtest-Player in `app.components.ts` zu sehen. Diese Einbindung wurde im Testcenter getestet. Zu beachten sind hier auch die "TODOs" in den Kommentaren.

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

## Documentation

API Doku erzeugen: 

```bash
npm run docs
```

Local betrachten:

```bash
npm run docs:serve
```
Die so erzeugte API-Doku wird auch auf GitHub-Pages via GitHub-Action angezeigt. 

## Versionierung

Erste Überlegungen, wie Lib-Spec und nmp-pakete Version verwaltet werden könnten, sind [**hier**](./VERSIONING.md) zu finden.

## Lizenz

MIT

## Links

- [Verona Specification](https://verona-interfaces.github.io/)