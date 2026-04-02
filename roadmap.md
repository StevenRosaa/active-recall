🗺️ ROADMAP DEFINITIVA:
FASE 1: Il Cronometro Strutturato (Focus Mode)

Obiettivo: Far eseguire le sessioni direttamente nell'app e tracciarne la durata.

UI: Nel modale ActivityDetailsDialog, aggiungere un bottone "▶ Inizia Sessione". Cliccandolo si apre un overlay/timer immersivo in stile Glassmorphism.

Funzionalità: Timer ibrido (Cronometro libero o Pomodoro).

Dati: Aggiungere actual_duration (e opzionalmente planned_duration) al DB e al tipo Activity per salvare i minuti effettivi studiati quando la sessione viene completata.

FASE 2: Custom Active Recall Profiles (Preferenze)

Obiettivo: Dare all'utente il potere di creare i propri intervalli di ripetizione spaziata.

UI: Sbloccare il tab "Preferenze" nel SettingsDialog (attualmente in "Coming Soon").

Funzionalità: Permettere all'utente di definire profili personalizzati (es. "Urgente: 1, 2, 4, 8" o "Lungo Termine: 1, 7, 30, 90"). Nel form di creazione attività, l'utente sceglierà uno di questi profili dal menu a tendina.

FASE 3: Analytics & Gamification (Dashboard)

Obiettivo: Sfruttare i dati raccolti per creare dipendenza positiva.

UI: Nuova pagina/sezione Statistiche.

Funzionalità: Heatmap stile GitHub (quadratini colorati in base alle ore studiate), grafici "Tempo Pianificato vs Tempo Effettivo", e Streak (giorni consecutivi di studio).

FASE 4: Ecosistema (PWA & Notifiche)

Obiettivo: Ritenzione e accessibilità nativa.

Funzionalità: Trasformare l'app in una PWA installabile su iOS/Android/Desktop e implementare notifiche push Web (es. "Oggi hai 3 sessioni programmate").