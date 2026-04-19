/**
 * AI Assistant Utility for Smart Campus Ticketing
 * 
 * In a real-world scenario, this would call an LLM API (like Gemini).
 * For this project, we use a robust keyword-based analysis engine 
 * to demonstrate "Smart" automation.
 */

const CATEGORY_KEYWORDS = {
  HARDWARE: ['projector', 'laptop', 'mouse', 'computer', 'keyboard', 'monitor', 'screen', 'printer', 'cpu', 'hardware', 'cable'],
  SOFTWARE: ['login', 'password', 'software', 'windows', 'office', 'app', 'bug', 'error', 'portal', 'account', 'license'],
  NETWORK: ['wifi', 'internet', 'ethernet', 'connection', 'offline', 'slow', 'router', 'network', 'signal', 'bandwidth'],
  FACILITY: ['light', 'water', 'leak', 'door', 'chair', 'table', 'ac', 'air conditioning', 'fan', 'toilet', 'room', 'ventilation', 'plumbing', 'desk']
};

const PRIORITY_KEYWORDS = {
  CRITICAL: ['fire', 'smoke', 'dangerous', 'flood', 'broken glass', 'security breach', 'emergency', 'explosion', 'hazard'],
  HIGH: ['urgent', 'immediately', 'asap', 'exam', 'presentation', 'lecture', 'stopped working', 'cannot work', 'broken'],
  LOW: ['slowly', 'request', 'info', 'question', 'suggestion', 'non-urgent', 'future']
};

export const analyzeDescription = (description) => {
  if (!description || description.length < 10) return null;

  const desc = description.toLowerCase();
  let suggestedCategory = 'OTHER';
  let suggestedPriority = 'MEDIUM';

  // Category Matching
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => desc.includes(kw))) {
      suggestedCategory = category;
      break;
    }
  }

  // Priority Matching
  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some(kw => desc.includes(kw))) {
      suggestedPriority = priority;
      break;
    }
  }

  return {
    category: suggestedCategory,
    priority: suggestedPriority,
    confidence: 0.85 // Mock confidence score for UI effect
  };
};
