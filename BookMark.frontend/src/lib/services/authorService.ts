import { getConstrainedAuthors } from "./api-calls/authorService";

export async function authorInputSuggestions(searchTerm: string) {
  const result = await getConstrainedAuthors({
    filters: { "Name~=": searchTerm },
    pageIndex: 1,
    pageSize: 5,
  });
  return result.items ?? [];
}
