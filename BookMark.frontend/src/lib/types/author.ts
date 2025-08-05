export interface Author {
  id: string;
  name: string;
  biography?: string;
  birthDate?: string;
  deathDate?: string;
}

export interface AuthorWithRole {
  id: string;
  roleId: number;
}

export interface AuthorWithNameAndRole {
  id: string;
  name: string;
  roleId: number;
}
