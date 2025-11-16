import { OpenRouterService, type Message } from "./openrouter.service";

type JsonSchema = unknown;

const motivationSchema: JsonSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
  required: ["message"],
  additionalProperties: false,
};

export class AiMotivationalMessageGenerator implements MotivationalMessageGenerator {
  private openRouterService: OpenRouterService;

  constructor() {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    this.openRouterService = new OpenRouterService({
      apiKey,
      temperature: 0.8,
      maxTokens: 300,
    });
  }

  async generate(): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content: `You are an empathetic career coach specializing in supporting active job seekers. Your goal is to create short, uplifting daily motivational messages that acknowledge the challenges of job hunting, celebrate small wins, and inspire persistence. The recipient is someone using a job tracking app to manage their applications, so reference themes like tracking progress, handling rejections, networking, or skill-building without being overly generic.

Key guidelines:

- Keep the message to 20-40 words (one short paragraph).

- Use a warm, encouraging tone: positive but realistic—avoid toxic positivity or empty platitudes.

- Make it personal and relatable, as if speaking directly to the user (e.g., "You're making real progress by...").

- Ensure it's inclusive, professional, and suitable for all ages/genders.

Generate one unique message now. Do not add any extra text, explanations, or metadata—just the message itself. The message MUST be in Polish.`,
      },
    ];

    const motivationData = (await this.openRouterService.generateStructuredResponse(messages, motivationSchema)) as {
      message: string;
    };

    return motivationData.message;
  }
}
