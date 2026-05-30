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
- **Supabase** (Postgres + auth + realtime) als backend: echte accounts per
  gezinslid, gedeelde data per gezin en live synchronisatie tussen apparaten.
  De datalaag zit in `src/store/AppContext.tsx`; database-toegang in
  `src/lib/supabase.ts` en het schema in `supabase/schema.sql`.

### Projectstructuur

```
src/
  types/models.ts        Datamodellen (User, Appointment, Task, ...)
  lib/                   Datum-, herhalings-, kalender- en opslaghelpers
  store/AppContext.tsx   Centrale state + CRUD + demo-login
  components/            UI (kalender, taken, formulieren, avatars)
  pages/                 Login, Planning, Locaties, Gezin, Profiel
```

## Database instellen (Supabase)

De app heeft een Supabase-project nodig voor opslag, accounts en sync.

1. Maak een gratis project op [supabase.com](https://supabase.com).
2. Open in het dashboard de **SQL Editor**, plak de inhoud van
   [`supabase/schema.sql`](supabase/schema.sql) en klik **Run**. Dit maakt de
   tabellen, de beveiliging (Row Level Security) en de functies voor het
   aanmaken/joinen van een gezin aan.
3. Ga naar **Project Settings → API** en kopieer de **Project URL** en de
   **anon public key**.
4. (Optioneel, makkelijker testen) Zet onder **Authentication → Providers →
   Email** de e-mailbevestiging uit, zodat je direct na registreren kunt
   inloggen.

> De anon-key is een publieke sleutel en mag in de frontend staan; de beveiliging
> gebeurt via Row Level Security, zodat elk gezin alleen zijn eigen data ziet.

## Ontwikkelen

```bash
npm install
cp .env.example .env.local   # vul je Supabase URL + anon key in
npm run dev                  # start de webapp op http://localhost:5173
npm run build                # type-check + productiebuild
npm run lint
```

Bij de eerste keer: maak een account aan, kies **Nieuw gezin**, en nodig daarna
andere gezinsleden uit met de **uitnodigingscode** (tabblad Gezin). Zij maken een
eigen account en kiezen **Aansluiten** met die code.

### Publiceren met de juiste sleutels

De GitHub Pages-workflow leest de Supabase-gegevens uit **repository-variabelen**.
Zet ze in **Settings → Secrets and variables → Actions → tabblad _Variables_**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Daarna bevat elke build automatisch de juiste verbinding.

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
