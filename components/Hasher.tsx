import React, { useState } from 'react';
import { generateSalt, hashWithSHA, hashWithPBKDF2 } from '../utils/security';

const ALGORITHMS = [
    { id: 'SHA-256', name: 'SHA-256 (Fast)', type: 'digest' },
    { id: 'SHA-512', name: 'SHA-512 (Fast)', type: 'digest' },
    { id: 'PBKDF2', name: 'PBKDF2 (Secure)', type: 'key' },
];

const Hasher: React.FC = () => {
    const [input, setInput] = useState('');
    const [algo, setAlgo] = useState(ALGORITHMS[0].id);
    const [salt, setSalt] = useState('');
    const [iterations, setIterations] = useState(100000);
    const [hash, setHash] = useState('');
    const [isHashing, setIsHashing] = useState(false);

    const handleHash = async () => {
        if (!input) return;
        setIsHashing(true);
        try {
            let result = '';
            if (algo.startsWith('SHA')) {
                result = await hashWithSHA(input, algo as any);
            } else if (algo === 'PBKDF2') {
                if (!salt) {
                    const newSalt = generateSalt();
                    setSalt(newSalt); // Auto-generate if missing
                    result = await hashWithPBKDF2(input, newSalt, iterations);
                } else {
                    result = await hashWithPBKDF2(input, salt, iterations);
                }
            }
            setHash(result);
        } catch (e) {
            console.error(e);
            alert("Hashing failed");
        } finally {
            setIsHashing(false);
        }
    };

    const copyHash = () => {
        navigator.clipboard.writeText(hash);
        alert("Hash copied!");
    };

    return (
        <div className="p-6 space-y-6">
             <div className="bg-red-100 border-2 border-black p-4 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                DISCLAIMER: This is an educational tool. Hashes are computed entirely in your browser using the Web Crypto API.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block text-sm font-bold uppercase">Input String</label>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full p-3 border-2 border-black focus:outline-none rounded-none"
                        placeholder="Text to hash..."
                    />
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-bold uppercase">Algorithm</label>
                    <select
                        value={algo}
                        onChange={(e) => setAlgo(e.target.value)}
                        className="w-full p-3 border-2 border-black focus:outline-none rounded-none bg-white"
                    >
                        {ALGORITHMS.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {algo === 'PBKDF2' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                    <div className="space-y-4">
                        <label className="block text-sm font-bold uppercase flex justify-between">
                            <span>Salt (Hex)</span>
                            <button onClick={() => setSalt(generateSalt())} className="text-xs underline text-blue-600">Generate New</button>
                        </label>
                        <input
                            type="text"
                            value={salt}
                            onChange={(e) => setSalt(e.target.value)}
                            className="w-full p-3 border-2 border-black focus:outline-none rounded-none font-mono text-sm"
                            placeholder="Salt value..."
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm font-bold uppercase">Iterations</label>
                        <input
                            type="number"
                            value={iterations}
                            onChange={(e) => setIterations(parseInt(e.target.value))}
                            className="w-full p-3 border-2 border-black focus:outline-none rounded-none"
                        />
                    </div>
                </div>
            )}
            
            <div className="pt-4">
                <button
                    onClick={handleHash}
                    disabled={isHashing || !input}
                    className="w-full py-4 bg-black text-white font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                >
                    {isHashing ? "Computing Hash..." : "Generate Hash"}
                </button>
            </div>

            {hash && (
                <div className="mt-8 space-y-2 animate-in slide-in-from-bottom-2">
                    <label className="block text-sm font-bold uppercase text-gray-500">Output Hash</label>
                    <div className="flex">
                        <div className="flex-1 p-4 border-2 border-black bg-gray-100 font-mono text-sm break-all">
                            {hash}
                        </div>
                        <button
                            onClick={copyHash}
                            className="px-4 border-2 border-l-0 border-black bg-white hover:bg-gray-50 font-bold uppercase text-sm"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-8 p-4 border-2 border-black bg-white text-sm">
                <h4 className="font-bold uppercase mb-2">Algorithm Info</h4>
                {algo === 'PBKDF2' ? (
                    <p>PBKDF2 (Password-Based Key Derivation Function 2) applies a pseudorandom function to the password along with a salt value and repeats the process many times to produce a derived key, making it resistant to brute-force attacks.</p>
                ) : (
                    <p>SHA (Secure Hash Algorithm) is a family of cryptographic hash functions designed to keep data secure. It is a one-way function that turns input into a fixed-size string of characters.</p>
                )}
            </div>
        </div>
    );
};

export default Hasher;
