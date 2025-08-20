// -------------------- DIET PLAN GENERATION --------------------
document.getElementById("nutrition-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  console.log("Form Data Submitted:", data);

  const prompt = `
Design a highly personalized nutrition and meal plan for a person based on the following details:
- Goal: ${data.goal}
- Food Preference: ${data.food_preference}
- Location: ${data.location}
- Age: ${data.age}
- Gender: ${data.gender}
- Height: ${data.height} cm
- Weight: ${data.weight} kg
- Food allergies: ${data.allergies}
- Health issues: ${data.health_issues}

The plan should include:
- Morning drink, breakfast, lunch, evening snack, and dinner
- Portion sizes (approx.)
- Locally available foods
- Nutritional tips based on user's health data
- Suggested water intake and fitness/activity recommendations
- Total daily calorie goal based on fitness objective
`;

  const output = document.getElementById("response-box");
  output.innerHTML = "⏳ Generating your personalized plan…";

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });
    const json = await res.json();
    displayMealPlan(json.choices[0].message.content);
  } catch {
    output.innerHTML = "⚠️ Something went wrong. Please try again.";
  }
});

function displayMealPlan(text) {
  const output = document.getElementById("response-box");
  output.innerHTML = "";

  const sectionRegex = /(\*\*(.*?)\*\*[\s\S]*?)(?=\n\*\*|$)/g;

  function getEmoji(title) {
    const lower = title.toLowerCase();
    if (lower.includes("morning")) return "🍵";
    if (lower.includes("breakfast")) return "🍳";
    if (lower.includes("lunch")) return "🍛";
    if (lower.includes("snack")) return "🍎";
    if (lower.includes("dinner")) return "🌙";
    if (lower.includes("water")) return "🚰";
    if (lower.includes("tip")) return "💡";
    if (lower.includes("fitness")) return "🏋️";
    if (lower.includes("activity")) return "🏃";
    if (lower.includes("profile") || lower.includes("user")) return "📋";
    return "";
  }

  let match;
  while ((match = sectionRegex.exec(text)) !== null) {
    const fullSection = match[1].trim();
    const titleRaw = fullSection.match(/\*\*(.*?)\*\*/)[1].trim();
    const emoji = getEmoji(titleRaw);
    const title = emoji ? `${emoji} ${titleRaw}` : titleRaw;

    const body = fullSection
      .replace(/\*\*(.*?)\*\*/, "")
      .replace(/\*\*/g, "")
      .trim();

    const card = document.createElement("div");
    card.className = "meal-card";
    card.innerHTML = `<h3>${title}</h3><p>${body}</p>`;
    output.appendChild(card);
  }
}

// -------------------- CHATBOT SECTION --------------------
document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatBox = document.getElementById("chat-box");

  if (!chatForm) return;

  chatForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    appendMessage("user", "🧑‍💬 " + userMessage);
    chatInput.value = "";

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [{ role: "user", content: userMessage }],
          temperature: 0.7
        })
      });

      const json = await res.json();
      const reply = json.choices[0].message.content;
      appendMessage("bot", "🤖 " + reply);
    } catch (err) {
      appendMessage("bot", "⚠️ Bot failed to respond.");
    }
  });

  function appendMessage(sender, message) {
    const msgDiv = document.createElement("div");
    msgDiv.className = sender === "user" ? "user-msg" : "bot-msg";
    msgDiv.innerText = message;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

