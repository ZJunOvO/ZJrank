import React from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { Item } from '../../types';

interface SortableItemProps { 
    item: Item; 
    onEdit: () => void; 
    onDelete: (e: React.MouseEvent) => void; 
}

export const SortableItem: React.FC<SortableItemProps> = ({ 
    item, 
    onEdit, 
    onDelete 
}) => {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={item}
            id={item.id}
            dragListener={false} // Disable default drag to prevent scroll conflict
            dragControls={dragControls}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-3 rounded-sm shadow-sm flex gap-3 items-center group relative overflow-hidden mb-3 border border-transparent hover:border-black/5"
            whileDrag={{ scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)", zIndex: 50 }}
        >
            {/* Drag Handle */}
            <div 
                onPointerDown={(e) => dragControls.start(e)}
                className="w-8 h-12 flex items-center justify-center cursor-grab active:cursor-grabbing text-text-sub/30 hover:text-text-main touch-none"
            >
                <span className="material-symbols-outlined text-xl">drag_indicator</span>
            </div>

            {/* Thumbnail */}
            <div className="w-12 h-12 bg-gray-100 shrink-0 rounded-sm overflow-hidden" onClick={onEdit}>
                <img src={item.image} className="w-full h-full object-cover" alt="" />
            </div>

            {/* Content (Click to Edit) */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
                <div className="flex items-baseline gap-2">
                    <span className="text-primary font-display italic font-bold text-lg">#{item.rank}</span>
                    <h4 className="text-sm font-medium truncate text-text-main">{item.name}</h4>
                </div>
                <p className="text-[10px] text-text-sub truncate">{item.subtitle || 'No subtitle'}</p>
            </div>

            {/* Delete Button */}
            <button 
                onClick={onDelete}
                className="w-8 h-8 flex items-center justify-center text-text-sub/40 hover:text-red-500 transition-colors z-10"
            >
                <span className="material-symbols-outlined text-lg">delete</span>
            </button>
        </Reorder.Item>
    );
};
