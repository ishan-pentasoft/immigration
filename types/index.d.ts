export type CreateTodoInput = {
  title: string;
  date: DateTime;
  status: boolean;
  associateId: string;
};

export type Todo = {
  id: string;
  title: string;
  date: DateTime;
  status: boolean;
  associateId: string;
  associate: Associate;
};

export type CreateAssociateInput = {
  username: string;
  email: string;
  role: string;
  password: string;
};

export type Associate = {
  id: string;
  username: string;
  email: string;
  role: string;
  password: string;
};

export type CreateVisaInput = {
  title: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
};

export type StaffTask = {
  id: string;
  date: string;
  title: string;
  description: string;
  file?: string | null;
  status: boolean;
  associateId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateStaffTaskInput = {
  date: string | Date;
  title: string;
  description: string;
  status?: boolean;
  file?: string | null;
};

export type AssociateLoginLog = {
  id: string;
  associateId?: string | null;
  username: string;
  ip?: string | null;
  userAgent?: string | null;
  success: boolean;
  message?: string | null;
  createdAt?: string;
  associate?: Associate | null;
};

export type ListAssociateLogsParams = {
  page?: number;
  limit?: number;
  search?: string;
  signal?: AbortSignal;
};

export type ListAssociateLogsResponse = {
  logs: AssociateLoginLog[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  search?: string;
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

export type Notice = {
  id: string;
  title: string;
  description: string;
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
  colleges?: (College & { country?: Country })[];
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

export type CreateUserDetailsInput = {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string | Date;
  nationality: string;
  citizenship: string;
  countryPreference: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extra?: Record<string, any>;
};

export type UserDetails = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  nationality: string;
  citizenship: string;
  countryPreference: string;
  associateId: string;
  extra?: Record<string, unknown>;
  approved?: boolean;
  approvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "DATE"
  | "SELECT"
  | "RADIO"
  | "CHECKBOX";

export type UserDetailField = {
  id: string;
  label: string;
  name: string;
  type: FieldType;
  required: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  order: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateTeamInput = {
  name: string;
  title: string;
  imageUrl?: string | null;
};

export type CreateCountryInput = {
  title: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
};

export type CreateCollegeInput = {
  name: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
  countryId: string;
};

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

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  nationality: string;
  citizenship: string;
  countryPreference: string;
  extra?: Record<string, unknown> | null;
  associateId: string;
  approved?: boolean;
  approvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  associate?: Associate;
  approvedBy?: Associate | null;
};

export type ListStudentsParams = {
  page?: number;
  limit?: number;
  search?: string;
  signal?: AbortSignal;
};

export type ListStudentsResponse = {
  data: Student[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
