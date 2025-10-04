import api from "./axios";

// Types
export type CreateVisaInput = {
  title: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
};

export type UpdateAboutUsInput = {
  description: string;
  imageUrl?: string | null;
};

export type UpdateWhyChooseUsInput = {
  title: string;
  description: string;
  link: string;
};

export type WhyChooseUs = {
  id: string;
  title: string;
  description: string;
  link: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AboutUs = {
  id: string;
  description: string;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Visa = {
  id: string;
  title: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ListVisasParams = {
  page?: number;
  limit?: number;
  search?: string;
  signal?: AbortSignal;
};

export type ListVisasResponse = {
  visas: Visa[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  search?: string;
};

// Images API
export const imagesApi = {
  async upload(
    file: File
  ): Promise<{ url?: string; fileName?: string; error?: string }> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post("/images", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  async delete(
    fileName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await api.delete(`/images/${fileName}`);
      return res.data;
    } catch (error) {
      console.error("Failed to delete image:", error);
      return { success: false, error: "Failed to delete image" };
    }
  },
};

// Admin Visas API
export const adminVisasApi = {
  async create(data: CreateVisaInput): Promise<Visa> {
    const res = await api.post("/admin/visas", data);
    return res.data;
  },
  async list(params?: ListVisasParams): Promise<ListVisasResponse> {
    const { page, limit, search, signal } = params || {};
    const res = await api.get("/admin/visas", {
      params: {
        page,
        limit,
        search: search?.trim() || undefined,
      },
      signal,
    });
    return res.data;
  },
  async getBySlug(slug: string): Promise<Visa> {
    const res = await api.get(`/admin/visas/${slug}`);
    return res.data.visa;
  },
  async update(id: string, data: Partial<CreateVisaInput>): Promise<Visa> {
    const res = await api.put(`/admin/visas/${id}`, data);
    return res.data;
  },
  async remove(id: string): Promise<{ success: boolean }> {
    const res = await api.delete(`/admin/visas/${id}`);
    return res.data;
  },
};

// Admin About Us API
export const adminAboutUsApi = {
  async create(data: Partial<UpdateAboutUsInput>): Promise<AboutUs> {
    const res = await api.post(`/admin/about-us`, data);
    return res.data.aboutUs;
  },
  async update(
    id: string,
    data: Partial<UpdateAboutUsInput>
  ): Promise<AboutUs> {
    const res = await api.put(`/admin/about-us/${id}`, data);
    return res.data.aboutUs;
  },
  async get(): Promise<AboutUs> {
    const res = await api.get(`/admin/about-us`);
    return res.data.aboutUs;
  },
};

// Admin Why Choose Us API
export const adminWhyChooseUsApi = {
  async create(data: UpdateWhyChooseUsInput): Promise<WhyChooseUs> {
    const res = await api.post(`/admin/why-choose-us`, data);
    return res.data.whyChooseUs;
  },
  async update(
    id: string,
    data: Partial<UpdateWhyChooseUsInput>
  ): Promise<WhyChooseUs> {
    const res = await api.put(`/admin/why-choose-us/${id}`, data);
    return res.data.whyChooseUs;
  },
  async getAll(): Promise<WhyChooseUs[]> {
    const res = await api.get(`/admin/why-choose-us`);
    return res.data.whyChooseUs;
  },
  async getById(id: string): Promise<WhyChooseUs> {
    const res = await api.get(`/admin/why-choose-us/${id}`);
    return res.data.whyChooseUs;
  },
  async remove(id: string): Promise<{ success: boolean }> {
    const res = await api.delete(`/admin/why-choose-us/${id}`);
    return res.data;
  },
};

// Aggregated export for convenience
const apiClient = {
  images: imagesApi,
  admin: {
    visas: adminVisasApi,
    aboutUs: adminAboutUsApi,
    whyChooseUs: adminWhyChooseUsApi,
  },
};

export default apiClient;
