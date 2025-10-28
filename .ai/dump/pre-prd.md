<conversation_summary> <decisions>

Uwierzytelnianie: Wdrożone zostanie logowanie i rejestracja (e-mail/hasło) oparte na tokenach JWT. Funkcjonalność "Zapomniałem hasła" (reset przez e-mail) jest poza zakresem MVP.

Zarządzanie kontem: Zalogowany użytkownik będzie miał dostęp do strony "Ustawienia Konta", z poziomu której będzie mógł zmienić swoje hasło oraz trwale usunąć swoje konto (wraz z potwierdzeniem).

Pulpit (Dashboard): Lista aplikacji będzie domyślnie sortowana po dacie dodania (od najnowszej). Lista będzie zawierać: Nazwę Firmy, Nazwę Stanowiska oraz menu rozwijane do szybkiej zmiany statusu.

Filtrowanie pulpitu: Pulpit będzie posiadał funkcjonalność filtrowania listy aplikacji na podstawie "Statusu".

Statusy: Lista statusów aplikacji będzie predefiniowana i stała (hardcoded) w MVP. Lista wszystkich statusów: "Zaplanowane do wysłania", "Wysłane", "W trakcie", "Rozmowa", "Odrzucone", "Oferta".

Tworzenie/Edycja Aplikacji: Użytkownik może dodawać nowe aplikacje oraz edytować wszystkie ich pola (Nazwa Firmy, Nazwa Stanowiska, Link do ogłoszenia o pracę, Data złożenia aplikacji, Notatki, Status) po przejściu do widoku szczegółów.

Walidacja formularza: Pola "Nazwa Firmy", "Nazwa Stanowiska" oraz "Data złożenia aplikacji" są polami wymaganymi podczas dodawania/edycji.

Pola (Input): Pole "Data złożenia aplikacji" będzie używać natywnego <input type="date">. Pole "Notatki" będzie prostym polem <textarea> bez formatowania.

Usuwanie aplikacji: Użytkownik może usunąć pojedynczą aplikację, co zostanie poprzedzone modalem potwierdzającym.

Statystyki (Strona): Strona statystyk będzie wyświetlać prostą, tekstową listę liczbową aplikacji w podziale na statusy.

Statystyki (Mierzenie): Utworzony zostanie endpoint backendowy do mierzenia metryk:

Zaangażowanie: Zwróci liczbę użytkowników, którzy dodali 3 lub więcej aplikacji.

Retencja: Zwróci procent aplikacji, które zostały zaktualizowane w ciągu ostatnich 7 dni, z wyłączeniem aplikacji będących w statusach terminalnych (Odrzucone, Oferta) 7 dni temu.

Nawigacja: Aplikacja będzie posiadać stały, górny pasek nawigacyjny (header) z linkami "Pulpit" i "Statystyki" oraz ikonę profilu użytkownika (z menu rozwijanym "Ustawienia Konta" i "Wyloguj").

UI/UX: Aplikacja musi być w pełni responsywna (RWD). Nowi użytkownicy zobaczą na pulpicie "empty state" z wezwaniem do działania (CTA).

Feedback: W aplikacji znajdzie się link do zewnętrznego formularza Google w celu zbierania opinii.

</decisions>

<matched_recommendations>

Rozpoczęcie wyłącznie od rejestracji e-mail/hasło w celu minimalizacji złożoności MVP.

Implementacja strony "Ustawienia Konta" jako miejsca dla funkcji "Zmień hasło" i "Usuń konto" (z potwierdzeniem).

Umożliwienie zmiany statusu aplikacji bezpośrednio z poziomu pulpitu (listy), aby przyspieszyć główny przepływ pracy.

Implementacja w pełni responsywnego interfejsu (mobile-first), aby umożliwić wygodne korzystanie na urządzeniach mobilnych.

Zastosowanie prostego <textarea> dla notatek (bez formatowania) oraz natywnego <input type="date"> dla daty, aby przyspieszyć wdrożenie.

Wyświetlanie "empty state" dla nowych użytkowników z jasnym wezwaniem do działania (CTA).

Zapewnienie możliwości usuwania aplikacji wraz z modalem potwierdzającym.

Użycie prostego, zewnętrznego formularza (Google Forms) do zbierania opinii, zamiast budowania wewnętrznego mechanizmu. </matched_recommendations>

<prd_planning_summary>

Podsumowanie planowania PRD dla JobHop (MVP)
Celem MVP jest rozwiązanie problemu chaotycznego śledzenia aplikacji o pracę poprzez centralizację informacji w jednym narzędziu. Poniższe podsumowanie określa zakres funkcjonalny na podstawie przeprowadzonych ustaleń.

1. Główne Wymagania Funkcjonalne
System Uwierzytelniania (JWT):
- Rejestracja (e-mail, hasło).
- Logowanie (e-mail, hasło).
- Wylogowanie

Zarządzanie Kontem (dla zalogowanych):
- Zmiana hasła (wymagane stare i nowe hasło).
- Usunięcie konta (wymagane potwierdzenie hasłem, skutkuje trwałym usunięciem danych).

Pulpit (Dashboard):
- Główny widok listy aplikacji.
- Domyślne sortowanie: od najnowszej dodanej aplikacji.
- Filtrowanie listy po "Statusie".
- Widok listy zawiera: Nazwę Firmy, Nazwę Stanowiska, rozwijane menu szybkiej zmiany Statusu.
- "Empty state" (stan pusty) z CTA dla nowych użytkowników.

Zarządzanie Aplikacjami (CRUD):

- Tworzenie: Formularz dodawania aplikacji (pola wymagane: Nazwa Firmy, Nazwa Stanowiska, Data złożenia; pola opcjonalne: Link, Notatki; Status ustawiany z predefiniowanej listy). Domyślny status to "Wysłane". 

- Odczyt: Widok listy (Pulpit) oraz Widok szczegółów.

- Aktualizacja: Szybka zmiana statusu (z pulpitu) oraz pełna edycja (w widoku szczegółów).

- Usuwanie: Możliwość usunięcia aplikacji (z pulpitu lub szczegółów) z modalem potwierdzającym.

Strona Statystyk:
- Prosty widok tekstowy (np. "Wysłane: 10", "Rozmowa: 2") pokazujący liczbę aplikacji w każdym predefiniowanym statusie.

Nawigacja i UI:
- Aplikacja w pełni responsywna (RWD).
- Górny pasek nawigacyjny (Header) z linkami: "Pulpit", "Statystyki".
- Ikona profilu użytkownika w Headerze, rozwijająca menu: "Ustawienia Konta", "Wyloguj".
- Kliknięcie w wiersz aplikacji na stronie "Pulpit" przenosi do widoku szczegółów

Link do zbierania opinii (Google Forms) dostępny na głównej stronie "Pulpit" w prawym rogu.

2. Kluczowe Historie Użytkownika (User Stories)
Jako nowy użytkownik, chcę móc szybko założyć konto używając mojego e-maila i hasła, aby móc zacząć śledzić moje aplikacje.

Jako użytkownik, chcę móc dodać nową aplikację o pracę, podając co najmniej Nazwę Firmy, Stanowisko i Datę złożenia.

Jako użytkownik, chcę widzieć wszystkie moje aplikacje na jednym pulpicie, posortowane od najnowszej, abym mógł łatwo zarządzać procesem.

Jako użytkownik, chcę móc szybko zmienić status mojej aplikacji (np. z "Wysłane" na "Rozmowa") bezpośrednio z poziomu pulpitu.

Jako użytkownik, chcę móc wejść w szczegóły aplikacji, aby dodać notatki (np. imię rekrutera) lub edytować błędnie wprowadzoną nazwę firmy.

Jako użytkownik, chcę móc odfiltrować aplikacje, które są np. tylko na etapie "Rozmowa", aby skupić się na przygotowaniach.

Jako użytkownik, chcę zobaczyć proste podsumowanie moich działań (ile mam ofert, ile odrzuconych), aby ocenić skuteczność poszukiwań.

Jako użytkownik, chcę mieć możliwość usunięcia aplikacji, która jest już nieaktualna lub została dodana przez pomyłkę.

Jako użytkownik, chcę mieć dostęp do ustawień konta, aby zmienić hasło lub usunąć konto, gdy znajdę pracę.

3. Kryteria Sukcesu i Mierzenie
Zaangażowanie (Engagement): Cel: 50% zarejestrowanych użytkowników dodało minimum 3 aplikacje o pracę.
Sposób mierzenia: Endpoint backendowy zliczający (Liczba użytkowników z >= 3 aplikacjami) / (Całkowita liczba użytkowników).

Retencja (Retention): Cel: 20% użytkowników wraca do aplikacji przynajmniej raz w tygodniu (WAU), aby zaktualizować statusy.
Sposób mierzenia: Endpoint backendowy obliczający (Liczba unikalnych aplikacji zaktualizowanych w ciągu 7 dni) / (Liczba aplikacji niebędących w stanie terminalnym 7 dni temu).

Opinie (Feedback): Cel: Uzyskanie co najmniej 10 merytorycznych opinii przez formularz Google.
Sposób mierzenia: Ręczna analiza odpowiedzi w Google Forms.

</prd_planning_summary>
</conversation_summary>