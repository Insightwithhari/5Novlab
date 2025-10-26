import React from 'react';

const InfoCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700 ${className}`}>
        <h3 className="text-xl font-semibold primary-text mb-4 border-b primary-border pb-2">{title}</h3>
        <div className="text-slate-700 dark:text-slate-300 space-y-2">{children}</div>
    </div>
);

const SupervisorProfileCard: React.FC<{name: string, title: string, imageUrl: string, bio: string}> = ({ name, title, imageUrl, bio }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-shadow duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img 
            src={imageUrl} 
            alt={name}
            className="w-32 h-32 rounded-full flex-shrink-0 border-4 border-slate-200 dark:border-slate-600 object-cover"
        />
        <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{name}</h2>
            <p className="text-md primary-text font-semibold">{title}</p>
            <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
                {bio}
            </p>
        </div>
    </div>
);

const SupervisorPage: React.FC = () => {
  return (
    <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-900/50 min-h-full">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
            <h1 className="text-4xl font-extrabold primary-text">Our Leadership</h1>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">Guiding the future of bioinformatics research.</p>
        </header>
        
        <div className="space-y-8 mb-12">
          <SupervisorProfileCard 
              name="Dr. Evelyn Reed"
              title="Principal Investigator"
              imageUrl="https://i.pravatar.cc/150?img=12"
              bio="Dr. Reed is a leading expert in computational biology with over 20 years of experience in protein engineering. Her work focuses on leveraging AI to accelerate drug discovery and develop novel therapeutic proteins."
          />
          <SupervisorProfileCard 
              name="Dr. Kenji Tanaka"
              title="Senior Research Scientist"
              imageUrl="https://i.pravatar.cc/150?img=58"
              bio="Dr. Tanaka specializes in structural bioinformatics and molecular dynamics simulations. His research is pivotal in understanding protein-ligand interactions and designing next-generation enzymes for industrial applications."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InfoCard title="Research Interests" className="lg:col-span-2">
                <p>
                    Our lab focuses on the intersection of computational biology and artificial intelligence. Key areas of interest include rational protein design, predicting protein-protein interactions, and developing novel algorithms for analyzing large-scale genomic data. We are particularly interested in engineering enzymes with enhanced catalytic activity and stability for industrial applications.
                </p>
            </InfoCard>
            <InfoCard title="Ongoing Projects">
                <ul className="list-disc list-inside space-y-1">
                    <li>Project Chimera: AI-driven protein stability analysis</li>
                    <li>Project Griffin: In-silico drug docking simulations</li>
                    <li>Project Hydra: Deep learning for gene sequence annotation</li>
                </ul>
            </InfoCard>
            <InfoCard title="Recent Publications">
                <ul className="list-disc list-inside space-y-1">
                    <li>"Predictive Models for In-Silico Protein Folding" - J. Mol. Biol.</li>
                    <li>"Engineering Thermostability in Lysozyme Mutants" - Protein Sci.</li>
                </ul>
            </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default SupervisorPage;