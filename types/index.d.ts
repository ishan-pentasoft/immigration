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
