import React, { useRef } from 'react';
import { uploadImageToStorage } from '../../utils/firebase';

interface ItemEditorProps {
    isAddingItem: boolean;
    editingItemId: string | null;
    itemCount: number;
    newItemName: string;
    setNewItemName: (val: string) => void;
    newItemSubtitle: string;
    setNewItemSubtitle: (val: string) => void;
    newItemDesc: string;
    setNewItemDesc: (val: string) => void;
    newItemPrice: string;
    setNewItemPrice: (val: string) => void;
    newItemImage: string | null;
    setNewItemImage: (val: string | null) => void;
    onSaveItem: () => void;
    onCancel: () => void;
    onStartAdd: () => void;
}

export const ItemEditor: React.FC<ItemEditorProps> = ({
    isAddingItem,
    editingItemId,
    itemCount,
    newItemName,
    setNewItemName,
    newItemSubtitle,
    setNewItemSubtitle,
    newItemDesc,
    setNewItemDesc,
    newItemPrice,
    setNewItemPrice,
    newItemImage,
    setNewItemImage,
    onSaveItem,
    onCancel,
    onStartAdd
}) => {
    const itemImageInputRef = useRef<HTMLInputElement>(null);

    const handleItemImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const base64 = await uploadImageToStorage(file);
        setNewItemImage(base64);
    };

    return (
        <div className={`transition-all duration-300 ${isAddingItem ? 'bg-white shadow-lg p-5 rounded-lg border border-black/5' : ''}`}>
            {!isAddingItem ? (
                <button 
                    onClick={onStartAdd}
                    className="w-full py-4 border border-dashed border-black/20 rounded-lg flex items-center justify-center gap-2 text-text-sub hover:text-black hover:border-black hover:bg-white transition-all group"
                >
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Add Item</span>
                </button>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary-dark">
                            {editingItemId ? `Edit Item` : `New Item #${itemCount + 1}`}
                        </span>
                        <button onClick={onCancel} className="text-text-sub hover:text-black">
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>

                    <input type="file" accept="image/*" ref={itemImageInputRef} onChange={handleItemImageSelect} className="hidden" />
                    <div 
                        onClick={() => itemImageInputRef.current?.click()}
                        className="w-full h-32 bg-background-light border border-black/5 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition-colors relative"
                    >
                        {newItemImage ? (
                            <img src={newItemImage} className="w-full h-full object-contain" alt="Preview" />
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-2xl text-text-sub/40 mb-1">add_a_photo</span>
                                <span className="text-[9px] text-text-sub/60 uppercase">Upload Photo</span>
                            </>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <input 
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder="单品名称 (e.g. Chanel No.5)" 
                                className="w-full bg-transparent border-b border-black/10 py-2 text-sm font-medium focus:border-black focus:outline-none placeholder-text-sub/40"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                value={newItemSubtitle}
                                onChange={(e) => setNewItemSubtitle(e.target.value)}
                                placeholder="品牌/副标题" 
                                className="w-full bg-transparent border-b border-black/10 py-2 text-xs focus:border-black focus:outline-none placeholder-text-sub/40"
                            />
                            <input 
                                value={newItemPrice}
                                onChange={(e) => setNewItemPrice(e.target.value)}
                                placeholder="价格 (选填)" 
                                className="w-full bg-transparent border-b border-black/10 py-2 text-xs focus:border-black focus:outline-none placeholder-text-sub/40 text-right"
                            />
                        </div>
                        <div>
                            <textarea 
                                value={newItemDesc}
                                onChange={(e) => setNewItemDesc(e.target.value)}
                                placeholder="写一段种草理由..." 
                                rows={3}
                                className="w-full bg-background-light p-3 rounded text-xs leading-relaxed border-none focus:ring-1 focus:ring-black/10 resize-none placeholder-text-sub/40"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={onSaveItem}
                        className="w-full bg-black text-primary py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors mt-2"
                    >
                        {editingItemId ? 'Update Item' : 'Add to List'}
                    </button>
                </div>
            )}
        </div>
    );
};
