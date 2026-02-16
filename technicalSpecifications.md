# Pulse App - Technical Specifications

## Overview

Pulse is a personal rhythm and habit tracking application that helps users monitor life components, log activity records, track energy/mood via pulse checks, and gain insights through correlations and weekly patterns.

---

## Architecture

### Infrastructure (SST v3 on AWS)

The application is deployed using **SST (Serverless Stack) v3** with AWS as the cloud provider.

| Resource            | SST Construct             | Details                              |
|---------------------|---------------------------|--------------------------------------|
| API                 | `sst.aws.ApiGatewayV2`    | HTTP API with CORS enabled           |
| Backend             | Lambda (via `$default`)   | Express app wrapped with serverless-express, 512 MB memory, 30s timeout |
| Frontend            | `sst.aws.StaticSite`      | Vite build output served from S3/CloudFront |
| Secrets             | `sst.Secret`              | `MongoUri` — MongoDB connection string |
| Region              | `ap-southeast-2` (Sydney) |                                      |

**Stage-based removal policy:** Resources are retained in `production`, removed in all other stages.

### High-Level Diagram

```
                    ┌──────────────────┐
                    │   StaticSite     │
                    │  (S3/CloudFront) │
                    │   React + Vite   │
                    └────────┬─────────┘
                             │ VITE_API_URL
                             ▼
                    ┌──────────────────┐
                    │ API Gateway V2   │
                    │   (HTTP API)     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Lambda Function │
                    │  (Express app)   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    MongoDB       │
                    │  (via MongoUri)  │
                    └──────────────────┘
```

---

## Backend

### Runtime Stack

- **Runtime:** Node.js on AWS Lambda
- **Framework:** Express.js
- **Lambda Adapter:** `@vendia/serverless-express`
- **Database:** MongoDB via Mongoose
- **Validation:** Zod
- **Language:** TypeScript

### Lambda Entry Point

`backend/src/lambda.ts` — Initializes the database connection once on cold start, then delegates all requests to the Express app via `serverless-express`.

### API Routes

All routes are prefixed with `/api`.

| Prefix              | Resource      |
|----------------------|--------------|
| `/api/components`    | Components   |
| `/api/records`       | Records      |
| `/api/pulse-checks`  | Pulse Checks |
| `/api/stages`        | Stages       |
| `/health`            | Health check |

### Data Models

#### Component
Represents a life area or habit to track.

| Field           | Type     | Constraints                       |
|-----------------|----------|-----------------------------------|
| `name`          | String   | Required, trimmed                 |
| `weight`        | String   | Enum: `low`, `medium`, `high`     |
| `minWeeklyFreq` | Number  | Required, min: 1                  |
| `color`         | String   | Required, hex format `#RRGGBB`    |
| `timestamps`    | Auto     | `createdAt`, `updatedAt`          |

#### Record
A logged activity entry for a component.

| Field         | Type     | Constraints                       |
|---------------|----------|-----------------------------------|
| `componentId` | ObjectId | Required, ref: Component          |
| `date`        | Date     | Required                          |
| `effortLevel` | String   | Enum: `low`, `medium`, `high`     |
| `note`        | String   | Optional, trimmed                 |
| `timestamps`  | Auto     | `createdAt`, `updatedAt`          |

Index: `{ componentId: 1, date: 1 }`

#### PulseCheck
Daily energy and mood snapshot.

| Field         | Type     | Constraints                       |
|---------------|----------|-----------------------------------|
| `date`        | Date     | Required, unique (normalized UTC) |
| `energyLevel` | Number   | Required, 1-5                     |
| `moodLevel`   | Number   | Required, 1-5                     |
| `timestamps`  | Auto     | `createdAt`, `updatedAt`          |

Index: `{ date: 1 }` (unique)

#### Stage
A sub-task or milestone within a component.

| Field         | Type     | Constraints                        |
|---------------|----------|------------------------------------|
| `componentId` | ObjectId | Required, ref: Component           |
| `name`        | String   | Required, trimmed, max 200 chars   |
| `description` | String   | Optional, trimmed, max 1000 chars  |
| `effortLevel` | String   | Required, enum: `low`, `medium`, `high` |
| `status`      | String   | Enum: `active`, `completed`, `archived` |
| `order`       | Number   | Required, default: 0              |
| `color`       | String   | Optional, hex format `#RRGGBB`    |
| `completedAt` | Date     | Optional                          |
| `timestamps`  | Auto     | `createdAt`, `updatedAt`          |

Index: `{ componentId: 1, order: 1 }`

---

## Frontend

### Runtime Stack

- **Framework:** React 19
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4
- **State/Data Fetching:** TanStack React Query
- **HTTP Client:** Axios
- **Canvas/Visualization:** Konva + react-konva, headbreaker (puzzle)
- **Language:** TypeScript

### Key Components

| Component              | Purpose                                      |
|------------------------|----------------------------------------------|
| `ComponentCard`        | Displays a component with progress info      |
| `ComponentForm`        | Create/edit component form                   |
| `RecordModal`          | Log a new activity record                    |
| `PulseCheckModal`      | Submit daily energy/mood check               |
| `StagesPanel`          | List and manage stages for a component       |
| `StageForm`            | Create/edit stage form                       |
| `StageItem`            | Individual stage display                     |
| `PuzzleCanvas`         | Konva-based puzzle visualization             |
| `CalendarView`         | Calendar display of activity records         |
| `MetricsPanel`         | Dashboard metrics overview                   |
| `InsightsPanel`        | Correlation and pattern insights             |
| `WeeklyGoalsView`      | Weekly goal tracking view                    |
| `FocusMode`            | Distraction-free focused view                |
| `PulseCheckPrompt`     | Dashboard prompt for daily pulse check       |

### UI Primitives

`Button`, `Input`, `Select`, `Modal` — located in `frontend/src/components/ui/`.

---

## Scripts

| Command             | Description                              |
|----------------------|------------------------------------------|
| `npm run dev`        | Start SST dev environment (live Lambda)  |
| `npm run deploy`     | Deploy to default stage                  |
| `npm run deploy:prod`| Deploy to production stage               |
| `npm run remove`     | Tear down the SST stack                  |
| `npm run dev:backend`| Run backend locally with ts-node-dev     |
| `npm run dev:frontend`| Run frontend locally with Vite          |
| `npm run install:all`| Install deps for backend and frontend    |

---

## Environment & Secrets

| Variable        | Scope    | Source                              |
|-----------------|----------|-------------------------------------|
| `MongoUri`      | Backend  | SST Secret, linked to Lambda        |
| `VITE_API_URL`  | Frontend | Auto-injected from API Gateway URL  |
