import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const {
      query: { id },
    } = req;

    if (!id) return res.status(400).json({ error: "missing riddle id" });

    const result = await sql(
      "UPDATE riddles SET likes = COALESCE(likes, 0) + 1 WHERE id = $1 RETURNING likes",
      [id]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "riddle not found" });
    }

    return res.status(200).json({ id, likes: result[0].likes });
  } catch (err) {
    console.error("like api error:", err);
    return res.status(500).json({ error: "Sphinx is sleeping" });
  }
}