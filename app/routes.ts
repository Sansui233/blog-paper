import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("memos", "routes/memos.tsx"),
  route("about", "routes/about/about.tsx"),
  route("posts/:slug", "routes/posts.$slug.tsx"),
  route("categories", "routes/categories.tsx"),
  route("categories/:id", "routes/categories.$id.tsx"),
  route("tags/:id", "routes/tags.$id.tsx"),
  route("test/:slug", "routes/test.tsx"),
  route("*", "./routes/404.tsx"),
] satisfies RouteConfig;

