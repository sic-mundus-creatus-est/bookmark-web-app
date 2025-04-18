import { BookCatalog } from "@/components/layouts/book-catalog";

const realBookData = [
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    coverId: 33,
    desc: "The future of civilization rests in the fate of the One Ring, which has been lost for centuries. Dark forces are relentlessly searching for it, but fate has placed it in the hands of a young Hobbit named Frodo Baggins who inherits the Ring and steps into legend.",
  },
  {
    title: "Foundation",
    author: "Isaac Asimov",
    coverId: 29579,
    desc: "For twelve thousand years the Galactic Empire has ruled supreme. Now it is dying. Only Hari Seldon, creator of the revolutionary science of psychohistory, can see into the future—a dark age of ignorance, barbarism, and warfare that will last thirty thousand years.",
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    coverId: 447674,
    desc: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who would become the mysterious man known as Muad'Dib. A stunning blend of adventure and mysticism, environmentalism and politics, Dune won the first Nebula Award and shared the Hugo Award.",
  },
  {
    title: "A Game of Thrones",
    author: "George R.R. Martin",
    coverId: 1842439,
    desc: "Long ago, in a time forgotten, a preternatural event threw the seasons out of balance. Now the Starks of Winterfell may hold the key to the survival of the kingdom as a brutal struggle for power nears its climax in a world where summers can last decades and winters a lifetime.",
  },
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    coverId: 186074,
    desc: "The riveting first-person narrative of a young man who grows to be the most notorious magician his world has ever seen. From his childhood in a troupe of traveling players to years spent as a near-feral orphan, Kvothe's story is one of magic, adventure, and legendary deeds.",
  },
  {
    title: "Neuromancer",
    author: "William Gibson",
    coverId: 909206,
    desc: "The first novel to win the Hugo, Nebula, and Philip K. Dick Awards, Neuromancer is the archetypal cyberpunk work that defined the genre. Case was the hottest computer cowboy until he double-crossed the wrong people, who damaged his nervous system and left him unable to enter cyberspace.",
  },
  {
    title: "The Way of Kings",
    author: "Brandon Sanderson",
    coverId: 7235533,
    desc: "Roshar is a world of stone and storms. It has been centuries since the fall of the ten consecrated orders known as the Knights Radiant, but their Shardblades and Shardplate remain. This tale unfolds amid war and the machinations of those who seek to control its outcome.",
  },
];

const mockBooks = Array.from({ length: 500 }, (_, i) => {
  const book = realBookData[i % realBookData.length];
  return {
    id: `book-${i + 1}`,
    title: book.title,
    author: book.author,
    coverImage: `https://covers.openlibrary.org/b/id/${book.coverId + i}-M.jpg`,
    rating: 3.5 + Math.random() * 1.5,
    ratingCount: Math.floor(Math.random() * 1000000),
    publishedYear: 2015 + (i % 8),
    desc: book.desc,
  };
});

const mockFetchBooks = async (page: number, limit: number) => {
  const start = (page - 1) * limit;
  const end = start + limit;

  const books = mockBooks.slice(start, end);
  const totalItems = mockBooks.length;

  await new Promise((res) => setTimeout(res, 300));

  return { books, totalItems };
};

export function TestPage() {
  return (
    <div className="container mx-auto py-8 px-6">
      <h1 className="text-2xl mb-6 font-serif">TEST BOOK CATALOG:</h1>
      <BookCatalog fetchBooks={mockFetchBooks} />
    </div>
  );
}
