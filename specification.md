# Fullstack App Specification: Pulse Task Manager

## 1. System Overview
A "Personal Rhythm" manager that tracks commitment to specific life areas (Components) rather than just a simple to-do list. It measures success based on the frequency of logged activities against set weekly targets.

---

## 2. Technical Stack
- **Frontend:** React 18 (Vite), TypeScript, Tailwind CSS, TanStack Query
- **Backend:** Node.js, Express, TypeScript, Zod validation
- **Database:** MongoDB via Mongoose

---

## 3. Project Structure

### Backend (`/backend`)
```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── interfaces/
│   │   ├── component.interface.ts
│   │   └── record.interface.ts
│   ├── models/
│   │   ├── Component.ts
│   │   └── Record.ts
│   ├── controllers/
│   │   ├── component.controller.ts
│   │   └── record.controller.ts
│   ├── routes/
│   │   ├── component.routes.ts
│   │   ├── record.routes.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── validate.ts          # Zod validation middleware
│   ├── schemas/
│   │   ├── component.schema.ts  # Zod schemas for components
│   │   └── record.schema.ts     # Zod schemas for records
│   ├── utils/
│   │   └── statsCalculator.ts   # Success rate calculations
│   └── index.ts                 # Express app entry
├── package.json
├── tsconfig.json
└── .env
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts            # Axios + API functions
│   ├── components/
│   │   ├── ComponentCard.tsx
│   │   ├── ComponentForm.tsx
│   │   ├── RecordModal.tsx
│   │   ├── Dashboard/
│   │   │   ├── CalendarView.tsx
│   │   │   ├── TimelineView.tsx
│   │   │   └── MetricsPanel.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       └── Modal.tsx
│   ├── hooks/
│   │   ├── useComponents.ts
│   │   └── useRecords.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 4. Data Architecture

### IComponent
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique identifier |
| `name` | String | e.g., "Tech Lead", "Life", "Fitness" |
| `weight` | String | Enum: 'low', 'medium', 'high' |
| `minWeeklyFreq` | Number | Required logs per week (min: 1) |
| `color` | String | Hex code for UI display (#RRGGBB) |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

### IComponentWithStats (API Response)
Extends IComponent with:
| Field | Type | Description |
| :--- | :--- | :--- |
| `currentWeekLogs` | Number | Records logged this week |
| `successRate` | Number | (currentWeekLogs / minWeeklyFreq) * 100, capped at 100 |

### IRecord
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique identifier |
| `componentId` | ObjectId | Reference to the parent Component |
| `date` | Date | The date the work was performed |
| `effortLevel` | String | Enum: 'low', 'medium', 'high' |
| `note` | String | Optional description (max 500 chars) |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

---

## 5. API Endpoints

### Components
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/components` | List all with aggregated weekly stats |
| GET | `/api/components/:id` | Get single component with stats |
| POST | `/api/components` | Create new component |
| PATCH | `/api/components/:id` | Update component |
| DELETE | `/api/components/:id` | Delete component + cascade delete records |

### Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/records` | List records (query: startDate, endDate, componentId) |
| POST | `/api/records` | Create new record |
| PATCH | `/api/records/:id` | Update record (date, effortLevel, note) |
| DELETE | `/api/records/:id` | Delete record |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

---

## 6. Frontend Features

### Component Management
- **Component Cards:** Display name, color indicator, weight badge, progress bar, success rate
- **CRUD Operations:** Create, edit, and delete components via modal forms
- **Color Picker:** 8 predefined color options for components
- **Cascade Delete:** Deleting a component removes all associated records

### Activity Calendar
- **View Modes:** Toggle between Week and Month view
- **Navigation:** Previous/Next buttons, "Today" quick navigation
- **Component Filter:** Dropdown to filter by specific component or show all
- **Effort Icons:** Geometric shapes indicate effort level:
  - Circle = Low effort
  - Triangle = Medium effort
  - Square = High effort
- **Hover Tooltips:** Shows component name and effort level on icon hover
- **Current Day Highlight:** Today's date highlighted with indigo border
- **Outside Month Styling:** Days outside current month shown with muted styling

### Record Management
- **Quick Log Modal:** Rapid entry for logging activities
- **Edit Records:** Modify date, effort level, and notes from Recent Activity
- **Delete Records:** Remove individual records with confirmation

### Recent Activity (Timeline)
- **Chronological List:** Shows last 10 records sorted by date
- **Date Formatting:** "Today", "Yesterday", or formatted date
- **Effort Badges:** Color-coded badges (green/yellow/red)
- **Edit/Delete Actions:** Inline buttons for each record

### Metrics Panel
- **Overview Stats:**
  - This Week: Total activities with % change vs last week
  - Average Success Rate: Across all components
  - Day Streak: Consecutive days with at least one activity
  - Avg/Day (30d): Average activities per day over last 30 days

- **Effort Distribution:**
  - Visual bar chart showing low/medium/high effort breakdown
  - Percentage and count for each effort level

- **Component Trends (Last 4 Weeks):**
  - Per-component weekly activity bars
  - Target indicator (green when met)
  - Week-over-week trend indicator

---

## 7. Validation (Zod Schemas)

### Component Validation
- `name`: Required, 1-100 characters
- `weight`: Enum ['low', 'medium', 'high'], default 'medium'
- `minWeeklyFreq`: Integer, minimum 1
- `color`: Regex validated hex code (#RRGGBB)

### Record Validation
- `componentId`: Required, valid ObjectId
- `date`: ISO datetime or YYYY-MM-DD format
- `effortLevel`: Enum ['low', 'medium', 'high'], default 'medium'
- `note`: Optional, max 500 characters

---

## 8. Error Handling

### Backend
- Centralized error middleware
- Zod validation errors return 400 with field-specific messages
- Mongoose CastError (invalid ID) returns 400
- Not found errors return 404
- Consistent JSON error response format:
```json
{
  "error": "Error message",
  "details": [{ "path": "field", "message": "error" }]
}
```

### Frontend
- TanStack Query handles loading and error states
- Optimistic updates with automatic cache invalidation
- Confirmation dialogs for destructive actions

---

## 9. Running the Application

### Prerequisites
- Node.js 20.19+ or 22.12+
- MongoDB running locally or connection string

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configure MONGODB_URI and PORT
npm run dev           # Runs on http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev           # Runs on http://localhost:5173
```

The frontend proxies `/api` requests to the backend automatically.

---

## 10. Future Enhancements
- User authentication and multi-user support
- Data export (CSV, JSON)
- Goal setting and reminders
- Mobile responsive improvements
- Dark mode support
- Activity notes with rich text
- Recurring activity templates
