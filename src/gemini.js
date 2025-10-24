// Call Gemini API for semantic similarity
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const EMBEDDING_URL = "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=" + GEMINI_API_KEY;

// Compute embedding for a given piece of text
export async function getEmbedding(text) {
    const payload = { content: text };
    const res = await fetch(EMBEDDING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.embedding?.values; // Array of floats
}

// Compute cosine similarity
export function cosineSimilarity(a, b) {
    let dot = 0, mA = 0, mB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        mA += a[i] * a[i];
        mB += b[i] * b[i];
    }
    return dot / (Math.sqrt(mA) * Math.sqrt(mB));
}
