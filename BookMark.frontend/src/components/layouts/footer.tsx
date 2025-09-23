import { appConfig } from "@/config/appConfig";

export function Footer() {
  return (
    <footer className="bg-accent pb-12 pt-8 text-sm z-30">
      <div className="container mx-auto px-10 sm:px-10 md:px-4 lg:px-28">
        <div className="flex flex-col md:flex-row md:items-center justify-center sm:gap-4 md-gap-6 lg:gap-16 text-background">
          {/* Left: Title + Author */}
          <div className="font-[Helvetica]">
            <p className="font-semibold text-3xl md:text-4xl">
              {appConfig.name}
              <span className="text-popover font-bold">™</span>
            </p>
            <p className="text-sm font-semibold -mt-1">
              A project by {appConfig.author.index}{" "}
              <span className="text-popover">©</span> 2025
            </p>
          </div>

          {/* Right: Description */}
          <div className="text-sm font-semibold pt-4 md:pt-0 lg:pt-0 font-[Verdana]">
            {appConfig.description.split(". ").map((sentence, i) => {
              const words = sentence.trim().split(" ");
              return (
                <p key={i} className="leading-tight">
                  {words.map((word, index) => {
                    const cleanWord = word.replace(/[.,!?]/g, "");
                    const isBookmark = cleanWord.toLowerCase() === "bookmark";
                    return (
                      <span
                        key={index}
                        className={
                          isBookmark ? "text-popover font-bold" : undefined
                        }
                      >
                        {word}
                        {index !== words.length - 1 && " "}
                      </span>
                    );
                  })}
                  {i !== appConfig.description.split(". ").length - 1 && "."}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
