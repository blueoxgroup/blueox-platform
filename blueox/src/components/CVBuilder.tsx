import React, { useState, useRef } from 'react';
import { Plus, Trash2, Download, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';

interface CVData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    nationality: string;
    dateOfBirth: string;
  };
  summary: string;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: string[];
  languages: Array<{ language: string; level: string }>;
}

const CVBuilder: React.FC<{ applicationType: string }> = ({ applicationType }) => {
  const { client } = useAuth();
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      firstName: client?.full_name?.split(' ')[0] || '',
      lastName: client?.full_name?.split(' ').slice(1).join(' ') || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      nationality: client?.nationality || '',
      dateOfBirth: client?.date_of_birth || '',
    },
    summary: '',
    education: [{ institution: '', degree: '', field: '', startDate: '', endDate: '' }],
    experience: [{ company: '', position: '', location: '', startDate: '', endDate: '', description: '' }],
    skills: [''],
    languages: [{ language: '', level: 'B1' }],
  });

  const updatePersonalInfo = (field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', field: '', startDate: '', endDate: '' }]
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setCvData(prev => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const removeEducation = (index: number) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', position: '', location: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setCvData(prev => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const removeExperience = (index: number) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    setCvData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
  };

  const updateSkill = (index: number, value: string) => {
    setCvData(prev => {
      const updated = [...prev.skills];
      updated[index] = value;
      return { ...prev, skills: updated };
    });
  };

  const addLanguage = () => {
    setCvData(prev => ({ ...prev, languages: [...prev.languages, { language: '', level: 'B1' }] }));
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    setCvData(prev => {
      const updated = [...prev.languages];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, languages: updated };
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const { personalInfo, summary, education, experience, skills, languages } = cvData;
    let y = 20;
    const lineHeight = 7;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`${personalInfo.firstName} ${personalInfo.lastName}`, margin, y);
    y += 12;

    // Contact Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactInfo = [personalInfo.email, personalInfo.phone, personalInfo.address].filter(Boolean).join(' | ');
    doc.text(contactInfo, margin, y);
    y += lineHeight;

    if (personalInfo.nationality || personalInfo.dateOfBirth) {
      const extraInfo = [personalInfo.nationality && `Nationality: ${personalInfo.nationality}`, personalInfo.dateOfBirth && `DOB: ${personalInfo.dateOfBirth}`].filter(Boolean).join(' | ');
      doc.text(extraInfo, margin, y);
      y += lineHeight;
    }

    // Line
    y += 3;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Summary
    if (summary) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PROFESSIONAL SUMMARY', margin, y);
      y += lineHeight;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 5 + 8;
    }

    // Education
    if (education.some(e => e.institution)) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EDUCATION', margin, y);
      y += lineHeight;
      doc.setFontSize(10);

      education.filter(e => e.institution).forEach(edu => {
        doc.setFont('helvetica', 'bold');
        doc.text(edu.institution, margin, y);
        y += lineHeight - 2;
        doc.setFont('helvetica', 'normal');
        doc.text(`${edu.degree} in ${edu.field}`, margin, y);
        doc.text(`${edu.startDate} - ${edu.endDate}`, pageWidth - margin - 40, y);
        y += lineHeight;
      });
      y += 5;
    }

    // Experience
    if (experience.some(e => e.company)) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('WORK EXPERIENCE', margin, y);
      y += lineHeight;
      doc.setFontSize(10);

      experience.filter(e => e.company).forEach(exp => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${exp.position} at ${exp.company}`, margin, y);
        y += lineHeight - 2;
        doc.setFont('helvetica', 'normal');
        doc.text(`${exp.location} | ${exp.startDate} - ${exp.endDate}`, margin, y);
        y += lineHeight - 2;
        if (exp.description) {
          const descLines = doc.splitTextToSize(exp.description, pageWidth - 2 * margin);
          doc.text(descLines, margin, y);
          y += descLines.length * 5;
        }
        y += 5;
      });
    }

    // Skills
    if (skills.some(s => s)) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SKILLS', margin, y);
      y += lineHeight;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(skills.filter(Boolean).join(', '), margin, y);
      y += lineHeight + 5;
    }

    // Languages
    if (languages.some(l => l.language)) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('LANGUAGES', margin, y);
      y += lineHeight;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      languages.filter(l => l.language).forEach(lang => {
        doc.text(`${lang.language}: ${lang.level}`, margin, y);
        y += lineHeight - 2;
      });
    }

    doc.save(`${personalInfo.firstName}_${personalInfo.lastName}_CV.pdf`);
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-orbitron text-2xl font-bold text-navy">Europass CV Builder</h2>
        <button
          onClick={generatePDF}
          className="bg-coral text-white px-6 py-2 rounded-lg font-space font-semibold hover:bg-coral-dark transition flex items-center"
        >
          <Download className="w-5 h-5 mr-2" /> Download PDF
        </button>
      </div>

      <div className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6">
          <h3 className="font-space font-semibold text-lg text-navy mb-4">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input type="text" value={cvData.personalInfo.firstName} onChange={(e) => updatePersonalInfo('firstName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" value={cvData.personalInfo.lastName} onChange={(e) => updatePersonalInfo('lastName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={cvData.personalInfo.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={cvData.personalInfo.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input type="text" value={cvData.personalInfo.address} onChange={(e) => updatePersonalInfo('address', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nationality</label>
              <input type="text" value={cvData.personalInfo.nationality} onChange={(e) => updatePersonalInfo('nationality', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" value={cvData.personalInfo.dateOfBirth} onChange={(e) => updatePersonalInfo('dateOfBirth', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-6">
          <h3 className="font-space font-semibold text-lg text-navy mb-4">Professional Summary</h3>
          <textarea
            value={cvData.summary}
            onChange={(e) => setCvData(prev => ({ ...prev, summary: e.target.value }))}
            className={`${inputClass} h-24`}
            placeholder="Brief summary of your professional background and goals..."
          />
        </div>

        {/* Education */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-space font-semibold text-lg text-navy">Education</h3>
            <button onClick={addEducation} className="text-coral hover:text-coral-dark flex items-center text-sm font-medium">
              <Plus className="w-4 h-4 mr-1" /> Add
            </button>
          </div>
          {cvData.education.map((edu, i) => (
            <div key={i} className="mb-4 pb-4 border-b last:border-b-0">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Institution</label>
                  <input type="text" value={edu.institution} onChange={(e) => updateEducation(i, 'institution', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Degree</label>
                  <input type="text" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} className={inputClass} placeholder="e.g., Bachelor's" />
                </div>
                <div>
                  <label className={labelClass}>Field of Study</label>
                  <input type="text" value={edu.field} onChange={(e) => updateEducation(i, 'field', e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass}>Start</label>
                    <input type="month" value={edu.startDate} onChange={(e) => updateEducation(i, 'startDate', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>End</label>
                    <input type="month" value={edu.endDate} onChange={(e) => updateEducation(i, 'endDate', e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
              {cvData.education.length > 1 && (
                <button onClick={() => removeEducation(i)} className="text-red-500 text-sm mt-2 flex items-center">
                  <Trash2 className="w-4 h-4 mr-1" /> Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Experience */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-space font-semibold text-lg text-navy">Work Experience</h3>
            <button onClick={addExperience} className="text-coral hover:text-coral-dark flex items-center text-sm font-medium">
              <Plus className="w-4 h-4 mr-1" /> Add
            </button>
          </div>
          {cvData.experience.map((exp, i) => (
            <div key={i} className="mb-4 pb-4 border-b last:border-b-0">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Company</label>
                  <input type="text" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Position</label>
                  <input type="text" value={exp.position} onChange={(e) => updateExperience(i, 'position', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input type="text" value={exp.location} onChange={(e) => updateExperience(i, 'location', e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass}>Start</label>
                    <input type="month" value={exp.startDate} onChange={(e) => updateExperience(i, 'startDate', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>End</label>
                    <input type="month" value={exp.endDate} onChange={(e) => updateExperience(i, 'endDate', e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea value={exp.description} onChange={(e) => updateExperience(i, 'description', e.target.value)} className={`${inputClass} h-20`} placeholder="Key responsibilities and achievements..." />
                </div>
              </div>
              {cvData.experience.length > 1 && (
                <button onClick={() => removeExperience(i)} className="text-red-500 text-sm mt-2 flex items-center">
                  <Trash2 className="w-4 h-4 mr-1" /> Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-space font-semibold text-lg text-navy">Skills</h3>
            <button onClick={addSkill} className="text-coral hover:text-coral-dark flex items-center text-sm font-medium">
              <Plus className="w-4 h-4 mr-1" /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, i) => (
              <input
                key={i}
                type="text"
                value={skill}
                onChange={(e) => updateSkill(i, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent text-sm w-40"
                placeholder="Skill"
              />
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-space font-semibold text-lg text-navy">Languages</h3>
            <button onClick={addLanguage} className="text-coral hover:text-coral-dark flex items-center text-sm font-medium">
              <Plus className="w-4 h-4 mr-1" /> Add
            </button>
          </div>
          <div className="space-y-4">
            {cvData.languages.map((lang, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end p-3 bg-gray-50 rounded-lg">
                <div className="md:col-span-2">
                  <label className={labelClass}>Language</label>
                  <input
                    type="text"
                    value={lang.language}
                    onChange={(e) => updateLanguage(i, 'language', e.target.value)}
                    className={inputClass}
                    placeholder="e.g., Portuguese (Brazilian), Spanish (Latin American)"
                  />
                </div>
                <div>
                  <label className={labelClass}>Proficiency Level</label>
                  <select
                    value={lang.level}
                    onChange={(e) => updateLanguage(i, 'level', e.target.value)}
                    className={inputClass}
                  >
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilder;
