import { Request, Response, NextFunction } from 'express';
import { PulseCheck } from '../models/PulseCheck';
import { Record } from '../models/Record';
import { Component } from '../models/Component';

interface DayData {
  date: Date;
  energyLevel: number;
  moodLevel: number;
  activityCount: number;
  highEffortCount: number;
  componentActivities: Map<string, { count: number; highEffort: number }>;
}

interface Insight {
  type: 'same_day' | 'next_day' | 'weekly_pattern';
  insight: string;
  confidence: 'low' | 'medium' | 'high';
  dataPoints: number;
  details: {
    correlation: number;
    direction: string;
    activityType?: string;
  };
}

interface WeeklyPatternEntry {
  dayOfWeek: number;
  avgEnergy: number;
  avgMood: number;
  count: number;
}

interface InsightsResponse {
  correlations: Insight[];
  summary: {
    averageEnergy: number;
    averageMood: number;
    bestDayOfWeek: string | null;
    worstDayOfWeek: string | null;
  };
  weeklyPattern: WeeklyPatternEntry[];
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MIN_DATA_POINTS = 5;
const CORRELATION_THRESHOLD = 0.3;

// Calculate Pearson correlation coefficient
function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
  const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

function getConfidence(correlation: number, dataPoints: number): 'low' | 'medium' | 'high' {
  const absCorr = Math.abs(correlation);
  if (dataPoints >= 20 && absCorr >= 0.6) return 'high';
  if (dataPoints >= 10 && absCorr >= 0.4) return 'medium';
  return 'low';
}

function getDirection(correlation: number): string {
  if (correlation >= 0.3) return 'positive';
  if (correlation <= -0.3) return 'negative';
  return 'neutral';
}

export async function getInsights(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get last 30 days of pulse checks and records
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    const [pulseChecks, records, components] = await Promise.all([
      PulseCheck.find({ date: { $gte: thirtyDaysAgo } }).sort({ date: 1 }),
      Record.find({ date: { $gte: thirtyDaysAgo } }),
      Component.find(),
    ]);

    // Build component name map
    const componentNameMap = new Map(
      components.map((c) => [c._id.toString(), c.name])
    );

    // Build day data map
    const dayDataMap = new Map<string, DayData>();

    // Add pulse check data
    for (const pc of pulseChecks) {
      const dateKey = pc.date.toISOString().split('T')[0];
      dayDataMap.set(dateKey, {
        date: pc.date,
        energyLevel: pc.energyLevel,
        moodLevel: pc.moodLevel,
        activityCount: 0,
        highEffortCount: 0,
        componentActivities: new Map(),
      });
    }

    // Add activity data
    for (const record of records) {
      const dateKey = new Date(record.date).toISOString().split('T')[0];
      const dayData = dayDataMap.get(dateKey);
      if (dayData) {
        dayData.activityCount++;
        if (record.effortLevel === 'high') {
          dayData.highEffortCount++;
        }

        const componentId = record.componentId.toString();
        const existing = dayData.componentActivities.get(componentId) || { count: 0, highEffort: 0 };
        existing.count++;
        if (record.effortLevel === 'high') {
          existing.highEffort++;
        }
        dayData.componentActivities.set(componentId, existing);
      }
    }

    const insights: Insight[] = [];
    const dayDataList = Array.from(dayDataMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    // Skip insights if not enough data
    if (dayDataList.length < MIN_DATA_POINTS) {
      const response: InsightsResponse = {
        correlations: [],
        summary: {
          averageEnergy: 0,
          averageMood: 0,
          bestDayOfWeek: null,
          worstDayOfWeek: null,
        },
        weeklyPattern: [],
      };
      res.json(response);
      return;
    }

    // 1. Same-day correlations: activity count vs mood/energy
    const activityCounts = dayDataList.map((d) => d.activityCount);
    const moodLevels = dayDataList.map((d) => d.moodLevel);
    const energyLevels = dayDataList.map((d) => d.energyLevel);

    const activityMoodCorr = pearsonCorrelation(activityCounts, moodLevels);
    if (Math.abs(activityMoodCorr) >= CORRELATION_THRESHOLD) {
      insights.push({
        type: 'same_day',
        insight:
          activityMoodCorr > 0
            ? 'More activities correlate with better mood on the same day'
            : 'More activities correlate with lower mood on the same day',
        confidence: getConfidence(activityMoodCorr, dayDataList.length),
        dataPoints: dayDataList.length,
        details: {
          correlation: Math.round(activityMoodCorr * 100) / 100,
          direction: getDirection(activityMoodCorr),
        },
      });
    }

    const activityEnergyCorr = pearsonCorrelation(activityCounts, energyLevels);
    if (Math.abs(activityEnergyCorr) >= CORRELATION_THRESHOLD) {
      insights.push({
        type: 'same_day',
        insight:
          activityEnergyCorr > 0
            ? 'More activities correlate with higher energy on the same day'
            : 'More activities correlate with lower energy on the same day',
        confidence: getConfidence(activityEnergyCorr, dayDataList.length),
        dataPoints: dayDataList.length,
        details: {
          correlation: Math.round(activityEnergyCorr * 100) / 100,
          direction: getDirection(activityEnergyCorr),
        },
      });
    }

    // 2. Next-day correlations: previous day's high-effort activities vs today's mood
    if (dayDataList.length >= MIN_DATA_POINTS + 1) {
      const prevHighEffort: number[] = [];
      const nextMood: number[] = [];
      const nextEnergy: number[] = [];

      for (let i = 1; i < dayDataList.length; i++) {
        const prevDate = dayDataList[i - 1].date.getTime();
        const currDate = dayDataList[i].date.getTime();
        const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

        // Only consecutive days
        if (dayDiff === 1) {
          prevHighEffort.push(dayDataList[i - 1].highEffortCount);
          nextMood.push(dayDataList[i].moodLevel);
          nextEnergy.push(dayDataList[i].energyLevel);
        }
      }

      if (prevHighEffort.length >= MIN_DATA_POINTS) {
        const highEffortMoodCorr = pearsonCorrelation(prevHighEffort, nextMood);
        if (Math.abs(highEffortMoodCorr) >= CORRELATION_THRESHOLD) {
          insights.push({
            type: 'next_day',
            insight:
              highEffortMoodCorr > 0
                ? 'High-effort exercise correlates with better mood the next day'
                : 'High-effort exercise correlates with lower mood the next day',
            confidence: getConfidence(highEffortMoodCorr, prevHighEffort.length),
            dataPoints: prevHighEffort.length,
            details: {
              correlation: Math.round(highEffortMoodCorr * 100) / 100,
              direction: getDirection(highEffortMoodCorr),
            },
          });
        }

        const highEffortEnergyCorr = pearsonCorrelation(prevHighEffort, nextEnergy);
        if (Math.abs(highEffortEnergyCorr) >= CORRELATION_THRESHOLD) {
          insights.push({
            type: 'next_day',
            insight:
              highEffortEnergyCorr > 0
                ? 'High-effort activities correlate with higher energy the next day'
                : 'High-effort activities correlate with lower energy the next day',
            confidence: getConfidence(highEffortEnergyCorr, prevHighEffort.length),
            dataPoints: prevHighEffort.length,
            details: {
              correlation: Math.round(highEffortEnergyCorr * 100) / 100,
              direction: getDirection(highEffortEnergyCorr),
            },
          });
        }
      }
    }

    // 3. Component-specific correlations (next-day)
    const componentIds = new Set<string>();
    for (const dayData of dayDataList) {
      Array.from(dayData.componentActivities.keys()).forEach((componentId) => {
        componentIds.add(componentId);
      });
    }

    Array.from(componentIds).forEach((componentId) => {
      const componentName = componentNameMap.get(componentId) || 'Unknown';
      const prevComponentActivity: number[] = [];
      const nextMood: number[] = [];

      for (let i = 1; i < dayDataList.length; i++) {
        const prevDate = dayDataList[i - 1].date.getTime();
        const currDate = dayDataList[i].date.getTime();
        const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

        if (dayDiff === 1) {
          const activity = dayDataList[i - 1].componentActivities.get(componentId);
          prevComponentActivity.push(activity?.count || 0);
          nextMood.push(dayDataList[i].moodLevel);
        }
      }

      if (prevComponentActivity.length >= MIN_DATA_POINTS) {
        const corr = pearsonCorrelation(prevComponentActivity, nextMood);
        if (Math.abs(corr) >= CORRELATION_THRESHOLD) {
          insights.push({
            type: 'next_day',
            insight:
              corr > 0
                ? `${componentName} correlates with better mood the next day`
                : `${componentName} correlates with lower mood the next day`,
            confidence: getConfidence(corr, prevComponentActivity.length),
            dataPoints: prevComponentActivity.length,
            details: {
              correlation: Math.round(corr * 100) / 100,
              direction: getDirection(corr),
              activityType: componentName,
            },
          });
        }
      }
    });

    // 4. Weekly pattern analysis
    const weeklyData: Map<number, { energy: number[]; mood: number[] }> = new Map();
    for (let i = 0; i < 7; i++) {
      weeklyData.set(i, { energy: [], mood: [] });
    }

    for (const dayData of dayDataList) {
      const dayOfWeek = dayData.date.getUTCDay();
      const data = weeklyData.get(dayOfWeek)!;
      data.energy.push(dayData.energyLevel);
      data.mood.push(dayData.moodLevel);
    }

    const weeklyPattern: WeeklyPatternEntry[] = [];
    let bestDay = { day: -1, avgMood: 0 };
    let worstDay = { day: -1, avgMood: 5 };

    Array.from(weeklyData.entries()).forEach(([dayOfWeek, data]) => {
      if (data.mood.length > 0) {
        const avgEnergy = data.energy.reduce((a, b) => a + b, 0) / data.energy.length;
        const avgMood = data.mood.reduce((a, b) => a + b, 0) / data.mood.length;

        weeklyPattern.push({
          dayOfWeek,
          avgEnergy: Math.round(avgEnergy * 100) / 100,
          avgMood: Math.round(avgMood * 100) / 100,
          count: data.mood.length,
        });

        if (avgMood > bestDay.avgMood) {
          bestDay = { day: dayOfWeek, avgMood };
        }
        if (avgMood < worstDay.avgMood) {
          worstDay = { day: dayOfWeek, avgMood };
        }
      }
    });

    // Add weekly pattern insights
    if (weeklyPattern.length >= 3 && bestDay.day !== worstDay.day) {
      const moodRange = bestDay.avgMood - worstDay.avgMood;
      if (moodRange >= 0.5) {
        insights.push({
          type: 'weekly_pattern',
          insight: `${DAY_NAMES[bestDay.day]} tends to be your best day; ${DAY_NAMES[worstDay.day]} tends to be your lowest`,
          confidence: weeklyPattern.reduce((sum, w) => sum + w.count, 0) >= 20 ? 'high' : 'medium',
          dataPoints: weeklyPattern.reduce((sum, w) => sum + w.count, 0),
          details: {
            correlation: Math.round(moodRange * 100) / 100,
            direction: 'pattern',
          },
        });
      }
    }

    // Calculate summary
    const avgEnergy = dayDataList.length > 0
      ? dayDataList.reduce((sum, d) => sum + d.energyLevel, 0) / dayDataList.length
      : 0;
    const avgMood = dayDataList.length > 0
      ? dayDataList.reduce((sum, d) => sum + d.moodLevel, 0) / dayDataList.length
      : 0;

    const response: InsightsResponse = {
      correlations: insights,
      summary: {
        averageEnergy: Math.round(avgEnergy * 100) / 100,
        averageMood: Math.round(avgMood * 100) / 100,
        bestDayOfWeek: bestDay.day >= 0 ? DAY_NAMES[bestDay.day] : null,
        worstDayOfWeek: worstDay.day >= 0 ? DAY_NAMES[worstDay.day] : null,
      },
      weeklyPattern: weeklyPattern.sort((a, b) => a.dayOfWeek - b.dayOfWeek),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}
