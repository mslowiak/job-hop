import { AiMotivationalMessageGenerator } from "./ai-motivational-message-generator.service";
import { InMemoryMotivationalMessageGenerator } from "./in-memory-motivational-message-generator.service";

interface MotivationalMessageGenerator {
  generate(): Promise<string>;
}

export const MotivationalMessageProvider = {
  getImplementation(): MotivationalMessageGenerator {
    const useAI = import.meta.env.MOTIVATIONAL_MESSAGES_AI_INTEGRATION === "true";

    if (useAI) {
      return new AiMotivationalMessageGenerator();
    } else {
      return new InMemoryMotivationalMessageGenerator();
    }
  },
};
