import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(),
    // visualizer({
    //   emitFile: true,
    //   filename: "stats.html", // 打包后会生成这个 HTML 文件
    //   open: true, // 打包完成后自动打开浏览器
    //   gzipSize: true, // 显示 gzip 压缩后的大小
    //   brotliSize: true,
    // }),
  ],
  
});
