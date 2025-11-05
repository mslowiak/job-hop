# Dokument wymagań produktu (PRD) - JobHop

## 1. Przegląd produktu

JobHop to aplikacja internetowa zaprojektowana, aby pomóc osobom aktywnie poszukującym pracy w centralizacji, zarządzaniu i śledzeniu statusu swoich aplikacji o pracę. Celem produktu w wersji MVP (Minimum Viable Product) jest dostarczenie kluczowego narzędzia, które zastąpi rozproszone metody, takie jak arkusze kalkulacyjne, notatniki czy zakładki w przeglądarce. Aplikacja skupia się na prostocie i przejrzystości, umożliwiając użytkownikom ręczne dodawanie aplikacji, śledzenie ich statusów na pulpicie nawigacyjnym oraz analizę podstawowych statystyk dotyczących procesu rekrutacyjnego.

## 2. Problem użytkownika

Osoby aktywnie poszukujące pracy mają problem z efektywnym zarządzaniem i śledzeniem statusu swoich licznych aplikacji o pracę. Proces ten jest obecnie rozproszony, co prowadzi do chaosu informacyjnego, pomyłek (np. zapomnienie o terminie rozmowy, pomylenie rekruterów), utraty ważnych linków do ofert oraz braku jasnego obrazu całego procesu rekrutacyjnego. Brakuje jednego, dedykowanego narzędzia, które centralizuje wszystkie te informacje w prosty i przejrzysty sposób.

## 3. Wymagania funkcjonalne

### 3.1. Uwierzytelnianie i Zarządzanie Kontem
- Użytkownicy mogą założyć konto za pomocą adresu e-mail i hasła.
- Uwierzytelnianie oparte jest na tokenach JWT.
- Zalogowani użytkownicy mają dostęp do strony "Ustawienia Konta".
- Użytkownicy mogą zmienić swoje hasło po podaniu starego i nowego hasła.
- Użytkownicy mogą trwale usunąć swoje konto wraz ze wszystkimi danymi po potwierdzeniu operacji hasłem.
- Sesja użytkownika wygasa, a wylogowanie następuje automatycznie lub manualnie.

### 3.2. Zarządzanie Aplikacjami (CRUD)
- Użytkownicy mogą ręcznie dodawać nową aplikację o pracę poprzez dedykowany formularz.
- Pola formularza to: Nazwa Firmy, Nazwa Stanowiska, Data złożenia aplikacji, Link do ogłoszenia, Notatki, Status.
- Pola "Nazwa Firmy", "Nazwa Stanowiska", "Status" i "Data złożenia aplikacji" są wymagane.
- Status aplikacji jest wybierany z predefiniowanej, stałej listy: "Zaplanowane do wysłania", "Wysłane", "W trakcie", "Rozmowa", "Odrzucone", "Oferta". Domyślnym statusem przy tworzeniu jest "Wysłane".
- Użytkownicy mogą przeglądać wszystkie dodane aplikacje w formie listy na głównym pulpicie.
- Użytkownicy mogą wyświetlić widok szczegółowy każdej aplikacji, klikając na nią na liście.
- Użytkownicy mogą edytować wszystkie pola istniejącej aplikacji w widoku szczegółowym.
- Użytkownicy mogą usunąć pojedynczą aplikację, co jest poprzedzone modalem potwierdzającym.

### 3.3. Pulpit (Dashboard)
- Pulpit jest głównym widokiem po zalogowaniu, wyświetlającym listę wszystkich aplikacji.
- Aplikacje są domyślnie sortowane od najnowszej do najstarszej (wg daty dodania).
- Lista na pulpicie zawiera kolumny: Nazwa Firmy, Nazwa Stanowiska oraz menu do szybkiej zmiany statusu.
- Użytkownicy mogą filtrować listę aplikacji na podstawie ich statusu.
- Dla nowych użytkowników, którzy nie dodali jeszcze żadnej aplikacji, wyświetlany jest "empty state" z wezwaniem do działania (CTA) zachęcającym do dodania pierwszej aplikacji.

### 3.4. Strona Statystyk
- Dedykowana strona "Statystyki" jest dostępna dla zalogowanych użytkowników.
- Strona wyświetla prostą, tekstową listę zliczającą liczbę aplikacji w każdym z predefiniowanych statusów (np. "Wysłane: 10", "Rozmowa: 2").

### 3.5. Nawigacja i Interfejs Użytkownika
- Aplikacja posiada stały, górny pasek nawigacyjny (header).
- W nawigacji znajdują się linki do "Pulpitu" i "Statystyk".
- W nagłówku znajduje się ikona profilu użytkownika, która rozwija menu z opcjami "Ustawienia Konta" i "Wyloguj".
- Cały interfejs aplikacji jest w pełni responsywny (RWD), zapewniając poprawne działanie na urządzeniach mobilnych i desktopowych.

### 3.6. Zbieranie Opinii
- W aplikacji, w widocznym miejscu (np. na pulpicie), znajduje się stały link do zewnętrznego formularza Google w celu zbierania opinii od użytkowników.

## 4. Granice produktu

Następujące funkcjonalności nie wchodzą w zakres wersji MVP:
- Automatyczne importowanie stanu aplikacji z zewnętrznych źródeł (np. e-mail, portale pracy jak LinkedIn, Pracuj.pl).
- Integracja z kalendarzami (np. Google Calendar, Outlook) do automatycznego zapisywania terminów rozmów.
- System przypomnień i powiadomień (np. o zbliżającej się rozmowie, o potrzebie wysłania follow-up).
- Przechowywanie i wersjonowanie dokumentów aplikacyjnych (np. CV, listy motywacyjne).
- Dedykowane aplikacje mobilne na platformy iOS/Android.
- Funkcjonalność "Zapomniałem hasła" z opcją resetu przez e-mail.
- Funkcje oparte na AI (np. sugestie dopasowania CV do oferty, generowanie treści maili).

## 5. Historyjki użytkowników

### Uwierzytelnianie i Zarządzanie Kontem

- ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto za pomocą e-maila i hasła, aby rozpocząć śledzenie moich aplikacji o pracę.
- Kryteria akceptacji:
  - 1. Formularz rejestracji zawiera pola: "Adres e-mail", "Hasło", "Potwierdź hasło".
  - 2. Walidacja sprawdza, czy podany e-mail ma poprawny format.
  - 3. Walidacja sprawdza, czy hasła w obu polach są identyczne.
  - 4. Walidacja sprawdza, czy hasło spełnia minimalne wymagania bezpieczeństwa (np. 8 znaków).
  - 5. System uniemożliwia rejestrację na e-mail, który już istnieje w bazie danych.
  - 6. Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany na pulpit.

- ID: US-002
- Tytuł: Logowanie do aplikacji
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się do aplikacji przy użyciu mojego e-maila i hasła, aby uzyskać dostęp do mojego pulpitu.
- Kryteria akceptacji:
  - 1. Formularz logowania zawiera pola "Adres e-mail" i "Hasło".
  - 2. Po pomyślnym zalogowaniu użytkownik jest przekierowany na swój pulpit.
  - 3. W przypadku podania błędnego e-maila lub hasła, wyświetlany jest stosowny komunikat o błędzie.
  - 4. Użytkownik nie może uzyskać dostępu do stron wymagających logowania bez aktywnej sesji.

### Zarządzanie Aplikacjami

- ID: US-006
- Tytuł: Dodawanie nowej aplikacji o pracę
- Opis: Jako użytkownik, chcę móc dodać nową aplikację o pracę, podając co najmniej nazwę firmy, stanowisko i datę złożenia, aby śledzić ją w systemie.
- Kryteria akceptacji:
  - 1. Na pulpicie znajduje się przycisk "Dodaj aplikację", który prowadzi do formularza tworzenia.
  - 2. Formularz zawiera pola: "Nazwa Firmy", "Nazwa Stanowiska", "Data złożenia aplikacji", "Link do ogłoszenia", "Notatki" i pole wyboru "Status".
  - 3. Walidacja formularza uniemożliwia jego wysłanie bez wypełnienia pól "Nazwa Firmy", "Nazwa Stanowiska" i "Data złożenia aplikacji".
  - 4. Pole daty używa natywnego widgetu `<input type="date">`.
  - 5. Domyślnym statusem dla nowej aplikacji jest "Wysłane".
  - 6. Po pomyślnym dodaniu aplikacji użytkownik jest przekierowywany na pulpit, gdzie nowa aplikacja jest widoczna na górze listy.

- ID: US-007
- Tytuł: Wyświetlanie listy aplikacji na pulpicie
- Opis: Jako użytkownik, chcę widzieć wszystkie moje aplikacje na jednym pulpicie, posortowane od najnowszej, abym mógł łatwo zarządzać procesem.
- Kryteria akceptacji:
  - 1. Pulpit wyświetla listę wszystkich aplikacji dodanych przez użytkownika.
  - 2. Każdy wiersz na liście pokazuje co najmniej "Nazwę Firmy", "Nazwę Stanowiska" oraz menu do zmiany statusu.
  - 3. Aplikacje są domyślnie posortowane malejąco według daty dodania.
  - 4. Kliknięcie w dowolny wiersz aplikacji przenosi do widoku szczegółów tej aplikacji.

- ID: US-008
- Tytuł: Wyświetlanie pustego stanu na pulpicie
- Opis: Jako nowy użytkownik, który nie dodał jeszcze żadnej aplikacji, chcę zobaczyć informację o pustym stanie i wezwanie do działania, abym wiedział, co robić dalej.
- Kryteria akceptacji:
  - 1. Jeśli użytkownik nie ma żadnych aplikacji, pulpit zamiast listy wyświetla komunikat informujący o braku danych.
  - 2. W komunikacie znajduje się wyraźny przycisk lub link (CTA), który przenosi do formularza dodawania nowej aplikacji.

- ID: US-009
- Tytuł: Wyświetlanie szczegółów aplikacji
- Opis: Jako użytkownik, chcę móc wejść w szczegóły aplikacji, aby zobaczyć wszystkie zapisane informacje, takie jak link do ogłoszenia czy notatki.
- Kryteria akceptacji:
  - 1. Widok szczegółów wyświetla wszystkie pola aplikacji: Nazwa Firmy, Nazwa Stanowiska, Data złożenia aplikacji, Link do ogłoszenia, Notatki, Status.
  - 2. W widoku szczegółów znajduje się przycisk "Edytuj", który pozwala na modyfikację danych.
  - 3. W widoku szczegółów znajduje się przycisk "Usuń".

- ID: US-010
- Tytuł: Edycja istniejącej aplikacji
- Opis: Jako użytkownik, chcę móc edytować szczegóły aplikacji, aby poprawić błędy lub dodać nowe informacje, np. notatki po rozmowie.
- Kryteria akceptacji:
  - 1. Po kliknięciu przycisku "Edytuj" w widoku szczegółów, pola stają się edytowalne.
  - 2. Użytkownik może zmienić wartość każdego pola.
  - 3. Zapisanie zmian aktualizuje dane aplikacji w systemie.
  - 4. Walidacja pól wymaganych jest aktywna również podczas edycji.

- ID: US-011
- Tytuł: Szybka zmiana statusu aplikacji z pulpitu
- Opis: Jako użytkownik, chcę móc szybko zmienić status mojej aplikacji (np. z "Wysłane" na "Rozmowa") bezpośrednio z poziomu pulpitu.
- Kryteria akceptacji:
  - 1. W każdym wierszu na liście aplikacji znajduje się menu rozwijane (dropdown) z listą wszystkich dostępnych statusów.
  - 2. Wybranie nowego statusu z listy natychmiast aktualizuje status aplikacji w bazie danych bez przeładowania strony.
  - 3. Wizualne potwierdzenie zmiany jest widoczne na liście.

- ID: US-012
- Tytuł: Usuwanie aplikacji
- Opis: Jako użytkownik, chcę mieć możliwość usunięcia aplikacji, która jest już nieaktualna lub została dodana przez pomyłkę.
- Kryteria akceptacji:
  - 1. Przycisk usuwania jest dostępny w widoku szczegółów aplikacji.
  - 2. Kliknięcie przycisku "Usuń" wyświetla modal z prośbą o potwierdzenie ("Czy na pewno chcesz usunąć tę aplikację?").
  - 3. Dopiero po potwierdzeniu w modalu aplikacja jest trwale usuwana.
  - 4. Po usunięciu użytkownik jest przekierowywany na pulpit.

### Funkcje dodatkowe

- ID: US-013
- Tytuł: Filtrowanie aplikacji po statusie
- Opis: Jako użytkownik, chcę móc odfiltrować aplikacje, które są np. tylko na etapie "Rozmowa", aby skupić się na przygotowaniach.
- Kryteria akceptacji:
  - 1. Na pulpicie znajduje się element UI (np. dropdown), który pozwala na filtrowanie listy aplikacji po statusie.
  - 2. Wybranie statusu z filtra powoduje wyświetlenie na liście tylko tych aplikacji, które mają dany status.
  - 3. Istnieje opcja "Wszystkie", aby zresetować filtr i pokazać wszystkie aplikacje.

- ID: US-014
- Tytuł: Przeglądanie statystyk aplikacji
- Opis: Jako użytkownik, chcę zobaczyć proste podsumowanie moich działań (ile mam ofert, ile odrzuconych), aby ocenić skuteczność poszukiwań.
- Kryteria akceptacji:
  - 1. W głównej nawigacji znajduje się link "Statystyki".
  - 2. Strona statystyk wyświetla listę wszystkich statusów wraz z liczbą aplikacji przypisanych do każdego z nich.
  - 3. Dane są aktualizowane w czasie rzeczywistym wraz ze zmianami na pulpicie.

- ID: US-015
- Tytuł: Nawigacja po aplikacji
- Opis: Jako użytkownik, chcę mieć łatwy dostęp do wszystkich głównych sekcji aplikacji poprzez stały pasek nawigacyjny.
- Kryteria akceptacji:
  - 1. Pasek nawigacyjny jest widoczny na wszystkich podstronach po zalogowaniu.
  - 2. Pasek zawiera linki do "Pulpitu" i "Statystyk".
  - 3. Pasek zawiera menu użytkownika z opcjami "Ustawienia Konta" i "Wyloguj".
  - 4. Nawigacja jest w pełni responsywna i użyteczna na urządzeniach mobilnych.

## 6. Metryki sukcesu

- 1. Angażowanie (Engagement)
  - Cel: Co najmniej 50% zarejestrowanych użytkowników dodało minimum 3 aplikacje o pracę w pierwszym tygodniu korzystania.
  - Sposób mierzenia: Endpoint backendowy zliczający stosunek liczby użytkowników z 3 lub więcej aplikacjami do całkowitej liczby użytkowników.

- 2. Retencja (Retention)
  - Cel: 20% użytkowników wraca do aplikacji przynajmniej raz w tygodniu (Weekly Active Users), aby zaktualizować statusy swoich aplikacji.
  - Sposób mierzenia: Endpoint backendowy obliczający stosunek liczby unikalnych aplikacji zaktualizowanych w ciągu ostatnich 7 dni do liczby aplikacji, które 7 dni temu nie były w stanie terminalnym ("Odrzucone", "Oferta").

- 3. Zebranie opinii (Feedback)
  - Cel: Uzyskanie co najmniej 10 merytorycznych opinii od pierwszych użytkowników poprzez zewnętrzny formularz.
  - Sposób mierzenia: Ręczna analiza odpowiedzi zebranych w formularzu Google.
