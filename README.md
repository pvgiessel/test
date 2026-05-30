# Gezinsplanner 📅

Een planningsapp voor het hele gezin: één gedeeld overzicht van **afspraken** en
**taken**, met meerdere gebruikers, een maandkalender en herhalende afspraken.
Gebouwd als responsive webapp (telefoon → iPad) en te verpakken als native
iOS/iPadOS-app via [Capacitor](https://capacitorjs.com/).

## Functies

### 👥 Gebruikers
- Meerdere gezinsleden met een eigen profiel (naam, kleur, emoji-avatar).
- Inloggen door een profiel te kiezen, optioneel beveiligd met een pincode.
- Gezinsleden beheren via de pagina **Gezin**.

### 🗓️ Agenda
- Maandkalender met alle dagen; per dag de afspraken met omschrijving.
- Afspraken hebben: omschrijving, uitgebreide toelichting, locatie, en datum/tijd
  van–tot (of "hele dag").
- Meerdere gezinsleden per afspraak; hun **avatars** worden in het maandoverzicht
  getoond.
- **Herhalende afspraken** (dagelijks/wekelijks/maandelijks/jaarlijks, met
  interval, weekdagen en einde na X keer of op datum).
- Een **losse afspraak binnen een reeks** kan afwijken: bij wijzigen/verwijderen
  wordt gevraagd of het om *deze afspraak* of de *hele reeks* gaat. Bij "hele
  reeks" wordt de volledige reeks bijgewerkt.
- Filteren op gezinslid en eenvoudig navigeren tussen maanden (vorige/volgende/
  vandaag).

### ✅ Taken
- Taken met omschrijving, toelichting, optionele datum en meerdere gezinsleden.
- Met een datum verschijnt de taak óók in de kalender — in een **andere kleur**
  (oranje) dan afspraken (blauw).
- Overzichtelijke lijst onder de kalender; **swipe naar rechts om af te handelen**.
- Afgehandelde taken zijn verborgen, tenzij je "Toon afgehandelde" aanvinkt.

### 📍 Locaties
- Beheer een lijst met locaties (naam, adres, notities) en koppel ze aan
  afspraken.

## Techniek

- **React 19 + TypeScript + Vite**
- **Tailwind CSS** voor de styling, **framer-motion** voor sheets en swipe.
- **date-fns** voor datums; eigen, tijdzone-veilige herhalingslogica
  (`src/lib/recurrence.ts`).
- **Local-first**: alle data staat in `localStorage` (zie `src/lib/storage.ts`).
  De datalaag in `src/store/AppContext.tsx` is bewust afgeschermd achter
  CRUD-functies, zodat later een echte backend (bijv. Supabase/Firebase) in te
  pluggen is zonder de UI te wijzigen.

### Projectstructuur

```
src/
  types/models.ts        Datamodellen (User, Appointment, Task, ...)
  lib/                   Datum-, herhalings-, kalender- en opslaghelpers
  store/AppContext.tsx   Centrale state + CRUD + demo-login
  components/            UI (kalender, taken, formulieren, avatars)
  pages/                 Login, Planning, Locaties, Gezin, Profiel
```

## Ontwikkelen

```bash
npm install
npm run dev      # start de webapp op http://localhost:5173
npm run build    # type-check + productiebuild
npm run lint
```

> Bij de eerste start wordt een voorbeeldgezin met afspraken en taken aangemaakt.
> Wis de opslag van de site in je browser om opnieuw te beginnen.

## Native app (iOS / iPadOS) met Capacitor

De Capacitor-configuratie staat klaar in `capacitor.config.ts`. Het toevoegen van
het iOS-platform en bouwen vereist **macOS met Xcode** (en CocoaPods):

```bash
npm install @capacitor/ios       # eenmalig
npm run cap:add:ios              # voegt het ios/ project toe (alleen op macOS)
npm run cap:sync                 # bouwt de web-app en synchroniseert naar iOS
npm run cap:open:ios             # opent het project in Xcode
```

Daarna draai je de app vanuit Xcode op een simulator of toestel. Voor Android
kan op dezelfde manier `@capacitor/android` worden toegevoegd.
