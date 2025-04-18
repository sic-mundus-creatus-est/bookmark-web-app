import { Separator } from "@/components/ui/separator";
import { appConfig } from "@/config/appConfig";

export function Footer() {
  return (
    <footer className="bg-accent py-6 text-sm text-gray-500">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-wrap justify-center gap-6 text-center">
          <a href="#" className="hover:text-primary">
            Home
          </a>
          <a href="#" className="hover:text-primary">
            Books
          </a>
          <a href="#" className="hover:text-primary">
            Reviews
          </a>
          <a href="#" className="hover:text-primary">
            Community
          </a>
          <a href="#" className="hover:text-primary">
            About
          </a>
          <a href="#" className="hover:text-primary">
            Terms
          </a>
          <a href="#" className="hover:text-primary">
            Privacy
          </a>
          <a href="#" className="hover:text-primary">
            Help
          </a>
        </div>

        <Separator className="my-4 bg-gray-300" />

        <div className="text-center">
          <p className="font-semibold text-lg">{appConfig.name}</p>
          <p className="text-xs">
            A project by {appConfig.author.index} © 2025
          </p>
        </div>
      </div>
    </footer>
  );
}
