import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Faculty } from '../types/timetable';
import { User, Plus, Trash2, BookOpen, FlaskConical } from 'lucide-react';

interface FacultyFormProps {
  onSubmit: (faculty: Faculty[]) => void;
  onBack: () => void;
  initialData?: Faculty[];
}

export const FacultyForm: React.FC<FacultyFormProps> = ({
  onSubmit,
  onBack,
  initialData = []
}) => {
  const [facultyList, setFacultyList] = useState<Faculty[]>(
    initialData.length > 0 ? initialData : [
      {
        id: '1',
        name: '',
        subject: '',
        type: 'Regular',
        maxLecturesPerDay: 4,
        maxLecturesPerWeek: 20
      }
    ]
  );

  const { register, handleSubmit, formState: { errors } } = useForm();

  const addFaculty = () => {
    const newFaculty: Faculty = {
      id: Date.now().toString(),
      name: '',
      subject: '',
      type: 'Regular',
      maxLecturesPerDay: 4,
      maxLecturesPerWeek: 20
    };
    setFacultyList([...facultyList, newFaculty]);
  };

  const removeFaculty = (id: string) => {
    if (facultyList.length > 1) {
      setFacultyList(facultyList.filter(f => f.id !== id));
    }
  };

  const updateFaculty = (id: string, field: keyof Faculty, value: any) => {
    setFacultyList(facultyList.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const handleFormSubmit = () => {
    const validFaculty = facultyList.filter(f => f.name.trim() && f.subject.trim());
    if (validFaculty.length === 0) {
      alert('Please add at least one faculty member with name and subject.');
      return;
    }
    onSubmit(validFaculty);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <User className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Faculty & Subject Setup</h2>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {facultyList.map((faculty, index) => (
          <div key={faculty.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Faculty {index + 1}
              </h3>
              {facultyList.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFaculty(faculty.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty Name *
                </label>
                <input
                  type="text"
                  value={faculty.name}
                  onChange={(e) => updateFaculty(faculty.id, 'name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter faculty name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={faculty.subject}
                  onChange={(e) => updateFaculty(faculty.id, 'subject', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter subject name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Type
                </label>
                <select
                  value={faculty.type}
                  onChange={(e) => updateFaculty(faculty.id, 'type', e.target.value as 'Regular' | 'Lab')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Regular">Regular</option>
                  <option value="Lab">Lab</option>
                </select>
                {faculty.type === 'Lab' && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <FlaskConical className="w-3 h-3" />
                    Lab sessions require 3 continuous hours
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Lectures/Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={faculty.maxLecturesPerDay}
                  onChange={(e) => updateFaculty(faculty.id, 'maxLecturesPerDay', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Lectures/Week
                </label>
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={faculty.maxLecturesPerWeek}
                  onChange={(e) => updateFaculty(faculty.id, 'maxLecturesPerWeek', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addFaculty}
        className="w-full mt-4 border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Another Faculty
      </button>

      <div className="flex gap-4 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-200"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleFormSubmit}
          className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Generate Timetable
        </button>
      </div>
    </div>
  );
};