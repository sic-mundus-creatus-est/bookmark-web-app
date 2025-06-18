export interface Author {
  id: string;
  name: string;
  biography?: string;
  dateOfBirth?: Date;
  dateOfDeath?: Date;
}

export interface AuthorWithRole {
  authorId: string;
  roleId: number;
}

export interface AuthorWithNameAndRole {
  id: string;
  name: string;
  roleId: number;
}
