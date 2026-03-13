export const siteConfig = {
  "activeTheme": "@homeblog/theme-pack",
  "home": {
    "radius": 8,
    "profile": {
      "name": "NebulaX",
      "handle": "homeblog",
      "avatarText": "N",
      "avatarUrl": "/avatars/avatar.png",
      "bio": "写作、产品与工具整理。",
      "socials": [
        {
          "label": "Email",
          "href": "mailto:qingyingx@099311.xyz",
          "icon": "mail"
        },
        {
          "label": "GitHub",
          "href": "https://github.com/QingYingX",
          "icon": "github"
        }
      ]
    },
    "navCards": [
      {
        "title": "博客",
        "description": "文章与笔记集中地。",
        "href": "/blog",
        "variant": "primary"
      }
    ],
    "quoteCard": {
      "apiUrl": "https://v1.hitokoto.cn",
      "loadingText": "加载中...",
      "loadingAuthor": "—— HomeBlog",
      "errorText": "啊哦，加载失败力",
      "errorAuthor": "—— HomeBlog"
    }
  }
};

export type SiteConfig = typeof siteConfig;
