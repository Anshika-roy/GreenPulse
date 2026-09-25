# GreenPulse Startup Readiness Audit

## 1. Executive Summary

This audit evaluates the **GreenPulse AI** codebase (`greenpulse-ai` and `greenpulse-api`) to determine its exact technical reality, system architecture, data flow, security posture, and readiness for production deployment as a Commercial SaaS product.

- **Current Reality**: GreenPulse is a **functional, well-structured full-stack prototype** with end-to-end device enrollment, agent token authentication, real OS RAM/CPU telemetry ingestion, and weighted component health analysis.
- **AI/ML Reality**: **No trained machine learning model or external LLM API is currently connected**. The predictive logic consists of a deterministic weighted factor scoring model and a sigmoid logistic probability formula with manually assigned coefficients.
- **Production Status**: **PARTIALLY READY FOR BETA / HACKATHON DEMO**. It requires automated alert generation, public self-serve registration, native OS agent packaging, and production deployment configuration before becoming a commercial SaaS product.

---

## 2. Actual Architecture

```
User (Browser)
   │
   ├─► React 19 Frontend (greenpulse-ai / Vite)
   │     │
   │     ├── [VITE_USE_MOCK=true]  ──► Client-side Mock Resolvers (src/api/*.ts)
   │     └── [VITE_USE_MOCK=false] ──► REST API (Fetch + JWT Headers)
   │
Node.js Device Agent (scripts/nativeAgent.ts)
   │
   └─► POST /api/telemetry (Bearer gp_agent_xxxx)
         │
         ▼
Express 4.21 Backend (greenpulse-api)
   │
   ├── Middleware: agentAuth.ts (SHA-256 Token Hash Verification)
   ├── Service: telemetryService.ts (ingestTelemetry)
   ├── Engine: deviceHealthService.ts (analyzeDeviceHealth & sigmoid logit)
   │
   ▼
Prisma ORM 5.20 ──► PostgreSQL Database (devices, telemetry_readings, device_health_points)
```

---

## 3. Data Flow Audit

| Step | Source | Destination | Protocol / API | Responsible File | Status |
|---|---|---|---|---|---|
| **1. User Auth** | Browser Login Form | `/api/login` | HTTP POST | `authController.ts` | 🟢 **Connected (Real JWT + bcrypt)** |
| **2. Device Enrollment** | Add Device Modal | `/api/devices/enroll` | HTTP POST | `deviceController.ts` | 🟢 **Connected (SHA-256 Hash + Raw Token)** |
| **3. Hardware Collection** | Local Host OS (`os`) | `nativeAgent.ts` | Node.js System Calls | `nativeAgent.ts` | 🟡 **Partially Real (RAM/CPU load real; SSD/Battery simulated)** |
| **4. Telemetry Post** | `nativeAgent.ts` | `/api/telemetry` | HTTP POST (Bearer `gp_agent_`) | `telemetryController.ts` | 🟢 **Connected (Device Identity Verified)** |
| **5. Database Save** | Backend Service | Postgres DB | Prisma ORM | `telemetryService.ts` | 🟢 **Connected (`TelemetryReading` persisted)** |
| **6. Health Scoring** | Backend Service | Memory Computation | Weighted Factor Math | `deviceHealthService.ts` | 🟢 **Connected (Weight math executes)** |
| **7. Health DB Update** | Backend Service | Postgres DB | Prisma ORM | `telemetryService.ts` | 🟢 **Connected (`Device` & `DeviceHealthPoint` updated)** |
| **8. Health API Fetch** | React Device Detail | `/api/devices/:id/health` | HTTP GET | `deviceHealthController.ts` | 🟢 **Connected (Frontend re-renders live)** |

---

## 4. Frontend ↔ Backend Audit

- **LOGIN**: 🟢 **ACTUALLY CONNECTED**. `Login.tsx` $\to$ `POST /api/login` $\to$ `authController.ts` $\to$ `bcrypt.compare` $\to$ JWT Token issued $\to$ Stored in `localStorage("gp_token")`.
- **DEVICES LIST**: 🟢 **ACTUALLY CONNECTED**. `Devices.tsx` $\to$ `GET /api/devices` $\to$ `deviceController.listDevices` $\to$ Prisma query scoped to `req.auth.companyId` $\to$ Rendered in `DeviceTable.tsx`.
- **ADD DEVICE / ENROLL**: 🟢 **ACTUALLY CONNECTED**. `AddDeviceModal.tsx` $\to$ `POST /api/devices/enroll` $\to$ `deviceController.enrollDevice` $\to$ Generates `gp_agent_<raw>`, stores SHA-256 hash in Prisma $\to$ Returns raw token ONCE.
- **TELEMETRY INGESTION**: 🟢 **ACTUALLY CONNECTED**. `nativeAgent.ts` $\to$ `POST /api/telemetry` $\to$ `agentAuth.ts` (SHA-256 token verification) $\to$ `telemetryService.ingestTelemetry` $\to$ Prisma `TelemetryReading` $\to$ `analyzeDeviceHealth` $\to$ Updates `Device.healthScore` & `DeviceHealthPoint` in Postgres.

---

## 5. Device Agent Telemetry Reality

Classification of telemetry metrics collected by `scripts/nativeAgent.ts`:

- 🟢 **RAM Usage (`ram_usage_percent`)**: **REAL**. Calculated dynamically via `os.totalmem()` and `os.freemem()`.
- 🟢 **CPU Load / Cores**: **REAL**. Collected dynamically via `os.cpus()` tick sample calculation.
- 🟢 **OS Platform & Specs**: **REAL**. Collected dynamically via `os.platform()`, `os.arch()`, `os.cpus().length`.
- 🟠 **CPU Temperature (`cpu_temperature_c`)**: **DERIVED**. Estimated via CPU load ratio formula (`42 + cpuLoadPercent * 0.4`).
- 🔴 **Storage Usage (`storage_usage_percent`)**: **SIMULATED / HARDCODED**. Fixed default value (`64%`).
- 🔴 **Battery Health (`battery_health_percent`)**: **SIMULATED / HARDCODED**. Fixed default value (`88%`).
- 🔴 **SSD Wear (`ssd_wear_percent`)**: **SIMULATED / HARDCODED**. Fixed default value (`18%`).
- 🔴 **Battery Cycles & Thermal Events**: **SIMULATED / HARDCODED**. Fallback default values in health engine.

---

## 6. Health Score / Risk Engine Audit

- **Implementation File**: `greenpulse-api/src/services/deviceHealthService.ts`
- **Scoring Method**: **Deterministic Heuristic Weighted Math** (NOT Trained ML).
  - Battery: 25% weight
  - SSD: 25% weight
  - Thermal: 20% weight
  - RAM: 15% weight
  - Storage: 15% weight
- **Risk Classification**: Health score < 60 = `HIGH` / `CRITICAL` (14-day action window); 60–80 = `MEDIUM` (45-day window); > 80 = `LOW` (120-day window).
- **Recalculation Trigger**: **Executed automatically on every telemetry ingestion batch** in `telemetryService.ts`. Updates `Device` table and appends a `DeviceHealthPoint` row.

---

## 7. AI / ML Reality Audit

> **NO TRAINED MACHINE LEARNING MODEL OR EXTERNAL LLM API IS CURRENTLY CONNECTED.**

- **`scripts/trainMLModel.ts`**: Standalone TypeScript file evaluating a Sigmoid Logistic probability formula $\sigma(z) = \frac{1}{1 + e^{-z}}$ using **fixed, manually assigned heuristic weights** (`MODEL_WEIGHTS`). No optimization algorithm (gradient descent) or scikit-learn/PyTorch dataset training exists.
- **`copilotEngine.ts`**: Evaluates natural language keywords (`risk`, `budget`, `battery`, `ssd`, `sustainability`) against active database metrics. No OpenAI, Anthropic, or Gemini API keys are called.

---

## 8. Database Audit

- **ORM & Database**: Prisma ORM 5.20 connecting to PostgreSQL.
- **Entities Persisted**: `Company`, `User`, `Device`, `DeviceHealthPoint`, `TelemetryReading`, `MaintenanceEvent`, `Alert`, `Ticket`, `Recommendation`, `Prediction`, `ChatMessage`.
- **Relationships & Indexes**: Foreign keys linking `Device` $\to$ `Company`, `TelemetryReading` $\to$ `Device`, `DeviceHealthPoint` $\to$ `Device`. Indexes set on `companyId`, `riskLevel`, `deviceId`, and `metricType`.
- **Data Accumulation**: Historical `TelemetryReading` and `DeviceHealthPoint` rows accumulate over time upon each ingestion batch.

---

## 9. Multi-Tenancy & Isolation Audit

- 🟢 **Company Level Isolation**: `listDevices`, `getDeviceById`, `enrollDevice`, and `regenerateAgentToken` enforce `where: { companyId: req.auth.companyId }`.
- 🟢 **Device Token Security**: `POST /api/telemetry` validates the token hash in `agentAuth.ts` and enforces that `deviceId` matches the token owner (`req.authenticatedDevice.id`). Device A token **cannot** post telemetry for Device B.

---

## 10. Authentication & Security Audit

- **Password Hashing**: `bcryptjs` (salt factor 10) in `userService.ts` & `seed.ts`.
- **User JWT**: Signed with `env.jwtSecret`, 8h expiration.
- **Agent Tokens**: Format `gp_agent_<20_random_bytes_hex>`. Stored in PostgreSQL as **SHA-256 hashes** (`agentTokenHash`). Raw tokens returned only once at enrollment.
- **Input Validation**: `zod` middleware schemas validating query parameters, request bodies, and path variables.
- **Security Headers & Protection**: Helmet headers enabled; CORS restricted to `env.corsOrigin`; Express rate-limiting active (`100 requests / 15 mins`).
- **Security Findings**:
  - 🟢 *No critical raw token leaks found*.
  - 🟡 *JWT secret defaults to `.env.example` placeholder if unset in development*.

---

## 11. Alert System Audit

- 🟡 **Status**: **PARTIAL**.
- **Existing**: `Alert` database model, `alertRoutes.ts`, `alertController.ts` (`GET /api/alerts`, `PATCH /api/alerts/:id/read`), and frontend Alerts Page (`Alerts.tsx`).
- 🔴 **Missing**: Automated trigger inserting an `Alert` table row when `ingestTelemetry` detects a critical health drop below score 50. Email, SMS, Webhook, and Push notifications are currently unconfigured.

---

## 12. Startup Customer Journey Breakdown

1. Company signs up $\implies$ 🔴 **MISSING** (No public registration route; companies seeded or created via script).
2. Admin logs in $\implies$ 🟢 **WORKING** (`POST /api/login`).
3. Admin creates organization $\implies$ 🟡 **PARTIAL** (DB seed creation).
4. Admin adds/enrolls a laptop $\implies$ 🟢 **WORKING** (`POST /api/devices/enroll` & `AddDeviceModal`).
5. Employee installs agent $\implies$ 🟡 **PARTIAL** (Local script `npm run agent`, not a packaged OS installer).
6. Agent receives device token $\implies$ 🟢 **WORKING** (`GREENPULSE_DEVICE_TOKEN`).
7. Agent starts $\implies$ 🟢 **WORKING** (`npm run agent`).
8. Agent collects telemetry $\implies$ 🟢 **WORKING** (Reads OS RAM & CPU, posts to API).
9. Backend authenticates device $\implies$ 🟢 **WORKING** (`agentAuth.ts` SHA-256 token validation).
10. Telemetry is stored $\implies$ 🟢 **WORKING** (`TelemetryReading` persisted in Postgres).
11. Backend calculates device health $\implies$ 🟢 **WORKING** (`analyzeDeviceHealth`).
12. AI predicts failure risk $\implies$ 🟡 **PARTIAL** (Heuristic sigmoid logit formula).
13. Alert is generated $\implies$ 🔴 **MISSING** (No auto-insertion of `Alert` table rows on telemetry ingestion).
14. Admin sees alert $\implies$ 🟡 **PARTIAL** (Dashboard shows seeded alerts).
15. Admin takes action $\implies$ 🟡 **PARTIAL** (Action Center prototype actions).
16. Historical data remains available $\implies$ 🟢 **WORKING** (`DeviceHealthPoint` accumulation).

> **Customer Journey Breakpoints**: Self-serve organization registration, packaged OS agent installer, and automated critical alert triggers.

---

## 13. Production Deployment Audit

- **Can Deploy Today?**: 🟡 **PARTIALLY**.
- **Exact Blockers**:
  1. No `Dockerfile` or `docker-compose.yml` for automated deployment.
  2. No automated database migration script for production setup.
  3. No dedicated `/health` endpoint for load balancer health checks.
  4. Logging uses standard `console.log` rather than a structured logger (Winston/Pino).

---

## 14. Hackathon vs MVP vs Production

| Feature | Hackathon Demo | Commercial MVP | Enterprise Production |
|---|---|---|---|
| **Data Mode** | Standalone Mock + Real Agent | Real Postgres DB | High-availability Postgres Cluster |
| **Agent** | Node.js CLI (`npm run agent`) | Lightweight Background Service | Signed C++/Rust OS Binary Installer |
| **Auth** | JWT + Agent Token Hash | JWT + Agent Token Hash + OAuth2/SSO | SAML 2.0 / Okta / Azure AD |
| **Alerts** | Dashboard UI Cards | Auto DB Alerts + Email | Webhooks + Slack + Jira / ServiceNow |
| **AI/ML** | Sigmoid Logit + Heuristics | Trained Logistic Regression | PyTorch Time-Series LSTM / LLM Adapter |

---

## 15. Things NOT To Build Yet (Distractions)

- ❌ **Chatbot / Conversational Voice Assistant**: Keep Copilot as text-based query assistant.
- ❌ **Mobile App**: Focus 100% on the web dashboard.
- ❌ **Complex Microservices**: Keep standard Express monolith architecture.
- ❌ **Multi-Cloud Billing Engine**: Standard B2B tier pricing is sufficient.

---

## 16. Recommended Build Order

### PHASE 1: Self-Serve Organization Registration & User Signup
- **Problem**: No public endpoint for new companies to register.
- **Files**: `authController.ts`, `authRoutes.ts`, `userService.ts`, `Login.tsx`.
- **Dependency**: Required before real customer onboarding.

### PHASE 2: Native OS Hardware Agent Expansion
- **Problem**: SSD wear, battery health, and disk space are static in `nativeAgent.ts`.
- **Files**: `nativeAgent.ts` (Add `systeminformation` npm package or native OS commands).
- **Dependency**: Depends on Phase 1; makes device telemetry 100% real across all 8 metrics.

### PHASE 3: Automated Alert Pipeline & Webhook Notifications
- **Problem**: Critical health drops do not insert `Alert` DB rows or fire webhooks.
- **Files**: `telemetryService.ts`, `alertController.ts`, `alertRoutes.ts`.
- **Dependency**: Depends on Phase 2.

### PHASE 4: Trained Machine Learning Model & LLM Integration
- **Problem**: Intelligence relies on manually chosen heuristic weights.
- **Files**: `trainMLModel.ts`, `recommendationEngine.ts`, `copilotEngine.ts`.
- **Dependency**: Depends on Phase 3 accumulating real telemetry dataset logs.

### PHASE 5: Production Deployment & Docker Packaging
- **Problem**: Missing containerization and production health check endpoints.
- **Files**: `Dockerfile`, `docker-compose.yml`, `server.ts`.
- **Dependency**: Final step before SaaS launch.
