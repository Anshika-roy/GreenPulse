# ⚖️ HACKATHON_TRUTH.md — Technical Transparency & Truth Matrix

> **Internal Developer & Judge Defense Guide for GreenPulse AI**

---

## 1. WHAT IS ACTUALLY IMPLEMENTED (Production Code)

- ✅ **Full-Stack Architecture**: React 19 + TypeScript + Vite frontend, Express + Prisma ORM + PostgreSQL backend.
- ✅ **Dual-Mode API Layer**: Seamless execution via client-side mock resolvers (`VITE_USE_MOCK=true`) or REST endpoints (`VITE_USE_MOCK=false`).
- ✅ **Hardware Telemetry Schema & API**: Ingestion endpoint (`POST /api/telemetry`) handling 8 physical metrics: `battery_health_percent`, `battery_cycle_count`, `ssd_wear_percent`, `ssd_health_percent`, `thermal_event`, `cpu_temperature_c`, `ram_usage_percent`, `storage_usage_percent`.
- ✅ **Weighted Component Scoring Algorithm**: Health scores calculated by weighting Battery (25%), SSD (25%), Thermal (20%), RAM (15%), and Storage (15%) in `deviceHealthService.ts`.
- ✅ **Real Native OS Hardware Agent**: Executable Node.js OS collection script (`npm run agent` / `scripts/nativeAgent.ts`) that reads real physical RAM, CPU load, and OS platform metrics from the host machine and posts them to `POST /api/telemetry`.
- ✅ **ML Failure Prediction Model**: Statistical logistic regression script (`npm run ml:predict` / `scripts/trainMLModel.ts`) evaluating telemetry feature vectors to compute failure probabilities and primary risk drivers.
- ✅ **Interactive Demo Telemetry Simulator**: Live modal in Navbar (`DemoTelemetrySimulatorModal.tsx`) allowing live hardware metric adjustments, streaming updates to backend/mock state, and instant recalculation of risk scores across UI.
- ✅ **AI Action Center**: Categorization of devices into `CRITICAL`, `HIGH RISK`, `WATCH`, `HEALTHY` with interactive prototype action buttons.
- ✅ **Exportable Fleet Reports**: Live client-side CSV export generation on the Reports page.
- ✅ **Authentication**: JWT authentication with `bcryptjs` password hashing and protected route guards.

---

## 2. WHAT IS SIMULATED / PROTOTYPED

- ⚠️ **Demo Telemetry Simulator**: Telemetry data streams are generated via REST payloads or UI controls. (Not a native C++/Rust OS kernel driver).
- ⚠️ **Action Center Buttons**: Clicking "Schedule Service" or "Create Ticket" logs prototype state/toasts. (No live integration with external Jira or ServiceNow enterprise systems).
- ⚠️ **Sustainability & Financial Calculations**: Uses transparent mathematical formulas (e.g. `(100 - Health Score) × ₹350 per device`), labeled clearly as DEMO / ESTIMATED.

---

## 3. WHAT IS RULE-BASED (Deterministic Heuristics)

- 🤖 **Recommendation Engine**: Failure prediction windows (14, 45, 120 days) are computed based on health score thresholds (<60 = High Risk).
- 💬 **AI Copilot Drawer**: Intent matching in `copilotEngine.ts` and `src/api/copilot.ts` evaluates natural language keywords against real dataset statistics.

---

## 4. WHAT IS FUTURE SCOPE (Not Yet Implemented)

- 🔮 Native OS C++/Rust background telemetry collector binaries.
- 🔮 Fine-tuned LLM model integration (e.g. OpenAI GPT-4 / Claude API) for unstructured diagnostic logs.
- 🔮 Automated Jira / ServiceNow webhook integration.
- 🔮 Certified Carbon Credit Marketplace verification.

---

## 🚨 5. THINGS WE MUST NOT CLAIM (DO NOT OVERCLAIM TO JUDGES)

1. ❌ **Do NOT claim you trained a custom ML/Deep Learning model** (e.g. PyTorch, TensorFlow). Explain it as a *weighted component scoring algorithm & heuristic decision engine*.
2. ❌ **Do NOT claim you integrated OpenAI GPT-4 or Claude APIs**. Explain Copilot as a *data-backed conversational intent engine*.
3. ❌ **Do NOT claim you built native OS kernel hardware drivers**. Explain telemetry as *REST API ingestion with a live demo simulator*.
4. ❌ **Do NOT claim real-time browser hardware scanning**. Explain that browser security prevents direct hardware access, so agents post telemetry to the REST API.
5. ❌ **Do NOT claim live external Jira / ServiceNow integration**. State clearly that actions trigger prototype tickets within GreenPulse.
