interface IAppConfig {
  name: string;
  description: string;

  repository: string;
  author: {
    index: string;
    githubUrl: string;
  };
}

export const appConfig: IAppConfig = {
  name: "BookMark",
  description:
    "Search, track, and review your books in one place. Never lose your next great read, bookmark it!",

  repository: "https://github.com/sic-mundus-creatus-est/bookmark-app",
  author: {
    index: "18859",
    githubUrl: "https://github.com/sic-mundus-creatus-est",
  },
};
