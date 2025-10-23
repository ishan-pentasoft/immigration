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
  maintenanceMode?: boolean;
  maintenanceMessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateSiteDetailsInput = Partial<
  Pick<
    SiteDetails,
    | "phone"
    | "email"
    | "facebook"
    | "twitter"
    | "youtube"
    | "address"
    | "maintenanceMode"
    | "maintenanceMessage"
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

export type TicketStatus = "OPEN" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";
export type TicketSenderType = "STUDENT" | "ASSOCIATE" | "DIRECTOR";

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  attachmentUrl?: string | null;
  studentId: string;
  associateId: string;
  createdAt?: string;
  updatedAt?: string;
  student?: Student;
  associate?: Associate;
  messages?: TicketMessage[];
};

export type TicketMessage = {
  id: string;
  ticketId: string;
  content: string;
  attachmentUrl?: string | null;
  senderType: TicketSenderType;
  studentId?: string | null;
  associateId?: string | null;
  createdAt?: string;
  student?: Student | null;
  associate?: Associate | null;
};

export type CreateTicketInput = {
  title: string;
  description: string;
  priority?: TicketPriority;
  attachmentUrl?: string | null;
};

export type CreateTicketMessageInput = {
  content: string;
  attachmentUrl?: string | null;
};

export type ListTicketsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatus;
  signal?: AbortSignal;
};

export type TicketWithLatestMessage = Ticket & {
  latestMessage?: TicketMessage | null;
};

export type ListTicketsResponse = {
  tickets: TicketWithLatestMessage[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type DocumentType =
  | "PASSPORT"
  | "VISA"
  | "ACADEMIC_TRANSCRIPT"
  | "DEGREE_CERTIFICATE"
  | "LANGUAGE_TEST"
  | "FINANCIAL_STATEMENT"
  | "MEDICAL_CERTIFICATE"
  | "POLICE_CLEARANCE"
  | "BIRTH_CERTIFICATE"
  | "MARRIAGE_CERTIFICATE"
  | "WORK_EXPERIENCE"
  | "RECOMMENDATION_LETTER"
  | "STATEMENT_OF_PURPOSE"
  | "OTHER";

export type DocumentStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "RESUBMISSION_REQUIRED";

export type VerificationStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "COMPLETED"
  | "REJECTED";

export type DocumentRequirement = {
  id: string;
  countryId: string;
  documentType: DocumentType;
  title: string;
  description?: string | null;
  required: boolean;
  maxFileSize: number;
  allowedTypes: string[];
  order: number;
  active: boolean;
  createdById: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StudentDocument = {
  id: string;
  requirementId: string;
  verificationRequestId: string;
  studentId: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  rejectionReason?: string | null;
  parentDocumentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DocumentVerificationRequest = {
  id: string;
  studentId: string;
  countryId: string;
  status: VerificationStatus;
  assignedToId?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  documents?: StudentDocument[];
};

export type EmailService = {
  id: string;
  email: string;
  password: string;
  associateId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpsertEmailServiceInput = {
  email: string;
  password?: string;
};

export type ImapMessage = {
  uid: number;
  subject: string;
  from: string;
  date: string;
  body: string;
  seen: boolean;
  totalUnread: number;
};

export type CreateDocumentRequirementInput = {
  countryId: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  required?: boolean;
  maxFileSize?: number;
  allowedTypes?: string[];
  order?: number;
  active?: boolean;
};

export type ReviewDocumentInput = {
  status: DocumentStatus;
  reviewNotes?: string;
  rejectionReason?: string;
};

export type CreateDocumentVerificationRequestInput = {
  countryId: string;
  documents: {
    requirementId: string;
    fileUrl: string;
    originalName: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }[];
};

export type ListDocumentRequirementsParams = {
  countryId?: string;
  active?: boolean;
  signal?: AbortSignal;
};

export type ListDocumentRequirementsResponse = {
  requirements: DocumentRequirement[];
};

export type ListVerificationRequestsParams = {
  page?: number;
  limit?: number;
  status?: VerificationStatus;
  assignedToId?: string;
  countryId?: string;
  studentId?: string;
  signal?: AbortSignal;
};

export type ListVerificationRequestsResponse = {
  requests: DocumentVerificationRequest[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
