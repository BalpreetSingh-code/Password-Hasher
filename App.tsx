
import React, { useState } from 'react';
import Generator from './components/Generator';
import Analyzer from './components/Analyzer';
import Hasher from './components/Hasher';

type Tab = 'generator' | 'analyzer' | 'hasher';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('generator');

    return (
        <div className="min-h-screen bg-white text-black p-4 sm:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-4 mb-8">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-[0.85]">
                            SecurePass<br />Toolkit
                        </h1>
                        <p className="mt-4 font-bold text-gray-500 uppercase tracking-widest text-sm">
                            Client-Side Security Utilities
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 px-3 py-1 bg-black text-white font-mono text-xs uppercase font-bold">
                        v1.0.0
                    </div>
                </header>

                {/* Tab Navigation */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {[
                        { id: 'generator', label: 'AI Generator' },
                        { id: 'analyzer', label: 'Strength Analyzer' },
                        { id: 'hasher', label: 'Password Hasher' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`
                        flex-1 py-4 px-6 text-center font-black uppercase tracking-wide border-2 border-black transition-all duration-200
                        ${activeTab === tab.id
                                    ? 'bg-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] -translate-y-1'
                                    : 'bg-white text-black hover:bg-gray-100 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
                    `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <main className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[600px] relative overflow-hidden">
                    <div className={activeTab === 'generator' ? 'block' : 'hidden'}>
                        <Generator />
                    </div>
                    <div className={activeTab === 'analyzer' ? 'block' : 'hidden'}>
                        <Analyzer />
                    </div>
                    <div className={activeTab === 'hasher' ? 'block' : 'hidden'}>
                        <Hasher />
                    </div>
                </main>

                <footer className="text-center text-xs font-bold text-gray-400 uppercase pt-8">
                    Made by Omar, Radin and Balpreet
                </footer>

            </div>
        </div>
    );
};

export default App;
