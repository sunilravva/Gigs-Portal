# Enterprise Innovation Gig Marketplace — System Architecture & Deployment Guide

This document details the tech stack, system architecture, security guidelines, and deployment strategies for hosting the **Enterprise Innovation Gig Marketplace** platform on **Google Cloud Platform (GCP)** or **On-Premises Infrastructure**.

---

## 1. Executive Summary & Core Platform Architecture

The Enterprise Innovation Gig Marketplace is a full-stack, AI-powered internal mobility platform designed for enterprise organizations. It enables managers to post innovation gigs, employees to apply and contribute skill hours, and executives to track internal innovation ROI, cross-functional talent utilization, and skill demand telemetry.

### Architectural Blueprint
```
                   ┌─────────────────────────────────────────┐
                   │           Client Browser (SPA)           │
                   │   React 18 + TypeScript + Tailwind CSS   │
                   └────────────────────┬────────────────────┘
                                        │ HTTPS / REST API
                                        ▼
                   ┌─────────────────────────────────────────┐
                   │          Express Backend Server          │
                   │        Node.js + CJS / ESM Bundle        │
                   └──────────┬──────────────────┬───────────┘
                              │                  │
            Internal State /  │                  │  Google Gen AI SDK
            Database Service  ▼                  ▼  (@google/genai)
                     ┌──────────────┐     ┌────────────────────────┐
                     │ Persistence  │     │   Gemini 2.5 AI Engine │
                     │ Cloud SQL /  │     │ (Gig Scoring, Drafting,│
                     │ Firestore    │     │  Executive Briefings)  │
                     └──────────────┘     └────────────────────────┘
```

---

## 2. Complete Technology Stack Details

### Frontend Layer (Client-Side SPA)
* **Framework**: React 18 with TypeScript
* **Build Tool**: Vite (Lightning-fast HMR and optimized production asset bundling)
* **Styling & UI**: Tailwind CSS v4 (Utility-first styling with responsive, accessible layout tokens)
* **Icons**: `lucide-react`
* **Data Visualization & Analytics**: `recharts` (Responsive Pie, Bar, Area, and Radar telemetry charts for leadership dashboards)
* **Animations**: `motion` (Framer Motion derivative for seamless page and modal transitions)

### Backend Layer (API & Server-Side Logic)
* **Runtime**: Node.js v18.x / v20.x / v22.x LTS
* **Framework**: Express.js (v4 / v5)
* **TypeScript Execution**: `tsx` in development mode
* **Production Bundler**: `esbuild` (Bundles server code into a standalone `dist/server.cjs` file to bypass runtime ES module resolution overhead)

### AI & Machine Learning Integration
* **SDK**: `@google/genai` (Official Google Gen AI TypeScript SDK)
* **Models**: `gemini-2.5-flash` (Fast, structured AI skill match evaluation, automated gig drafting, and C-Suite executive briefing summaries)
* **Features**:
  * AI Skill Match Scoring (0–100%) and personalized candidate match rationales.
  * Automated Gig Description & Skill Tag Generator.
  * C-Suite Executive Analytics Summary Briefing Generator.

---

## 3. Environment Variables & Secret Management

| Variable Name | Required | Location | Description |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | **Yes** | Server-Side Only | Google Gemini API Key. Must **never** be exposed to browser bundles. |
| `PORT` | Optional | Server-Side | Container port (Defaults to `3000`). |
| `NODE_ENV` | **Yes** | Server-Side | Set to `production` for production builds. |

---

## 4. Containerization & Build Pipeline

### Production Build Sequence
```bash
# 1. Install Dependencies
npm install

# 2. Build Frontend Static Assets & Bundle Server Script
npm run build
```
The build script triggers:
1. `vite build` → Output static HTML/JS/CSS assets to `dist/`
2. `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`

### Production Start Command
```bash
npm start
# Executes: node dist/server.cjs
```

---

## 5. Deployment Option A: Google Cloud Platform (GCP)

Hosting on Google Cloud provides zero-server-maintenance serverless scaling, integrated identity management, and direct secret control.

### Recommended GCP Architecture
1. **Google Cloud Run**: Serverless container hosting for the full-stack Express + React application. Auto-scales from 0 to N instances.
2. **Secret Manager**: Securely injects `GEMINI_API_KEY` into Cloud Run environment variables at runtime.
3. **Artifact Registry**: Private Docker repository for storing versioned container images.
4. **Cloud Load Balancing & Identity-Aware Proxy (IAP)**: (Optional) Provides enterprise Single Sign-On (SSO) with Google Workspace / Entra ID for employee authentication.
5. **Cloud SQL for PostgreSQL / Firestore**: (Optional) Production database layer if migrating from in-memory state to durable database storage.

### Step-by-Step GCP Cloud Run Deployment

#### Step 1: Create Dockerfile
Create a `Dockerfile` at the root of the project:
```dockerfile
# Stage 1: Build Phase
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Execution Phase
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

#### Step 2: Store Secrets in Secret Manager
```bash
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
```

#### Step 3: Build & Push Container to Artifact Registry
```bash
# Create artifact repository
gcloud artifacts repositories create innovation-app-repo \
    --repository-format=docker \
    --location=us-central1

# Build container image with Cloud Build
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/innovation-app-repo/gig-marketplace:latest .
```

#### Step 4: Deploy to Cloud Run
```bash
gcloud run deploy gig-marketplace-app \
    --image=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/innovation-app-repo/gig-marketplace:latest \
    --region=us-central1 \
    --platform=managed \
    --allow-unauthenticated \
    --port=3000 \
    --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
    --cpu=1 \
    --memory=512Mi \
    --min-instances=0 \
    --max-instances=10
```

---

## 6. Deployment Option B: On-Premises Infrastructure / Kubernetes

For organizations running on-premises data centers, private clouds, or Kubernetes clusters (OpenShift, GKE Enterprise, VMware Tanzu).

### Recommended On-Prem Architecture
1. **Container Registry**: Enterprise registry (Harbor, Nexus, or JFrog Artifactory).
2. **Kubernetes Cluster**: Deployment with `2+` replicas for high availability behind a Kubernetes Service (`ClusterIP`) and Ingress Controller (NGINX / Traefik).
3. **Secret Store**: HashiCorp Vault or Kubernetes Native Secrets for `GEMINI_API_KEY`.
4. **Reverse Proxy / SSL**: NGINX Ingress with TLS certificates managed via cert-manager or internal CA.
5. **SSO / OIDC**: Integration with Okta, Keycloak, Ping Identity, or Microsoft Entra ID.

### Kubernetes Manifest Examples

#### 1. Deployment (`deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gig-marketplace
  namespace: innovation-portal
  labels:
    app: gig-marketplace
spec:
  replicas: 2
  selector:
    matchLabels:
      app: gig-marketplace
  template:
    metadata:
      labels:
        app: gig-marketplace
    spec:
      containers:
      - name: gig-marketplace
        image: internal-registry.company.local/innovation/gig-marketplace:v1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: gig-marketplace-secrets
              key: GEMINI_API_KEY
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 15
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
```

#### 2. Service & Ingress (`service-ingress.yaml`)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: gig-marketplace-svc
  namespace: innovation-portal
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: gig-marketplace
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: gig-marketplace-ingress
  namespace: innovation-portal
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - gigs.company.local
    secretName: company-tls-cert
  rules:
  - host: gigs.company.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gig-marketplace-svc
            port:
              number: 80
```

---

## 7. Security & Enterprise Compliance Checklist

* **Zero Client API Key Leakage**: Gemini API interactions are strictly proxied via the Node/Express backend (`/api/evaluate-match`, `/api/generate-gig-description`, `/api/generate-csuite-report`). No API keys exist in client bundle code.
* **CORS & Helmets**: Enable Express `cors` policy restricted to company domain origins and `helmet` for HTTP security headers in production.
* **Health Check Endpoint**: Backend provides `/api/health` for orchestrator liveness and readiness probes.
* **Non-Root Execution**: Docker container runs as a unprivileged user (`node`) for security compliance.

---

## 8. Summary Comparison Matrix

| Architectural Dimension | Google Cloud Platform (GCP) | On-Premises Infrastructure |
| :--- | :--- | :--- |
| **Compute Engine** | GCP Cloud Run (Serverless) | Kubernetes / Docker Engine / VM |
| **Container Registry** | GCP Artifact Registry | Harbor / JFrog / Local Registry |
| **Secret Management** | GCP Secret Manager | HashiCorp Vault / K8s Secrets |
| **Load Balancing** | GCP Cloud Load Balancer | NGINX / F5 BIG-IP / Traefik |
| **Authentication** | GCP Identity-Aware Proxy / Workspace SSO | Keycloak / Okta / Entra ID |
| **Ops Complexity** | Low (Fully Managed) | Medium-High (Infra Management) |
