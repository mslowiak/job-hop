# OpenRouter Service Implementation Plan

## 1. Service Description

The OpenRouter service is a TypeScript class designed to facilitate interactions with the OpenRouter API for LLM-based chat functionalities in the JobHop application. It abstracts the complexities of API calls, message formatting, structured response handling, and error management, allowing seamless integration into the frontend (Astro/React) and backend (Supabase) components. The service supports sending system and user messages, specifying models and parameters, and enforcing structured JSON responses via JSON schema. It adheres to the project's tech stack (Astro 5, React 19, TypeScript 5, Tailwind 4) and coding practices, emphasizing error handling, security, and clean code principles.

Key goals:
- Provide a simple interface for chat completions.
- Ensure secure handling of API keys and sensitive data.
- Support structured outputs for reliable parsing in the application (e.g., generating job application insights or motivational messages).
- Integrate with Supabase for potential storage of chat histories if extended.

## 2. Constructor Description

The constructor initializes the service with necessary configurations, including the API key, base URL, and default model parameters. It validates inputs early to prevent runtime errors.

```typescript
constructor(options: OpenRouterOptions) {
  // Validate options
  if (!options.apiKey) {
    throw new Error('API key is required');
  }

  this.apiKey = options.apiKey;
  this.baseUrl = options.baseUrl || 'https://openrouter.ai/api/v1';
  this.defaultModel = options.defaultModel || 'anthropic/claude-3.5-sonnet'; // Example default model
  this.defaultParameters = {
    temperature: options.temperature || 0.7,
    maxTokens: options.maxTokens || 1000,
    // Other defaults
  };
}
```

- **Parameters**:
  - `apiKey`: string - Required OpenRouter API key (stored securely, e.g., via environment variables).
  - `baseUrl`: string (optional) - API endpoint base URL.
  - `defaultModel`: string (optional) - Default LLM model.
  - `temperature`: number (optional) - Default sampling temperature (0-2).
  - `maxTokens`: number (optional) - Default maximum response tokens.
- **Validation**: Use guard clauses for missing required fields; log warnings for optional misconfigurations.
- **Security**: Never hardcode the API key; load from environment (e.g., `import.meta.env.OPENROUTER_API_KEY` in Astro).

## 3. Public Methods and Fields

Public interface focuses on high-level operations for chat interactions.

### Fields
- `apiKey`: string - Private, but exposed via getter if needed for debugging (masked).
- `defaultModel`: string - Public getter for the configured model.

### Methods
1. **`chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>`**
   - Sends a chat completion request to OpenRouter.
   - `messages`: Array of `{ role: 'system' | 'user' | 'assistant', content: string }`.
   - `options`: Overrides for model, parameters, response_format.
   - Returns parsed response with structured data if specified.
   - Example:
     ```typescript
     const response = await service.chat([
       { role: 'system', content: 'You are a helpful job search assistant.' },
       { role: 'user', content: 'Suggest improvements for my resume.' }
     ], { model: 'gpt-4o', responseFormat: { type: 'json_schema', ... } });
     ```

2. **`generateStructuredResponse(messages: Message[], schema: JsonSchema, options?: StructuredOptions): Promise<any>`**
   - Specialized method for JSON schema-enforced responses.
   - Validates and parses the response against the schema.
   - Throws if structure doesn't match.

3. **`getModels(): Promise<ModelInfo[]>`**
   - Fetches available models from OpenRouter API (for dynamic selection in UI).

## 4. Private Methods and Fields

Internal helpers for API interactions and data processing.

### Fields
- `_headers`: Record<string, string> - Computed headers including Authorization: Bearer ${apiKey}.
- `_defaultParameters`: ChatParameters - Stored defaults.

### Methods
1. **`_makeRequest(endpoint: string, body: any): Promise<any>`**
   - Performs HTTP POST/GET using native `fetch` (no external deps for simplicity).
   - Includes error handling for network issues.
   - Example body for chat: `{ model, messages, ...parameters }`.

2. **`_formatMessages(messages: Message[], systemMessage?: string): Message[]`**
   - Ensures system message is prepended if not provided.
   - Validates message roles and content length.

3. **`_parseStructuredResponse(response: any, schema: JsonSchema): any`**
   - Uses TypeScript type guards or a lightweight validator (e.g., zod if added) to parse JSON.
   - Handles partial matches with fallbacks.

4. **`_applyResponseFormat(options: ChatOptions): ResponseFormat | undefined`**
   - Constructs response_format object: `{ type: 'json_schema', json_schema: { name: 'response', strict: true, schema: schemaObj } }`.

## 5. Error Handling

Follow project guidelines: Early returns, guard clauses, custom errors.

- **Potential Scenarios**:
  1. **Invalid API Key**: 401 Unauthorized - Throw `AuthError` with user-friendly message.
  2. **Network Failure**: Fetch errors - Retry once with exponential backoff; log and throw `NetworkError`.
  3. **Rate Limiting**: 429 Too Many Requests - Implement client-side throttling; inform user via UI toast.
  4. **Invalid JSON Schema**: Malformed response_format - Validate schema in `_applyResponseFormat`; throw `ValidationError`.
  5. **Model Unavailable**: 400 Bad Request - Fallback to default model; log warning.
  6. **Timeout**: Response > 30s - Abort fetch; throw `TimeoutError`.
  7. **Parsing Failure**: Non-JSON response - Log raw response (sanitized); throw `ParseError`.

- **Centralized Handler**: Wrap `_makeRequest` in try-catch; map HTTP status to custom errors extending `Error`.
- **Logging**: Use console.error in dev; integrate with Supabase logging in prod.
- **User Feedback**: Return errors with `message` and `code` for UI handling (e.g., via sonner toasts).

Custom Error Types:
```typescript
class OpenRouterError extends Error { code: string; }
class AuthError extends OpenRouterError { /* ... */ }
```

## 6. Security Considerations

- **API Key Management**: Load from environment variables (e.g., `.env` in Astro); never expose in client-side bundles. Use Supabase Edge Functions for server-side calls if needed.
- **Input Sanitization**: Escape user messages to prevent injection (though LLM APIs are generally safe); limit content length to avoid token overflow.
- **Rate Limiting**: Client-side debounce on chat method; respect OpenRouter limits.
- **Data Privacy**: Do not log sensitive user data (e.g., resumes); anonymize requests if storing histories.
- **CORS/HTTPS**: Ensure all requests use HTTPS; configure Astro for secure headers.
- **Dependency Security**: No external HTTP libs; audit if adding validators like zod.
- **Structured Outputs**: Enforce strict JSON schema to prevent malicious responses.

## 7. Step-by-Step Implementation Plan

### Step 1: Setup and Types
- Create `src/lib/services/openrouter.service.ts`.
- Define interfaces: `Message`, `ChatOptions`, `JsonSchema`, `ResponseFormat`, custom errors.
- Import necessary types from `@supabase/supabase-js` if integrating storage.

### Step 2: Constructor and Configuration
- Implement constructor with validation.
- Add environment variable loading: `const apiKey = import.meta.env.OPENROUTER_API_KEY;`.
- Set defaults aligned with OpenRouter docs (e.g., temperature 0.7).

### Step 3: Private Methods
- Implement `_makeRequest` using `fetch` with JSON body and headers.
  - Headers: `{ 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': window.location.origin, 'X-Title': 'JobHop' }` (per OpenRouter requirements).
- Build `_formatMessages` to prepend system message.
- Create `_applyResponseFormat` using the specified pattern:
  ```typescript
  if (options.responseFormat?.type === 'json_schema') {
    return {
      type: 'json_schema',
      json_schema: {
        name: options.responseFormat.name || 'response',
        strict: true,
        schema: options.responseFormat.schema
      }
    };
  }
  ```
- Implement `_parseStructuredResponse` with JSON.parse and schema validation.

### Step 4: Public Methods
- Build `chat` method: Format messages, apply options, call `_makeRequest('/chat/completions')`, parse response.
  - Example for system/user: Prepend `{ role: 'system', content: '...' }` if missing.
  - Model: `options.model || this.defaultModel`.
  - Parameters: Merge defaults with options.
- Add `generateStructuredResponse`: Call `chat` with response_format, then parse.
  - Example schema for job advice: `{ type: 'object', properties: { suggestions: { type: 'array', items: { type: 'string' } } }, required: ['suggestions'] }`.
- Implement `getModels`: GET `/models` endpoint.

### Step 5: Error Handling Integration
- Wrap all async methods in try-catch.
- Define and throw custom errors.
- Add retry logic for transient errors (e.g., 5xx).

### Step 6: Security and Testing
- Ensure API key is server-side only (use Astro API routes).
- Test with mock responses; add unit tests in `__tests__`.
- Integrate with React components (e.g., chat UI in DashboardView.tsx).

### Step 7: Integration and Documentation
- Export service from `lib/services/index.ts`.
- Update README with usage examples.
- Configure in Astro: Add env vars to `.env.example`.
- For structured responses: Example usage in a React hook:
  ```typescript
  const responseFormat = {
    type: 'json_schema',
    json_schema: {
      name: 'job-advice',
      strict: true,
      schema: { /* schema obj */ }
    }
  };
  ```

This plan ensures a robust, secure service aligned with JobHop's architecture.
