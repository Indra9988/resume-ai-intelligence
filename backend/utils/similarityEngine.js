/**
 * similarityEngine.js
 * TF-IDF based cosine similarity between two text documents.
 */

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s\+\#\.]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

function buildTFIDF(tokens, allDocs) {
  const tf = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  Object.keys(tf).forEach(t => { tf[t] /= tokens.length; });

  const idf = {};
  const vocab = new Set(tokens);
  vocab.forEach(term => {
    const docsWithTerm = allDocs.filter(d => d.includes(term)).length;
    idf[term] = Math.log((allDocs.length + 1) / (docsWithTerm + 1)) + 1;
  });

  const tfidf = {};
  vocab.forEach(t => { tfidf[t] = (tf[t] || 0) * (idf[t] || 1); });
  return tfidf;
}

function cosineSimilarity(vecA, vecB) {
  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, normA = 0, normB = 0;
  allKeys.forEach(k => {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  });
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function computeSimilarity(textA, textB) {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  const allDocs = [tokensA, tokensB];
  const vecA = buildTFIDF(tokensA, allDocs);
  const vecB = buildTFIDF(tokensB, allDocs);
  return cosineSimilarity(vecA, vecB);
}

module.exports = { computeSimilarity };
