const dotenv = require("dotenv");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load local environment variables from workspace
dotenv.config({ path: path.join(__dirname, ".env.local") });
dotenv.config({ path: path.join(__dirname, ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = process.env.GEMINI_API_KEY;

const publicSupabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

// Replicate db helper functions from lib/db/reflections.ts
async function getRecentReflections(userId, limit = 5) {
  console.log("-> Starting getRecentReflections query");
  const { data, error } = await supabaseAdmin
    .from('reflections')
    .select('messages, created_at, last_message')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  console.log("-> Finished getRecentReflections query", error);
  return data || [];
}

async function getDailyReflectionCount(userId) {
  console.log("-> Starting getDailyReflectionCount query");
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { data, error } = await supabaseAdmin
    .from('reflections')
    .select('messages')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString());
  console.log("-> Finished getDailyReflectionCount query", error);
  return 0;
}

async function getUserSubscriptionTier(userId) {
  console.log("-> Starting getUserSubscriptionTier query");
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();
  console.log("-> Finished getUserSubscriptionTier query", error);
  return data?.subscription_tier || 'free';
}

function formatAIHistoryContext(reflections) {
  return "Memory context mock";
}

async function run() {
  // Let's get a real user ID
  console.log("Querying profiles to get a valid user...");
  const { data: profiles } = await supabaseAdmin.from("profiles").select("id").limit(1);
  const userId = profiles[0].id;
  console.log("Using User ID:", userId);

  try {
    console.log("1. Calling getUserSubscriptionTier...");
    const profile = await getUserSubscriptionTier(userId);

    console.log("2. Calling preferredMode query...");
    const preferredMode = await (async () => {
      const { data } = await publicSupabase
        .from('profiles')
        .select('preferred_coach_mode')
        .eq('id', userId)
        .single();
      return data?.preferred_coach_mode || 'Gentle Observer';
    })();
    console.log("preferredMode Result:", preferredMode);

    console.log("3. Calling getDailyReflectionCount...");
    const dailyCount = await getDailyReflectionCount(userId);

    console.log("4. Calling getRecentReflections...");
    const recentReflections = await getRecentReflections(userId, 5);
    const historyContext = formatAIHistoryContext(recentReflections);

    console.log("5. Initializing GoogleGenerativeAI...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: "You are a helpful assistant."
    });

    console.log("6. Starting Chat...");
    const chat = model.startChat({ history: [] });

    console.log("7. Sending Message...");
    const result = await chat.sendMessage("Hello");
    const response = await result.response.text();
    console.log("Gemini response:", response);

    console.log("ALL STEPS COMPLETED PERFECTLY!");
  } catch (error) {
    console.error("CRITICAL EXCEPTION:", error);
  }
}

run();
