import {
  Associate,
  CreateAssociateInput,
  CreateTodoInput,
  Todo,
  CreateVisaInput,
  StaffTask,
  CreateStaffTaskInput,
  UserDetailField,
  FieldType,
  ListAssociateLogsParams,
  ListAssociateLogsResponse,
  UpdateAboutUsInput,
  UpdateWhyChooseUsInput,
  UpdateFaqInput,
  Faq,
  SiteDetails,
  UpdateSiteDetailsInput,
  WhyChooseUs,
  AboutUs,
  Visa,
  Notice,
  Country,
  College,
  ListVisasParams,
  ListVisasResponse,
  ListCountriesParams,
  ListCountriesResponse,
  ListCollegesParams,
  ListCollegesResponse,
  Team,
  Contact,
  CreateUserDetailsInput,
  UserDetails,
  CreateCountryInput,
  CreateCollegeInput,
  ListContactsParams,
  ListContactsResponse,
  UpdateTeamInput,
} from "@/types";
import api from "./axios";

// Associate Staff Tasks API (DIRECTOR only for create)
export const associateStaffTasksApi = {
  async create(
    associateId: string,
    data: CreateStaffTaskInput
  ): Promise<StaffTask> {
    const res = await api.post(`/associate/staff-tasks/${associateId}`, data);
    return res.data.task as StaffTask;
  },
};

export const directorUserDetailFieldsApi = {
  async list(): Promise<{ fields: UserDetailField[] }> {
    const res = await api.get(`/associate/user-details/fields`);
    return res.data as { fields: UserDetailField[] };
  },
  async create(payload: {
    label: string;
    name: string;
    type: FieldType;
    required?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: any;
    active?: boolean;
  }): Promise<{ field: UserDetailField; message?: string }> {
    const res = await api.post(`/associate/user-details/fields`, payload);
    return res.data as { field: UserDetailField; message?: string };
  },
  async update(
    id: string,
    payload: Partial<{
      label: string;
      name: string;
      type: FieldType;
      required: boolean;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: any;
      active: boolean;
      order: number;
    }>
  ): Promise<{ field: UserDetailField; message?: string }> {
    const res = await api.put(`/associate/user-details/fields/${id}`, payload);
    return res.data as { field: UserDetailField; message?: string };
  },
  async remove(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await api.delete(`/associate/user-details/fields/${id}`);
    return res.data as { success: boolean; message?: string };
  },
  async reorder(
    order: string[]
  ): Promise<{ success: boolean; message?: string }> {
    const res = await api.patch(`/associate/user-details/fields/reorder`, {
      order,
    });
    return res.data as { success: boolean; message?: string };
  },
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

//User faq API
export const userFaqApi = {
  async getAll(): Promise<Faq[]> {
    const res = await api.get(`/user/faq`);
    return res.data.faq;
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

export const publicUserDetailsApi = {
  async submit(
    associateId: string,
    data: CreateUserDetailsInput
  ): Promise<UserDetails> {
    const res = await api.post(`/associate/user-details/${associateId}`, data);
    return res.data?.data as UserDetails;
  },
  async listFields(): Promise<{ fields: UserDetailField[] }> {
    const res = await api.get(`/user-details/fields`);
    return res.data as { fields: UserDetailField[] };
  },
  async remove(id: string) {
    const res = await api.delete(`/associate/user-details/${id}`);
    return res.data;
  },
  async approve(id: string): Promise<{
    message: string;
    student: {
      id: string;
      name: string;
      email: string;
      phone: string;
      gender: string;
      dob: string;
      associateId: string;
      createdAt: string;
      updatedAt: string;
    };
    generatedPassword: string;
  }> {
    const res = await api.post(`/associate/user-details/${id}/approve`);
    return res.data as {
      message: string;
      student: {
        id: string;
        name: string;
        email: string;
        phone: string;
        gender: string;
        dob: string;
        associateId: string;
        createdAt: string;
        updatedAt: string;
      };
      generatedPassword: string;
    };
  },
  async listByAssociate(
    associateId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      associateId?: string;
    }
  ): Promise<{
    data: UserDetails[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const {
      page,
      limit,
      search,
      associateId: filterAssociateId,
    } = params || {};
    const res = await api.get(
      `/associate/user-details/${associateId}` as const,
      {
        params: {
          page,
          limit,
          search: search?.trim() || undefined,
          associateId: filterAssociateId,
        },
      }
    );
    const { data, page: p, limit: l, total, totalPages } = res.data || {};
    return {
      data: (data as UserDetails[]) || [],
      page: Number(p) || 1,
      limit: Number(l) || limit || 10,
      total: Number(total) || 0,
      totalPages: Number(totalPages) || 1,
    };
  },
};

//Associate Todo API
export const associateTodoApi = {
  async create(data: CreateTodoInput): Promise<Todo> {
    const res = await api.post(`/associate/todo`, data);
    return res.data.todo;
  },
  async list(): Promise<Todo[]> {
    const res = await api.get(`/associate/todo`);
    return res.data.todos;
  },
  async remove(id: string): Promise<{ success: boolean }> {
    await api.delete(`/associate/todo/${id}`);
    return { success: true };
  },
  async update(id: string): Promise<Todo> {
    const res = await api.patch(`/associate/todo/${id}`);
    return res.data.todo;
  },
};

//Associate Staff API
export const associateStaffApi = {
  async create(
    data: CreateAssociateInput
  ): Promise<{ associate: Associate; message?: string }> {
    const res = await api.post(`/associate/staff`, data);
    return {
      associate: res.data.staff as Associate,
      message: res.data.message,
    };
  },
  async list(): Promise<Associate[]> {
    const res = await api.get(`/associate/staff`);
    return res.data.staff;
  },
  async getById(id: string): Promise<Associate> {
    const res = await api.get(`/associate/staff/${id}`);
    return res.data.staff;
  },
  async remove(id: string): Promise<{ success: boolean }> {
    const res = await api.delete(`/associate/staff/${id}`);
    return res.data;
  },
  async update(
    id: string,
    data: Partial<CreateAssociateInput>
  ): Promise<{ associate: Associate; message?: string }> {
    const res = await api.patch(`/associate/staff/${id}`, data);
    return {
      associate: res.data.staff as Associate,
      message: res.data.message,
    };
  },
};

export const associateLogsApi = {
  async list(
    params?: ListAssociateLogsParams
  ): Promise<ListAssociateLogsResponse> {
    const { page, limit, search, signal } = params || {};
    const res = await api.get(`/associate/logs`, {
      params: {
        page,
        limit,
        search: search?.trim() || undefined,
      },
      signal,
    });
    return res.data as ListAssociateLogsResponse;
  },
};

// Associate Notice API (DIRECTOR only)
export const associateNoticeApi = {
  async get(): Promise<Notice> {
    const res = await api.get(`/associate/notice`);
    return res.data.notice as Notice;
  },
  async update(
    data: Partial<Pick<Notice, "title" | "description">>
  ): Promise<Notice> {
    const res = await api.put(`/associate/notice`, data);
    return res.data.notice as Notice;
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
    faq: userFaqApi,
  },
  associate: {
    todo: associateTodoApi,
    staff: associateStaffApi,
    staffTasks: associateStaffTasksApi,
    logs: associateLogsApi,
    notice: associateNoticeApi,
  },
  userDetails: publicUserDetailsApi,
  userDetailsFields: {
    listPublic: publicUserDetailsApi.listFields,
    director: directorUserDetailFieldsApi,
  },
};

export default apiClient;
