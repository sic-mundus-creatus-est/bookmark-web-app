export interface UserAuth {
  username: string;
  role: string[];
  exp: number;
}

export interface User {
  id: string;
  displayName: string;
  username: string;
  email: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export interface UserLinkProps {
  id: string;
  username: string;
  displayName?: string;
}
