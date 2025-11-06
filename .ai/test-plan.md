[7 tools called]

# Plan Testów dla Aplikacji JobHop

## 1. Wprowadzenie i Cele Testowania

Plan testów dla aplikacji JobHop, webowej platformy do zarządzania aplikacjami o pracę, został opracowany w celu zapewnienia wysokiej jakości oprogramowania, zgodności z wymaganiami MVP oraz minimalizacji ryzyka błędów w produkcji. Aplikacja opiera się na stosie Astro 5 z React 19, TypeScript 5, Tailwind 4, Shadcn/ui oraz Supabase jako backendzie (PostgreSQL z uwierzytelnianiem JWT). Cele testowania obejmują:

- Weryfikację poprawności kluczowych funkcjonalności, takich jak uwierzytelnianie, CRUD aplikacji o pracę, dashboard i statystyki.
- Zapewnienie bezpieczeństwa danych użytkownika i zgodności z RLS (Row Level Security) w Supabase.
- Sprawdzenie responsywności interfejsu użytkownika oraz kompatybilności z różnymi urządzeniami i przeglądarkami.
- Identyfikację i eliminację błędów w integracji frontend-backend, z uwzględnieniem SSR (Server-Side Rendering) w Astro.
- Osiągnięcie co najmniej 80% pokrycia kodu testami jednostkowymi dla krytycznych modułów (np. ApplicationService, API endpoints).

Testy skupiają się na prostocie i przejrzystości, odzwierciedlając filozofię MVP projektu, z priorytetem na ścieżki użytkownika (user flows) związane z dodawaniem i śledzeniem aplikacji.

## 2. Zakres Testów

Zakres obejmuje wszystkie moduły aplikacji zdefiniowane w strukturze repozytorium:

- **Frontend**: Komponenty React (np. ApplicationList, AddApplicationForm, AuthForm), strony Astro (dashboard.astro, index.astro, auth/login.astro), layouty (MainLayout.astro) oraz hooki (useApplications, useApplicationStats).
- **Backend**: API endpoints (/api/applications, /api/auth), middleware uwierzytelniające, serwisy (ApplicationService w src/lib/services).
- **Integracja**: Połączenie z Supabase (autentykacja, zapytania do tabeli `applications`), walidacja danych (Zod schemas).
- **UI/UX**: Responsywność (mobile/desktop), dostępność (WCAG 2.1), interakcje (dropdowny statusu, formularze).
- **Wykluczenia**: Funkcje poza MVP, takie jak integracje AI (Openrouter.ai), automatyczne importy aplikacji czy aplikacje mobilne. Testy nie obejmują load testing dla skalowania poza podstawowe scenariusze.

Testy będą przeprowadzane na środowiskach development, staging i production-like, z fokusem na dane testowe symulujące realne aplikacje o pracę (np. 50+ wpisów).

## 3. Typy Testów do Przeprowadzenia

- **Testy Jednostkowe**: Weryfikacja pojedynczych funkcji/komponentów (np. walidacja formularza w AddApplicationForm, metody ApplicationService jak createApplication). Pokrycie: 80% dla TypeScript/React, 70% dla Astro.
- **Testy Integracyjne**: Sprawdzenie interakcji modułów (np. API endpoint /api/applications z Supabase, middleware auth z sesjami JWT).
- **Testy End-to-End (E2E)**: Symulacja pełnych flow użytkownika (np. rejestracja → dodanie aplikacji → aktualizacja statusu → logout) za pomocą narzędzi jak Playwright.
- **Testy Wydajnościowe**: Podstawowe benchmarki (np. czas ładowania dashboardu dla 100 aplikacji, responsywność SSR w Astro).
- **Testy Bezpieczeństwa**: Weryfikacja RLS w Supabase, ochrona przed XSS/CSRF, walidacja tokenów JWT.
- **Testy Dostępności i Responsywności**: Audyt WCAG (np. ARIA labels w Shadcn/ui), testy na urządzeniach (Chrome, Safari, Firefox; iOS/Android).
- **Testy Snapshot**: Dla komponentów UI w React, aby wykryć regresje wizualne spowodowane Tailwind.

Testy będą automatyczne (CI/CD via GitHub Actions) z uzupełnieniem manualnymi dla UX.

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

### Uwierzytelnianie i Zarządzanie Kontem
- TC-001: Rejestracja nowego użytkownika (poprawne dane, email unikalny) – oczekiwany: sukces, redirect do dashboardu.
- TC-002: Logowanie z poprawnymi/niewłaściwymi danymi – oczekiwany: sukces/błąd 401.
- TC-003: Zmiana hasła (z aktualnym hasłem) – oczekiwany: sukces, wylogowanie.
- TC-004: Usunięcie konta (z potwierdzeniem hasłem) – oczekiwany: usunięcie danych, wylogowanie.
- TC-005: Edge case: Wygaśnięcie sesji JWT – oczekiwany: redirect do login.

### Zarządzanie Aplikacjami (CRUD)
- TC-006: Dodanie nowej aplikacji (wszystkie pola wymagane: company_name, position_name, application_date, status) – oczekiwany: wpis w DB, UI update.
- TC-007: Pobranie listy aplikacji (z filtrem statusu, paginacja) – oczekiwany: sortowanie DESC po created_at, RLS ogranicza do user_id.
- TC-008: Edycja aplikacji (update statusu/linku) – oczekiwany: partial update, optymistyczne UI.
- TC-009: Usunięcie aplikacji – oczekiwany: usunięcie z DB, potwierdzenie modalem.
- TC-010: Edge case: Próba dostępu do obcej aplikacji – oczekiwany: 403 Forbidden.

### Dashboard i Statystyki
- TC-011: Wyświetlenie dashboardu (pusta lista, z danymi, filtr statusu) – oczekiwany: empty state, sortable table.
- TC-012: Aktualizacja statusu via dropdown – oczekiwany: API call, realtime UI refresh.
- TC-013: Strona statystyk (count po statusach) – oczekiwany: dokładne liczniki, total sum.
- TC-014: Responsywność na mobile (table → cards) – oczekiwany: brak overflow, touch-friendly.

### Błędy i Edge Cases
- TC-015: Walidacja formularza (brakujące pola, invalid date) – oczekiwany: błędy Zod, user-friendly messages.
- TC-016: Brak połączenia z Supabase – oczekiwany: fallback error, retry mechanism.

## 5. Środowisko Testowe

- **Development**: Lokalne (localhost:4321), Supabase lokalny (docker-compose) lub cloud dev instance.
- **Staging**: Wersja production-like na DigitalOcean, z mockowanymi danymi (50+ aplikacji testowych).
- **Production**: Monitorowanie post-deployment via GitHub Actions.
- Konfiguracja: Node.js 20+, PostgreSQL via Supabase, przeglądarki: Chrome 120+, Safari 17+, Firefox 115+; urządzenia: Desktop (1920x1080), Mobile (iPhone 14, Galaxy S21).
- Dane testowe: Faker.js do generowania (firmy, stanowiska), separacja baz (test_db vs prod_db).

## 6. Narzędzia do Testowania

- **Jednostkowe/Integracyjne**: Vitest/Jest dla TypeScript/React, @testing-library/react dla komponentów, Supabase test utils (mock client).
- **E2E**: Playwright (dla Astro SSR, cross-browser), z integracją Supabase.
- **Wydajnościowe**: Lighthouse (wbudowane w Chrome DevTools), Artillery dla API load.
- **Bezpieczeństwa**: OWASP ZAP dla skanowania, Supabase dashboard dla RLS verification.
- **Dostępność**: Axe-core (w Playwright), WAVE tool.
- **CI/CD**: GitHub Actions (vitest run, playwright test), z raportami w Markdown/JSON.
- **Inne**: Zod dla walidacji, Storybook dla izolowanego testowania UI komponentów Shadcn.

## 7. Harmonogram Testów

- **Tydzień 1 (Przygotowanie)**: Konfiguracja narzędzi, pisanie testów jednostkowych (ApplicationService, API).
- **Tydzień 2 (Core Features)**: Testy integracyjne auth/CRUD, E2E dla dashboardu.
- **Tydzień 3 (UI/Edge Cases)**: Testy responsywności, dostępności, snapshot; manualne UX review.
- **Tydzień 4 (Wydajność i Regression)**: Load tests, pełne E2E, integracja z CI/CD.
- **Cykliczne**: Regression tests po każdym PR, full suite przed release (co 2 tygodnie).
- Całkowity czas: 4 tygodnie dla początkowego cyklu, ongoing w development.

## 8. Kryteria Akceptacji Testów

- 100% testów E2E dla critical paths (auth, CRUD) przechodzi bez błędów.
- Pokrycie kodu: ≥80% dla services/API, ≥70% dla komponentów React.
- Brak krytycznych błędów bezpieczeństwa (np. auth bypass <1%).
- Czas odpowiedzi API <200ms dla standardowych zapytań, strona ładuje się <3s.
- Responsywność: 100% test cases pass na mobile/desktop.
- Raporty: Zero P0/P1 błędów przed deployment; wszystkie testy green w CI.
- Użytkownik: Brak regresji w flow (np. dodanie aplikacji nie crashuje dashboardu).

## 9. Role i Odpowiedzialności w Procesie Testowania

- **QA Engineer (główny)**: Tworzenie i utrzymanie testów, raportowanie błędów, audyty.
- **Developer**: Pisanie testów jednostkowych w ramach TDD, fix błędów z testów.
- **Product Owner**: Definiowanie priorytetów testowych, walidacja UX scenarios.
- **DevOps**: Konfiguracja CI/CD (GitHub Actions), środowisk staging/prod.
- **Zespół**: Code review testów w PR, manual testing dla nowych features.
- Współpraca: Codzienne stand-upy, tool Slack/Jira dla tracking.

## 10. Procedury Raportowania Błędów

- **Rejestracja**: Używać GitHub Issues z template (bug report): opis, steps to reproduce, expected/actual, screenshots, environment.
- **Priorytetyzacja**: P0 (critical: crash/security), P1 (high: core func), P2 (medium: UX), P3 (low: edge).
- **Raportowanie**: Automatyczne z CI (Allure reports w GitHub Actions), manualne via Playwright traces.
- **Tracking**: Jira board dla test cycles, z linkami do issues/PR.
- **Post-Mortem**: Po każdym release, analiza failed tests i lessons learned w .cursor/rules/test-plan.mdc.
- **Komunikacja**: Notify w Slack (#qa-channel) dla P0/P1, weekly summary raport.