# ConVoice Terminverwaltung

![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![Stars](https://img.shields.io/github/stars/cschaf/convoice?style=social)](https://github.com/cschaf/convoice/stargazers)
[![Forks](https://img.shields.io/github/forks/cschaf/convoice?style=social)](https://github.com/cschaf/convoice/network/members)

Eine moderne Web-App zur Verwaltung von Terminen für den ConVoice Gospel Chor Bremen.

**Hinweis:** Dies ist eine privat genutzte Webanwendung und nur für ausgewählte Mitglieder bestimmt.

## Inhaltsverzeichnis

* [Über das Projekt](#über-das-projekt)
    * [Erstellt mit](#erstellt-mit)
* [Erste Schritte](#erste-schritte)
    * [Voraussetzungen](#voraussetzungen)
    * [Installation](#installation)
* [Benutzung](#benutzung)
* [Projektstruktur](#projektstruktur)
* [Styling](#styling)
* [Mitwirken](#mitwirken)
* [Lizenz](#lizenz)
* [Kontakt](#kontakt)
* [Danksagungen](#danksagungen)

## Über das Projekt

ConVoice Terminverwaltung ist eine moderne Webanwendung, die entwickelt wurde, um Termine und Veranstaltungen für den ConVoice Gospel Chor Bremen effizient zu verwalten. Sie löst die Herausforderung, Chormitglieder über bevorstehende Proben, Auftritte und andere wichtige Termine informiert zu halten. Das Projekt wurde kürzlich einer umfassenden Refaktorisierung unterzogen, um die Prinzipien der Clean Architecture zu übernehmen. Diese Umstrukturierung zielt darauf ab, die Modularität, Testbarkeit und Wartbarkeit der Codebasis langfristig zu verbessern.

Wichtige Funktionen sind:
*   **Klare Terminübersicht:** Eine organisierte und leicht verständliche Darstellung aller Veranstaltungen.
*   **Suche und Filter:** Schnelles Finden spezifischer Veranstaltungen anhand verschiedener Kriterien.
*   **Responsives Design:** Voll zugänglich und nutzbar auf Desktops, Tablets und Smartphones.
*   **Kalender-Export (ICS):** Ermöglicht es Mitgliedern, Chortermine einfach zu ihren persönlichen digitalen Kalendern hinzuzufügen.
*   **Automatische Generierung von Chorproben:** Vereinfacht die Planung regelmäßiger Chorproben.
*   **Geburtstagserinnerungen:** Hilft dem Chor, sich an die Geburtstage der Mitglieder zu erinnern und diese zu feiern.

Die Wahl von React ermöglicht eine modulare und wartbare Benutzeroberfläche durch seine komponentenbasierte Architektur. Vite bietet eine extrem schnelle Entwicklungsumgebung mit schnellen Serverstarts und Hot Module Replacement. Tailwind CSS ermöglicht eine schnelle UI-Entwicklung mit Utility-First-Klassen, was es einfach macht, ein modernes und responsives Design zu erstellen.

### Erstellt mit

*   [React](https://react.dev/)
*   [Vite](https://vitejs.dev/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Lucide React Icons](https://lucide.dev/)
*   [Sonner](https://sonner.emilkowal.ski/) (für Benachrichtigungen)
*   JavaScript

## Erste Schritte

Anleitung, wie Sie Ihr Projekt lokal zum Laufen bringen.

### Voraussetzungen

*   Node.js (Version 18 oder höher empfohlen)
*   npm
    ```bash
    npm install npm@latest -g
    ```

### Installation

1.  Klone das Repository
    ```bash
    git clone https://github.com/cschaf/convoice.git
    ```
2.  Navigiere in das Projektverzeichnis
    ```bash
    cd convoice
    ```
3.  Installiere NPM-Pakete
    ```bash
    npm install
    ```
4.  Starte den Entwicklungsserver
    ```bash
    npm run dev
    ```
    Die Anwendung sollte nun auf einem lokalen Port laufen (typischerweise `http://localhost:5173`, wie von Vite angegeben).

## Benutzung

Sobald die Anwendung läuft (nachdem Sie die Anweisungen unter 'Erste Schritte' befolgt haben), können Sie wie folgt mit der ConVoice Terminverwaltung interagieren:

*   **Termine anzeigen:** Die Hauptoberfläche zeigt bevorstehende Chortermine, Proben und andere wichtige Daten in einer klaren, chronologischen Anordnung.
*   **Suchen und Filtern:** Nutzen Sie die Suchleiste, um spezifische Termine nach Namen oder Stichwort zu finden. Filteroptionen können verfügbar sein, um Termine nach Typ, Datumsbereich oder anderen Kriterien einzugrenzen.
*   **Kalender exportieren (ICS):** Suchen Sie nach einer Option, um den Terminkalender zu exportieren. Dies lädt typischerweise eine `.ics`-Datei herunter, die Sie in Ihre persönliche Kalenderanwendung (wie Google Kalender, Outlook Kalender oder Apple Kalender) importieren können, um alle ConVoice-Termine synchron zu halten.
*   **Automatische Proben und Erinnerungen:** Das System generiert automatisch Einträge für regelmäßige Chorproben. Geburtstagserinnerungen für Chormitglieder erscheinen ebenfalls in der Terminliste und helfen allen, in Verbindung zu bleiben.
*   **Responsive Oberfläche:** Greifen Sie auf die Anwendung von jedem Gerät aus zu; das Layout passt sich für eine optimale Anzeige auf Desktops, Tablets oder Mobiltelefonen an.

Für spezifische Details zur Dateneingabe oder zu administrativen Funktionen können weitere Dokumentationen oder eine Erkundung der Anwendung erforderlich sein.

## Projektstruktur

Das Projekt folgt nun einer an Clean Architecture orientierten Struktur, um eine klare Trennung der Belange zu gewährleisten:

*   **`.github/`**: Enthält GitHub Actions Workflow-Dateien, hauptsächlich für die automatisierte Bereitstellung auf GitHub Pages.
*   **`public/`**: Statische Assets, die direkt in das Build-Ausgabeverzeichnis kopiert werden (z.B. `vite.svg`).
*   **`src/`**: Der Hauptquellcode der Anwendung.
    *   **`domain/`**: Enthält die Kernlogik und die Geschäftsregeln der Anwendung.
        *   `entities/`: Domänenobjekte (z.B. `Event.js`, `Member.js`), die die grundlegenden Datenstrukturen und deren Logik definieren.
        *   `services/`: Domänendienste (z.B. `ScheduleGeneratorService.js`), die komplexere, entitätsübergreifende Geschäftslogik kapseln.
    *   **`application/`**: Steuert die Anwendungsfälle und die Interaktion zwischen der Domänenschicht und der Infrastrukturschicht.
        *   `usecases/`: Anwendungsfälle (z.B. `LoadScheduleUseCase.js`, `ManageYearlyDataUseCase.js`), die spezifische Anwendungsaktionen repräsentieren.
        *   `repositories/`: Schnittstellen (abstrakte Verträge) für den Datenzugriff (z.B. `IYearlyDataRepository.js`).
    *   **`infrastructure/`**: Implementiert Details für externe Abhängigkeiten wie Datenquellen oder externe Dienste.
        *   `data/`: Konkrete Implementierungen der Repository-Schnittstellen (z.B. `JsonYearlyDataRepository.js`), die auf JSON-Dateien zugreifen.
        *   `services/`: Integrationen mit externen Diensten (z.B. `icsHelper.js` für iCalendar-Exporte).
    *   **`presentation/`**: Verantwortlich für die Benutzeroberfläche und die Interaktion mit dem Benutzer.
        *   `react/components/`: Wiederverwendbare, kleinere React-Komponenten (z.B. `EventCard.jsx`, `FilterSidebar.jsx`).
        *   `react/pages/`: Komponenten, die ganze Seiten repräsentieren (z.B. `DataEntryPage.jsx`, `LoginPage.jsx`).
        *   `react/hooks/`: (Bisher nicht explizit vorhanden) Benutzerdefinierte React Hooks.
        *   `react/utils/`: UI-spezifische Hilfsfunktionen (z.B. `helpers.jsx`).
        *   `theme.js`: Logik und Konfiguration für das Anwendungs-Theme.
    *   **`data/`**: JSON-Dateien, die als primäre Datenquelle für die Anwendung dienen (z.B. Termindaten, Mitgliederlisten).
    *   **`main.jsx`**: Der Haupteinstiegspunkt für die React-Anwendung.
    *   **`index.css`**: Globale Stile und Tailwind CSS Basiskonfigurationen.
*   **Root-Verzeichnis**:
    *   **`index.html`**: Die Haupt-HTML-Seite, die die React-Anwendung hostet.
    *   **`vite.config.js`**: Konfiguration für das Vite-Build-Tool.
    *   **`tailwind.config.js`**: Konfiguration für Tailwind CSS.
    *   **`package.json`**: Projektmetadaten, Abhängigkeiten und Skripte.
    *   **`readme.md`**: Diese Datei.

## Styling

Dieses Projekt verwendet **Tailwind CSS** für sein Styling. Tailwind ist ein Utility-First-CSS-Framework, das eine schnelle UI-Entwicklung direkt im HTML/JSX-Markup ermöglicht.

*   **Konfiguration**: Die Tailwind CSS-Konfiguration befindet sich in `tailwind.config.js`. Diese Datei definiert die Design-Tokens des Projekts, wie z.B. die Farbpalette, Abstandsskalen und Schriftarten.
*   **Globale Stile**: Basisstile, globale benutzerdefinierte CSS-Anweisungen und Tailwinds `@tailwind`-Direktiven sind in `src/index.css` enthalten.
*   **Komponentenstile**: Das meiste Styling wird direkt auf Komponenten mittels Tailwinds Utility-Klassen angewendet.

Lucide React Icons werden für die Ikonographie verwendet und bieten einen Satz konsistenter und anpassbarer SVG-Icons.

## Mitwirken

Beiträge machen die Open-Source-Community zu einem so großartigen Ort zum Lernen, Inspirieren und Schaffen. Alle Beiträge, die Sie leisten, werden **sehr geschätzt**.

Wenn Sie einen Vorschlag haben, der dieses Projekt verbessern könnte, forken Sie bitte das Repository und erstellen Sie einen Pull Request. Sie können auch einfach ein Issue eröffnen, um Ihre Ideen zu diskutieren oder einen Fehler zu melden.

1.  **Forke das Projekt**
2.  **Erstelle deinen Feature Branch** (`git checkout -b feature/AmazingFeature`)
3.  **Commite deine Änderungen** (`git commit -m 'Add some AmazingFeature'`)
4.  **Pushe zum Branch** (`git push origin feature/AmazingFeature`)
5.  **Öffne einen Pull Request**

Bitte stellen Sie sicher, dass Ihr Code den Programmierstandards des Projekts entspricht und gegebenenfalls entsprechende Tests enthält.

## Lizenz

Verteilt unter der MIT-Lizenz. Siehe `LICENSE` für weitere Informationen. (Hinweis: Eine `LICENSE`-Datei ist im aktuellen Repository nicht vorhanden, sollte aber für ein MIT-Lizenzprojekt hinzugefügt werden.)

## Kontakt

Christian Schaf - [cschaf@users.noreply.github.com](mailto:cschaf@users.noreply.github.com)

Projekt-Link: [https://github.com/cschaf/convoice](https://github.com/cschaf/convoice)

## Danksagungen

*   Dieses Projekt wurde entwickelt für den **ConVoice Gospel Chor Bremen** 🎵.
*   Dank an die Entwickler und Betreuer der Bibliotheken und Werkzeuge, die im Abschnitt 'Erstellt mit' aufgeführt sind und dieses Projekt ermöglicht haben.
*   Shields.io für die Badges, die am Anfang dieser README verwendet werden.
