# Allianz Claims App – Product Requirements Document (PRD)

## 🎯 Objective
Transform the current Retirement Planner demo app into a Claims Processing Application for Allianz Life. The app will guide users through the claims process via a chat-first, tab-based interface, simulating human-agent interaction with intelligent support.

---

## 🧱 Architecture & Setup

### Modular File Structure

Organize components for maintainability and reuse:

```
/components/
  ChatModal.tsx
  DocumentUploader.tsx
  ClaimTypeSelector.tsx
  ClaimFormFiller.tsx
  StatusTracker.tsx
  ContactSupport.tsx

/agents/
  intake_agent.json
  claim_type_agent.json
  document_agent.json
  tracker_agent.json
  escalation_agent.json

/data/
  claim_types.json
  faq_answers.json
  prefilled_forms.json

/public/images/
  allianz_logo.png
  document_samples/
  avatars/
```

- UI framework: React + Tailwind + `shadcn/ui`
- Use only **simulated data**—no live API dependencies

---

## 🗃️ Tabs (Workflow Steps)

Each step in the claims journey is a separate tab to ensure modularity.

### 1. 🆕 **Start a Claim**
- Description: Select the product or policy type (e.g., annuity, life insurance, long-term care)
- UI: Dropdown or card selector
- Agent: `claim_type_agent.json`
- Features:
  - Explain claim categories
  - Offer links to external policy documents (mocked)

### 2. 📄 **Upload Documents**
- Description: Upload death certificate, claim form, or medical records
- UI: `DocumentUploader.tsx`
- Agent: `document_agent.json`
- Features:
  - Show required docs by claim type
  - Allow upload + simulated preview
  - Warn on missing fields

### 3. ✍️ **Fill Claim Form**
- Description: Guide user in completing claim forms (simulated)
- UI: Auto-filled chat-based form using `prefilled_forms.json`
- Agent: `intake_agent.json`
- Features:
  - Prepopulate known fields
  - Validate input (SSN format, DOB range, etc.)
  - Export as downloadable PDF (mocked)

### 4. 📦 **Track Claim Status**
- Description: Simulate claim submission status updates
- UI: Status bar or stepper
- Agent: `tracker_agent.json`
- Features:
  - “In review”, “Additional info required”, “Approved”, “Denied”
  - Trigger follow-ups if status = "stalled"

### 5. 🧑‍💼 **Contact a Claims Agent**
- Description: Provide escalation or contact support
- UI: Display simulated contact info and initiate live hand-off
- Agent: `escalation_agent.json`
- Features:
  - Summarize chat history for agent hand-off
  - Show call/email/live chat options

---

## 💬 Chat Modal (Universal)

Each tab should invoke a chat modal with the tab-specific agent.

### Requirements:
- Open/close with single click
- Render system/agent typing delays
- “Reset conversation” option
- Agent avatar + name (e.g., “Allianz Claims Assistant”)

---

## 🧼 Cleanup Instructions (Retirement Planner Components)

Remove the following
