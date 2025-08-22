import { neon } from "@neondatabase/serverless";
import { GoogleGenAI } from "@google/genai";

const sql = neon(process.env.DATABASE_URL);

async function ensureTable() {
  await sql.query(
    `CREATE TABLE IF NOT EXISTS riddles (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      answer TEXT NOT NULL,
      likes INT DEFAULT 0,
      used BOOLEAN DEFAULT FALSE
    )`
  );
}

// Initialize the AI client
//const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ai = new GoogleGenAI({});

async function generateRiddleWithAI() {
  try {
    //const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate a creative riddle with its answer. Format your response as JSON with this exact structure:
{
  "riddle": "Your riddle text here",
  "answer": "The answer here"
}

Write poetic, riddle-style metaphors rooted in software development culture.

Each riddle should be 1–3 lines long, in a clever, Sphinx-like tone: part mysterious, part sarcastic, a little poetic, and full of developer truth.

The riddles should reflect real experiences in the world of programming—bugs, tools, team dynamics, bad habits, deployment issues, technical debt, etc.

Each riddle should be followed by an answer, like so:

'I vanish with a restart, appear with a commit, and laugh at your logging. What am I?'
Answer: A ghost bug.

Tone: Playful, cynical, self-aware, and clever. Avoid dry definitions or generic trivia. Reference dev culture, not just concepts.

Generate only 10 riddle-answer pair in valid JSON format.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${prompt}`,
    });

    //const result = await model.generateContent(prompt);
    //const response = await result.response;
    const text = response.text;
    console.log("AI response:", text);

    let cleaned = text.replace(/^```json\s*([\s\S]*?)\s*```$/, '$1');
    console.log("Cleaned response:", cleaned);

    // Parse the JSON response
    const riddleData = JSON.parse(cleaned.trim());

    return riddleData;
  } catch (error) {
    console.error('Error generating riddle with AI:', error);
    // Fallback to placeholder if AI generation fails
    const fallbackId = Date.now();
    return [{
      text: `Generated riddle #${fallbackId}: What has many teeth but cannot bite?`,
      answer: `A comb or zipper`
    }];
  }
}

async function generateRiddles(count = 100) {
  // TODO: replace with AI generation (OpenAI / other) when API key is available.
  // For now insert simple generated placeholders so the site remains functional.
  const now = Date.now();
  //for (let i = 0; i < count; i++) {
    //const text = `Generated riddle #${i + 1}: What has many teeth but cannot bite?`;
    //const answer = `Placeholder answer #${i + 1}`;
    const list = await generateRiddleWithAI();

    // Convert to SQL VALUES format
    const sqlValues = list.map(item => {
      // Escape single quotes by doubling them
      const escapedRiddle = item.riddle.replace(/'/g, "''");
      const escapedAnswer = item.answer.replace(/'/g, "''");

      return `('${escapedRiddle}','${escapedAnswer}')`;
    }).join(',');

    await sql.query(
      `INSERT INTO riddles (riddle_text, answer_text) VALUES ${sqlValues} ON CONFLICT (riddle_id) DO NOTHING`,
    );
  //}
}

export default async function handler(req, res) {
  try {
    await ensureTable();

    if (req.method === "GET") {
      // pick one unused riddle
      let rows = await sql.query(
        "SELECT riddle_id as id, riddle_text as text, answer_text as answer, likes FROM riddles WHERE used = false LIMIT 1"
      );
      if (!rows || rows.length === 0) {
        // generate more riddles if none available
        await generateRiddles(1);
        rows = await sql.query(
          "SELECT riddle_id as id, riddle_text as text, answer_text as answer, likes FROM riddles WHERE used = false LIMIT 1"
        );
      }

      if (!rows || rows.length === 0) {
        // still none -> signal backend/AI problem
        return res.status(500).json({ error: "Sphinx is sleeping" });
      }

      const r = rows[0];
      // mark as used so next visitor gets a different riddle
      await sql.query("UPDATE riddles SET used = true WHERE riddle_id = $1", [r.id]);

      return res.status(200).json(r);
    }

    // Optionally allow creating a riddle via POST (not used by frontend now)
    if (req.method === "POST") {
      const { riddle_id, riddle_text, answer_text, } = req.body || {};
      if (!isValidRiddle(riddle_id, riddle_text, answer_text))
        return res
          .status(400)
          .json({ error: "riddle_id, riddle_text and answer_text required" });
      await sql.query(
        "INSERT INTO riddles (riddle_id, riddle_text, answer_text, likes, used) VALUES ($1, $2, $3, 0, false) ON CONFLICT (riddle_id) DO NOTHING",
        [riddle_id, riddle_text, answer_text,]
      );
      return res.status(201).json({ ok: true });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("sphinx api error:", err);
    return res.status(500).json({ error: "Sphinx is sleeping" });
  }
}

function isValidRiddle(id, text, answer) {
  return !id || !text || !answer ? false : true;
}