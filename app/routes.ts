import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about/about.tsx"),
  route("posts/:slug", "routes/posts.$slug.tsx"),
] satisfies RouteConfig;
