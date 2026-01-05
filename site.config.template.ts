export const siteInfo: SiteInfo = {
  author: "Sansui", // Required
  social: {
    email: "YourName@gmail.com", // Required
    github: "https://github.com/yourname", // Required
  },
  timeZone: "Asia/Shanghai", // Required, e.g. 'North America/New York', 'Asia/Shanghai'
  domain: "https://yourname.com", // Required,Used to generate rss at build time
  friends: [
    {
      name: "Gawain Antarx",
      link: "https://gawainx.github.io/",
    },
    {
      name: "ABYSS WHALE",
      link: "https://starfish.yuzhehao.com/",
    },
  ],
  walineApi: "https://waline.yourname.com", // Optional, Waline Comment System
  GAId: "G-EDE15EB3W8", // Optional, Google Analytics id
} as const;

type SiteInfo = {
  author: string;
  social: {
    email: string;
    github: string;
  };
  friends?: {
    name: string;
    link: string;
  }[];
  timeZone?: string; // e.g. 'Asia/Shanghai'

  // Sites
  domain: string; // Used to generate rss at build time
  walineApi?: string; // Waline 评论系统后端地址
  GAId?: string; // Google Analytics id
};
