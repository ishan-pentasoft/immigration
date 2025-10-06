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

export type UpdateFaqInput = {
  question: string;
  answer: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SiteDetails = {
  id: string;
  phone?: string | null;
  email?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateSiteDetailsInput = Partial<
  Pick<
    SiteDetails,
    "phone" | "email" | "facebook" | "twitter" | "youtube" | "address"
  >
>;

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

export type Country = {
  id: string;
  title: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type College = {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
  countryId: string;
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

export type ListCountriesParams = {
  page?: number;
  limit?: number;
  search?: string;
  signal?: AbortSignal;
};

export type ListCountriesResponse = {
  countries: Country[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  search?: string;
};

export type ListCollegesParams = {
  page?: number;
  limit?: number;
  search?: string;
  countryId?: string;
  signal?: AbortSignal;
};

export type ListCollegesResponse = {
  colleges: (College & { country?: Country })[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  search?: string;
  countryId?: string;
};

export type Team = {
  id: string;
  name: string;
  title: string;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  visaType: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateTeamInput = {
  name: string;
  title: string;
  imageUrl?: string | null;
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

// User Visas Api
export const userVisasApi = {
  async list(): Promise<{ visas: Visa[] }> {
    const res = await api.get("/user/visas");
    return res.data;
  },
  async getBySlug(slug: string): Promise<Visa> {
    const res = await api.get(`/user/visas/${slug}`);
    return res.data.visa;
  },
};

// Admin Countries API
export type CreateCountryInput = {
  title: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
};

export const adminCountriesApi = {
  async create(data: CreateCountryInput): Promise<Country> {
    const res = await api.post("/admin/countries", data);
    return res.data.country;
  },
  async list(params?: ListCountriesParams): Promise<ListCountriesResponse> {
    const { page, limit, search, signal } = params || {};
    const res = await api.get("/admin/countries", {
      params: {
        page,
        limit,
        search: search?.trim() || undefined,
      },
      signal,
    });
    return res.data;
  },
  async getBySlug(slug: string): Promise<Country> {
    const res = await api.get(`/admin/countries/${slug}`);
    return res.data.country;
  },
  async update(
    slug: string,
    data: Partial<CreateCountryInput>
  ): Promise<Country> {
    const res = await api.put(`/admin/countries/${slug}`, data);
    return res.data.country;
  },
  async remove(slug: string): Promise<{ success: boolean }> {
    const res = await api.delete(`/admin/countries/${slug}`);
    return res.data;
  },
};

// User Countries API
export const userCountriesApi = {
  async list(): Promise<{ countries: Country[] }> {
    const res = await api.get("/user/countries");
    return res.data;
  },
  async getBySlug(slug: string): Promise<Country> {
    const res = await api.get(`/user/countries/${slug}`);
    return res.data.country;
  },
};

// User Colleges API
export const userCollegesApi = {
  async list(params?: ListCollegesParams): Promise<ListCollegesResponse> {
    const { page, limit, search, countryId, signal } = params || {};
    const res = await api.get("/user/colleges", {
      params: {
        page,
        limit,
        search: search?.trim() || undefined,
        countryId,
      },
      signal,
    });
    return res.data;
  },
  async getBySlug(slug: string): Promise<College & { country?: Country }> {
    const res = await api.get(`/user/colleges/${slug}`);
    return res.data.college as College & { country?: Country };
  },
};

// Admin Colleges API
export type CreateCollegeInput = {
  name: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
  countryId: string;
};

export const adminCollegesApi = {
  async create(data: CreateCollegeInput): Promise<College> {
    const res = await api.post("/admin/colleges", data);
    return res.data.college;
  },
  async list(params?: ListCollegesParams): Promise<ListCollegesResponse> {
    const { page, limit, search, countryId, signal } = params || {};
    const res = await api.get("/admin/colleges", {
      params: {
        page,
        limit,
        search: search?.trim() || undefined,
        countryId,
      },
      signal,
    });
    return res.data;
  },
  async getBySlug(slug: string): Promise<College> {
    const res = await api.get(`/admin/colleges/${slug}`);
    return res.data.college;
  },
  async update(
    slug: string,
    data: Partial<Omit<CreateCollegeInput, "slug">> & { slug?: string }
  ): Promise<College> {
    const res = await api.put(`/admin/colleges/${slug}`, data);
    return res.data.college;
  },
  async remove(slug: string): Promise<{ success: boolean }> {
    const res = await api.delete(`/admin/colleges/${slug}`);
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

//User About Us API
export const userAboutUsApi = {
  async get(): Promise<AboutUs> {
    const res = await api.get(`/user/about-us`);
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

//User Why Choose us API
export const userWhyChooseUsApi = {
  async getAll(): Promise<WhyChooseUs[]> {
    const res = await api.get(`/user/why-choose-us`);
    return res.data.whyChooseUs;
  },
};

// Admin faq API
export const adminFaqApi = {
  async create(data: UpdateFaqInput): Promise<Faq> {
    const res = await api.post(`/admin/faq`, data);
    return res.data.faq;
  },
  async update(id: string, data: Partial<UpdateFaqInput>): Promise<Faq> {
    const res = await api.put(`/admin/faq/${id}`, data);
    return res.data.faq;
  },
  async getAll(): Promise<Faq[]> {
    const res = await api.get(`/admin/faq`);
    return res.data.faq;
  },
  async getById(id: string): Promise<Faq> {
    const res = await api.get(`/admin/faq/${id}`);
    return res.data.faq;
  },
  async remove(id: string): Promise<{ success: boolean }> {
    const res = await api.delete(`/admin/faq/${id}`);
    return res.data;
  },
};

// Admin Site Details API
export const adminSiteDetailsApi = {
  async get(): Promise<SiteDetails> {
    const res = await api.get(`/admin/site-details`);
    return res.data.siteDetails;
  },
  async update(data: UpdateSiteDetailsInput): Promise<SiteDetails> {
    const res = await api.put(`/admin/site-details`, data);
    return res.data.siteDetails;
  },
};

//User Site Details API
export const userSiteDetailsApi = {
  async get(): Promise<SiteDetails> {
    const res = await api.get(`/user/site-details`);
    return res.data.siteDetails;
  },
};

// Admin Team API
export const adminTeamApi = {
  async create(data: UpdateTeamInput): Promise<Team> {
    const res = await api.post(`/admin/team`, data);
    return res.data.team;
  },
  async update(id: string, data: Partial<UpdateTeamInput>): Promise<Team> {
    const res = await api.put(`/admin/team/${id}`, data);
    return res.data.team;
  },
  async getAll(): Promise<Team[]> {
    const res = await api.get(`/admin/team`);
    return res.data.team;
  },
  async getById(id: string): Promise<Team> {
    const res = await api.get(`/admin/team/${id}`);
    return res.data.team;
  },
  async remove(id: string): Promise<{ success: boolean }> {
    const res = await api.delete(`/admin/team/${id}`);
    return res.data;
  },
};

//User Team API

export const userTeamApi = {
  async getAll(): Promise<Team[]> {
    const res = await api.get(`/user/team`);
    return res.data.team;
  },
};

// Admin Contacts API
export type ListContactsParams = {
  page?: number;
  limit?: number;
  search?: string;
  signal?: AbortSignal;
};

export type ListContactsResponse = {
  contacts: Contact[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  search?: string;
};

export const adminContactsApi = {
  async list(params?: ListContactsParams): Promise<ListContactsResponse> {
    const { page, limit, search, signal } = params || {};
    const res = await api.get(`/admin/contact`, {
      params: {
        page,
        limit,
        search: search?.trim() || undefined,
      },
      signal,
    });
    return res.data;
  },
  async getById(id: string): Promise<Contact> {
    const res = await api.get(`/admin/contact/${id}`);
    return res.data.contact;
  },
  async remove(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await api.delete(`/admin/contact/${id}`);
    return res.data;
  },
};

// Public Contact API
export const contactApi = {
  async submit(
    data: Omit<Contact, "id" | "createdAt" | "updatedAt">
  ): Promise<Contact> {
    const res = await api.post(`/contact`, data);
    return res.data.contact;
  },
};

// Aggregated export for convenience
const apiClient = {
  images: imagesApi,
  admin: {
    visas: adminVisasApi,
    countries: adminCountriesApi,
    colleges: adminCollegesApi,
    aboutUs: adminAboutUsApi,
    whyChooseUs: adminWhyChooseUsApi,
    faq: adminFaqApi,
    siteDetails: adminSiteDetailsApi,
    team: adminTeamApi,
    contacts: adminContactsApi,
  },
  contact: contactApi,
  user: {
    siteDetails: userSiteDetailsApi,
    visas: userVisasApi,
    countries: userCountriesApi,
    colleges: userCollegesApi,
    team: userTeamApi,
    aboutUs: userAboutUsApi,
    whyChooseUs: userWhyChooseUsApi,
  },
};

export default apiClient;
