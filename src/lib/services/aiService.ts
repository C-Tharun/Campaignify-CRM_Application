export class AIService {
  static async naturalLanguageToRules(naturalLanguage: string) {
    try {
      const prompt = `Convert the following natural language description into a JSON object for customer segmentation rules. The rules should include fields like country, minOrders, minSpend, and inactiveDays. Only return the JSON object, no other text.

Description: ${naturalLanguage}

Example output format:
{
  "country": "India",
  "minOrders": 3,
  "minSpend": 5000,
  "inactiveDays": 90
}`;

      const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 250,
              temperature: 0.3,
              return_full_text: false,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response from Hugging Face");
      }

      const data = await response.json();
      const generatedText = data[0].generated_text;

      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in the response");
      }

      // Parse the JSON
      const rules = JSON.parse(jsonMatch[0]);
      return rules;
    } catch (error) {
      console.error("Error converting natural language to rules:", error);
      throw error;
    }
  }
} 