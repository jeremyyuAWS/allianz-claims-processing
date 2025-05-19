# 🧓💬 Retirement Planner Agent Demo

Welcome to the Retirement Planner Agent Demo, a modular AI-powered assistant designed to help users and financial advisors collaboratively plan for retirement. This application supports **two interaction modes** – *Customer* and *Advisor* – and is built using simulated data for demonstration purposes.

---

## 🔁 Modes of Interaction

### 1. **Customer Mode**
For individuals planning their retirement journey. The chat agent collects financial and personal planning data to generate tailored portfolio options.

### 2. **Advisor Mode**
For financial professionals who review, customize, and finalize retirement plans for clients. Advisors can interact directly with portfolio options through embedded chat agents.

---

## 🧠 AI-Powered Agent Features

| Agent | Description | Used In |
|-------|-------------|---------|
| **Questionnaire Agent** | Conversational agent that gathers retirement goals, savings, income, age, and risk tolerance | Customer & Advisor Mode |
| **Portfolio Recommender Agent** | Generates 3 recommended investment strategies: Aggressive, Balanced, and Safe | Customer & Advisor Mode |
| **Plan Explainer Agent** | Responds to questions about the generated portfolios using natural language | Customer & Advisor Mode |
| **Plan Editor Agent** | Enables financial advisors to modify portfolios using chat-based commands (e.g., "add bonds", "reduce equities") | Advisor Mode only |
| **Simulated Data Agent** | Provides mock user profiles and investment performance scenarios | Both Modes |

---

## 📊 Visualizations

Each retirement plan includes clear, easy-to-understand visual components:

- **Portfolio Breakdown** (Pie Chart)
  - Asset allocation across Stocks, Bonds, REITs, International, etc.
- **Projected Retirement Value** (Bar Chart)
  - Expected total value at retirement age
- **Annual Withdrawal Estimate** (Numeric Table)
  - Forecasted annual withdrawal capacity based on strategy
- **Risk Profile Indicators** (Badge or Color Scale)
  - Highlights comparative volatility and expected returns

---

## 💬 Sample Questions & Inputs

The AI will ask the following questions in **Customer Mode**:

- 🧍‍♂️ What is your current age?
- 🎯 What age do you plan to retire?
- 💵 What is your current annual income?
- 💰 How much do you currently have saved?
- 📈 What is your expected annual savings going forward?
- 🧘 How would you describe your risk tolerance? (Low / Medium / High)
- 🌴 What kind of lifestyle do you want in retirement?

In **Advisor Mode**, the same questions are collected but used to simulate an intake form or live customer session.

---

## 🧑‍💼 Advisor-Specific Features

- View client profile and their recommended options
- Click into any of the 3 portfolios (Aggressive / Balanced / Safe)
- Chat with a portfolio:
  - “Replace international stocks with U.S. equities.”
  - “Reduce risk by shifting 15% into fixed income.”
  - “Add ESG funds to this mix.”

The portfolio is dynamically rebalanced and returns updated charts and risk assessments after each interaction.

---

## 🧪 Sample Simulated Data

```json
{
  "age": 35,
  "retirement_age": 65,
  "current_savings": 150000,
  "income": 90000,
  "risk_tolerance": "Medium",
  "expected_growth": {
    "aggressive": "8%",
    "balanced": "6%",
    "safe": "4%"
  },
  "projected_values": {
    "aggressive": "$2.3M",
    "balanced": "$1.7M",
    "safe": "$1.2M"
  }
}
```

---

## ⚙️ Tech Stack (Suggested for Implementation)

- **Lyzr Studio** – Agent orchestration and prompt management
- **Bolt.new** – Frontend UI for toggling modes and chat experiences
- **Supabase** – Backend for storing session info and simulated profiles
- **D3.js or Chart.js** – Visualizations for portfolios
- **Prefect or Airflow** – Optional orchestration of refresh jobs and tracking
