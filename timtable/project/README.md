# Smart College Timetable Generator

A web-based college timetable generator with intelligent scheduling algorithms, constraint satisfaction, and JSON configuration support.

## Features

### 🎯 Core Functionality
- **Constraint-based scheduling** - Ensures no faculty conflicts or free periods
- **Single lab room management** - Only one section can use the lab at any time
- **Weekly test scheduling** - Fixed Wednesday last 2 periods for all sections
- **Rotating activities** - Library, Sports, Add-on, Counselling in last periods
- **JSON configuration** - Import/export complete configurations
- **Excel export** - Download timetables as Excel files

### 📋 Scheduling Constraints
- **No free periods** - Every time slot must be assigned
- **Faculty conflict prevention** - No faculty teaches multiple sections simultaneously
- **Lab room exclusivity** - Only one section can have lab sessions at a time
- **Weekly test placement** - Wednesday last 2 periods reserved for tests
- **Activity rotation** - Last period of other days cycles through special activities

### 🕐 Time Management
- **Configurable hours** - User-defined number of periods per day
- **Fixed breaks** - Morning break (09:40-10:00) and lunch (12:30-13:20)
- **Flexible duration** - Customizable period length (default: 50 minutes)
- **Time range** - 08:00-15:00 (configurable)

## JSON Configuration Format

The timetable generator accepts JSON configuration files with the following structure:

```json
{
  "settings": {
    "sections": ["A", "B", "C"],
    "classHoursPerDay": 7,
    "hourDuration": 50,
    "startTime": "08:00",
    "endTime": "15:00"
  },
  "faculty": [
    {
      "id": "1",
      "name": "Dr. Smith",
      "subject": "Mathematics",
      "type": "Regular",
      "maxLecturesPerDay": 3,
      "maxLecturesPerWeek": 15
    },
    {
      "id": "2",
      "name": "Prof. Johnson",
      "subject": "Physics",
      "type": "Lab",
      "maxLecturesPerDay": 2,
      "maxLecturesPerWeek": 10
    }
  ],
  "constraints": {
    "morningBreak": {
      "start": "09:40",
      "end": "10:00"
    },
    "lunch": {
      "start": "12:30",
      "end": "13:20"
    },
    "weeklyTest": {
      "day": "Wednesday",
      "lastTwoPeriods": true
    },
    "rotatingActivities": {
      "activities": ["Library", "Sports", "Addon", "Counselling"],
      "lastPeriodOnly": true
    }
  }
}
```

### Configuration Fields

#### Settings
- `sections`: Array of section names (e.g., ["A", "B", "C"])
- `classHoursPerDay`: Number of class periods per day
- `hourDuration`: Duration of each period in minutes
- `startTime`: Start time in HH:MM format
- `endTime`: End time in HH:MM format

#### Faculty
- `id`: Unique identifier
- `name`: Faculty member's name
- `subject`: Subject they teach
- `type`: "Regular" or "Lab"
- `maxLecturesPerDay`: Maximum lectures per day (optional)
- `maxLecturesPerWeek`: Maximum lectures per week (optional)

#### Constraints
- `morningBreak`: Morning break timing
- `lunch`: Lunch break timing
- `weeklyTest`: Wednesday test configuration
- `rotatingActivities`: Special activities for last periods

## Usage

### 1. JSON Configuration Method (Recommended)
1. Start the application
2. Upload a JSON configuration file or paste JSON content
3. The system will automatically generate the timetable
4. Review and export to Excel

### 2. Manual Configuration Method
1. Configure general settings (sections, hours, duration)
2. Add faculty members with their subjects and constraints
3. Generate timetable
4. Review and export

### 3. Using Sample Configuration
1. Use the provided `sample-config.json` as a template
2. Modify sections, faculty, and constraints as needed
3. Import the modified configuration

## Algorithm Details

### Constraint Satisfaction Problem (CSP) Approach
The timetable generator uses a constraint-based approach to ensure all requirements are met:

1. **Variable Assignment**: Each (section, day, slot) combination is assigned a subject/faculty
2. **Unary Constraints**: Break/lunch periods, weekly tests, rotating activities
3. **Binary Constraints**: Faculty conflicts, lab room exclusivity
4. **Global Constraints**: No free periods, lab session continuity

### Lab Scheduling Logic
- Lab sessions require 3 consecutive periods
- Only one section can use the lab room at any time
- Lab sessions cannot overlap breaks, lunch, or special periods
- Each lab faculty can only have one lab session per week per section

### Weekly Test and Activities
- **Wednesday**: Last 2 periods reserved for "Weekly Test" across all sections
- **Other days**: Last period cycles through Library, Sports, Add-on, Counselling
- These periods are fixed and cannot be used for regular classes or labs

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd timetable-generator

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
```

## File Structure

```
src/
├── components/
│   ├── FacultyForm.tsx          # Faculty management
│   ├── GeneralSettingsForm.tsx  # General settings
│   ├── JSONConfigForm.tsx       # JSON import/export
│   └── TimetableDisplay.tsx     # Timetable visualization
├── types/
│   └── timetable.ts             # TypeScript type definitions
├── utils/
│   ├── configManager.ts         # JSON configuration handling
│   ├── excelExport.ts           # Excel export functionality
│   ├── timetableGenerator.ts    # Core scheduling algorithm
│   └── timeUtils.ts             # Time utility functions
└── App.tsx                      # Main application component
```

## Export Options

### Excel Export
- One sheet per section
- Rows represent days (Monday-Saturday)
- Columns represent time slots
- Cell format: "Subject - Faculty"
- Special periods highlighted with colors

### JSON Export
- Complete configuration including generated timetable
- Metadata with generation time and constraint validation
- Can be reused for future generations

## Validation and Error Handling

The system includes comprehensive validation:

- **Configuration validation**: Ensures all required fields are present
- **Constraint validation**: Checks for conflicts and violations
- **Lab room validation**: Verifies single lab usage
- **Faculty conflict detection**: Prevents double-booking
- **Free period detection**: Ensures no empty slots

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the sample configuration file
2. Review the validation messages
3. Ensure all constraints are properly defined
4. Contact the development team

---

**Note**: This timetable generator is designed specifically for college environments with the described constraints. The algorithm ensures optimal resource utilization while maintaining all specified requirements. 