
export interface Item {
  id: string;
  rank: number;
  name: string;
  subtitle?: string; // Brand or English name
  description?: string;
  price?: string;
  image: string;
  tags?: string[];
}

export interface Collection {
  id: string;
  title: string;
  template: 'classic' | 'editorial'; // The two styles requested
  itemCount: number;
  lastEdited: string;
  coverImage: string;
  items: Item[];
  isDraft?: boolean;
}

export type ViewState = 'home' | 'profile' | 'detail' | 'create';

export interface ViewStackItem {
    view: ViewState;
    collectionId?: string;
}
