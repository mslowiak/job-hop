<conversation_summary>
<decisions>
Encja "users" (auth.users) ma relację jeden-do-wielu z "applications" poprzez klucz obcy user_id w tabeli applications, odnoszący się bezpośrednio do auth.users.id.
Pole "status" w tabeli "applications" używa typu ENUM z wartościami: 'planned', 'sent', 'in_progress', 'interview', 'rejected', 'offer', z domyślną wartością 'sent' ustawianą w aplikacji, nie w bazie danych.
Kompozytowy indeks na (user_id, created_at DESC) w tabeli "applications" jest utworzony dla optymalizacji sortowania.
Partycjonowanie tabeli "applications" nie jest stosowane dla MVP.
RLS jest włączone na tabeli "applications" z politykami SELECT, INSERT, UPDATE, DELETE ograniczającymi dostęp do rekordów gdzie user_id = auth.uid().
Tabela auth.users ma UNIQUE constraint na "email", hasło jest hashowane via Supabase auth; brak custom updated_at dla użytkownika.
Indeks na (user_id, status) w tabeli "applications" jest utworzony dla zapytań agregujących statystyk.
ON DELETE CASCADE jest zdefiniowane na kluczu obcym user_id w tabeli "applications" (REFERENCES auth.users(id)); dla usuwania konta użyj Supabase triggera do kaskadowego usunięcia applications po usunięciu z auth.users.
NOT NULL constraints są dodane na pola company_name (VARCHAR(255)), position_name (VARCHAR(255)) i application_date (DATE) w tabeli "applications".
Pole updated_at (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP) jest dodane z BEFORE UPDATE triggerem tylko na tabeli "applications".
Tabela "profiles" jest usunięta; brak pośredniej encji dla custom danych użytkownika.
Pole "link" w tabeli "applications" używa typu TEXT bez dodatkowej walidacji.
Walidacja CHECK na "application_date" <= CURRENT_DATE nie jest dodana.
Indeks na (user_id, application_date DESC) w tabeli "applications" jest utworzony.
RLS jest włączone na tabeli "applications" z politykami UPDATE i DELETE ograniczającymi do where user_id = auth.uid(); Supabase trigger dla kaskadowego usuwania applications przy usuwaniu konta (US-004 i US-005).
Pole "notes" w tabeli "applications" jest zdefiniowane jako TEXT NULL bez indeksu.
Domyślna wartość dla "status" jest ustawiana w logice aplikacji, nie w bazie danych.
UNIQUE constraint na (user_id, company_name, position_name) nie jest dodany.
</decisions>
<matched_recommendations>
Utworzenie bezpośredniej relacji jeden-do-wielu między auth.users a applications z kluczem obcym user_id dla izolacji danych per użytkownik, bez pośredniej tabeli profiles.
Użycie ENUM dla pola "status" w applications dla integralności danych, z wartościami w języku angielskim.
Dodanie kompozytowych indeksów na (user_id, created_at DESC), (user_id, status) i (user_id, application_date DESC) dla optymalizacji zapytań sortujących i agregujących.
Włączenie RLS na tabeli applications z politykami opartymi na auth.uid() dla bezpieczeństwa dostępu.
Zdefiniowanie ON DELETE CASCADE na kluczu obcym w applications i użycie triggera dla usuwania konta, aby zapewnić spójność danych.
Dodanie NOT NULL constraints na wymagane pola w applications (company_name, position_name, application_date) dla walidacji integralności.
Implementacja BEFORE UPDATE triggera dla automatycznego ustawiania updated_at na applications dla audytu zmian.
Bezpośrednia integracja z auth.users w Supabase dla autentykacji i custom danych (applications), bez dodatkowej tabeli profiles dla prostoty MVP.
Definicja pól opcjonalnych jak "link" i "notes" jako TEXT NULL bez dodatkowych indeksów lub walidacji dla MVP.
Brak partycjonowania i dodatkowych UNIQUE constraints dla prostoty MVP, z wystarczającą skalowalnością dla do 100 aplikacji per użytkownik.
</matched_recommendations>
<database_planning_summary>
a. Główne wymagania dotyczące schematu bazy danych
Schemat bazy danych dla MVP JobHop opiera się na wymaganiach z PRD, skupiając się na zarządzaniu użytkownikami i aplikacjami o pracę. Kluczowe funkcjonalności to: uwierzytelnianie (rejestracja, logowanie, zmiana hasła, usuwanie konta), CRUD dla aplikacji (dodawanie, edycja, usuwanie, szybka zmiana statusu), pulpit z listą i filtrowaniem, oraz strona statystyk zliczająca aplikacje po statusach. Dane muszą być izolowane per użytkownik, z walidacją wymaganych pól i automatycznym audytem zmian. Stack wykorzystuje Supabase (PostgreSQL z wbudowaną autentykacją), co narzuca bezpośrednią integrację z auth.users bez custom tabel pośrednich.
b. Kluczowe encje i ich relacje
Encje główne:
auth.users (wbudowana w Supabase): Zawiera id (UUID PRIMARY KEY), email (UNIQUE), hasło (hashowane bcrypt), created_at, updated_at. Używana do autentykacji; nie modyfikowana bezpośrednio poza SDK Supabase.
applications: id (UUID PRIMARY KEY), user_id (UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE), company_name (VARCHAR(255) NOT NULL), position_name (VARCHAR(255) NOT NULL), application_date (DATE NOT NULL), link (TEXT NULL), notes (TEXT NULL), status (ENUM('planned', 'sent', 'in_progress', 'interview', 'rejected', 'offer') NOT NULL), created_at (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP), updated_at (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP).
Relacje:
Jeden-do-wielu: auth.users (1) → applications (N) poprzez user_id. Zapewnia, że aplikacje są powiązane z użytkownikiem; kaskadowe usuwanie przy usuwaniu użytkownika (poprzez trigger w Supabase).
Brak innych relacji w MVP; status jest ENUM bez osobnej tabeli.
c. Ważne kwestie dotyczące bezpieczeństwa i skalowalności
Bezpieczeństwo: RLS włączone na applications z politykami: SELECT/INSERT/UPDATE/DELETE WHERE user_id = auth.uid(). Dla usuwania konta (US-005): Supabase trigger (np. na auth.users) kasuje applications kaskadowo po usunięciu użytkownika z auth.users. Hasła hashowane via Supabase; brak bezpośredniego dostępu do auth.users poza SDK. Zapobiega to wyciekom danych między użytkownikami.
Skalowalność i wydajność: Dla MVP (do 100 aplikacji/użytkownik) wystarczą indeksy: kompozytowe na (user_id, created_at DESC), (user_id, status), (user_id, application_date DESC) dla sortowania, filtrowania i statystyk (COUNT GROUP BY status). Brak partycjonowania; default status i walidacja daty w aplikacji, nie w DB. Trigger BEFORE UPDATE dla updated_at zapewnia audyt bez obciążenia frontendu. Oczekiwana skala: niskie obciążenie, zoptymalizowane zapytania per użytkownik.
</database_planning_summary>
<unresolved_issues>
Walidacja formatu email i hasła (z PRD: min. 8 znaków, potwierdzenie) jest obsługiwana w aplikacji i Supabase auth – upewnić się, że SDK to egzekwuje.
Usuwanie z auth.users wymaga custom triggera w Supabase (np. via Edge Function lub Database Trigger), bo bezpośredni FK CASCADE do auth.users może być ograniczony; przetestować.
</unresolved_issues>
</conversation_summary>