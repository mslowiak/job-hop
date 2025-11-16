export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatParameters {
  temperature: number;
  maxTokens: number;
  // Additional parameters can be extended as needed (e.g., top_p, frequency_penalty)
}

interface OpenRouterOptions {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatOptions {
  model?: string;
  parameters?: Partial<ChatParameters>;
  responseFormat?: ResponseFormat;
}

interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: JsonSchema;
  };
}

type JsonSchema = Record<string, unknown>;

interface ModelInfo {
  id: string;
  name: string;
  // Additional fields as per OpenRouter API response
}

class OpenRouterError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "OpenRouterError";
    this.code = code;
  }
}

class AuthError extends OpenRouterError {
  constructor(message = "Authentication failed") {
    super(message, "AUTH_ERROR");
    this.name = "AuthError";
  }
}

class NetworkError extends OpenRouterError {
  constructor(message = "Network request failed") {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

class ValidationError extends OpenRouterError {
  constructor(message = "Validation failed") {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

class ParseError extends OpenRouterError {
  constructor(message = "Failed to parse response") {
    super(message, "PARSE_ERROR");
    this.name = "ParseError";
  }
}

class TimeoutError extends OpenRouterError {
  constructor(message = "Request timed out") {
    super(message, "TIMEOUT_ERROR");
    this.name = "TimeoutError";
  }
}

interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  // Additional fields as per OpenRouter API
}

interface StructuredOptions extends ChatOptions {
  schema: JsonSchema;
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private defaultParameters: ChatParameters;

  constructor(options: OpenRouterOptions) {
    // Early validation for required fields
    if (!options.apiKey) {
      throw new ValidationError("API key is required");
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://openrouter.ai/api/v1";

    this.defaultModel =
      options.defaultModel ||
      (import.meta.env.OPENROUTER_AI_MODEL?.trim()
        ? import.meta.env.OPENROUTER_AI_MODEL
        : "tngtech/deepseek-r1t2-chimera:free");

    this.defaultParameters = {
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 1000,
    };
  }

  get defaultModelGetter(): string {
    return this.defaultModel;
  }

  private _headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://jobhop.local",
      // Placeholder for server-side; can be overridden or set from request context
      // in usage
      "X-Title": "JobHop",
    };
  }

  private async _makeRequest(endpoint: string, body?: unknown, method: "POST" | "GET" = "POST"): Promise<unknown> {
    // Guard clause for invalid endpoint
    if (!endpoint.startsWith("/")) {
      throw new ValidationError("Endpoint must start with /");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = this._headers();

    const config: RequestInit = {
      method,
      headers,
    };

    if (method === "POST" && body) {
      config.body = JSON.stringify(body);
    }

    // Timeout implementation using AbortController (30s as per plan)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        if (response.status === 401) {
          throw new AuthError(errorMessage);
        } else if (response.status === 429) {
          throw new OpenRouterError(errorMessage, "RATE_LIMIT");
        } else if (response.status >= 500) {
          // Basic retry for server errors (once)
          const retryResponse = await fetch(url, {
            ...config,
            signal: controller.signal,
          });
          if (!retryResponse.ok) {
            throw new NetworkError(errorMessage);
          }
          return await retryResponse.json();
        } else {
          throw new OpenRouterError(errorMessage, `HTTP_${response.status}`);
        }
      }

      return await response.json();
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new TimeoutError();
      }
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new NetworkError("Network request failed");
      }
      throw error;
    }
  }

  private _formatMessages(messages: Message[], systemMessage?: string): Message[] {
    // Guard clause for empty or invalid messages
    if (!messages || messages.length === 0) {
      throw new ValidationError("Messages array cannot be empty");
    }

    const formatted: Message[] = [...messages];

    // Prepend system message if provided and not already present
    if (systemMessage && !formatted.some((msg) => msg.role === "system")) {
      formatted.unshift({ role: "system", content: systemMessage });
    }

    // Validate each message
    for (const msg of formatted) {
      if (!msg || typeof msg.content !== "string" || msg.content.trim().length === 0) {
        throw new ValidationError("Each message must have a valid role and non-empty content");
      }
      if (msg.content.length > 4000) {
        // Arbitrary limit to prevent token overflow; adjust as needed
        throw new ValidationError("Message content too long; limit is 4000 characters");
      }
      if (!["system", "user", "assistant"].includes(msg.role)) {
        throw new ValidationError("Invalid message role");
      }
    }

    return formatted;
  }

  private _applyResponseFormat(options: ChatOptions): ResponseFormat | undefined {
    const rf = options.responseFormat;
    if (rf?.type === "json_schema") {
      // Validate schema presence
      if (!rf.json_schema?.schema) {
        throw new ValidationError("JSON schema is required for structured responses");
      }
      return {
        type: "json_schema",
        json_schema: {
          name: rf.json_schema.name || "response",
          strict: rf.json_schema.strict !== false, // Default to true as per plan
          schema: rf.json_schema.schema,
        },
      };
    }
    return undefined;
  }

  private _parseStructuredResponse(response: unknown, schema: JsonSchema): unknown {
    // Guard clause for invalid response structure
    if (
      !response ||
      typeof response !== "object" ||
      response === null ||
      !("choices" in response) ||
      !Array.isArray((response as Record<string, unknown>).choices) ||
      (response as Record<string, unknown>).choices.length === 0
    ) {
      throw new ParseError("Invalid response structure: no choices found");
    }

    const choices = (response as Record<string, unknown>).choices as {
      message: { content: string };
    }[];
    const content = choices[0]?.message?.content;
    if (typeof content !== "string") {
      throw new ParseError("Response content is not a string");
    }

    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      // Basic schema validation (expand with zod if added later)
      // For now, assume parsed matches schema structure; throw if not object for
      // json_schema
      if (schema && typeof schema === "object" && (!parsed || typeof parsed !== "object")) {
        throw new ParseError("Parsed response does not match expected object structure");
      }
      // TODO: Implement full schema validation using zod or similar
      return parsed;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ParseError(`Failed to parse JSON from response content: ${error.message}`);
      }
      throw new ParseError("Failed to parse JSON from response content");
    }
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse> {
    // Guard clause for messages
    if (!messages || messages.length === 0) {
      throw new ValidationError("Messages array cannot be empty for chat");
    }

    // Format messages (no systemMessage here; assume provided in messages)
    const formattedMessages = this._formatMessages(messages);

    // Merge options with defaults
    const model = options?.model || this.defaultModel;
    const parameters: ChatParameters = {
      ...this.defaultParameters,
      ...(options?.parameters || {}),
    };

    // Apply response format if specified
    const responseFormat = this._applyResponseFormat(options || {});

    const body = {
      model,
      messages: formattedMessages,
      ...(Object.keys(parameters).length > 0 ? { ...parameters } : {}),
      ...(responseFormat ? { response_format: responseFormat } : {}),
    };

    try {
      // Call private request
      const responseData = (await this._makeRequest("/chat/completions", body)) as ChatResponse;

      // Basic response validation
      if (
        !responseData ||
        typeof responseData !== "object" ||
        !responseData.choices ||
        !Array.isArray(responseData.choices) ||
        responseData.choices.length === 0
      ) {
        throw new ParseError("Invalid chat response structure");
      }

      return responseData;
    } catch (error: unknown) {
      // Propagate custom errors
      if (error instanceof OpenRouterError) {
        // For rate limit, suggest throttling (handled in UI)
        if (error.code === "RATE_LIMIT") {
          error.message += "; Consider throttling requests.";
        }
        throw error;
      }
      // Retry logic for transient errors (network, 5xx already retried in
      // _makeRequest, but add one more layer)
      if (error instanceof NetworkError || error instanceof TimeoutError) {
        // Exponential backoff: wait 1s for first retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          const retryResponseData = (await this._makeRequest("/chat/completions", body)) as ChatResponse;
          if (
            !retryResponseData ||
            typeof retryResponseData !== "object" ||
            !retryResponseData.choices ||
            !Array.isArray(retryResponseData.choices) ||
            retryResponseData.choices.length === 0
          ) {
            throw new ParseError("Invalid chat response structure on retry");
          }
          return retryResponseData;
        } catch (_: unknown) {
          throw error; // Throw original
        }
      }
      // General catch
      const generalError = new OpenRouterError(
        error instanceof Error ? error.message : "Unknown chat error",
        "CHAT_ERROR"
      );
      throw generalError;
    }
  }

  async generateStructuredResponse(
    messages: Message[],
    schema: JsonSchema,
    options?: StructuredOptions
  ): Promise<unknown> {
    // Guard clauses
    if (!messages || messages.length === 0) {
      throw new ValidationError("Messages array cannot be empty for structured response");
    }
    if (!schema) {
      throw new ValidationError("Schema is required for structured response");
    }

    // Prepare options for chat
    const chatOptions: ChatOptions = {
      ...options,
      responseFormat: {
        type: "json_schema",
        json_schema: {
          name: options?.responseFormat?.json_schema?.name || "structured_response",
          strict: true,
          schema,
        },
      },
    };

    try {
      // Call chat with structured format
      const rawResponse = await this.chat(messages, chatOptions);

      // Parse using private method
      const parsed = this._parseStructuredResponse(rawResponse, schema);

      return parsed;
    } catch (error: unknown) {
      if (error instanceof OpenRouterError) {
        throw error;
      }
      if (error instanceof ParseError) {
        // Enhance message for UI
        error.message += "; Response did not match expected schema.";
        throw error;
      }
      if (error instanceof NetworkError || error instanceof TimeoutError) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          const rawResponse = await this.chat(messages, chatOptions);
          return this._parseStructuredResponse(rawResponse, schema);
        } catch (_: unknown) {
          throw error;
        }
      }
      const generalError = new OpenRouterError(
        error instanceof Error ? error.message : "Unknown structured response error",
        "STRUCTURED_ERROR"
      );
      throw generalError;
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const responseData = (await this._makeRequest("/models", undefined, "GET")) as {
        data: { id: string; name?: string }[];
      };

      // Validate response
      if (
        !responseData ||
        typeof responseData !== "object" ||
        !responseData.data ||
        !Array.isArray(responseData.data)
      ) {
        throw new ParseError("Invalid models response structure");
      }

      // Map to ModelInfo (assuming API returns { data: [{ id, ... }] })
      return responseData.data.map((item) => ({
        id: item.id,
        name: item.name || item.id,
      })) as ModelInfo[];
    } catch (error: unknown) {
      if (error instanceof OpenRouterError) {
        throw error;
      }
      if (error instanceof NetworkError || error instanceof TimeoutError) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          const responseData = (await this._makeRequest("/models", undefined, "GET")) as {
            data: { id: string; name?: string }[];
          };
          if (
            !responseData ||
            typeof responseData !== "object" ||
            !responseData.data ||
            !Array.isArray(responseData.data)
          ) {
            throw new ParseError("Invalid models response structure");
          }
          return responseData.data.map((item) => ({
            id: item.id,
            name: item.name || item.id,
          })) as ModelInfo[];
        } catch (_: unknown) {
          throw error;
        }
      }
      const generalError = new OpenRouterError(
        error instanceof Error ? error.message : "Unknown models error",
        "MODELS_ERROR"
      );
      throw generalError;
    }
  }
}
