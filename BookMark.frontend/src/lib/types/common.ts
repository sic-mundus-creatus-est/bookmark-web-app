export interface Page<T> {
  items?: T[];
  pageIndex: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
