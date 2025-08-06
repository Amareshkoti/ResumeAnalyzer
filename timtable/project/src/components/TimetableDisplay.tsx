import React from 'react';
import { SectionTimetable, TimeSlot } from '../types/timetable';
import { Calendar, Download, ArrowLeft, FlaskConical, Coffee, Utensils } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

interface TimetableDisplayProps {
  timetables: SectionTimetable[];
  timeSlots: TimeSlot[];
  onBack: () => void;
}

export const TimetableDisplay: React.FC<TimetableDisplayProps> = ({
  timetables,
  timeSlots,
  onBack
}) => {
  const [selectedSection, setSelectedSection] = React.useState(0);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleExcelExport = async () => {
    try {
      await exportToExcel(timetables, timeSlots);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const getCellStyle = (cell: any) => {
    if (cell.isBreak) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300 font-semibold';
    }
    if (cell.isLunch) {
      return 'bg-pink-100 text-pink-800 border-pink-300 font-semibold';
    }
    if (cell.subject === 'Free Period') {
      return 'bg-gray-50 text-gray-500 border-gray-200 italic';
    }
    if (cell.type === 'Lab' || cell.subject.includes('LAB')) {
      return 'bg-green-100 text-green-800 border-green-300 font-medium';
    }
    if (cell.type === 'WeeklyTest') {
      return 'bg-red-100 text-red-800 border-red-300 font-semibold';
    }
    if (cell.type === 'Library') {
      return 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
    }
    if (cell.type === 'Sports') {
      return 'bg-orange-100 text-orange-800 border-orange-300 font-semibold';
    }
    if (cell.type === 'Addon') {
      return 'bg-purple-100 text-purple-800 border-purple-300 font-semibold';
    }
    if (cell.type === 'Counselling') {
      return 'bg-teal-100 text-teal-800 border-teal-300 font-semibold';
    }
    return 'bg-blue-50 text-blue-800 border-blue-200';
  };

  const getCellIcon = (cell: any) => {
    if (cell.isBreak) return <Coffee className="w-3 h-3" />;
    if (cell.isLunch) return <Utensils className="w-3 h-3" />;
    if (cell.type === 'Lab' || cell.subject.includes('LAB')) return <FlaskConical className="w-3 h-3" />;
    if (cell.type === 'WeeklyTest') return <span className="font-bold text-red-600">📝</span>;
    if (cell.type === 'Library') return <span className="font-bold text-blue-600">📚</span>;
    if (cell.type === 'Sports') return <span className="font-bold text-orange-600">🏅</span>;
    if (cell.type === 'Addon') return <span className="font-bold text-purple-600">✨</span>;
    if (cell.type === 'Counselling') return <span className="font-bold text-teal-600">🧑‍🏫</span>;
    return null;
  };

  const currentTimetable = timetables[selectedSection];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Generated Timetable</h2>
            {currentTimetable && (
              <p className="text-gray-600">Section {currentTimetable.section}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExcelExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
          <button
            onClick={onBack}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      {timetables.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {timetables.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedSection(index)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap ${
                selectedSection === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Section {timetables[index].section}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
          <span className="text-sm text-gray-600">Regular Classes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
          <FlaskConical className="w-3 h-3 text-green-600" />
          <span className="text-sm text-gray-600">Lab Sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
          <Coffee className="w-3 h-3 text-yellow-600" />
          <span className="text-sm text-gray-600">Break</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-100 border border-pink-200 rounded"></div>
          <Utensils className="w-3 h-3 text-pink-600" />
          <span className="text-sm text-gray-600">Lunch</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
          <span className="text-sm text-gray-600">Free Period</span>
        </div>
      </div>

      {/* Timetable */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-blue-600 text-white border border-gray-300 p-3 text-center font-bold sticky left-0 z-10">
                DAY
              </th>
              {timeSlots.map((slot, index) => (
                <th
                  key={index}
                  className="bg-blue-600 text-white border border-gray-300 p-2 text-center font-bold min-w-24"
                >
                  <div className="text-xs whitespace-nowrap">
                    {slot.isBreak ? 'BREAK' : slot.isLunch ? 'LUNCH' : slot.label}
                  </div>
                  <div className="text-xs font-normal mt-1">
                    {index + 1}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              <tr key={day}>
                <td className="bg-blue-100 border border-gray-300 p-3 font-bold text-blue-800 text-center sticky left-0 z-10">
                  {day.toUpperCase().substring(0, 3)}
                </td>
                {currentTimetable?.schedule[day]?.map((cell, slotIndex) => (
                  <td
                    key={slotIndex}
                    className={`border border-gray-300 p-2 text-center text-xs min-w-24 ${getCellStyle(cell)}`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center justify-center gap-1">
                        {getCellIcon(cell)}
                        <span className="font-medium text-xs leading-tight">
                          {cell.subject}
                        </span>
                      </div>
                      {cell.faculty && !cell.isBreak && !cell.isLunch && (
                        <span className="text-xs opacity-75 leading-tight">
                          {cell.faculty}
                        </span>
                      )}
                    </div>
                  </td>
                )) || []}
                {/* Fill empty slots if schedule is shorter than timeSlots */}
                {Array.from({ 
                  length: Math.max(0, timeSlots.length - (currentTimetable?.schedule[day]?.length || 0))
                }).map((_, emptyIndex) => (
                  <td
                    key={`empty-${emptyIndex}`}
                    className="border border-gray-300 p-2 text-center text-xs bg-gray-50 text-gray-500 italic min-w-24"
                  >
                    Free Period
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">Timetable Rules:</h3>
        <ul className="space-y-1 text-xs">
          <li>• <strong>Lab sessions:</strong> Scheduled for 3 continuous hours, only once per week per section</li>
          <li>• <strong>Break time:</strong> 9:40 AM - 10:00 AM (Fixed across all sections)</li>
          <li>• <strong>Lunch time:</strong> 12:30 PM - 1:20 PM (Fixed across all sections)</li>
          <li>• <strong>Faculty clash prevention:</strong> No faculty assigned to multiple sections simultaneously</li>
          <li>• <strong>Schedule:</strong> Monday to Saturday with optimized subject distribution</li>
          <li>• <strong>Lab display:</strong> Each lab hour shown in separate columns with "LAB" suffix</li>
        </ul>
      </div>
    </div>
  );
};