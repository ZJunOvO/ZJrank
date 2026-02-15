import React, { useRef } from 'react';
import { uploadImageToStorage } from '../../utils/api';

interface CoverImageUploaderProps {
    coverImagePreview: string | null;
    setCoverImagePreview: (val: string) => void;
    template: 'classic' | 'editorial';
    title: string;
    setTitle: (val: string) => void;
}

export const CoverImageUploader: React.FC<CoverImageUploaderProps> = ({
    coverImagePreview,
    setCoverImagePreview,
    template,
    title,
    setTitle
}) => {
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleCoverSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const base64 = await uploadImageToStorage(file);
        setCoverImagePreview(base64);
    };

    return (
        <div className="mt-6 mb-8">
            <span className="block text-text-sub text-[10px] font-bold tracking-[0.2em] uppercase mb-4 pl-3 border-l-2 border-primary">
                Issue No. 01 • {template === 'classic' ? 'Classic List' : 'Editorial Magazine'}
            </span>
            
            <textarea 
                className="w-full bg-transparent border-0 border-b border-black/10 focus:border-black p-0 py-2 text-3xl leading-tight text-text-main font-display placeholder-text-sub/30 focus:ring-0 resize-none font-bold italic transition-colors mb-6" 
                placeholder="输入榜单标题..." 
                rows={1}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            ></textarea>

            <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverSelect} className="hidden" />
            <div 
                onClick={() => coverInputRef.current?.click()}
                className="w-full aspect-video bg-white border border-dashed border-black/10 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-black/30 transition-colors relative overflow-hidden group shadow-sm"
            >
                {coverImagePreview ? (
                    <>
                        <img src={coverImagePreview} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-xs tracking-widest uppercase">
                            更换封面 (如果为空，将使用Rank 1图片)
                        </div>
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-2xl text-text-sub/50 mb-1">image</span>
                        <span className="text-[10px] uppercase tracking-widest text-text-sub/50">Set Cover Image</span>
                    </>
                )}
            </div>
        </div>
    );
};
