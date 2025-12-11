import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, FileCheck, Users, Globe, Shield, ArrowRight, X } from 'lucide-react';

const Home: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleTrackSelect = (track: 'student' | 'workforce') => {
    setShowModal(false);
    navigate(`/apply/${track}`);
  };

  return (
    <div className="font-inter">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy via-navy-dark to-navy min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySC0yNHYtMmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-orbitron text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Earn Your European Future.<br />
              <span className="text-coral">Study. Work. Thrive.</span>
            </h1>
            <p className="font-space text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
              The only platform providing end-to-end guidance from Africa to Europe's blue-collar and student markets.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-coral hover:bg-coral-dark text-white font-space font-bold text-lg px-10 py-4 rounded-lg transition transform hover:scale-105 inline-flex items-center"
            >
              Apply <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Track Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <h2 className="font-orbitron text-2xl font-bold text-navy mb-6 text-center">
              Are you applying to Study or Work?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTrackSelect('student')}
                className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:border-coral hover:bg-coral/5 transition"
              >
                <GraduationCap className="w-12 h-12 text-coral mb-3" />
                <span className="font-space font-semibold text-navy">Study</span>
              </button>
              <button
                onClick={() => handleTrackSelect('workforce')}
                className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:border-coral hover:bg-coral/5 transition"
              >
                <Briefcase className="w-12 h-12 text-coral mb-3" />
                <span className="font-space font-semibold text-navy">Work</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Step Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-navy text-center mb-16">
            Your Journey in <span className="text-coral">3 Simple Steps</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, icon: FileCheck, title: 'Apply & Upload', desc: 'Create your account, build your Europass CV, and securely upload your documents.' },
              { step: 2, icon: Users, title: 'Get Verified', desc: 'Our team reviews your application and guides you through the requirements.' },
              { step: 3, icon: Globe, title: 'Start Your Journey', desc: 'Receive your placement and begin your European adventure.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative">
                <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition h-full">
                  <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-coral" />
                  </div>
                  <div className="font-orbitron text-4xl font-bold text-coral/20 mb-2">{`0${step}`}</div>
                  <h3 className="font-space font-bold text-xl text-navy mb-3">{title}</h3>
                  <p className="text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-navy text-center mb-16">
            Success <span className="text-coral">Stories</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Emmanuel O.', country: 'Nigeria to Poland', quote: 'Blue OX made my dream of studying in Europe a reality. The process was smooth and professional.' },
              { name: 'Grace M.', country: 'Kenya to Netherlands', quote: 'I found a great job opportunity through Blue OX. Their support was exceptional throughout.' },
              { name: 'David K.', country: 'Uganda to Germany', quote: 'The team guided me every step of the way. Now I am building my career in Europe.' },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center mr-4">
                    <span className="font-orbitron font-bold text-coral">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-space font-semibold text-navy">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.country}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-coral">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="font-space text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of Africans who have successfully transitioned to Europe with Blue OX.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-coral font-space font-bold text-lg px-10 py-4 rounded-lg transition hover:bg-gray-100 inline-flex items-center"
          >
            Get Started Today <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
