import React, { useState } from 'react';
import { GeneralSettingsForm } from './components/GeneralSettingsForm';
import { FacultyForm } from './components/FacultyForm';
import { TimetableDisplay } from './components/TimetableDisplay';
import { JSONConfigForm } from './components/JSONConfigForm';
import { GeneralSettings, Faculty, SectionTimetable, TimeSlot, TimetableConfig } from './types/timetable';
import { generateTimetable, generateTimeSlots } from './utils/timetableGenerator';
import { convertConfigToUI, generateTimetableFromConfig } from './utils/configManager';
import { GraduationCap, Settings, Users, Calendar, FileText } from 'lucide-react';

type Step = 'settings' | 'faculty' | 'timetable';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('settings');
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [timetables, setTimetables] = useState<SectionTimetable[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const handleSettingsSubmit = (settings: GeneralSettings) => {
    setGeneralSettings(settings);
    setCurrentStep('faculty');
  };

  const handleFacultySubmit = (faculty: Faculty[]) => {
    setFacultyList(faculty);
    
    if (generalSettings) {
      const generatedTimeSlots = generateTimeSlots(generalSettings);
      const generatedTimetables = generateTimetable(generalSettings, faculty);
      
      setTimeSlots(generatedTimeSlots);
      setTimetables(generatedTimetables);
      setCurrentStep('timetable');
    }
  };

  const handleBackToSettings = () => {
    setCurrentStep('settings');
  };

  const handleBackToFaculty = () => {
    setCurrentStep('faculty');
  };

  const getStepIcon = (step: Step, isActive: boolean) => {
    const iconClass = `w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`;
    
    switch (step) {
      case 'settings':
        return <Settings className={iconClass} />;
      case 'faculty':
        return <Users className={iconClass} />;
      case 'timetable':
        return <Calendar className={iconClass} />;
      default:
        return null;
    }
  };

  const getStepNumber = (step: Step): number => {
    switch (step) {
      case 'settings': return 1;
      case 'faculty': return 2;
      case 'timetable': return 3;
      default: return 1;
    }
  };

  const getStepTitle = (step: Step): string => {
    switch (step) {
      case 'settings': return 'General Settings';
      case 'faculty': return 'Faculty Setup';
      case 'timetable': return 'Timetable';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">
              Smart College Timetable Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate optimized college timetables with intelligent scheduling, 
            lab session management, and faculty clash prevention
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {(['settings', 'faculty', 'timetable'] as Step[]).map((step, index) => {
              const stepNumber = getStepNumber(step);
              const isActive = currentStep === step;
              const isCompleted = getStepNumber(currentStep) > stepNumber;
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200 ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {getStepIcon(step, isActive || isCompleted)}
                  </div>
                  <div className="ml-2">
                    <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                      Step {stepNumber}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                      {getStepTitle(step)}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className={`ml-4 w-8 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 'settings' && (
            <GeneralSettingsForm 
              onSubmit={handleSettingsSubmit}
              initialData={generalSettings || undefined}
            />
          )}
          
          {currentStep === 'faculty' && (
            <FacultyForm
              onSubmit={handleFacultySubmit}
              onBack={handleBackToSettings}
              initialData={facultyList}
            />
          )}
          
          {currentStep === 'timetable' && (
            <TimetableDisplay
              timetables={timetables}
              timeSlots={timeSlots}
              onBack={handleBackToFaculty}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Built with intelligent scheduling algorithms and Excel export capabilities</p>
        </div>
      </div>
    </div>
  );
}

export default App;