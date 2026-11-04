// API response types. MongoDB persistence is implemented in backend/.
export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
  count?: string;
  image: string;
  bannerImage?: string;
  description: string;
  sortOrder: number;
  status: "Active" | "Inactive";
  specTemplate?: string[]; // e.g. ["Display", "Processor", "Battery", "RAM"]
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
