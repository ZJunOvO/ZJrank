
import React from 'react';

interface BottomNavProps {
    activeTab: 'home' | 'profile' | 'create';
    onTabChange: (tab: 'home' | 'profile') => void;
    onCreateClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onCreateClick }) => {
    return (
        <div className="absolute bottom-0 left-0 w-full z-50 pb-8 flex justify-center">
             <div 
                className="pointer-events-auto rounded-full px-2 py-2 flex items-center backdrop-blur-xl transition-all duration-300"
                style={{
                    // Increased opacity slightly for better contrast on complex backgrounds
                    background: 'linear-gradient(rgba(247, 247, 246, 0.7), rgba(247, 247, 246, 0.5))',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 25px 35px rgba(0, 0, 0, 0.15)'
                }}
            >
                <button 
                    onClick={() => onTabChange('home')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 group ${activeTab === 'home' ? 'bg-white/40 shadow-sm' : 'hover:bg-white/20'}`}
                >
                    {/* Active: Dark Bronze (#605228) for high contrast | Inactive: Deep Stone (#57534e) */}
                    {/* Added drop-shadow-md to create a "halo" effect on dark backgrounds */}
                    <span className={`material-symbols-outlined text-[22px] transition-colors drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] ${activeTab === 'home' ? 'text-[#605228]' : 'text-[#57534e] group-hover:text-[#605228]'}`}>
                        auto_awesome_mosaic
                    </span>
                    <span className={`text-xs font-display font-bold transition-colors drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] ${activeTab === 'home' ? 'text-[#605228]' : 'text-[#57534e] group-hover:text-[#605228]'}`}>
                        动态
                    </span>
                </button>
                
                <button 
                    onClick={onCreateClick}
                    className="w-12 h-12 bg-[#ded5b6] text-background-dark rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform mx-1 group shadow-lg shadow-[#ded5b6]/30 border border-[#c2b690]"
                >
                    <span className="material-symbols-outlined text-[26px] group-hover:rotate-90 transition-transform duration-300 text-[#2a2720]">
                        add
                    </span>
                </button>
                
                <button 
                        onClick={() => onTabChange('profile')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 group ${activeTab === 'profile' ? 'bg-white/40 shadow-sm' : 'hover:bg-white/20'}`}
                >
                    <span className={`material-symbols-outlined text-[22px] transition-colors drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] ${activeTab === 'profile' ? 'text-[#605228]' : 'text-[#57534e] group-hover:text-[#605228]'}`}>
                        person
                    </span>
                    <span className={`text-xs font-display font-bold transition-colors drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] ${activeTab === 'profile' ? 'text-[#605228]' : 'text-[#57534e] group-hover:text-[#605228]'}`}>
                        我的
                    </span>
                </button>
            </div>
        </div>
    );
};
