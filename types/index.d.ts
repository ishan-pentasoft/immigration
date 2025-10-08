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
