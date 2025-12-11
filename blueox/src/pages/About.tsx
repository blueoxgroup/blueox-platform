import React from 'react';
import { Shield, Scale, Award, Users, Globe, CheckCircle } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="font-inter pt-20">
      {/* Hero */}
      <section className="bg-navy py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-orbitron text-4xl md:text-5xl font-bold text-white mb-6">
            Why <span className="text-coral">Blue OX</span>?
          </h1>
          <p className="font-space text-xl text-gray-300 max-w-3xl mx-auto">
            We are the bridge between African ambition and European opportunity, providing comprehensive support for your journey.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-orbitron text-3xl font-bold text-navy mb-8">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-12">
              Blue OX exists to empower African students and workers to achieve their European dreams. We provide end-to-end guidance, legal compliance support, and document management to ensure a smooth transition from Africa to Europe's education and blue-collar markets.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { icon: Globe, title: 'Global Reach', desc: 'Operating across multiple European countries with established partnerships.' },
              { icon: Shield, title: 'Full Compliance', desc: 'All processes adhere to EU immigration and labor regulations.' },
              { icon: Users, title: 'Dedicated Support', desc: 'Personal guidance from application to placement.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-coral" />
                </div>
                <h3 className="font-space font-bold text-xl text-navy mb-3">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Compliance */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <Scale className="w-12 h-12 text-coral mr-4" />
              <h2 className="font-orbitron text-3xl font-bold text-navy">Legal Compliance</h2>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <p className="text-lg text-gray-600 mb-6 text-center">
                Blue OX operates with full transparency and compliance with European Union regulations:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'EU Work Permit Regulations',
                  'Student Visa Requirements',
                  'Labor Law Compliance',
                  'Data Protection (GDPR)',
                  'Immigration Standards',
                  'Employment Contract Law',
                ].map((item, i) => (
                  <div key={i} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-coral mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-orbitron text-3xl font-bold text-navy text-center mb-12">
            Success <span className="text-coral">Stories</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: 'Samuel A.',
                role: 'Engineering Student',
                location: 'Nigeria to Germany',
                story: 'Through Blue OX, I secured admission to a top engineering program in Germany. The team helped me with my visa, documents, and even finding accommodation.',
              },
              {
                name: 'Mary K.',
                role: 'Healthcare Worker',
                location: 'Kenya to Netherlands',
                story: 'I am now working as a certified healthcare assistant in Amsterdam. Blue OX made the entire process manageable and stress-free.',
              },
            ].map((story, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-coral/10 rounded-full flex items-center justify-center mr-4">
                    <Award className="w-7 h-7 text-coral" />
                  </div>
                  <div>
                    <h4 className="font-space font-bold text-lg text-navy">{story.name}</h4>
                    <p className="text-sm text-coral">{story.role}</p>
                    <p className="text-xs text-gray-500">{story.location}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{story.story}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
