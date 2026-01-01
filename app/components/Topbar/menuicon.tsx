
type Props = {
  width?: string;
  height?: string;
  isClose: boolean;
  isCloseToggler?: () => void;
  className?: string; // 允许外部传入额外的类名
};

const MenuIcon = ({
  width = "1rem", // 默认 1em (16px approx)
  height = "1rem",
  isClose,
  isCloseToggler,
  className = ""
}: Props) => {

  // 公共样式：高度2px，圆角，过渡动画，背景色
  const lineBaseClass = "h-[2px] w-full rounded-sm bg-text-primary transition-all duration-300 ease-in-out";

  return (
    <div
      className={`flex flex-col justify-between cursor-pointer ${className}`}
      style={{ width, height }}
      onClick={isCloseToggler}
      aria-expanded={isClose}
      aria-label="Toggle menu"
    >
      {/* 上面的线：关闭时透明 */}
      <div className={`${lineBaseClass} ${isClose ? 'opacity-0' : 'opacity-100'}`} />

      {/* 中间的容器：负责画 X */}
      <div className="relative h-0.5 w-full">
        {/* X 的第一笔 (原 before) */}
        <div
          className={`absolute top-0 left-0 ${lineBaseClass} ${isClose ? 'rotate-45' : 'rotate-0'
            }`}
        />

        {/* X 的第二笔 (原 after) */}
        <div
          className={`absolute top-0 left-0 ${lineBaseClass} ${isClose ? '-rotate-45' : 'rotate-0'
            }`}
        />
      </div>

      {/* 下面的线：关闭时透明 */}
      <div className={`${lineBaseClass} ${isClose ? 'opacity-0' : 'opacity-100'}`} />
    </div>
  );
};

export default MenuIcon;
