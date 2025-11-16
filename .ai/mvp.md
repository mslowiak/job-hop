# Aplikacja - JobHop (MVP)

## Główny problem

Osoby aktywnie poszukujące pracy mają problem z efektywnym zarządzaniem i śledzeniem statusu swoich licznych aplikacji o pracę. Proces ten jest obecnie rozproszony – kandydaci korzystają z arkuszy kalkulacyjnych, notatników, zakładek w przeglądarce lub polegają na własnej pamięci.

Prowadzi to do chaosu informacyjnego, pomyłek (np. zapomnienie o terminie rozmowy, pomylenie rekruterów), utraty ważnych linków do ofert oraz braku jasnego obrazu całego procesu rekrutacyjnego. Brakuje jednego, dedykowanego narzędzia, które centralizuje wszystkie te informacje w prosty i przejrzysty sposób.

## Najmniejszy zestaw funkcjonalności

1. Rejestracja i logowanie użytkownika (w celu zapewnienia prywatności danych).

2. Ręczne dodawanie nowej aplikacji do systemu. Minimalne wymagane pola to:
- Nazwa Firmy
- Nazwa Stanowiska
- Status aplikacji ("Zaplanowane do wysłania", "Wysłane", "W trakcie", "Rozmowa", "Odrzucone", "Oferta")

3. Główny pulpit (Dashboard) wyświetlający wszystkie dodane aplikacje w formie listy pozwalający na szybki przegląd sytuacji.

4. Widok szczegółów aplikacji, gdzie użytkownik może dodać i edytować podstawowe informacje:
- Link do ogłoszenia o pracę.
- Data złożenia aplikacji.
- Pole na notatki (np. imię rekrutera, uwagi po rozmowie).

5. Strona ze statystykami - jak wygląda aktualny przebieg poszukiwań pracy - ile aplikacji w jakich stanach

6. Codzienne wiadomości motywacyjne - wyświetlanie losowej wiadomości motywacyjnej na górze pulpitu, przypisanej użytkownikowi na cały dzień (w strefie UTC). Wybranej z predefiniowanej listy, z przygotowaniem do przyszłej generacji przez AI (OpenRouter).

## Co NIE wchodzi w zakres MVP

1. Automatyczne importowanie stanu aplikacji (z email czy tez stron typu LinkedIn, Pracuj.pl)
2. Integracja z kalendarzem (np. Google Calendar, Outlook) do automatycznego zapisywania terminów rozmów.
3. System przypomnień i powiadomień (np. "czas na follow-up", "zbliża się rozmowa").
4. Przechowywanie i wersjonowanie dokumentów (np. wysłane CV, listy motywacyjne).
5. Dedykowane aplikacje mobilne (iOS/Android)
6. Funkcje AI (np. sugestie dopasowania CV do oferty, generowanie treści maili). (Wyjątek: przygotowanie do generowania wiadomości motywacyjnych)

## Kryteria sukcesu

1. Angażowanie (Engagement): Co najmniej 50% zarejestrowanych użytkowników dodało minimum 3 aplikacje o pracę w pierwszym tygodniu korzystania.

2. Retencja (Retention): 20% użytkowników wraca do aplikacji przynajmniej raz w tygodniu (Weekly Active Users), aby zaktualizować statusy swoich aplikacji.

3. Zebranie opinii: Uzyskanie co najmniej 10 merytorycznych opinii (feedbacku) od pierwszych użytkowników, które potwierdzą, że aplikacja rozwiązuje ich główny problem i wskażą najbardziej pożądane funkcje do dalszego rozwoju.