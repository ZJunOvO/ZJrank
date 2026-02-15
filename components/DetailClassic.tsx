
import React from 'react';
import { motion } from 'framer-motion';
import { Collection } from '../types';

interface DetailClassicProps {
    collection: Collection;
    onBack: () => void;
    onEdit: (collection: Collection) => void;
    onDelete: (id: string) => void;
}

export const DetailClassic: React.FC<DetailClassicProps> = ({ collection, onBack, onEdit, onDelete }) => {
    
    const handleDelete = () => {
        if (confirm("确定要删除这个榜单吗？此操作无法撤销。")) {
            onDelete(collection.id);
        }
    };

    return (
        <div className="h-full flex flex-col bg-background-light">
             {/* Sticky Header with Shared Element Image */}
            <div className="pt-0 pb-0 z-40 bg-background-light sticky top-0 transition-all duration-300 border-b border-black/5 shadow-sm">
                
                <div className="relative h-24 overflow-hidden w-full">
                    <motion.div 
                        layoutId={`cover-${collection.id}`}
                        className="absolute inset-0 w-full h-full"
                    >
                         <img 
                            src={collection.coverImage} 
                            alt={collection.title}
                            className="w-full h-full object-cover opacity-30 grayscale-[50%]"
                        />
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background-light"></div>
                    </motion.div>
                </div>

                <div className="flex justify-between items-center px-4 -mt-16 relative pb-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-md hover:bg-white transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-text-main text-lg">arrow_back</span>
                    </button>
                    <div className="flex flex-col items-center">
                         <span className="text-[9px] uppercase tracking-[0.2em] text-text-sub/80 font-sans font-bold mb-1 shadow-black/10 drop-shadow-sm">Wishlist</span>
                        <motion.h1 layoutId={`title-${collection.id}`} className="text-xl font-display text-text-main font-bold tracking-wide drop-shadow-md">
                            {collection.title}
                        </motion.h1>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleDelete}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 backdrop-blur-md hover:bg-red-500 hover:text-white transition-colors shadow-sm text-red-600"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                        <button 
                            onClick={() => onEdit(collection)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-md hover:bg-white transition-colors shadow-sm"
                        >
                            <span className="material-symbols-outlined text-text-main text-lg">edit</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-32 px-5 space-y-12 pt-8">
                {collection.items.map((item, index) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={item.id} 
                        className="group relative flex flex-col gap-4 cursor-pointer"
                    >
                        <div className="flex justify-between items-end px-1">
                            <span className="font-display text-5xl italic text-primary/40 font-bold leading-none -mb-1">
                                {String(item.rank).padStart(2, '0')}
                            </span>
                            <div className="flex flex-col text-right">
                                <span className="text-xs text-text-sub font-display italic">{item.subtitle}</span>
                                <h2 className="text-2xl text-text-main font-display font-medium leading-none">{item.name}</h2>
                            </div>
                        </div>
                        
                        <div className="relative w-full overflow-hidden rounded-lg shadow-sm bg-background-paper">
                            <img alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl scale-110" src={item.image} />
                            
                            <img 
                                alt={item.name} 
                                className="relative w-full h-auto max-h-[60vh] object-contain mx-auto transform group-hover:scale-[1.02] transition-transform duration-700 ease-out block" 
                                src={item.image} 
                            />
                            
                            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.05)] pointer-events-none"></div>
                            {index === 0 && (
                                <div className="absolute bottom-4 right-4 z-10">
                                    <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-text-main hover:bg-primary hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">favorite</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {item.description && (
                             <p className="text-sm text-text-sub font-display leading-relaxed px-1 text-justify">
                                {item.description}
                            </p>
                        )}
                         {item.price && (
                             <div className="flex justify-end px-1">
                                  <span className="text-xs text-text-sub/80 font-display mt-1">{item.price}</span>
                             </div>
                        )}
                    </motion.div>
                ))}

                 <div className="h-16"></div>
            </div>
        </div>
    );
};
