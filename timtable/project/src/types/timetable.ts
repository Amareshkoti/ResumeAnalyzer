export interface GeneralSettings {
  sections: string[];
  classHoursPerDay: number;
  hourDuration: number; // in minutes
  startTime: string; // HH:MM format
}

export interface Faculty {
  id: string;
  name: string;
  subject: string;
  type: 'Regular' | 'Lab';
  maxLecturesPerDay?: number;
  maxLecturesPerWeek?: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isBreak: boolean;
  isLunch: boolean;
  label: string;
}

export interface TimetableCell {
  subject: string;
  faculty: string;
  type: 'Regular' | 'Lab' | 'WeeklyTest' | 'Library' | 'Sports' | 'Addon' | 'Counselling';
  isBreak?: boolean;
  isLunch?: boolean;
}

export interface SectionTimetable {
  section: string;
  schedule: {
    [day: string]: TimetableCell[];
  };
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

// JSON Configuration Types
export interface TimetableConfig {
  settings: {
    sections: string[];
    classHoursPerDay: number;
    hourDuration: number;
    startTime: string;
    endTime: string;
  };
  faculty: Faculty[];
  constraints: {
    morningBreak: {
      start: string;
      end: string;
    };
    lunch: {
      start: string;
      end: string;
    };
    weeklyTest: {
      day: 'Wednesday';
      lastTwoPeriods: boolean;
    };
    rotatingActivities: {
      activities: string[];
      lastPeriodOnly: boolean;
    };
  };
}

export interface TimetableSolution {
  config: TimetableConfig;
  timetables: SectionTimetable[];
  timeSlots: TimeSlot[];
  metadata: {
    generationTime: string;
    constraintsSatisfied: boolean;
    conflicts: string[];
  };
}