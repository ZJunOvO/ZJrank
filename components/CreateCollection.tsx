import React, { useState, useRef } from 'react';
import { Collection, Item } from '../types';
import { IMAGES } from '../constants';
import { addNewCollection, updateCollection, uploadImageToStorage } from '../utils/api';
import { DetailClassic } from './DetailClassic';
import { DetailEditorial } from './DetailEditorial';
import { CoverImageUploader } from './create/CoverImageUploader';
import { ItemList } from './create/ItemList';
import { ItemEditor } from './create/ItemEditor';

interface CreateCollectionProps {
    onBack: () => void;
    template: 'classic' | 'editorial';
    onSave: () => void;
    initialData?: Collection | null; 
}

export const CreateCollection: React.FC<CreateCollectionProps> = ({ onBack, template, onSave, initialData }) => {
    // --- State ---
    const [step, setStep] = useState<'edit' | 'preview'>('edit');
    const [title, setTitle] = useState(initialData?.title || '');
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(initialData?.coverImage || null);
    const [items, setItems] = useState<Item[]>(initialData?.items || []);
    const [isPublishing, setIsPublishing] = useState(false);

    // --- New/Edit Item Form State ---
    const [editingItemId, setEditingItemId] = useState<string | null>(null); 
    const [newItemName, setNewItemName] = useState('');
    const [newItemSubtitle, setNewItemSubtitle] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemImage, setNewItemImage] = useState<string | null>(null);
    const [isAddingItem, setIsAddingItem] = useState(false);

    // --- Refs ---
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // --- Handlers: Item Management ---
    
    // 1. Drag Reorder Logic
    const handleReorder = (newOrder: Item[]) => {
        // Update the ranks based on the new index
        const updatedItems = newOrder.map((item, index) => ({
            ...item,
            rank: index + 1
        }));
        setItems(updatedItems);
    };

    // 2. Edit existing item
    const handleEditItemStart = (item: Item) => {
        setEditingItemId(item.id);
        setNewItemName(item.name);
        setNewItemSubtitle(item.subtitle || '');
        setNewItemDesc(item.description || '');
        setNewItemPrice(item.price || '');
        setNewItemImage(item.image);
        setIsAddingItem(true);
    };

    const handleSaveItem = () => {
        if (!newItemName.trim()) {
            alert("请至少填写单品名称");
            return;
        }
        if (!newItemImage) {
            alert("请上传一张单品图片");
            return;
        }

        if (editingItemId) {
            // Update existing item
            const updatedItems = items.map(item => {
                if (item.id === editingItemId) {
                    return {
                        ...item,
                        name: newItemName,
                        subtitle: newItemSubtitle,
                        description: newItemDesc,
                        price: newItemPrice,
                        image: newItemImage,
                        // Keep rank as is
                    };
                }
                return item;
            });
            setItems(updatedItems);
        } else {
            // Add new item
            const newItem: Item = {
                id: Date.now().toString(),
                rank: items.length + 1,
                name: newItemName,
                subtitle: newItemSubtitle,
                description: newItemDesc,
                price: newItemPrice,
                image: newItemImage,
            };
            setItems([...items, newItem]);
            // Scroll to bottom helper
            setTimeout(() => {
                scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
            }, 100);
        }

        // Reset Form
        setEditingItemId(null);
        setNewItemName('');
        setNewItemSubtitle('');
        setNewItemDesc('');
        setNewItemPrice('');
        setNewItemImage(null);
        setIsAddingItem(false);
    };

    const handleDeleteItem = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); 
        const updated = items.filter(i => i.id !== id).map((item, index) => ({
            ...item,
            rank: index + 1 // Re-rank
        }));
        setItems(updated);
        
        if (editingItemId === id) {
             setIsAddingItem(false);
             setEditingItemId(null);
        }
    };

    // --- Handlers: Publish/Update ---
    const handlePublish = async () => {
        if (!title.trim()) {
            alert("请输入榜单标题");
            return;
        }
        if (items.length === 0) {
            const confirmEmpty = window.confirm("你还没有添加任何单品，确定要发布一个空榜单吗？");
            if (!confirmEmpty) return;
        }

        setIsPublishing(true);

        try {
            let finalCover = coverImagePreview;
            if (!finalCover) {
                if (items.length > 0) {
                    finalCover = items[0].image;
                } else {
                    finalCover = template === 'classic' ? IMAGES.sunset : IMAGES.milktea;
                }
            }

            const payload = {
                title: title,
                template: template,
                itemCount: items.length,
                coverImage: finalCover,
                items: items
            };

            if (initialData?.id) {
                await updateCollection(initialData.id, payload);
            } else {
                await addNewCollection(payload);
            }

            onSave();
        } catch (error) {
            console.error(error);
            alert("保存失败，请检查网络");
        } finally {
            setIsPublishing(false);
        }
    };

    const getDraftCollection = (): Collection => {
        let previewCover = coverImagePreview;
        if (!previewCover && items.length > 0) previewCover = items[0].image;
        if (!previewCover) previewCover = (template === 'classic' ? IMAGES.sunset : IMAGES.milktea);

        return {
            id: initialData?.id || 'draft',
            title: title || '未命名榜单',
            template: template,
            itemCount: items.length,
            lastEdited: '刚刚',
            coverImage: previewCover,
            items: items,
            isDraft: true
        };
    };

    // --- RENDER: PREVIEW MODE ---
    if (step === 'preview') {
        const draft = getDraftCollection();
        const noOp = () => {}; 
        
        return (
            <div className="relative w-full h-full bg-background-light">
                <div className="absolute inset-0 z-0">
                    {template === 'classic' ? (
                        <DetailClassic collection={draft} onBack={() => setStep('edit')} onEdit={noOp} onDelete={noOp} />
                    ) : (
                        <DetailEditorial collection={draft} onBack={() => setStep('edit')} onEdit={noOp} onDelete={noOp} />
                    )}
                </div>
                
                {/* Preview Control Bar */}
                <div className="absolute bottom-6 left-6 right-6 z-50">
                    <div className="bg-black/80 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl flex items-center justify-between border border-white/10">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Preview Mode</span>
                            <span className="text-sm font-medium">预览效果</span>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setStep('edit')}
                                className="px-4 py-2 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                返回修改
                            </button>
                            <button 
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-black hover:bg-primary-dark transition-colors flex items-center gap-2"
                            >
                                {isPublishing ? (initialData ? '更新中...' : '发布中...') : (initialData ? '确认更新' : '确认发布')}
                                {!isPublishing && <span className="material-symbols-outlined text-[14px]">send</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: EDIT MODE ---
    return (
        <div className="bg-[#f2f0e9] h-full w-full flex flex-col relative">
            {/* Header */}
            <div className="pt-6 pb-4 px-6 flex justify-between items-center z-40 bg-[#f2f0e9]/95 backdrop-blur-sm border-b border-black/5">
                <button onClick={onBack} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors">
                    <span className="material-symbols-outlined text-text-main text-2xl">close</span>
                </button>
                <div className="flex gap-3">
                     <button 
                        onClick={() => setStep('preview')}
                        className="flex items-center gap-1 text-text-main text-xs font-bold tracking-wider uppercase border border-black/10 px-3 py-1.5 rounded-full hover:bg-black/5 transition-all"
                    >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        Preview
                    </button>
                </div>
            </div>

            {/* Content */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
                <div className="max-w-md mx-auto">
                    
                    <CoverImageUploader 
                        coverImagePreview={coverImagePreview}
                        setCoverImagePreview={setCoverImagePreview}
                        template={template}
                        title={title}
                        setTitle={setTitle}
                    />

                    <ItemList 
                        items={items}
                        onReorder={handleReorder}
                        onEditItem={handleEditItemStart}
                        onDeleteItem={handleDeleteItem}
                    />

                    <ItemEditor 
                        isAddingItem={isAddingItem}
                        editingItemId={editingItemId}
                        itemCount={items.length}
                        newItemName={newItemName}
                        setNewItemName={setNewItemName}
                        newItemSubtitle={newItemSubtitle}
                        setNewItemSubtitle={setNewItemSubtitle}
                        newItemDesc={newItemDesc}
                        setNewItemDesc={setNewItemDesc}
                        newItemPrice={newItemPrice}
                        setNewItemPrice={setNewItemPrice}
                        newItemImage={newItemImage}
                        setNewItemImage={setNewItemImage}
                        onSaveItem={handleSaveItem}
                        onCancel={() => { setIsAddingItem(false); setEditingItemId(null); }}
                        onStartAdd={() => {
                            setEditingItemId(null);
                            setNewItemName('');
                            setNewItemSubtitle('');
                            setNewItemDesc('');
                            setNewItemPrice('');
                            setNewItemImage(null);
                            setIsAddingItem(true);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
