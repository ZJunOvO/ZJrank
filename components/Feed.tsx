
import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collection } from '../types';

interface FeedProps {
    collections: Collection[];
    onCollectionClick: (id: string, scrollY: number) => void;
    initialScroll: number;
    userAvatar: string;
}

const SEARCH_PLACEHOLDERS = [
    "送给男朋友的生日礼物？",
    "2024年度必读书单",
    "适合约会的氛围感餐厅",
    "300元以内的格调香薰",
    "周末露营装备清单",
    "极简主义桌面好物",
    "上海City Walk路线"
];

export const Feed: React.FC<FeedProps> = ({ collections, onCollectionClick, initialScroll, userAvatar }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [randomPlaceholder, setRandomPlaceholder] = useState(SEARCH_PLACEHOLDERS[0]);
    const [showHeaderContent, setShowHeaderContent] = useState(true);
    
    // Refs for scroll logic
    const lastScrollY = useRef(0);
    const scrollDirection = useRef<'up' | 'down'>('up');
    const ignoreScrollRef = useRef(false); // New: Prevents jitter on bounce

    // Pick random placeholder on mount
    useEffect(() => {
        setRandomPlaceholder(SEARCH_PLACEHOLDERS[Math.floor(Math.random() * SEARCH_PLACEHOLDERS.length)]);
    }, []);

    // Restore scroll position
    useLayoutEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = initialScroll;
        }
    }, [initialScroll]);

    // --- Strict Scroll & Touch Logic ---
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const currentY = container.scrollTop;
            const delta = currentY - lastScrollY.current;
            
            // Hysteresis: Ignore tiny movements (noise/jitter)
            if (Math.abs(delta) < 4) return;

            // Determine direction
            if (delta > 0) {
                scrollDirection.current = 'down';
            } else if (delta < 0) {
                scrollDirection.current = 'up';
            }

            // Logic: Hide Immediately on Scroll Down
            // Added check for ignoreScrollRef to prevent hiding during bounce-back
            if (scrollDirection.current === 'down' && currentY > 60 && showHeaderContent && !ignoreScrollRef.current) {
                setShowHeaderContent(false);
            }

            lastScrollY.current = currentY;
        };

        // Listen to Touch End to trigger "Reveal"
        const handleTouchEnd = () => {
            // Only reveal if user was scrolling UP and header is currently hidden
            if (scrollDirection.current === 'up' && !showHeaderContent) {
                setShowHeaderContent(true);
                
                // CRITICAL FIX: Lock hiding for a short period.
                // This prevents the natural "rubber band" bounce or finger settling 
                // from immediately triggering a "down" scroll event and hiding the header again.
                ignoreScrollRef.current = true;
                setTimeout(() => {
                    ignoreScrollRef.current = false;
                }, 500);
            }
        };

        container.addEventListener('scroll', handleScroll);
        container.addEventListener('touchend', handleTouchEnd);
        
        return () => {
            container.removeEventListener('scroll', handleScroll);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [showHeaderContent]); // Re-bind if state changes to ensure closure captures correct state

    const handleItemClick = (id: string) => {
        if (containerRef.current) {
            onCollectionClick(id, containerRef.current.scrollTop);
        }
    };

    // --- Search Logic ---
    const filteredCollections = collections.filter(c => {
        const query = searchQuery.toLowerCase();
        if (!query) return true;
        
        // Search in title
        if (c.title.toLowerCase().includes(query)) return true;
        
        // Search in item names or subtitles
        return c.items.some(item => 
            item.name.toLowerCase().includes(query) || 
            (item.subtitle && item.subtitle.toLowerCase().includes(query)) ||
            (item.tags && item.tags.some(t => t.toLowerCase().includes(query)))
        );
    });

    return (
        <div ref={containerRef} className="flex-1 h-full overflow-y-auto no-scrollbar pb-32 px-6">
            
            {/* Header Area */}
            {/* Using absolute Avatar ensures it never collides with title/search flow */}
            <div className={`fixed top-6 right-6 z-50 transition-opacity duration-300 ${!showHeaderContent ? 'opacity-100' : 'opacity-100'}`}>
                <div className="w-9 h-9 rounded-full overflow-hidden border border-black/10 shadow-sm cursor-pointer">
                    <motion.img 
                        layoutId="shared-avatar-img"
                        alt="User Profile" 
                        className="w-full h-full object-cover" 
                        src={userAvatar} 
                    />
                </div>
            </div>

            <div 
                className={`pt-8 pb-4 sticky top-0 z-40 transition-all duration-500 ease-in-out
                ${!showHeaderContent 
                    ? 'bg-gradient-to-b from-background-light via-background-light/90 to-transparent -mx-6 px-6 backdrop-blur-[2px]' 
                    : 'bg-background-light/95 backdrop-blur-md -mx-6 px-6'}`}
                style={{
                    // Feathering effect at the bottom when collapsed
                    maskImage: !showHeaderContent ? 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)' : 'none',
                    WebkitMaskImage: !showHeaderContent ? 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)' : 'none'
                }}
            >
                <div className="flex flex-col gap-6 relative">
                    <div className="flex justify-between items-end border-b border-black/5 pb-4 transition-all duration-500 min-h-[60px]">
                        
                        {/* Title Wrapper */}
                        <div className="relative w-full">
                            <AnimatePresence>
                                {showHeaderContent && (
                                    <motion.h1 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-4xl font-display text-text-main tracking-tight font-bold origin-left"
                                    >
                                        ZJrank
                                    </motion.h1>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Search Bar - Collapses smoothly */}
                    <motion.div 
                        initial={false}
                        animate={{ 
                            height: showHeaderContent ? 'auto' : 0, 
                            opacity: showHeaderContent ? 1 : 0,
                            marginBottom: showHeaderContent ? '0.5rem' : 0,
                            marginTop: showHeaderContent ? 0 : -20 // Pull up slightly when hiding
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="relative group overflow-hidden origin-top"
                    >
                        <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-text-sub/60 group-focus-within:text-black transition-colors text-lg">search</span>
                        </div>
                        <input 
                            className="block w-full pl-8 pr-3 py-2 bg-transparent border-0 border-b border-black/10 text-text-main placeholder-text-sub/50 focus:ring-0 focus:border-black/30 sm:text-[15px] font-sans transition-colors placeholder:font-sans" 
                            placeholder={randomPlaceholder} 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                         <div className="absolute inset-y-0 right-0 flex items-center">
                            {searchQuery ? (
                                <button onClick={() => setSearchQuery('')} className="text-text-sub/60 hover:text-black transition-colors">
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            ) : (
                                <button className="text-text-sub/60 hover:text-black transition-colors">
                                    <span className="material-symbols-outlined text-lg">tune</span>
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="space-y-16 pt-6">
                {filteredCollections.length > 0 ? (
                    filteredCollections.map((collection) => (
                        <div key={collection.id} className="group relative flex flex-col gap-5 cursor-pointer" onClick={() => handleItemClick(collection.id)}>
                            <motion.div 
                                layoutId={`cover-${collection.id}`}
                                className="relative w-full aspect-[4/5] overflow-hidden rounded shadow-sm bg-background-paper z-10"
                            >
                                <img 
                                    alt={collection.title} 
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out" 
                                    src={collection.coverImage} 
                                />
                                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] pointer-events-none"></div>
                            </motion.div>
                            <div className="flex flex-col gap-2 items-center text-center">
                                <span className="text-text-sub text-[10px] font-bold tracking-[0.2em] uppercase border-b border-black/10 pb-1">
                                    {collection.template === 'editorial' ? 'Feature Story' : 'The List'}
                                </span>
                                <motion.h2 layoutId={`title-${collection.id}`} className="text-3xl text-text-main font-display font-medium leading-tight mt-1">
                                    {collection.title}
                                </motion.h2>
                                <div className="flex items-center gap-3 mt-1 text-text-sub text-xs font-sans tracking-wide">
                                    <span>{collection.itemCount} 项</span>
                                    <span className="w-1 h-1 rounded-full bg-black/20"></span>
                                    <span className="font-sans text-xs">{collection.lastEdited}编辑</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center opacity-50">
                        <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                        <p className="font-display">没有找到相关榜单</p>
                    </div>
                )}
            </div>
            <div className="h-16"></div>
        </div>
    );
};
