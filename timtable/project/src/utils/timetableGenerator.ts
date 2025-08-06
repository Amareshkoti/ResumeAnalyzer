import { GeneralSettings, Faculty, TimetableCell, SectionTimetable, TimeSlot, DayOfWeek, TimetableConfig, TimetableSolution } from '../types/timetable';
import { addMinutes, isTimeBetween, timeToMinutes } from './timeUtils';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_BREAK_START = '09:40';
const DEFAULT_BREAK_END = '10:00';
const DEFAULT_LUNCH_START = '12:30';
const DEFAULT_LUNCH_END = '13:20';

export const generateTimeSlots = (settings: GeneralSettings): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  
  // Create time slots exactly as per sample timetable
  const timeSlotConfig = [
    { start: '08:00', end: '08:50', isBreak: false, isLunch: false },
    { start: '08:50', end: '09:40', isBreak: false, isLunch: false },
    { start: '09:40', end: '10:00', isBreak: true, isLunch: false },
    { start: '10:00', end: '10:50', isBreak: false, isLunch: false },
    { start: '10:50', end: '11:40', isBreak: false, isLunch: false },
    { start: '11:40', end: '12:30', isBreak: false, isLunch: false },
    { start: '12:30', end: '13:20', isBreak: false, isLunch: true },
    { start: '13:20', end: '14:10', isBreak: false, isLunch: false },
    { start: '14:10', end: '15:00', isBreak: false, isLunch: false }
  ];
  
  timeSlotConfig.forEach((config, index) => {
    slots.push({
      startTime: config.start,
      endTime: config.end,
      isBreak: config.isBreak,
      isLunch: config.isLunch,
      label: config.isBreak ? 'BREAK' : config.isLunch ? 'LUNCH' : `${config.start}-${config.end}`
    });
  });
  
  return slots;
};

// Improved constraint-based timetable generator
export const generateTimetable = (
  settings: GeneralSettings,
  facultyList: Faculty[]
): SectionTimetable[] => {
  const timeSlots = generateTimeSlots(settings);
  const timetables: SectionTimetable[] = [];
  
  // Track faculty assignments globally to prevent clashes
  const globalFacultySchedule: { [facultyId: string]: { [day: string]: number[] } } = {};
  
  // Track lab assignments per section per lab faculty (every section should get each lab once)
  const labAssignments: { [section: string]: { [labFacultyId: string]: boolean } } = {};
  
  // Track lab room usage (only one section can use lab at a time)
  const labRoomSchedule: { [day: string]: { [slotIndex: number]: string } } = {};
  
  // Get lab faculty list
  const labFaculty = facultyList.filter(f => f.type === 'Lab');
  const regularFaculty = facultyList.filter(f => f.type === 'Regular');
  
  // Initialize tracking
  facultyList.forEach(faculty => {
    globalFacultySchedule[faculty.id] = {};
    DAYS.forEach(day => {
      globalFacultySchedule[faculty.id][day] = [];
    });
  });
  
  DAYS.forEach(day => {
    labRoomSchedule[day] = {};
  });
  
  settings.sections.forEach(section => {
    labAssignments[section] = {};
    labFaculty.forEach(faculty => {
      labAssignments[section][faculty.id] = false;
    });
  });
  
  // First pass: Schedule labs for all sections (priority)
  // Each section needs to get ALL lab subjects once per week
  // Strategy: Distribute labs evenly across sections and days
  
  // Create a matrix of lab assignments: [section][labFaculty]
  const labAssignmentMatrix: { [section: string]: { [labFacultyId: string]: { day: string; slots: number[] } | null } } = {};
  
  settings.sections.forEach(section => {
    labAssignmentMatrix[section] = {};
    labFaculty.forEach(faculty => {
      labAssignmentMatrix[section][faculty.id] = null;
    });
  });
  
  // LAB SCHEDULING: Guarantee every section gets every lab
  labFaculty.forEach(labFac => {
    settings.sections.forEach(section => {
      if (!labAssignmentMatrix[section][labFac.id]) {
        let scheduled = false;
        for (let dayIndex = 0; dayIndex < DAYS.length && !scheduled; dayIndex++) {
          const day = DAYS[dayIndex];
          if (day === 'Wednesday') continue;
          for (let startSlot = 0; startSlot < timeSlots.length - 2 && !scheduled; startSlot++) {
            const labSlots = findConsecutiveLabSlotsFromStart(labFac.id, startSlot, timeSlots, globalFacultySchedule, labRoomSchedule, day, section);
            if (labSlots.length === 3) {
              scheduleLabSession(labFac, labSlots, day, section, globalFacultySchedule, labRoomSchedule);
              labAssignmentMatrix[section][labFac.id] = { day, slots: labSlots };
              labAssignments[section][labFac.id] = true;
              scheduled = true;
            }
          }
        }
        if (!labAssignmentMatrix[section][labFac.id]) {
          console.log(`✗ FAILED to schedule ${labFac.subject} LAB for Section ${section}`);
        }
      }
    });
  });
  
  // Log lab assignments for debugging
  console.log('\n=== Lab Assignment Summary ===');
  settings.sections.forEach(section => {
    console.log(`\nSection ${section}:`);
    labFaculty.forEach(labFac => {
      const assignment = labAssignmentMatrix[section][labFac.id];
      if (assignment) {
        console.log(`  ✓ ${labFac.subject} LAB: ${assignment.day} (${assignment.slots.length} periods)`);
      } else {
        console.log(`  ✗ ${labFac.subject} LAB: NOT SCHEDULED`);
      }
    });
  });
  
  // Generate complete timetables
  // REGULAR SUBJECT SCHEDULING: Round-robin, load-balanced, no consecutive repeats
  settings.sections.forEach(section => {
    const sectionTimetable: SectionTimetable = {
      section,
      schedule: {}
    };
    DAYS.forEach((day, dayIndex) => {
      sectionTimetable.schedule[day] = [];
      let lastFaculty = null;
      let subjectQueue = [...regularFaculty];
      for (let slotIndex = 0; slotIndex < timeSlots.length; slotIndex++) {
        const slot = timeSlots[slotIndex];
        if (slot.isBreak) {
          sectionTimetable.schedule[day].push({ subject: 'BREAK', faculty: '', type: 'Regular', isBreak: true });
        } else if (slot.isLunch) {
          sectionTimetable.schedule[day].push({ subject: 'LUNCH', faculty: '', type: 'Regular', isLunch: true });
        } else if (day === 'Wednesday' && (slotIndex === timeSlots.length - 2 || slotIndex === timeSlots.length - 1)) {
          sectionTimetable.schedule[day].push({ subject: 'Weekly Test', faculty: '', type: 'WeeklyTest' });
        } else if (day !== 'Wednesday' && slotIndex === timeSlots.length - 1) {
          const activities = ['Library', 'Sports', 'Addon', 'Counselling'];
          const activityIndex = (dayIndex + section.charCodeAt(0) - 65) % activities.length;
          const activity = activities[activityIndex];
          sectionTimetable.schedule[day].push({ subject: activity, faculty: '', type: activity as any });
        } else {
          // Check if this slot is already assigned to a lab
          const existingAssignment = getExistingAssignment(section, day, slotIndex, globalFacultySchedule, labRoomSchedule, facultyList);
          if (existingAssignment) {
            sectionTimetable.schedule[day].push(existingAssignment);
                } else {
            // Round-robin, load-balanced regular subject assignment
            let assigned = false;
            for (let i = 0; i < subjectQueue.length; i++) {
              const faculty = subjectQueue[0];
              subjectQueue.push(subjectQueue.shift()!); // rotate
              if (faculty.name === lastFaculty) continue; // avoid consecutive
              if (globalFacultySchedule[faculty.id][day].includes(slotIndex)) continue;
              // Check max lectures per day/week
              if (faculty.maxLecturesPerDay && globalFacultySchedule[faculty.id][day].length >= faculty.maxLecturesPerDay) continue;
              if (faculty.maxLecturesPerWeek) {
                const weekLectures = DAYS.reduce((total, d) => total + (globalFacultySchedule[faculty.id][d]?.length || 0), 0);
                if (weekLectures >= faculty.maxLecturesPerWeek) continue;
              }
              sectionTimetable.schedule[day].push({ subject: faculty.subject, faculty: faculty.name, type: 'Regular' });
              globalFacultySchedule[faculty.id][day].push(slotIndex);
              lastFaculty = faculty.name;
              assigned = true;
              break;
            }
            if (!assigned) {
              // fallback: assign any available
              sectionTimetable.schedule[day].push({ subject: 'Free Period', faculty: '', type: 'Regular' });
            }
          }
        }
      }
    });
    timetables.push(sectionTimetable);
  });
  
  return timetables;
};

// Find 3 consecutive class periods for lab (breaks/lunch can interrupt)
const findConsecutiveLabSlots = (
  facultyId: string,
  timeSlots: TimeSlot[],
  globalFacultySchedule: { [facultyId: string]: { [day: string]: number[] } },
  labRoomSchedule: { [day: string]: { [slotIndex: number]: string } },
  day: string,
  section: string
): number[] => {
  const labSlots: number[] = [];
  
  for (let startSlot = 0; startSlot < timeSlots.length; startSlot++) {
    labSlots.length = 0; // Reset
    
    // Try to find 3 consecutive class periods starting from this slot
    let classPeriodsFound = 0;
    let currentSlot = startSlot;
    
    while (currentSlot < timeSlots.length && classPeriodsFound < 3) {
      const slot = timeSlots[currentSlot];
      
      // Skip breaks and lunch (they don't count as class periods)
      if (slot.isBreak || slot.isLunch) {
        currentSlot++;
        continue;
      }
      
      // Check if this slot is available for lab
      if (canScheduleLabAtSlot(facultyId, currentSlot, timeSlots, globalFacultySchedule, labRoomSchedule, day, section)) {
        labSlots.push(currentSlot);
        classPeriodsFound++;
      } else {
        // If this slot is not available, we can't use it for lab
        break;
      }
      
      currentSlot++;
    }
    
    // If we found exactly 3 class periods, we can schedule the lab
    if (classPeriodsFound === 3) {
      return labSlots;
    }
  }
  
  return []; // No suitable consecutive slots found
};

// Find 3 consecutive class periods for lab starting from a specific slot
const findConsecutiveLabSlotsFromStart = (
  facultyId: string,
  startSlot: number,
  timeSlots: TimeSlot[],
  globalFacultySchedule: { [facultyId: string]: { [day: string]: number[] } },
  labRoomSchedule: { [day: string]: { [slotIndex: number]: string } },
  day: string,
  section: string
): number[] => {
  const labSlots: number[] = [];
  
  // Try to find 3 consecutive class periods starting from the specified slot
  let classPeriodsFound = 0;
  let currentSlot = startSlot;
  
  while (currentSlot < timeSlots.length && classPeriodsFound < 3) {
    const slot = timeSlots[currentSlot];
    
    // Skip breaks and lunch (they don't count as class periods)
    if (slot.isBreak || slot.isLunch) {
      currentSlot++;
      continue;
    }
    
    // Check if this slot is available for lab
    if (canScheduleLabAtSlot(facultyId, currentSlot, timeSlots, globalFacultySchedule, labRoomSchedule, day, section)) {
      labSlots.push(currentSlot);
      classPeriodsFound++;
    } else {
      // If this slot is not available, we can't use it for lab
      break;
    }
    
    currentSlot++;
  }
  
  // If we found exactly 3 class periods, we can schedule the lab
  if (classPeriodsFound === 3) {
    return labSlots;
  }
  
  return []; // No suitable consecutive slots found
};

// Emergency function to find any available slots for labs
const findEmergencyLabSlots = (
  facultyId: string,
  timeSlots: TimeSlot[],
  globalFacultySchedule: { [facultyId: string]: { [day: string]: number[] } },
  labRoomSchedule: { [day: string]: { [slotIndex: number]: string } },
  section: string
): number[] => {
  const emergencySlots: number[] = [];
  
  // Try all days except Wednesday
  DAYS.forEach((day, dayIndex) => {
    if (day === 'Wednesday') return;
    
    for (let slotIndex = 0; slotIndex < timeSlots.length; slotIndex++) {
      const slot = timeSlots[slotIndex];
      
      // Skip breaks, lunch, and special periods
      if (slot.isBreak || slot.isLunch) continue;
      if (slotIndex === timeSlots.length - 1) continue; // Skip last period (reserved for activities)
      
      // Check if this slot is available
      if (canScheduleLabAtSlot(facultyId, slotIndex, timeSlots, globalFacultySchedule, labRoomSchedule, day, section)) {
        emergencySlots.push(dayIndex * timeSlots.length + slotIndex);
      }
    }
  });
  
  return emergencySlots;
};

const canScheduleLabAtSlot = (
  facultyId: string,
  startSlot: number,
  timeSlots: TimeSlot[],
  globalFacultySchedule: { [facultyId: string]: { [day: string]: number[] } },
  labRoomSchedule: { [day: string]: { [slotIndex: number]: string } },
  day: string,
  section: string
): boolean => {
  // Check if this single slot is available for lab
  const slotIndex = startSlot;
  if (slotIndex >= timeSlots.length) return false;
  
  const slot = timeSlots[slotIndex];
  if (slot.isBreak || slot.isLunch) return false;
  
  // Check if faculty is already occupied at this time
    if (globalFacultySchedule[facultyId][day].includes(slotIndex)) {
      return false;
    }
    
  // Check if faculty is already teaching another section at this time
  const facultyAlreadyTeaching = Object.entries(globalFacultySchedule).some(([otherFacultyId, otherDaySchedule]) => {
    if (otherFacultyId === facultyId) return false;
    return otherDaySchedule[day] && otherDaySchedule[day].includes(slotIndex);
  });
  
  if (facultyAlreadyTeaching) {
    return false;
  }
  
  // Check if lab room is already occupied by another section at this specific time slot
  // Lab room is available all day, but only one section can use it at any specific time
  if (labRoomSchedule[day][slotIndex] && labRoomSchedule[day][slotIndex] !== section) {
    return false;
  }
  
  // Check if this slot is reserved for weekly test or rotating activities
  if ((day === 'Wednesday' && (slotIndex === timeSlots.length - 2 || slotIndex === timeSlots.length - 1)) ||
      (day !== 'Wednesday' && slotIndex === timeSlots.length - 1)) {
    return false;
  }
  
      return true;
};

const scheduleLabSession = (
  labFaculty: Faculty,
  labSlots: number[],
  day: string,
  section: string,
  globalFacultySchedule: { [facultyId: string]: { [day: string]: number[] } },
  labRoomSchedule: { [day: string]: { [slotIndex: number]: string } }
) => {
  // Schedule lab across the 3 consecutive class periods
  labSlots.forEach(slotIndex => {
    globalFacultySchedule[labFaculty.id][day].push(slotIndex);
    labRoomSchedule[day][slotIndex] = section;
  });
};

const getExistingAssignment = (
  section: string,
  day: string,
  slotIndex: number,
  globalFacultySchedule: { [facultyId: string]: { [day: string]: number[] } },
  labRoomSchedule: { [day: string]: { [slotIndex: number]: string } },
  facultyList: Faculty[]
): TimetableCell | null => {
  // Check if this slot is assigned to a lab for this section
  if (labRoomSchedule[day][slotIndex] === section) {
    // Find which faculty is assigned to this slot
    for (const [facultyId, daySchedule] of Object.entries(globalFacultySchedule)) {
      if (daySchedule[day] && daySchedule[day].includes(slotIndex)) {
        // Find the faculty details
        const faculty = facultyList.find(f => f.id === facultyId);
        if (faculty) {
        return {
            subject: faculty.subject + ' LAB',
            faculty: faculty.name,
          type: 'Lab'
        };
        }
      }
    }
  }
  return null;
};

const findBestRegularAssignment = (
  regularFaculty: Faculty[],
  globalFacultySchedule: { [facultyId: string]: { [day: string]: number[] } },
  day: string,
  slotIndex: number,
  section: string,
  sectionDayAssignments: TimetableCell[]
): { cell: TimetableCell; facultyId: string } | null => {
  // Sort by fewest periods today, then fewest periods this week
  const sortedFaculty = [...regularFaculty].sort((a, b) => {
    const aToday = globalFacultySchedule[a.id][day].length;
    const bToday = globalFacultySchedule[b.id][day].length;
    if (aToday !== bToday) return aToday - bToday;
    const aWeek = DAYS.reduce((total, d) => total + (globalFacultySchedule[a.id][d]?.length || 0), 0);
    const bWeek = DAYS.reduce((total, d) => total + (globalFacultySchedule[b.id][d]?.length || 0), 0);
    return aWeek - bWeek;
  });

  for (const faculty of sortedFaculty) {
    // Check if faculty is already occupied at this time
    if (globalFacultySchedule[faculty.id][day].includes(slotIndex)) continue;
    // Check if faculty is already teaching another section at this time
    const facultyAlreadyTeaching = Object.entries(globalFacultySchedule).some(([otherFacultyId, otherDaySchedule]) => {
      if (otherFacultyId === faculty.id) return false;
      return otherDaySchedule[day] && otherDaySchedule[day].includes(slotIndex);
    });
    if (facultyAlreadyTeaching) continue;
    // Check max lectures per day/week
    if (faculty.maxLecturesPerDay && globalFacultySchedule[faculty.id][day].length >= faculty.maxLecturesPerDay) continue;
    if (faculty.maxLecturesPerWeek) {
      const weekLectures = DAYS.reduce((total, d) => total + (globalFacultySchedule[faculty.id][d]?.length || 0), 0);
      if (weekLectures >= faculty.maxLecturesPerWeek) continue;
    }
    // Avoid assigning the same teacher for consecutive periods if possible
    if (sectionDayAssignments.length > 0 && sectionDayAssignments[sectionDayAssignments.length - 1]?.faculty === faculty.name) continue;
    // Try to maximize subject variety per day
    const subjectsToday = new Set(sectionDayAssignments.map(cell => cell.subject));
    if (subjectsToday.has(faculty.subject) && subjectsToday.size < regularFaculty.length) continue;
    return {
      cell: {
        subject: faculty.subject,
        faculty: faculty.name,
        type: 'Regular'
      },
      facultyId: faculty.id
    };
  }
  // Fallback: allow consecutive or repeated subjects if no other option
  for (const faculty of sortedFaculty) {
    if (globalFacultySchedule[faculty.id][day].includes(slotIndex)) continue;
    const facultyAlreadyTeaching = Object.entries(globalFacultySchedule).some(([otherFacultyId, otherDaySchedule]) => {
      if (otherFacultyId === faculty.id) return false;
      return otherDaySchedule[day] && otherDaySchedule[day].includes(slotIndex);
    });
    if (facultyAlreadyTeaching) continue;
    if (faculty.maxLecturesPerDay && globalFacultySchedule[faculty.id][day].length >= faculty.maxLecturesPerDay) continue;
    if (faculty.maxLecturesPerWeek) {
      const weekLectures = DAYS.reduce((total, d) => total + (globalFacultySchedule[faculty.id][d]?.length || 0), 0);
      if (weekLectures >= faculty.maxLecturesPerWeek) continue;
    }
    return {
      cell: {
        subject: faculty.subject,
        faculty: faculty.name,
        type: 'Regular'
      },
      facultyId: faculty.id
    };
  }
  return null;
};

const findAnyAvailableFaculty = (
  facultyList: Faculty[],
  globalFacultySchedule: { [facultyId: string]: { [day: string]: number[] } },
  day: string,
  slotIndex: number,
  section: string
): TimetableCell | null => {
  for (const faculty of facultyList) {
    if (!globalFacultySchedule[faculty.id][day].includes(slotIndex)) {
      return {
        subject: faculty.subject,
        faculty: faculty.name,
        type: faculty.type
      };
    }
  }
  return null;
};

// Legacy function for backward compatibility
export const generateTimetableLegacy = (
  settings: GeneralSettings,
  facultyList: Faculty[]
): SectionTimetable[] => {
  return generateTimetable(settings, facultyList);
};