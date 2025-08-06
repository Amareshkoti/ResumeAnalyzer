import { GeneralSettings, Faculty, TimetableConfig, TimetableSolution, SectionTimetable, TimeSlot } from '../types/timetable';
import { generateTimetable, generateTimeSlots } from './timetableGenerator';

// Default configuration template
export const getDefaultConfig = (): TimetableConfig => ({
  settings: {
    sections: ['A', 'B', 'C'],
    classHoursPerDay: 7,
    hourDuration: 50,
    startTime: '08:00',
    endTime: '15:00'
  },
  faculty: [
    {
      id: '1',
      name: 'Dr. Smith',
      subject: 'Mathematics',
      type: 'Regular',
      maxLecturesPerDay: 3,
      maxLecturesPerWeek: 15
    },
    {
      id: '2',
      name: 'Prof. Johnson',
      subject: 'Physics',
      type: 'Lab',
      maxLecturesPerDay: 2,
      maxLecturesPerWeek: 10
    },
    {
      id: '3',
      name: 'Ms. Davis',
      subject: 'English',
      type: 'Regular',
      maxLecturesPerDay: 4,
      maxLecturesPerWeek: 20
    }
  ],
  constraints: {
    morningBreak: {
      start: '09:40',
      end: '10:00'
    },
    lunch: {
      start: '12:30',
      end: '13:20'
    },
    weeklyTest: {
      day: 'Wednesday',
      lastTwoPeriods: true
    },
    rotatingActivities: {
      activities: ['Library', 'Sports', 'Addon', 'Counselling'],
      lastPeriodOnly: true
    }
  }
});

// Convert UI format to JSON config format
export const convertUIToConfig = (
  settings: GeneralSettings,
  facultyList: Faculty[]
): TimetableConfig => ({
  settings: {
    sections: settings.sections,
    classHoursPerDay: settings.classHoursPerDay,
    hourDuration: settings.hourDuration,
    startTime: settings.startTime,
    endTime: addMinutes(settings.startTime, settings.classHoursPerDay * settings.hourDuration)
  },
  faculty: facultyList,
  constraints: {
    morningBreak: {
      start: '09:40',
      end: '10:00'
    },
    lunch: {
      start: '12:30',
      end: '13:20'
    },
    weeklyTest: {
      day: 'Wednesday',
      lastTwoPeriods: true
    },
    rotatingActivities: {
      activities: ['Library', 'Sports', 'Addon', 'Counselling'],
      lastPeriodOnly: true
    }
  }
});

// Convert JSON config to UI format
export const convertConfigToUI = (config: TimetableConfig): {
  settings: GeneralSettings;
  faculty: Faculty[];
} => ({
  settings: {
    sections: config.settings.sections,
    classHoursPerDay: config.settings.classHoursPerDay,
    hourDuration: config.settings.hourDuration,
    startTime: config.settings.startTime
  },
  faculty: config.faculty
});

// Generate timetable from JSON config
export const generateTimetableFromConfig = (config: TimetableConfig): TimetableSolution => {
  const startTime = Date.now();
  
  // Convert config to UI format
  const { settings, faculty } = convertConfigToUI(config);
  
  // Generate timetable
  const timeSlots = generateTimeSlots(settings);
  const timetables = generateTimetable(settings, faculty);
  
  // Validate constraints
  const conflicts = validateConstraints(timetables, timeSlots, config);
  
  return {
    config,
    timetables,
    timeSlots,
    metadata: {
      generationTime: new Date().toISOString(),
      constraintsSatisfied: conflicts.length === 0,
      conflicts
    }
  };
};

// Validate timetable against constraints
const validateConstraints = (
  timetables: SectionTimetable[],
  timeSlots: TimeSlot[],
  config: TimetableConfig
): string[] => {
  const conflicts: string[] = [];
  
  // Check for free periods
  timetables.forEach(timetable => {
    Object.entries(timetable.schedule).forEach(([day, slots]) => {
      slots.forEach((slot, index) => {
        if (!slot.isBreak && !slot.isLunch && slot.subject === 'Free Period') {
          conflicts.push(`Free period found in Section ${timetable.section} on ${day} at slot ${index}`);
        }
      });
    });
  });
  
  // Check lab room conflicts
  const labRoomUsage: { [day: string]: { [slotIndex: number]: string[] } } = {};
  timetables.forEach(timetable => {
    Object.entries(timetable.schedule).forEach(([day, slots]) => {
      if (!labRoomUsage[day]) labRoomUsage[day] = {};
      
      slots.forEach((slot, index) => {
        if (slot.type === 'Lab') {
          if (!labRoomUsage[day][index]) labRoomUsage[day][index] = [];
          labRoomUsage[day][index].push(timetable.section);
        }
      });
    });
  });
  
  Object.entries(labRoomUsage).forEach(([day, slots]) => {
    Object.entries(slots).forEach(([slotIndex, sections]) => {
      if (sections.length > 1) {
        conflicts.push(`Lab room conflict on ${day} at slot ${slotIndex}: Sections ${sections.join(', ')}`);
      }
    });
  });
  
  // Check weekly test placement
  timetables.forEach(timetable => {
    const wednesdaySchedule = timetable.schedule['Wednesday'];
    if (wednesdaySchedule) {
      const lastTwoSlots = wednesdaySchedule.slice(-2);
      lastTwoSlots.forEach((slot, index) => {
        if (slot.type !== 'WeeklyTest') {
          conflicts.push(`Weekly test not in last two slots for Section ${timetable.section} on Wednesday`);
        }
      });
    }
  });
  
  return conflicts;
};

// Export configuration to JSON file
export const exportConfigToJSON = (config: TimetableConfig): string => {
  return JSON.stringify(config, null, 2);
};

// Import configuration from JSON string
export const importConfigFromJSON = (jsonString: string): TimetableConfig => {
  try {
    const config = JSON.parse(jsonString);
    
    // Validate required fields
    if (!config.settings || !config.faculty || !config.constraints) {
      throw new Error('Invalid configuration format');
    }
    
    return config;
  } catch (error) {
    throw new Error(`Failed to parse JSON configuration: ${error}`);
  }
};

// Helper function to add minutes to time
const addMinutes = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}; 