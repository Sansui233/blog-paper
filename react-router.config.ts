import type { Config } from "@react-router/dev/config";
import { getDynamicPaths } from "utils/dynamic-path";


export default {
  // Config options...
  // ssr-false to no-server SSG
  ssr: false,
  prerender: async ({ getStaticPaths }) => {
    const paths = await getStaticPaths();
    const dyn_paths = await getDynamicPaths();

    return ["/", "/test/a",...paths, ...dyn_paths];
  },
} satisfies Config;
