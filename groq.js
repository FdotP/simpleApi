import Groq from "groq-sdk";
import dotenv from "dotenv"

dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export async function main(item) {
  const chatCompletion = await getGroqChatCompletion(item);
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

export async function getGroqChatCompletion(item) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `wygeneruj tylko i wyłącznie kod html zawierający opis produktu zgodny z wymaganiami SEO , oto dane produktu${item}, nie dodawaj zadnych komentarzy ani zadnej innej tresci niz kod html`
      },
    ],
    model: "llama3-8b-8192",
  });
}