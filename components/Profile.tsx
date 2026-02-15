
import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Collection } from '../types';
import { uploadImageToStorage } from '../utils/firebase';

interface ProfileProps {
    collections: Collection[];
    onCollectionClick: (id: string, scrollY: number) => void;
    initialScroll: number;
    userAvatar: string;
    onUpdateAvatar: (url: string) => void;
    onCreateClick: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ 
    collections, 
    onCollectionClick, 
    initialScroll, 
    userAvatar, 
    onUpdateAvatar,
    onCreateClick
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useLayoutEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = initialScroll;
        }
    }, [initialScroll]);

    const handleItemClick = (id: string) => {
        if (containerRef.current) {
            onCollectionClick(id, containerRef.current.scrollTop);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const newAvatarUrl = await uploadImageToStorage(file);
            onUpdateAvatar(newAvatarUrl);
        }
    };

    return (
        <div ref={containerRef} className="flex-1 h-full overflow-y-auto no-scrollbar pb-32 pt-24">
            <div className="flex flex-col items-center px-6 mb-8">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
                <div 
                    className="relative w-32 h-32 mb-6 group cursor-pointer"
                    onClick={handleAvatarClick}
                >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/5 to-transparent"></div>
                    {/* Shared Element Avatar */}
                    <motion.img 
                        layoutId="shared-avatar-img"
                        alt="User Avatar" 
                        className="w-full h-full rounded-full object-cover border border-black/5 shadow-xl shadow-black/5" 
                        src={userAvatar} 
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-2xl">edit</span>
                    </div>
                </div>
                <h1 className="text-2xl text-text-main font-medium mb-1 tracking-wide font-display">Our Archive</h1>
                <p className="text-text-sub text-xs tracking-[0.1em] uppercase font-bold mb-4">Shared Memories • Est. {new Date().getFullYear()}</p>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    CLOUD SYNC ACTIVE
                </div>
                
                <div className="flex items-center gap-8 border-y border-black/10 py-5 w-full justify-center mt-8">
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-medium text-text-main font-sans">{collections.length}</span>
                        <span className="text-[11px] text-text-sub uppercase tracking-widest mt-1 font-bold">全部榜单</span>
                    </div>
                    <div className="w-px h-8 bg-black/10"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-medium text-text-main font-sans">
                            {collections.reduce((acc, curr) => acc + (curr.items?.length || 0), 0)}
                        </span>
                        <span className="text-[11px] text-text-sub uppercase tracking-widest mt-1 font-bold">收录单品</span>
                    </div>
                </div>
            </div>

            <div className="px-6 mb-6">
                <div className="flex gap-8 border-b border-black/10">
                    <button className="pb-3 text-sm font-medium text-black border-b-2 border-black px-1 font-display tracking-wide">所有收藏</button>
                </div>
            </div>

            <div className="px-4 grid grid-cols-2 gap-3">
                {collections.map(c => (
                     <div key={c.id} className="bg-background-paper rounded-sm overflow-hidden group shadow-sm cursor-pointer" onClick={() => handleItemClick(c.id)}>
                        <div className="aspect-[4/5] relative">
                            <motion.img 
                                layoutId={`cover-${c.id}`}
                                alt={c.title} 
                                className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-500 grayscale-[20%] group-hover:grayscale-0" 
                                src={c.coverImage} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                            <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                                <p className="text-white text-sm font-medium leading-tight font-display tracking-wide">{c.title}</p>
                                <p className="text-white/80 text-[10px] mt-1 font-sans tracking-wide">{c.items.length}项</p>
                            </div>
                        </div>
                    </div>
                ))}
               
                <div 
                    onClick={onCreateClick}
                    className="bg-background-paper rounded-sm overflow-hidden group flex items-center justify-center aspect-[4/5] relative border border-black/5 hover:bg-black/5 transition-colors cursor-pointer"
                >
                    <div className="flex flex-col items-center justify-center text-text-sub hover:text-black transition-colors">
                        <span className="material-symbols-outlined text-3xl mb-2 font-light">add</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold font-display">新建合集</span>
                    </div>
                </div>
            </div>
            
            <div className="h-24"></div>
        </div>
    );
};
