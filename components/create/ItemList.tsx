import React from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import { Item } from '../../types';
import { SortableItem } from './SortableItem';

interface ItemListProps {
    items: Item[];
    onReorder: (newOrder: Item[]) => void;
    onEditItem: (item: Item) => void;
    onDeleteItem: (id: string, e: React.MouseEvent) => void;
}

export const ItemList: React.FC<ItemListProps> = ({ items, onReorder, onEditItem, onDeleteItem }) => {
    return (
        <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <h3 className="font-display text-lg text-text-main font-bold">Contents ({items.length})</h3>
                <span className="text-[10px] text-text-sub uppercase tracking-wider">Drag to reorder</span>
            </div>
            
            <Reorder.Group axis="y" values={items} onReorder={onReorder}>
                <AnimatePresence>
                    {items.map((item) => (
                        <SortableItem 
                            key={item.id} 
                            item={item} 
                            onEdit={() => onEditItem(item)}
                            onDelete={(e) => onDeleteItem(item.id, e)}
                        />
                    ))}
                </AnimatePresence>
            </Reorder.Group>
        </div>
    );
};
