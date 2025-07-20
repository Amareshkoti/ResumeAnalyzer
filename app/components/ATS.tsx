import React from 'react'

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  // Determine background gradient based on score
  const gradientClass = score > 69
    ? 'from-green-100'
    : score > 49
      ? 'from-yellow-100'
      : 'from-red-100';

  // Determine icon based on score
  const iconSrc = score > 69
    ? '/icons/ats-good.svg'
    : score > 49
      ? '/icons/ats-warning.svg'
      : '/icons/ats-bad.svg';

  // Determine subtitle based on score
  const subtitle = score > 69
    ? 'Great Job!'
    : score > 49
      ? 'Good Start'
      : 'Needs Improvement';

  return (
    <div className={`bg-gradient-to-b ${gradientClass} to-white rounded-2xl shadow-lg w-full p-8 transition-all duration-200`}>
      {/* Top section with icon and headline */}
      <div className="flex items-center gap-6 mb-8">
        <img src={iconSrc} alt="ATS Score Icon" className="w-14 h-14" />
        <div>
          <h2 className="text-3xl font-extrabold text-[var(--color-text-main)]">ATS Score - {score}/100</h2>
        </div>
      </div>

      {/* Description section */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2 text-[var(--color-text-main)]">{subtitle}</h3>
        <p className="text-[var(--color-text-secondary)] mb-4 text-base">
          This score represents how well your resume is likely to perform in Applicant Tracking Systems used by employers.
        </p>

        {/* Suggestions list */}
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg shadow-sm bg-white">
              <img
                src={suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                alt={suggestion.type === "good" ? "Check" : "Warning"}
                className="w-5 h-5 mt-1"
              />
              <p className={suggestion.type === "good" ? "text-green-700 font-semibold" : "text-amber-700 font-semibold"}>
                {suggestion.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Closing encouragement */}
      <p className="text-[var(--color-text-secondary)] italic text-base">
        Keep refining your resume to improve your chances of getting past ATS filters and into the hands of recruiters.
      </p>
    </div>
  )
}

export default ATS
