function getTopicEmoji(topicName) {
  const topicEmojiMap = {
    love: "❤️",
    "pain, struggle and resilience": "💪",
    authenticity: "🎭",
    "productivity and focus": "🎯",
    "decisions and priorities": "⚖️",
    business: "💼",
    motivation: "🔥",
    "stop and think": "🤔",
    health: "🌿",
    "time, death and loss": "⏳",
    spirituality: "✨",
    "purpose and lifepath": "🗺️",
    work: "💻",
    pedagogy: "🎓",
    "materialism and impermanence": "🏺",
    "mindfulness and happiness": "🧘",
    "responsibilities and balance": "⚖️",
    "risk and failure": "🎲",
    systems: "⚙️",
    change: "🦋",
    "mindset and optimistic thinking": "🌟",
    discipline: "🥋",
    humility: "🙏",
    "inspiration and creativity": "💡",
    "money and investments": "💰",
    humor: "😄",
    reading: "📚",
    writing: "✍️",
    misc: "🌐",
  };

  const lowerTopic = topicName.toLowerCase().trim();
  return topicEmojiMap[lowerTopic] || "💭";
}
