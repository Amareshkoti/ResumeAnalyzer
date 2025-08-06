import React from 'react';
import { useForm } from 'react-hook-form';
import { GeneralSettings } from '../types/timetable';
import { Clock, Users, Timer } from 'lucide-react';

interface GeneralSettingsFormProps {
  onSubmit: (data: GeneralSettings) => void;
  initialData?: GeneralSettings;
}

export const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({
  onSubmit,
  initialData
}) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<GeneralSettings>({
    defaultValues: initialData || {
      sections: ['A'],
      classHoursPerDay: 6,
      hourDuration: 50,
      startTime: '08:00'
    }
  });

  const sectionCount = watch('sections')?.length || 1;

  const handleFormSubmit = (data: any) => {
    const sections = Array.from({ length: data.sectionCount }, (_, i) => 
      String.fromCharCode(65 + i) // A, B, C, etc.
    );
    
    onSubmit({
      ...data,
      sections
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">General Settings</h2>
      </div>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              Number of Sections
            </label>
            <select
              {...register('sectionCount', { required: 'Number of sections is required' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>
                  {num} Section{num > 1 ? 's' : ''} ({Array.from({ length: num }, (_, i) => 
                    String.fromCharCode(65 + i)
                  ).join(', ')})
                </option>
              ))}
            </select>
            {errors.sectionCount && (
              <p className="text-red-500 text-sm mt-1">{errors.sectionCount.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              Class Hours Per Day
            </label>
            <select
              {...register('classHoursPerDay', { required: 'Class hours per day is required' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[4, 5, 6, 7, 8, 9].map(num => (
                <option key={num} value={num}>{num} hours</option>
              ))}
            </select>
            {errors.classHoursPerDay && (
              <p className="text-red-500 text-sm mt-1">{errors.classHoursPerDay.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Timer className="w-4 h-4" />
              Duration of Each Hour (minutes)
            </label>
            <input
              type="number"
              min="30"
              max="90"
              {...register('hourDuration', { 
                required: 'Hour duration is required',
                min: { value: 30, message: 'Minimum 30 minutes' },
                max: { value: 90, message: 'Maximum 90 minutes' }
              })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.hourDuration && (
              <p className="text-red-500 text-sm mt-1">{errors.hourDuration.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              Start Time
            </label>
            <input
              type="time"
              {...register('startTime', { required: 'Start time is required' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Fixed Timings</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><span className="font-medium">Break:</span> 9:40 AM - 10:00 AM</p>
            <p><span className="font-medium">Lunch:</span> 12:30 PM - 1:20 PM</p>
            <p><span className="font-medium">Days:</span> Monday to Saturday</p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Continue to Faculty Setup
        </button>
      </form>
    </div>
  );
};