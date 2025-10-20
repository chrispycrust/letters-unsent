import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_LETTERS_UNSENT_API_KEY_GUARDIAN
})

const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: "Write a one-sentence bedtime story about a unicorn."
});

console.log(response.output_text);