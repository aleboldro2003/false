# False

![Alessandro Boldrini - False](assets/images/alessandro-boldrini-cover.png)

False e' un'app mobile social realizzata con Expo e React Native, pensata per pubblicare contenuti, seguire profili, interagire con post e ascoltare podcast in un'esperienza moderna e scura.

Il progetto include autenticazione, feed, profili utente, creazione di post, gestione podcast, player multimediale e integrazione con Supabase per dati, sessioni e contenuti dinamici.

## Funzionalita'

- Feed principale con post, media, like, commenti e repost
- Autenticazione utente tramite Supabase
- Profili personali e pagine utente pubbliche
- Creazione di post con contenuti testuali e multimediali
- Sezione podcast con player dedicato
- Mini-player persistente nella navigazione
- Ricerca e navigazione tramite Expo Router
- Layout mobile-first ottimizzato per Expo Go

## Stack

- Expo SDK 57
- React Native
- React
- TypeScript
- Expo Router
- Supabase
- Expo Audio e Expo Video
- Google AI Studio per supporto alla progettazione e sviluppo AI

## Avvio in locale

**Prerequisiti:** Node.js, npm ed Expo Go installato sul telefono.

1. Installa le dipendenze:

```bash
npm install
```

2. Avvia il progetto:

```bash
npx expo start --clear
```

3. Scansiona il QR code con Expo Go.

## Database

Il progetto usa Supabase per autenticazione e dati applicativi. Senza configurazione del database alcune schermate possono aprirsi, ma feed, profili, interazioni e contenuti dinamici dipendono dalle tabelle e dalle policy Supabase.

## Note

Questo repository contiene il frontend mobile dell'app False. Il progetto e' stato aggiornato a Expo SDK 57 per essere compatibile con le versioni recenti di Expo Go.
