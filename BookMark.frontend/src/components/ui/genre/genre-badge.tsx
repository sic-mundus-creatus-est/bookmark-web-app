import { Link } from "react-router-dom";

interface GenreBadgeProps {
  genreName: string;
  genreId: string;
}
export function GenreBadge({ genreName, genreId }: GenreBadgeProps) {
  return (
    <Link to={`/genre/${genreId}`}>
      <span className="select-none rounded-full px-3.5 py-1.5 text-xs tracking-wide bg-accent text-background font-bold font-[Helvetica] hover:bg-accent hover:text-popover">
        {genreName}
      </span>
    </Link>
  );
}
