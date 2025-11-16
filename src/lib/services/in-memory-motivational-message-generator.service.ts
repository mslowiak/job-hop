import { motivationalMessages } from "../constants/motivational-messages";

export class InMemoryMotivationalMessageGenerator implements MotivationalMessageGenerator {
  async generate(): Promise<string> {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    return motivationalMessages[randomIndex];
  }
}
