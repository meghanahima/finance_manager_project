// Gemini-based receipt analysis utility
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data:image/jpeg;base64, prefix
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

// Extract transaction data from receipt using Gemini
export async function analyzeReceiptWithGemini(file) {
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file);

    // Prepare the prompt for Gemini
    const prompt = `
Analyze this receipt image and extract transaction information. Return ONLY a valid JSON object with the following structure:
{
  "type": "Income" or "Expense",
  "amount": number (just the number, no currency symbols),
  "date": "YYYY-MM-DD" format,
  "description": "brief description of the transaction",
  "category": "one of: Food & Dining, Transportation, Shopping, Utilities, Entertainment, Healthcare, Education, Other, Salary, Freelance, Business, Investment, Rental, Gift, Bonus"
}

Important rules:
- Most receipts are expenses unless clearly indicated otherwise
- Use today's date if no date is visible: ${
      new Date().toISOString().split("T")[0]
    }
- Choose the most appropriate category from the list provided
- Amount should be the total amount as a number
- Description should be the merchant name or brief description of purchase
- Return ONLY the JSON object, no additional text or explanations
`;

    // Make request to Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Extract the text response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No response from Gemini API");
    }

    // Parse the JSON response
    try {
      // Clean the response - remove any markdown formatting
      const cleanedText = generatedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const extractedData = JSON.parse(cleanedText);

      // Validate the extracted data
      if (
        !extractedData.type ||
        !extractedData.amount ||
        !extractedData.category
      ) {
        throw new Error("Incomplete data extracted from receipt");
      }

      return {
        success: true,
        data: extractedData,
      };
    } catch (parseError) {
      throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to analyze receipt",
    };
  }
}
