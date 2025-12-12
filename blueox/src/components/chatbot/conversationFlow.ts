import { PathConfig, ChatChoice } from './types';

export const INITIAL_CHOICES: ChatChoice[] = [
  {
    id: 'student_university',
    label: 'I am a Student looking for a school',
    value: 'student_university',
    description: 'Find universities and educational programs in Europe'
  },
  {
    id: 'student_job',
    label: 'I am a Student looking for a job',
    value: 'student_job',
    description: 'Find part-time or internship opportunities while studying'
  },
  {
    id: 'worker_job',
    label: 'I am a worker looking for a job',
    value: 'worker_job',
    description: 'Find full-time employment opportunities in Europe'
  },
  {
    id: 'company',
    label: 'I am a Company looking for talent',
    value: 'company',
    description: 'Post jobs and find qualified candidates'
  }
];

export const WELCOME_MESSAGE = `Hello! I'm Blue Ox's AI Consultant.

I can guide you through securing your first job or finding your next great hire.

What are you here for today?`;

export const PATH_CONFIGS: Record<string, PathConfig> = {
  student_university: {
    id: 'student_university',
    name: 'Student University Path',
    steps: [
      {
        id: 'education_level',
        question: 'Great choice! What is your current education level?',
        inputType: 'select',
        field: 'educationLevel',
        inputOptions: ['High School', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Other']
      },
      {
        id: 'target_countries',
        question: 'Which European countries are you interested in studying in?',
        inputType: 'multiselect',
        field: 'targetCountries',
        inputOptions: ['Germany', 'Netherlands', 'Poland', 'Czech Republic', 'Hungary', 'Austria', 'France', 'Spain', 'Italy', 'Other']
      },
      {
        id: 'field_of_study',
        question: 'What field of study are you interested in?',
        inputType: 'select',
        field: 'fieldOfStudy',
        inputOptions: ['Engineering', 'Business & Economics', 'Computer Science', 'Medicine & Health', 'Arts & Humanities', 'Natural Sciences', 'Law', 'Other']
      },
      {
        id: 'budget',
        question: 'What is your approximate annual budget for tuition and living expenses (in EUR)?',
        inputType: 'select',
        field: 'budget',
        inputOptions: ['Under 5,000', '5,000 - 10,000', '10,000 - 15,000', '15,000 - 20,000', 'Over 20,000']
      },
      {
        id: 'start_date',
        question: 'When would you like to start your studies?',
        inputType: 'select',
        field: 'startDate',
        inputOptions: ['Spring 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026', 'Not sure yet']
      },
      {
        id: 'full_name',
        question: 'Perfect! Now let me get some personal details. What is your full name?',
        inputType: 'text',
        field: 'fullName',
        placeholder: 'Enter your full name'
      },
      {
        id: 'email',
        question: 'What is your email address?',
        inputType: 'text',
        field: 'email',
        placeholder: 'Enter your email address'
      },
      {
        id: 'phone',
        question: 'What is your phone number (with country code)?',
        inputType: 'text',
        field: 'phone',
        placeholder: '+234 XXX XXX XXXX'
      },
      {
        id: 'nationality',
        question: 'What is your nationality?',
        inputType: 'text',
        field: 'nationality',
        placeholder: 'Enter your nationality'
      }
    ]
  },
  student_job: {
    id: 'student_job',
    name: 'Student Job Path',
    steps: [
      {
        id: 'university',
        question: 'Great! Which university are you currently studying at?',
        inputType: 'text',
        field: 'university',
        placeholder: 'Enter your university name'
      },
      {
        id: 'course',
        question: 'What course or program are you studying?',
        inputType: 'text',
        field: 'course',
        placeholder: 'e.g., Computer Science, Business Administration'
      },
      {
        id: 'year',
        question: 'What year of study are you in?',
        inputType: 'select',
        field: 'yearOfStudy',
        inputOptions: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate Student']
      },
      {
        id: 'work_experience',
        question: 'Do you have any prior work experience?',
        inputType: 'select',
        field: 'workExperience',
        inputOptions: ['No experience', 'Less than 1 year', '1-2 years', '2-3 years', 'More than 3 years']
      },
      {
        id: 'availability',
        question: 'What is your availability for work?',
        inputType: 'select',
        field: 'availability',
        inputOptions: ['Part-time (10-20 hrs/week)', 'Part-time (20-30 hrs/week)', 'Full-time during holidays', 'Internship only', 'Flexible']
      },
      {
        id: 'job_type',
        question: 'What type of job are you looking for?',
        inputType: 'multiselect',
        field: 'jobType',
        inputOptions: ['Internship', 'Part-time', 'Working Student', 'Seasonal', 'Remote']
      },
      {
        id: 'full_name',
        question: 'Now for your contact details. What is your full name?',
        inputType: 'text',
        field: 'fullName',
        placeholder: 'Enter your full name'
      },
      {
        id: 'email',
        question: 'What is your email address?',
        inputType: 'text',
        field: 'email',
        placeholder: 'Enter your email address'
      },
      {
        id: 'phone',
        question: 'What is your phone number?',
        inputType: 'text',
        field: 'phone',
        placeholder: '+234 XXX XXX XXXX'
      }
    ]
  },
  worker_job: {
    id: 'worker_job',
    name: 'Worker Job Path',
    steps: [
      {
        id: 'current_job',
        question: 'What is your current job or most recent role?',
        inputType: 'text',
        field: 'currentJob',
        placeholder: 'e.g., Electrician, Nurse, Chef'
      },
      {
        id: 'experience_years',
        question: 'How many years of experience do you have in your field?',
        inputType: 'select',
        field: 'experienceYears',
        inputOptions: ['Less than 1 year', '1-2 years', '3-5 years', '5-10 years', 'More than 10 years']
      },
      {
        id: 'skills',
        question: 'What are your main skills? (Select all that apply)',
        inputType: 'multiselect',
        field: 'skills',
        inputOptions: ['Technical/Trade Skills', 'Language Skills', 'Management', 'Customer Service', 'Healthcare', 'IT/Technology', 'Driving', 'Construction', 'Manufacturing', 'Other']
      },
      {
        id: 'target_countries',
        question: 'Which European countries would you prefer to work in?',
        inputType: 'multiselect',
        field: 'targetCountries',
        inputOptions: ['Germany', 'Netherlands', 'Poland', 'Czech Republic', 'Hungary', 'Austria', 'Belgium', 'Sweden', 'Norway', 'Any']
      },
      {
        id: 'salary_expectation',
        question: 'What is your expected monthly salary (in EUR)?',
        inputType: 'select',
        field: 'salaryExpectation',
        inputOptions: ['1,000 - 1,500', '1,500 - 2,000', '2,000 - 2,500', '2,500 - 3,000', 'Over 3,000', 'Negotiable']
      },
      {
        id: 'certifications',
        question: 'Do you have any certifications or licenses?',
        inputType: 'text',
        field: 'certifications',
        placeholder: 'e.g., Driving license, Trade certificate, Language certificate'
      },
      {
        id: 'availability',
        question: 'When can you start a new position?',
        inputType: 'select',
        field: 'availability',
        inputOptions: ['Immediately', 'Within 1 month', 'Within 3 months', 'Within 6 months', 'Flexible']
      },
      {
        id: 'full_name',
        question: 'Now let me get your contact information. What is your full name?',
        inputType: 'text',
        field: 'fullName',
        placeholder: 'Enter your full name'
      },
      {
        id: 'email',
        question: 'What is your email address?',
        inputType: 'text',
        field: 'email',
        placeholder: 'Enter your email address'
      },
      {
        id: 'phone',
        question: 'What is your phone number?',
        inputType: 'text',
        field: 'phone',
        placeholder: '+234 XXX XXX XXXX'
      },
      {
        id: 'nationality',
        question: 'What is your nationality?',
        inputType: 'text',
        field: 'nationality',
        placeholder: 'Enter your nationality'
      }
    ]
  },
  company: {
    id: 'company',
    name: 'Company Path',
    steps: [
      {
        id: 'company_name',
        question: 'Welcome! What is your company name?',
        inputType: 'text',
        field: 'companyName',
        placeholder: 'Enter your company name'
      },
      {
        id: 'industry',
        question: 'What industry does your company operate in?',
        inputType: 'select',
        field: 'industry',
        inputOptions: ['Manufacturing', 'Healthcare', 'Technology', 'Construction', 'Hospitality', 'Agriculture', 'Logistics', 'Retail', 'Other']
      },
      {
        id: 'company_size',
        question: 'How many employees does your company have?',
        inputType: 'select',
        field: 'companySize',
        inputOptions: ['1-10', '11-50', '51-200', '201-500', '500+']
      },
      {
        id: 'positions_needed',
        question: 'What types of positions are you looking to fill?',
        inputType: 'multiselect',
        field: 'positionsNeeded',
        inputOptions: ['Skilled Workers', 'Unskilled Workers', 'Technicians', 'Engineers', 'Administrative', 'Management', 'Seasonal Workers', 'Interns']
      },
      {
        id: 'number_of_hires',
        question: 'How many candidates are you looking to hire?',
        inputType: 'select',
        field: 'numberOfHires',
        inputOptions: ['1-5', '6-10', '11-20', '21-50', '50+']
      },
      {
        id: 'timeline',
        question: 'What is your hiring timeline?',
        inputType: 'select',
        field: 'timeline',
        inputOptions: ['Urgent (Within 1 month)', 'Short-term (1-3 months)', 'Medium-term (3-6 months)', 'Long-term (6+ months)', 'Ongoing recruitment']
      },
      {
        id: 'budget_range',
        question: 'What is your budget per hire (recruitment fee)?',
        inputType: 'select',
        field: 'budgetRange',
        inputOptions: ['Under 500 EUR', '500-1000 EUR', '1000-2000 EUR', '2000-5000 EUR', 'Negotiable']
      },
      {
        id: 'contact_name',
        question: 'Who should we contact regarding this opportunity? Full name:',
        inputType: 'text',
        field: 'contactName',
        placeholder: 'Enter contact person name'
      },
      {
        id: 'contact_email',
        question: 'What is the best email to reach you?',
        inputType: 'text',
        field: 'contactEmail',
        placeholder: 'Enter email address'
      },
      {
        id: 'contact_phone',
        question: 'What is your phone number?',
        inputType: 'text',
        field: 'contactPhone',
        placeholder: '+XX XXX XXX XXXX'
      }
    ]
  }
};

export const getCompletionMessage = (path: string, data: Record<string, unknown>): string => {
  const name = (data.fullName || data.contactName || 'there') as string;
  
  const messages: Record<string, string> = {
    student_university: `Thank you, ${name}! I've collected all the information needed to help you find the perfect university in Europe.

Our team will review your preferences and reach out within 24-48 hours with personalized university recommendations.

In the meantime, you can create an account to:
- Save your progress
- Upload your documents
- Track your application status

Would you like to create an account now?`,
    
    student_job: `Excellent, ${name}! I have everything I need to start matching you with student job opportunities.

Our team will reach out within 24-48 hours with job listings that match your profile and availability.

Create an account to:
- Build your Europass CV
- Upload supporting documents
- Apply directly to positions

Ready to set up your account?`,
    
    worker_job: `Thank you, ${name}! Your profile is now ready for our recruitment team to review.

We'll match you with employers looking for your skills and experience, and contact you within 24-48 hours.

To increase your chances:
- Create an account
- Build a professional CV
- Upload certifications and references

Shall we set up your account?`,
    
    company: `Thank you for your interest in Blue Ox's recruitment services!

We'll have a recruitment specialist contact you within 24 hours to discuss your hiring needs and how we can help you find the best talent from our candidate pool.

In the meantime, would you like to create a company account to:
- Post job listings
- Browse candidate profiles
- Manage your recruitment pipeline`
  };
  
  return messages[path] || `Thank you! We'll be in touch soon.`;
};
