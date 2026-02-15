
import React from 'react';
import { motion } from 'framer-motion';
import { Collection } from '../types';

interface DetailEditorialProps {
    collection: Collection;
    onBack: () => void;
    onEdit: (collection: Collection) => void;
    onDelete: (id: string) => void;
}

export const DetailEditorial: React.FC<DetailEditorialProps> = ({ collection, onBack, onEdit, onDelete }) => {
    // 排序确保 1,2,3 是正确的
    const sortedItems = [...collection.items].sort((a, b) => a.rank - b.rank);
    const topItem = sortedItems[0];
    const secondItem = sortedItems[1];
    const thirdItem = sortedItems[2];
    const others = sortedItems.slice(3);

    // Hero Logic: Use Rank #1 Image if available, otherwise fallback to Collection Cover
    // If user deleted cover during create, we might rely on item 1 anyway.
    const heroImage = topItem?.image || collection.coverImage;

    const handleDelete = () => {
        if (confirm("确定要删除这个榜单吗？此操作无法撤销。")) {
            onDelete(collection.id);
        }
    };

    return (
        <div className="flex-1 h-full overflow-y-auto no-scrollbar bg-background-light">
            <div className="absolute top-6 left-0 w-full z-40 px-5 flex justify-between items-center pointer-events-none">
                <button onClick={onBack} className="pointer-events-auto w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors text-white border border-white/20">
                    <span className="material-symbols-outlined font-light">arrow_back</span>
                </button>
                <div className="flex gap-3 pointer-events-auto">
                    <button 
                        onClick={handleDelete}
                        className="w-10 h-10 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center hover:bg-red-600 transition-colors text-white border border-white/20 shadow-lg"
                    >
                        <span className="material-symbols-outlined text-lg font-light">delete</span>
                    </button>
                    <button 
                        onClick={() => onEdit(collection)}
                        className="w-10 h-10 rounded-full bg-[#1a1918] text-primary flex items-center justify-center hover:scale-105 transition-transform shadow-lg border border-white/10"
                    >
                        <span className="material-symbols-outlined text-lg font-light">edit</span>
                    </button>
                </div>
            </div>

            <motion.div 
                layoutId={`cover-${collection.id}`}
                className="relative w-full h-[70vh] shrink-0 group"
            >
                <div className="absolute inset-0 w-full h-full">
                    {/* Fixed: Show #1 Item Image here */}
                    <img alt="Hero" className="w-full h-full object-cover grayscale-[20%] contrast-[1.05]" src={heroImage} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/40 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 w-full px-6 pb-12 flex flex-col items-center text-center z-10">
                    <div className="flex items-center gap-3 mb-5 opacity-90">
                        <span className="w-12 h-[1px] bg-primary/60"></span>
                        <span className="text-primary text-[10px] uppercase tracking-[0.3em] font-medium font-display">THE SELECTION</span>
                        <span className="w-12 h-[1px] bg-primary/60"></span>
                    </div>
                    <motion.h1 layoutId={`title-${collection.id}`} className="text-[3.5rem] font-display font-medium text-[#fdfcf8] leading-none mb-3 tracking-wide">
                        {topItem?.name || collection.title}
                    </motion.h1>
                    <p className="text-[#fdfcf8]/70 text-xs font-light tracking-[0.2em] uppercase mb-8 font-sans">{topItem?.description || "Top Selection"}</p>
                    <div className="w-14 h-14 rounded-full border border-primary/30 flex items-center justify-center bg-black/20 backdrop-blur-md">
                        <span className="text-primary font-display text-2xl italic pt-1">1</span>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="px-8 pt-12 pb-4 relative z-20 bg-background-light -mt-6 rounded-t-3xl border-t border-black/5"
            >
                <div className="flex justify-between items-end border-b border-[#1a1918]/10 pb-8">
                    <div>
                        <h2 className="text-[#8c8883] text-[10px] font-bold tracking-[0.3em] uppercase mb-3 font-display">PERSONAL FAVORITES</h2>
                        <p className="text-3xl font-display font-medium text-[#1a1918] leading-tight tracking-wide">
                            <span className="italic font-normal">{collection.title}</span>
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                         <div className="flex -space-x-3">
                        </div>
                        <span className="text-[9px] text-[#8c8883] uppercase tracking-[0.2em] font-medium">EST. {new Date().getFullYear()}</span>
                    </div>
                </div>
            </motion.div>

            <div className="px-6 space-y-10 mt-6 pb-32">
                {secondItem && (
                    <div className="relative w-full rounded-none overflow-hidden group">
                        <div className="aspect-[4/5] w-full relative overflow-hidden rounded-xl shadow-soft">
                            <img alt={secondItem.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-[10%]" src={secondItem.image} />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1d1b15]/60 to-transparent"></div>
                            <div className="absolute top-5 left-5 w-10 h-10 rounded-full bg-[#fdfcf8]/95 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/50">
                                <span className="text-[#1a1918] font-display font-medium text-xl italic pt-0.5">2</span>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full p-8 text-[#fdfcf8]">
                                <div className="flex justify-between items-end border-t border-white/20 pt-4">
                                    <div>
                                        <h3 className="font-display text-3xl font-medium leading-none mb-2 tracking-wide">{secondItem.name}</h3>
                                        <p className="text-[#fdfcf8]/60 text-[10px] uppercase tracking-[0.25em] font-display">{secondItem.subtitle}</p>
                                    </div>
                                    <button className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                                        <span className="material-symbols-outlined text-lg font-light">arrow_outward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {thirdItem && (
                    <div className="relative w-full rounded-none overflow-hidden group px-2">
                        <div className="aspect-[16/10] w-full relative overflow-hidden rounded-lg shadow-soft">
                            <img alt={thirdItem.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-[10%]" src={thirdItem.image} />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1d1b15]/60 to-transparent"></div>
                            <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-[#fdfcf8]/95 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/50">
                                <span className="text-[#1a1918] font-display font-medium text-lg italic pt-0.5">3</span>
                            </div>
                             <div className="absolute bottom-0 left-0 w-full p-6 text-[#fdfcf8]">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="font-display text-2xl font-medium leading-none mb-1 tracking-wide">{thirdItem.name}</h3>
                                        <p className="text-[#fdfcf8]/60 text-[9px] uppercase tracking-[0.25em] font-display">{thirdItem.subtitle}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="pt-12 px-6 space-y-8">
                     <div className="flex items-center gap-4 border-b border-[#1a1918]/10 pb-4">
                        <p className="text-[#8c8883] text-[10px] uppercase tracking-[0.3em] w-full text-center font-display">More Recommendations</p>
                    </div>
                    {others.map(item => (
                        <div key={item.id} className="group flex items-center gap-6">
                            <span className="font-display text-2xl italic text-[#c5bda5] w-8 text-center pt-1 font-medium">{item.rank}</span>
                            <div className="w-20 h-20 rounded-md overflow-hidden shrink-0 shadow-sm relative border border-black/5">
                                <img alt={item.name} className="w-full h-full object-cover grayscale-[10%]" src={item.image} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center h-20 border-b border-[#1a1918]/5 group-last:border-0 pb-1">
                                <h4 className="text-[#1a1918] text-xl font-display font-medium leading-none mb-2 tracking-wide">{item.name}</h4>
                                <p className="text-[#8c8883] text-[10px] uppercase tracking-[0.15em] font-display">{item.subtitle}</p>
                            </div>
                        </div>
                    ))}
                     <div className="h-24 flex items-center justify-center opacity-40">
                        <div className="w-px h-12 bg-black/20"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
