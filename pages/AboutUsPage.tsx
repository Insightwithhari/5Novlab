import React from 'react';
import { TelegramIcon, InstagramIcon, XIcon, WhatsAppIcon } from '../components/icons';

const SocialLink: React.FC<{ href: string; icon: React.ReactNode }> = ({ href, icon }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:primary-text transition-colors">
        {icon}
    </a>
);

const ProfileCard: React.FC<{ name: string; title: string; imageUrl: string }> = ({ name, title, imageUrl }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg p-6 flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-lg hover:shadow-[var(--primary-color)]/10 shadow-md border border-slate-200 dark:border-slate-700">
    <img src={imageUrl} alt={`Profile of ${name}`} className="w-32 h-32 rounded-full mb-4 border-4 border-slate-300 dark:border-slate-700 object-cover" />
    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{name}</h3>
    <p className="primary-text">{title}</p>
    <div className="flex space-x-4 mt-4">
        <SocialLink href="#" icon={<TelegramIcon />} />
        <SocialLink href="#" icon={<InstagramIcon />} />
        <SocialLink href="#" icon={<XIcon />} />
        <SocialLink href="#" icon={<WhatsAppIcon />} />
    </div>
  </div>
);

const AboutUsPage: React.FC = () => {
  return (
    <div className="p-4 md:p-8 text-slate-800 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 primary-text">About The Dream Lab</h1>
        <p className="text-lg text-center text-slate-600 dark:text-slate-300 mb-12">
          We are a dedicated team of researchers and developers passionate about leveraging computational tools to push the boundaries of bioinformatics and protein engineering.
        </p>
        
        <div>
          <h2 className="text-3xl font-semibold text-center mb-8 border-b-2 primary-border pb-2">Meet the Developers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProfileCard name="Hariom" title="Lead Developer & Bioinformatician" imageUrl="https://i.pravatar.cc/150?img=5" />
            <ProfileCard name="Alex Doe" title="Frontend Specialist & UI/UX Designer" imageUrl="https://i.pravatar.cc/150?img=6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;