# Pulse - Business Specifications

## Overview

Pulse is an ADHD-oriented personal rhythm and habit tracking application designed to help neurodivergent individuals build sustainable routines without overwhelm. The app focuses on reducing decision paralysis, providing clear visual feedback, and celebrating progress rather than perfection.

---

## Target Audience

### Primary Users
- Adults with ADHD (diagnosed or self-identified)
- Individuals who struggle with:
  - Decision paralysis when faced with multiple tasks
  - Maintaining consistent habits and routines
  - Feeling overwhelmed by traditional productivity apps
  - All-or-nothing thinking patterns

### User Needs
- Simple, non-judgmental tracking
- Reduced cognitive load
- Flexible goals that adapt to energy levels
- Visual progress without shame
- Quick interactions (low friction logging)

---

## Core Concepts

### Components
A **Component** represents a life activity or habit the user wants to maintain. Examples:
- Exercise
- Reading
- Meditation
- Creative projects
- Social connection
- Household tasks

Each Component has:
| Field | Description |
|-------|-------------|
| `name` | Display name of the activity |
| `weight` | Priority level: `low`, `medium`, `high` |
| `minWeeklyFreq` | Minimum times per week to complete |
| `color` | Visual identifier for the component |
| `currentWeekLogs` | Auto-calculated: times logged this week |
| `successRate` | Auto-calculated: historical completion percentage |

### Records
A **Record** is a single logged instance of completing a Component. Each Record captures:
| Field | Description |
|-------|-------------|
| `componentId` | Which activity was completed |
| `date` | When it was done |
| `effortLevel` | Subjective effort: `low`, `medium`, `high` |
| `note` | Optional context or reflection |

### Weight (Priority)
The weight system acknowledges that not all habits are equally important:
- **High**: Core activities essential for wellbeing
- **Medium**: Important but flexible activities
- **Low**: Nice-to-have activities

Weight affects the Focus Mode recommendation algorithm, prioritizing high-weight incomplete items.

---

## Features

### 1. Focus Mode (Default View)
**Purpose**: Eliminate decision paralysis by showing ONE recommended activity.

**Algorithm**:
1. Filter to incomplete components (currentWeekLogs < minWeeklyFreq)
2. Calculate urgency score: `(remaining × weight)`
3. Show the highest-scoring component

**User Flow**:
- See one clear recommendation
- Option to "Log Activity" immediately
- Option to "Skip" and see another suggestion
- When all goals complete: celebration state with option for bonus logging

**ADHD Design Rationale**:
- Reduces overwhelm from seeing all tasks at once
- Removes the "what should I do?" paralysis
- Provides clear next action
- Skip feature respects that some activities don't fit the current moment

### 2. Full Dashboard View
**Purpose**: Provide detailed overview when users want more context.

**Includes**:
- Component cards grid with quick actions
- Calendar view of activity history
- Metrics panel with trends
- Weekly goals progress sidebar

### 3. Weekly Goals Tracking
**Purpose**: Visual progress toward weekly minimums.

**Features**:
- Progress bars for each component
- Clear "done" state when minimum reached
- Quick-log buttons directly from sidebar

**ADHD Design Rationale**:
- Weekly (not daily) goals reduce all-or-nothing thinking
- Missing Monday doesn't ruin the week
- Flexible timing accommodates variable energy levels

### 4. Calendar View
**Purpose**: Visualize patterns over time.

**Features**:
- Color-coded dots showing logged activities
- Click to add records for past dates
- Click existing records to edit

**ADHD Design Rationale**:
- Visual patterns help identify rhythms
- Ability to backfill reduces anxiety about "missed" days
- Seeing history provides motivation

### 5. Effort Level Tracking
**Purpose**: Acknowledge that the same activity can feel different day to day.

**Levels**:
- **Low**: Felt easy, minimal resistance
- **Medium**: Required some effort
- **High**: Significant effort, pushed through resistance

**ADHD Design Rationale**:
- Validates that some days are harder than others
- Data helps identify patterns (time of day, context)
- Completing a high-effort activity is still a win

### 6. Metrics Panel
**Purpose**: Provide insights without judgment.

**Potential Metrics**:
- Current week progress
- Streak information (optional, can trigger shame)
- Patterns by day of week
- Effort distribution

---

## Design Principles

### 1. Reduce Cognitive Load
- Default to Focus Mode (one thing at a time)
- Minimal required fields
- Smart defaults
- Clear visual hierarchy

### 2. Flexibility Over Rigidity
- Weekly goals, not daily requirements
- Skip functionality
- Easy backfilling
- No streaks shaming

### 3. Progress Over Perfection
- Celebrate partial completion
- "Bonus" activities beyond minimums
- Effort tracking validates hard days
- Success rate is informational, not judgmental

### 4. Quick Interactions
- One-tap logging from multiple entry points
- Pre-filled forms where possible
- Mobile-friendly touch targets
- Minimal typing required

### 5. Visual Feedback
- Color coding for quick recognition
- Progress bars for goal tracking
- Calendar dots for patterns
- Celebration states for completion

---

## User Flows

### New User Setup
1. Land on Focus Mode (empty state)
2. Prompted to create first Component
3. Simple form: name, weekly goal, priority, color
4. Immediately see Focus recommendation

### Daily Usage (Focus Mode)
1. Open app, see one recommended activity
2. Either:
   - Log it (opens modal, quick submit)
   - Skip it (see next recommendation)
3. Repeat until satisfied or goals complete
4. See celebration when all minimums met

### Weekly Review (Full View)
1. Switch to Full view
2. Review calendar for patterns
3. Check metrics for insights
4. Adjust component goals if needed

### Logging Past Activity
1. Click day on calendar
2. Select component
3. Add effort level and optional note
4. Submit

---

## Technical Architecture

### Frontend
- React with TypeScript
- TanStack Query for data fetching
- Tailwind CSS for styling
- Component-based architecture

### Backend
- RESTful API
- MongoDB for data storage
- Weekly aggregations calculated server-side

### Data Model
```
User (future)
  └── Components[]
        └── Records[]
```

---

## Future Considerations

### Potential Features
- **Reminders**: Gentle, customizable notifications
- **Energy tracking**: Log daily energy to correlate with effort
- **Time-of-day insights**: When are you most likely to succeed?
- **Rewards/gamification**: Optional, opt-in celebration features
- **Social accountability**: Share goals with trusted person
- **Theming**: Dark mode, custom colors
- **Mobile app**: Native iOS/Android

### Anti-Features (Intentionally Avoided)
- **Strict streaks**: Can trigger shame spirals
- **Leaderboards**: Competition isn't helpful for ADHD
- **Complex analytics**: Overwhelming data
- **Required daily check-ins**: Adds pressure
- **Social feeds**: Comparison is harmful

---

## Success Metrics

### User Success
- Consistent weekly engagement (not daily pressure)
- Increased completion of weekly minimums over time
- Positive sentiment in optional feedback

### Product Success
- User retention at 4+ weeks
- Feature usage (Focus vs Full mode ratio)
- Record creation frequency

---

## Accessibility Considerations

- High contrast color options
- Keyboard navigation support
- Screen reader compatibility
- Reduced motion options
- Clear, readable typography
- Touch-friendly button sizes

---

## Summary

Pulse is designed with ADHD minds at its core. Every feature choice prioritizes reducing overwhelm, respecting variable energy levels, and celebrating progress over perfection. The Focus Mode default embodies this philosophy: instead of showing everything and asking "what will you do?", it answers "here's one thing you could do right now."
