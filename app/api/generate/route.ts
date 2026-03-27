import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const CATEGORIES = {
  Indumentaria: ["remera", "buzo", "pantalon", "campera", "vestimenta", "jean", "short", "vestido", "blusa"],
  Calzado: ["zapatillas", "zapatos", "botas", "sandalias", "ojotas", "borceguies"],
  Perfumería: ["perfume", "fragancia", "colonia", "aroma", "extracto"],
  Accesorios: ["reloj", "pulsera", "anillo", "aros", "cinturon", "lentes", "anteojos", "gorra", "bolso", "cartera"]
};

function detectCategory(name: string) {
  const lowerName = name.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(kw => lowerName.includes(kw))) {
      return category;
    }
  }
  return "General";
}

export async function POST(req: Request) {
  try {
    const { productName, price, category: manualCategory, tone, objective } = await req.json();

    if (!productName) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const category = manualCategory === "Auto-detectar" ? detectCategory(productName) : manualCategory;

    const requestedTone = tone || "Atractivo y vendedor";
    const requestedObjective = objective || "Venta directa";

    const prompt = `Actúa como un experto en marketing digital y copywriter para Instagram.
Producto: ${productName}
Categoría: ${category}
Precio: ${price || 'No especificado'}
Tono deseado: ${requestedTone}
Objetivo principal: ${requestedObjective}

Debes analizar el producto y generar contenido altamente optimizado, creativo y listo para publicar. Genera la respuesta en formato JSON estrictamente siguiendo esta estructura:
{
  "category": "${category}",
  "inference": {
    "targetAudience": "Describe el público objetivo ideal (max 5 palabras)",
    "style": "Describe el estilo del producto y su vibra visual (max 5 palabras)",
    "keyBenefits": ["Beneficio clave 1", "Beneficio clave 2", "Beneficio clave 3"]
  },
  "posts": [
    {
      "type": "Promocional",
      "content": "Texto del post listo para Instagram con emojis. Debe estar muy alineado al Tono y Objetivo solicitados.",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]
    },
    {
      "type": "Aspiracional",
      "content": "Texto del post enfocado en el estilo de vida, deseo y valor de marca. Alineado al Tono y Objetivo.",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]
    },
    {
      "type": "Urgencia",
      "content": "Texto del post enfocado en escasez, oferta o urgencia para generar acción inmediata.",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]
    }
  ],
  "visualIdeas": [
    "Idea práctica y creativa 1 para foto o reel",
    "Idea práctica y creativa 2 para foto o reel",
    "Idea práctica y creativa 3 para foto o reel"
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    if (!resultText) {
       throw new Error("No text returned from Gemini");
    }

    const data = JSON.parse(resultText);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
