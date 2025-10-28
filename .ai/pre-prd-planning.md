Me: Jesteś doświadczonym menedżerem produktu, którego zadaniem jest pomoc w stworzeniu kompleksowego dokumentu wymagań projektowych (PRD) na podstawie dostarczonych informacji. Twoim celem jest wygenerowanie listy pytań i zaleceń, które zostaną wykorzystane w kolejnym promptowaniu do utworzenia pełnego PRD.

Prosimy o uważne zapoznanie się z poniższymi informacjami:

<project_description>
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

## Co NIE wchodzi w zakres MVP

1. Automatyczne importowanie stanu aplikacji (z email czy tez stron typu LinkedIn, Pracuj.pl)
2. Integracja z kalendarzem (np. Google Calendar, Outlook) do automatycznego zapisywania terminów rozmów.
3. System przypomnień i powiadomień (np. "czas na follow-up", "zbliża się rozmowa").
4. Przechowywanie i wersjonowanie dokumentów (np. wysłane CV, listy motywacyjne).
5. Dedykowane aplikacje mobilne (iOS/Android)
6. Funkcje AI (np. sugestie dopasowania CV do oferty, generowanie treści maili).


## Kryteria sukcesu

1. Aktywacja użytkowników: Osiągnięcie 50 zarejestrowanych użytkowników w pierwszym miesiącu po starcie.

2. Angażowanie (Engagement): Co najmniej 50% zarejestrowanych użytkowników dodało minimum 3 aplikacje o pracę w pierwszym tygodniu korzystania.

3. Retencja (Retention): 20% użytkowników wraca do aplikacji przynajmniej raz w tygodniu (Weekly Active Users), aby zaktualizować statusy swoich aplikacji.

4. Zebranie opinii: Uzyskanie co najmniej 10 merytorycznych opinii (feedbacku) od pierwszych użytkowników, które potwierdzą, że aplikacja rozwiązuje ich główny problem i wskażą najbardziej pożądane funkcje do dalszego rozwoju.
</project_description>

Przeanalizuj dostarczone informacje, koncentrując się na aspektach istotnych dla tworzenia PRD. Rozważ następujące kwestie:
<prd_analysis>
1. Zidentyfikuj główny problem, który produkt ma rozwiązać.
2. Określ kluczowe funkcjonalności MVP.
3. Rozważ potencjalne historie użytkownika i ścieżki korzystania z produktu.
4. Pomyśl o kryteriach sukcesu i sposobach ich mierzenia.
5. Oceń ograniczenia projektowe i ich wpływ na rozwój produktu.
</prd_analysis>

Na podstawie analizy wygeneruj listę 10 pytań i zaleceń w formie łączonej (pytanie + zalecenie). Powinny one dotyczyć wszelkich niejasności, potencjalnych problemów lub obszarów, w których potrzeba więcej informacji, aby stworzyć skuteczny PRD. Rozważ pytania dotyczące:

1. Szczegółów problemu użytkownika
2. Priorytetyzacji funkcjonalności
3. Oczekiwanego doświadczenia użytkownika
4. Mierzalnych wskaźników sukcesu
5. Potencjalnych ryzyk i wyzwań
6. Harmonogramu i zasobów

<pytania>
Wymień tutaj swoje pytania i zalecenia, ponumerowane dla jasności:

Przykładowo:
1. Czy już od startu projektu planujesz wprowadzenie płatnych subskrypcji?

Rekomendacja: Pierwszy etap projektu może skupić się na funkcjonalnościach darmowych, aby przyciągnąć użytkowników, a płatne funkcje można wprowadzić w późniejszym etapie.
</pytania>

Kontynuuj ten proces, generując nowe pytania i rekomendacje w oparciu o odpowiedzi użytkownika, dopóki użytkownik wyraźnie nie poprosi o podsumowanie.

Pamiętaj, aby skupić się na jasności, trafności i dokładności wyników. Nie dołączaj żadnych dodatkowych komentarzy ani wyjaśnień poza określonym formatem wyjściowym.

Pracę analityczną należy przeprowadzić w bloku myślenia. Końcowe dane wyjściowe powinny składać się wyłącznie z pytań i zaleceń i nie powinny powielać ani powtarzać żadnej pracy wykonanej w sekcji prd_analysis.

Agent: 
Jaka metoda rejestracji i logowania będzie wspierana w MVP? Czy oprócz standardowego e-maila i hasła planujemy logowanie przez dostawców zewnętrznych (np. Google, LinkedIn), aby przyspieszyć proces onboardingu użytkownika?

Zalecenie: Rekomenduję rozpoczęcie wyłącznie od rejestracji e-mail/hasło, aby zminimalizować złożoność implementacji i zależności zewnętrzne. Logowanie społecznościowe można dodać w kolejnej iteracji jako "fast-follow".

Główny pulpit ma wyświetlać aplikacje w formie listy. Czy ta lista powinna posiadać jakiekolwiek podstawowe funkcje sortowania (np. po dacie dodania) lub filtrowania (np. po statusie "Rozmowa")?

Zalecenie: Zalecam dodanie filtrowania przynajmniej po "Statusie aplikacji". Jest to kluczowe dla użytkowników z dużą liczbą (np. >20) wpisów, aby mogli szybko skupić się na najpilniejszych działaniach (np. rozmowach). Sortowanie można pominąć w MVP.

Czy zdefiniowane statusy aplikacji ("Zaplanowane do wysłania", "Wysłane", "W trakcie" itd.) są jedynymi dopuszczalnymi i są stałe (hardcoded)?

Zalecenie: W MVP zalecam, aby statusy były stałą, predefiniowaną listą (typu "enum"). Umożliwienie użytkownikom tworzenia własnych statusów znacząco zwiększa złożoność, co jest sprzeczne z ideą minimalnego produktu.

W jaki sposób wizualizujemy stronę ze statystykami? Czy wystarczy prosta lista (np. "Wysłane: 10", "Rozmowa: 2"), czy oczekujemy prostego wykresu (np. kołowego lub słupkowego), aby pokazać lejek?

Zalecenie: Dla MVP wystarczająca będzie prosta, tekstowa lista z liczbami dla każdego statusu. Jest to najszybsze do wdrożenia i w pełni realizuje wymaganie. Wykresy można dodać później jako ulepszenie.

Zakres MVP jasno wyklucza dedykowane aplikacje mobilne. Czy jednak wersja webowa ma być w pełni responsywna (RWD), aby zapewnić wygodne użytkowanie na przeglądarkach mobilnych?

Zalecenie: Aplikacja webowa musi być w pełni responsywna (mobile-first). Użytkownicy często chcą dodać notatki lub zaktualizować status zaraz po rozmowie kwalifikacyjnej, korzystając z telefonu.

Jak technicznie zamierzamy realizować zbieranie 10 merytorycznych opinii (kryterium sukcesu nr 4)? Czy planujemy wbudowany formularz, link do zewnętrznej ankiety (np. Tally/Google Forms), czy prośbę o kontakt mailowy?

Zalecenie: Zalecam dodanie stałego, prostego linku "Prześlij opinię" (np. w stopce lub menu użytkownika), który kieruje do prostego, zewnętrznego formularza. Pozwoli to na szybkie wdrożenie i łatwe gromadzenie danych bez budowania własnego mechanizmu.

Czy planujemy jakikolwiek minimalny onboarding dla nowego użytkownika, który loguje się po raz pierwszy i widzi pusty pulpit?

Zalecenie: Tak, pulpit dla nowego użytkownika nie może być pusty. Powinien zawierać tzw. "empty state" z jasnym wezwaniem do działania (CTA), np. "Nie masz jeszcze żadnych aplikacji. Kliknij 'Dodaj', aby rozpocząć śledzenie!".

Opisany jest proces dodawania i edycji aplikacji. A co z usuwaniem wpisów? Czy użytkownik może trwale usunąć aplikację ze swojego pulpitu?

Zalecenie: Użytkownik musi mieć możliwość usunięcia błędnie dodanej lub nieaktualnej aplikacji. Rekomenduję dodanie tej opcji w "Widoku szczegółów aplikacji" wraz z prostym modalem potwierdzającym ("Czy na pewno chcesz usunąć?").

W jaki sposób użytkownik zmienia status aplikacji? Czy musi wejść w "Widok szczegółów", czy powinien móc to zrobić szybciej, np. bezpośrednio z poziomu listy na pulpicie?

Zalecenie: Aby przyspieszyć główny przepływ pracy, rekomenduję umożliwienie zmiany statusu bezpośrednio z poziomu pulpitu (np. za pomocą menu rozwijanego przy każdym wpisie na liście). Wchodzenie w szczegóły tylko po to, by zmienić status, będzie frustrujące.

Kryterium sukcesu nr 1 to "50 zarejestrowanych użytkowników". Jak planujemy dotrzeć do tych pierwszych użytkowników (np. grupy na Facebooku, LinkedIn, fora dla poszukujących pracy)?

Zalecenie: Powinniśmy zdefiniować podstawową strategię "go-to-market" dla MVP. Rekomenduję skupienie się na 1-2 niszowych kanałach, np. konkretnych grupach na Facebooku lub Reddit (r/jobs), gdzie problem jest najczęściej dyskutowany, aby zebrać pierwszych, zaangażowanych testerów.

Me: 
1. Zacznijmy od zmiany hasła z poziomu ustawien konta dla zalogowanego uzytkownika
2. Opcja powinna byc dostepna w ustawieniach konta
3. Domyślnie sortowanie powinno być po dacie dodania aplikacji (od najnowszej)
4. Tak, uzytkownik moze modyfikowac nazwe firmy / nazwe stanowiska. 
5. Pola "Nazwa Firmy" i "Nazwa Stanowiska" sa wymagane - nie moga byc puste.
6. "Data złożenia aplikacji" wymagane pole. Jako input zastosujmy <input type="date"> (datepicker)
7. "Notatki" to proste pole typu textarea bez zadnej opcji formatowania
8. Nazwy Firmy, Nazwy Stanowiska oraz (potwierdzonego) rozwijanego menu do szybkiej zmiany Statusu. Pozostałe informacje (Link, Data, Notatki) powinny być dostępne po przejściu do szczegółów.
9. Stworzmy prosty endpoint ktory zwroci statystyki uzycia, dla Engagement zwrocmy liczbe uzytkownikow ktorzy maja 3 lub wiecej aplikacji, dla Retention sprawdzmy jaki % aplikacji zostal zaktualizowany podczas ostatnich 7 dni. Powinnismy nie brac pod uwage aplikacji ktore byly w stanach terminalnych 7 dni temu ( Odrzucono / Oferta ) gdyz nie ma to sensu.
10. Stały, górny pasek nawigacyjny (header), który zawierałby linki "Pulpit", "Statystyki" oraz ikonę profilu użytkownika. Kliknięcie ikony rozwijałoby menu z opcjami "Ustawienia Konta" i "Wyloguj".

---

Jesteś asystentem AI, którego zadaniem jest podsumowanie rozmowy na temat planowania PRD (Product Requirements Document) dla MVP i przygotowanie zwięzłego podsumowania dla następnego etapu rozwoju. W historii konwersacji znajdziesz następujące informacje:
1. Opis projektu
2. Zidentyfikowany problem użytkownika
3. Historia rozmów zawierająca pytania i odpowiedzi
4. Zalecenia dotyczące zawartości PRD

Twoim zadaniem jest:
1. Podsumować historię konwersacji, koncentrując się na wszystkich decyzjach związanych z planowaniem PRD.
2. Dopasowanie zaleceń modelu do odpowiedzi udzielonych w historii konwersacji. Zidentyfikuj, które zalecenia są istotne w oparciu o dyskusję.
3. Przygotuj szczegółowe podsumowanie rozmowy, które obejmuje:
   a. Główne wymagania funkcjonalne produktu
   b. Kluczowe historie użytkownika i ścieżki korzystania
   c. Ważne kryteria sukcesu i sposoby ich mierzenia
   d. Wszelkie nierozwiązane kwestie lub obszary wymagające dalszego wyjaśnienia
4. Sformatuj wyniki w następujący sposób:

<conversation_summary>
<decisions>
[Wymień decyzje podjęte przez użytkownika, ponumerowane].
</decisions>

<matched_recommendations>
[Lista najistotniejszych zaleceń dopasowanych do rozmowy, ponumerowanych]
</matched_recommendations>

<prd_planning_summary>
[Podaj szczegółowe podsumowanie rozmowy, w tym elementy wymienione w kroku 3].
</prd_planning_summary>

<unresolved_issues>
[Wymień wszelkie nierozwiązane kwestie lub obszary wymagające dalszych wyjaśnień, jeśli takie istnieją]
</unresolved_issues>
</conversation_summary>

Końcowy wynik powinien zawierać tylko treść w formacie markdown. Upewnij się, że Twoje podsumowanie jest jasne, zwięzłe i zapewnia cenne informacje dla następnego etapu tworzenia PRD.

Agent:
<conversation_summary> <decisions>

Uwierzytelnianie: Wdrożone zostanie logowanie i rejestracja (e-mail/hasło) oparte na tokenach JWT. Funkcjonalność "Zapomniałem hasła" (reset przez e-mail) jest poza zakresem MVP.

Zarządzanie kontem: Zalogowany użytkownik będzie miał dostęp do strony "Ustawienia Konta", z poziomu której będzie mógł zmienić swoje hasło oraz trwale usunąć swoje konto (wraz z potwierdzeniem).

Pulpit (Dashboard): Lista aplikacji będzie domyślnie sortowana po dacie dodania (od najnowszej). Lista będzie zawierać: Nazwę Firmy, Nazwę Stanowiska oraz menu rozwijane do szybkiej zmiany statusu.

Filtrowanie pulpitu: Pulpit będzie posiadał funkcjonalność filtrowania listy aplikacji na podstawie "Statusu".

Statusy: Lista statusów aplikacji (np. "Wysłane", "Rozmowa") będzie predefiniowana i stała (hardcoded) w MVP.

Tworzenie/Edycja Aplikacji: Użytkownik może dodawać nowe aplikacje oraz edytować wszystkie ich pola (Nazwa Firmy, Nazwa Stanowiska, Link, Data, Notatki, Status) po przejściu do widoku szczegółów.

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

Rejestracja (e-mail, hasło).

Logowanie (e-mail, hasło).

Wylogowanie.

Zarządzanie Kontem (dla zalogowanych):

Zmiana hasła (wymagane stare i nowe hasło).

Usunięcie konta (wymagane potwierdzenie hasłem, skutkuje trwałym usunięciem danych).

Pulpit (Dashboard):

Główny widok listy aplikacji.

Domyślne sortowanie: od najnowszej dodanej.

Filtrowanie listy po "Statusie".

Widok listy zawiera: Nazwę Firmy, Nazwę Stanowiska, rozwijane menu szybkiej zmiany Statusu.

"Empty state" (stan pusty) z CTA dla nowych użytkowników.

Zarządzanie Aplikacjami (CRUD):

Tworzenie: Formularz dodawania aplikacji (pola wymagane: Nazwa Firmy, Nazwa Stanowiska, Data złożenia; pola opcjonalne: Link, Notatki; Status ustawiany z predefiniowanej listy).

Odczyt: Widok listy (Pulpit) oraz Widok szczegółów.

Aktualizacja: Szybka zmiana statusu (z pulpitu) oraz pełna edycja (w widoku szczegółów).

Usuwanie: Możliwość usunięcia aplikacji (z pulpitu lub szczegółów) z modalem potwierdzającym.

Strona Statystyk:

Prosty widok tekstowy (np. "Wysłane: 10", "Rozmowa: 2") pokazujący liczbę aplikacji w każdym predefiniowanym statusie.

Nawigacja i UI:

Aplikacja w pełni responsywna (RWD).

Górny pasek nawigacyjny (Header) z linkami: "Pulpit", "Statystyki".

Ikona profilu użytkownika w Headerze, rozwijająca menu: "Ustawienia Konta", "Wyloguj".

Link do zbierania opinii (Google Forms).

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

<unresolved_issues>

Jaka jest domyślna wartość pola "Status" podczas tworzenia nowej aplikacji (np. "Zaplanowane do wysłania")?

W jaki sposób użytkownik nawiguje z pulpitu (listy) do "Widoku szczegółów" danej aplikacji (np. czy kliknięcie Nazwy Firmy/Stanowiska przenosi do szczegółów)?

Jaka jest walidacja pola "Link do ogłoszenia"? Czy akceptujemy dowolny tekst, czy wymagamy formatu URL? </unresolved_issues> </conversation_summary>