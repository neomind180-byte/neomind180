const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ No API Key found in .env.local");
    return;
  }

  console.log("🔑 Using Key:", apiKey.substring(0, 10) + "...");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // This asks Google for the list
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 
    // We can't list models directly with the simplified SDK easily, 
    // so we will try a standard 'gemini-pro' generation to see if it works 
    // outside of Next.js first.
    
    console.log("📡 Testing connection with 'gemini-pro'...");
    const result = await model.generateContent("Hello, are you there?");
    console.log("✅ SUCCESS! 'gemini-pro' works.");
    console.log("Response:", result.response.text());
    
  } catch (error) {
    console.log("\n❌ ERROR DETAILS:");
    console.log(error.message);
    
    // If that failed, let's try to fetch the available models via raw fetch
    console.log("\n📋 Attempting to fetch Model List via raw API...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) {
            console.log("\n✅ AVAILABLE MODELS FOR YOU:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`   - ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.log("RAW RESPONSE:", data);
        }
    } catch (fetchError) {
        console.log("Could not fetch list:", fetchError);
    }
  }
}

listModels();