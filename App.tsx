
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNav } from './components/BottomNav';
import { Feed } from './components/Feed';
import { Profile } from './components/Profile';
import { DetailClassic } from './components/DetailClassic';
import { DetailEditorial } from './components/DetailEditorial';
import { CreateCollection } from './components/CreateCollection';
import { TemplateModal } from './components/TemplateModal';
import { IMAGES } from './constants';
import { ViewState, Collection } from './types';
import { subscribeToCollections, deleteCollection, saveUserProfile, getUserProfile, addNewCollection, updateCollection, uploadImageToStorage } from './utils/api';

export default function App() {
    const [view, setView] = useState<ViewState>('home');
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
    
    // --- Global UI State ---
    const [userAvatar, setUserAvatar] = useState<string>(() => {
        return localStorage.getItem('muse_avatar') || IMAGES.avatar1;
    });

    // Create/Edit State
    const [createTemplate, setCreateTemplate] = useState<'classic' | 'editorial'>('classic');
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
    
    // Store scroll positions
    const scrollPositions = useRef({ home: 0, profile: 0 });

    // Load from Firebase on mount
    useEffect(() => {
        // 1. Subscribe to Collections
        const unsubscribe = subscribeToCollections((data) => {
            if (data.length === 0) {
                setCollections([]); 
            } else {
                setCollections(data);
            }
        });

        // 2. Fetch User Profile (Avatar)
        getUserProfile().then(profile => {
            if (profile && profile.avatar) {
                setUserAvatar(profile.avatar);
                localStorage.setItem('muse_avatar', profile.avatar);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleUpdateAvatar = async (newUrl: string) => {
        // Optimistic update
        setUserAvatar(newUrl);
        localStorage.setItem('muse_avatar', newUrl);
        
        // Save to Firebase
        try {
            await saveUserProfile(newUrl);
        } catch (e) {
            console.error("Failed to save avatar remotely", e);
        }
    };

    const handleCollectionClick = (id: string, scrollY: number) => {
        if (view === 'home' || view === 'profile') {
            scrollPositions.current[view] = scrollY;
        }
        setSelectedCollectionId(id);
        setView('detail');
    };

    const handleTabChange = (tab: 'home' | 'profile') => {
        setView(tab);
        setSelectedCollectionId(null);
    };

    const handleBack = () => {
        setView('home');
        setTimeout(() => setSelectedCollectionId(null), 300);
    };

    // --- Create Logic ---
    const handleCreateClick = () => {
        setEditingCollection(null); 
        setIsTemplateModalOpen(true);
    };

    const handleTemplateSelect = (template: 'classic' | 'editorial') => {
        setCreateTemplate(template);
        setIsTemplateModalOpen(false);
        setView('create');
    };

    const handleEditCollection = (collection: Collection) => {
        setEditingCollection(collection);
        setCreateTemplate(collection.template);
        setView('create');
    };

    const handleDeleteCollection = async (id: string) => {
        try {
            await deleteCollection(id);
            handleBack(); 
        } catch (e) {
            alert("删除失败，请重试");
        }
    };

    const handleSaveCollection = () => {
        setView('home');
        setEditingCollection(null);
    };

    const getSelectedCollection = () => {
        return collections.find(c => c.id === selectedCollectionId) || collections[0];
    };

    return (
        <div className="mx-auto w-full max-w-md h-screen relative flex flex-col bg-background-light overflow-hidden shadow-2xl font-sans before:content-[''] before:fixed before:top-0 before:left-0 before:w-full before:h-full before:bg-noise before:pointer-events-none before:z-[9999] before:mix-blend-multiply">
            
            <AnimatePresence mode="popLayout" initial={false}>
                {view === 'home' && (
                    <motion.div 
                        key="home"
                        className="w-full h-full absolute inset-0 bg-background-light"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    >
                        <Feed 
                            collections={collections} 
                            onCollectionClick={handleCollectionClick}
                            initialScroll={scrollPositions.current.home}
                            userAvatar={userAvatar}
                        />
                    </motion.div>
                )}

                {view === 'profile' && (
                    <motion.div 
                        key="profile"
                        className="w-full h-full absolute inset-0 bg-background-light"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                    >
                        <Profile 
                            collections={collections} 
                            onCollectionClick={handleCollectionClick} 
                            initialScroll={scrollPositions.current.profile}
                            userAvatar={userAvatar}
                            onUpdateAvatar={handleUpdateAvatar}
                            onCreateClick={handleCreateClick}
                        />
                    </motion.div>
                )}

                {view === 'detail' && selectedCollectionId && (
                    <motion.div 
                        key="detail"
                        className="w-full h-full absolute inset-0 bg-background-light z-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    >
                        {getSelectedCollection().template === 'classic' ? (
                            <DetailClassic 
                                collection={getSelectedCollection()} 
                                onBack={handleBack} 
                                onEdit={handleEditCollection}
                                onDelete={handleDeleteCollection}
                            />
                        ) : (
                            <DetailEditorial 
                                collection={getSelectedCollection()} 
                                onBack={handleBack} 
                                onEdit={handleEditCollection}
                                onDelete={handleDeleteCollection}
                            />
                        )}
                    </motion.div>
                )}

                {view === 'create' && (
                    <motion.div 
                        key="create"
                        className="w-full h-full absolute inset-0 bg-[#f2f0e9] z-30"
                        initial={{ y: '100%' }}
                        animate={{ y: 0, transition: { type: "spring", bounce: 0, duration: 0.4 } }}
                        exit={{ y: '100%', transition: { duration: 0.3 } }}
                    >
                        <CreateCollection 
                            onBack={() => { setView('home'); setEditingCollection(null); }} 
                            template={createTemplate} 
                            onSave={handleSaveCollection}
                            initialData={editingCollection}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {view !== 'create' && view !== 'detail' && (
                    <motion.div
                        initial={{ y: 150 }} 
                        animate={{ y: 0 }}
                        exit={{ y: 150 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                        className="absolute bottom-0 left-0 w-full z-50 pointer-events-none"
                    >
                        <div className="pointer-events-auto">
                            <BottomNav 
                                activeTab={view as 'home' | 'profile'} 
                                onTabChange={handleTabChange}
                                onCreateClick={handleCreateClick}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <TemplateModal 
                isOpen={isTemplateModalOpen} 
                onClose={() => setIsTemplateModalOpen(false)}
                onSelect={handleTemplateSelect}
            />
        </div>
    );
}
