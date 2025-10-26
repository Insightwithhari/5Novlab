import React, { useState } from 'react';
import { EnvelopeIcon, PhoneIcon } from '../components/icons';

const ContactInfo: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-semibold primary-text">{title}</h3>
            <div className="text-slate-700 dark:text-slate-300">{children}</div>
        </div>
    </div>
);


const ContactUsPage: React.FC = () => {
    const [formState, setFormState] = useState({ name: '', email: '', message: '' });
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formState.name || !formState.email || !formState.message) {
            setSubmitStatus('error');
            return;
        }
        setSubmitStatus('submitting');
        setTimeout(() => {
            setSubmitStatus('success');
            setFormState({ name: '', email: '', message: '' });
        }, 1500);
    };

  return (
    <div className="p-4 md:p-8 text-slate-800 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 primary-text">Contact Us</h1>
        <p className="text-lg text-center text-slate-600 dark:text-slate-300 mb-12">
            Have a question or want to collaborate? Reach out to us.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white dark:bg-slate-800/50 p-8 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="space-y-8">
                <ContactInfo
                    icon={<EnvelopeIcon className="w-6 h-6 primary-text" />}
                    title="Email Us"
                >
                    <a href="mailto:contact@dreamlab.science" className="hover:underline">
                        contact@dreamlab.science
                    </a>
                </ContactInfo>
                <ContactInfo
                    icon={<PhoneIcon className="w-6 h-6 primary-text" />}
                    title="Call Us"
                >
                    <p>+1 (555) 123-4567</p>
                </ContactInfo>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold primary-text">Send a Message</h3>
                <input type="text" name="name" placeholder="Your Name" value={formState.name} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-slate-700 p-3 rounded-md border border-slate-300 dark:border-slate-600 focus:primary-ring focus:outline-none" />
                <input type="email" name="email" placeholder="Your Email" value={formState.email} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-slate-700 p-3 rounded-md border border-slate-300 dark:border-slate-600 focus:primary-ring focus:outline-none" />
                <textarea name="message" placeholder="Your Message" rows={4} value={formState.message} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-slate-700 p-3 rounded-md border border-slate-300 dark:border-slate-600 focus:primary-ring focus:outline-none resize-none"></textarea>
                <button type="submit" disabled={submitStatus === 'submitting'} className="w-full py-3 primary-bg primary-bg-hover text-white rounded-md font-semibold transition-colors disabled:bg-slate-400">
                    {submitStatus === 'submitting' ? 'Sending...' : 'Submit'}
                </button>
                {submitStatus === 'success' && <p className="text-emerald-500 text-sm text-center">Thank you! Your message has been sent.</p>}
                {submitStatus === 'error' && <p className="text-red-500 text-sm text-center">Please fill out all fields.</p>}
            </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;