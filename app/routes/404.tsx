import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

const JOKES = [
  "你的页面像我的头发一样消失了。",
  "天气真好，和页面一起去散步吧~",
  "给我干哪来了？",
  "有时候离开是为了更好的归来，可这个页面再也回不来了。",
];

// ----------------------------------------------------------------------
// 2. 组件实现
// ----------------------------------------------------------------------

const NotFoundPage: React.FC = () => {
  const [joke, setJoke] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 眼睛跟踪的 Ref
  const leftEyeRef = useRef<SVGCircleElement>(null);
  const rightEyeRef = useRef<SVGCircleElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 初始化笑话和主题
  useEffect(() => {
    setJoke(JOKES[Math.floor(Math.random() * JOKES.length)]);

    // 检测系统深色模式偏好
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // 鼠标移动处理函数：计算眼球位置
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current || !leftEyeRef.current || !rightEyeRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    // 移动眼球的辅助函数
    const moveEye = (eyeX: number, eyeY: number, element: SVGCircleElement) => {
      const angle = Math.atan2(mouseY - eyeY, mouseX - eyeX);
      const distance = Math.min(
        10,
        Math.hypot(mouseX - eyeX, mouseY - eyeY) / 10,
      ); // 限制移动半径

      const pupilX = eyeX + Math.cos(angle) * distance;
      const pupilY = eyeY + Math.sin(angle) * distance;

      element.setAttribute("cx", pupilX.toString());
      element.setAttribute("cy", pupilY.toString());
    };

    // 左眼中心 (80, 100)，右眼中心 (120, 100) - 基于 SVG 坐标
    moveEye(80, 100, leftEyeRef.current);
    moveEye(120, 100, rightEyeRef.current);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const refreshJoke = () => {
    let newJoke = joke;
    while (newJoke === joke) {
      newJoke = JOKES[Math.floor(Math.random() * JOKES.length)];
    }
    setJoke(newJoke);
  };

  // 根据主题动态设置颜色
  const strokeColor = isDarkMode ? "#eee" : "#111";
  const fillColor = isDarkMode ? "#111" : "#fff";
  const pupilColor = isDarkMode ? "#eee" : "#111";

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center p-5 text-center transition-colors duration-300 ${
        isDarkMode ? "bg-[#111] text-[#eee]" : "bg-[#f9f9f9] text-[#111]"
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* 主题切换按钮 */}
      <button
        className={`absolute top-5 right-5 cursor-pointer rounded border bg-transparent px-4 py-2 text-[0.8rem] ${
          isDarkMode ? "border-[#555] text-[#eee]" : "border-[#ddd] text-[#111]"
        }`}
        onClick={toggleTheme}
      >
        {isDarkMode ? "☼ Day Mode" : "☾ Night Mode"}
      </button>

      {/* 动态 SVG 眼睛 */}
      <div
        className="mb-8 h-[200px] w-[200px] cursor-pointer"
        onClick={refreshJoke}
        title="点击我也能换笑话"
      >
        <svg ref={svgRef} viewBox="0 0 200 200" width="100%" height="100%">
          {/* 脸部轮廓 (幽灵/Pacman形状) */}
          <path
            d="M 40 180 Q 40 10 100 10 Q 160 10 160 180"
            fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* 嘴巴 (波浪线) */}
          <path
            d="M 50 160 Q 75 180 100 160 Q 125 140 150 160"
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* 左眼框 */}
          <circle
            cx="80"
            cy="100"
            r="15"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
          {/* 左眼珠 (动态) */}
          <circle ref={leftEyeRef} cx="80" cy="100" r="5" fill={pupilColor} />
          {/* 右眼框 */}
          <circle
            cx="120"
            cy="100"
            r="15"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
          {/* 右眼珠 (动态) */}
          <circle ref={rightEyeRef} cx="120" cy="100" r="5" fill={pupilColor} />
        </svg>
      </div>

      <h1 className="m-0 text-[6rem] leading-none font-black tracking-tight">
        404
      </h1>
      <div className="mt-4 mb-8 text-2xl font-semibold opacity-80">
        哎呀，这里一片荒芜。
      </div>

      {/* 随机笑话区域 */}
      <div
        className={`mb-8 max-w-150 cursor-pointer rounded-lg border-2 border-dashed px-8 py-4 select-none ${
          isDarkMode ? "border-[#444]" : "border-[#ccc]"
        }`}
        onClick={refreshJoke}
        title="点击切换笑话"
      >
        <p className="text-lg italic">" {joke} "</p>
        <span className="mt-1 block text-[0.8rem] opacity-50">
          (点我换个梗)
        </span>
      </div>

      <Link
        to="/"
        className={`rounded-full px-8 py-3 text-base font-bold tracking-wide uppercase transition-transform active:scale-95 ${
          isDarkMode ? "bg-white text-black" : "bg-black text-white"
        }`}
      >
        BACK TO HOME
      </Link>
    </div>
  );
};

export default NotFoundPage;
