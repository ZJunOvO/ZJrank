import React from 'react';
import { IMAGES } from '../constants';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: 'classic' | 'editorial') => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
            <div className="bg-background-light w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 pb-12 sm:pb-6 relative animate-slide-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-black/50 hover:text-black">
                     <span className="material-symbols-outlined">close</span>
                </button>
                <h2 className="font-display text-2xl font-bold mb-2">选择展示风格</h2>
                <p className="text-xs text-text-sub uppercase tracking-wider mb-6">Choose Presentation Style</p>

                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => onSelect('classic')} className="group flex flex-col gap-3 text-left">
                        <div className="aspect-[3/4] rounded-lg bg-background-paper overflow-hidden border border-black/10 relative">
                             <img src={IMAGES.sunset} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Classic" />
                             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                             <div className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 text-[10px] font-bold rounded-sm backdrop-blur-sm">LIST</div>
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-text-main group-hover:text-accent-gold transition-colors">经典清单</h3>
                            <p className="text-[10px] text-text-sub mt-1">适用于礼物、书单、好物推荐</p>
                        </div>
                    </button>
                     <button onClick={() => onSelect('editorial')} className="group flex flex-col gap-3 text-left">
                        <div className="aspect-[3/4] rounded-lg bg-background-paper overflow-hidden border border-black/10 relative">
                             <img src={IMAGES.milktea} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Editorial" />
                             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                              <div className="absolute bottom-3 left-3 bg-black/90 text-white px-2 py-1 text-[10px] font-bold rounded-sm backdrop-blur-sm">MAG</div>
                        </div>
                         <div>
                            <h3 className="font-display font-bold text-text-main group-hover:text-accent-gold transition-colors">杂志专栏</h3>
                            <p className="text-[10px] text-text-sub mt-1">适用于美食、探店、深度评测</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};