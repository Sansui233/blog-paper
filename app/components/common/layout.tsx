import React from "react";
import Footer from "./footer";
import Topbar from "./topbar";

// 简单的辅助函数用于合并类名，实际项目中推荐安装 'clsx' 或 'tailwind-merge'
const cn = (...classes: (string | undefined | false | null)[]) => classes.filter(Boolean).join(' ');

type Props = React.HTMLProps<HTMLDivElement> & {
  hidesearch?: boolean;
};

const LayoutContainer: React.FC<Props> = ({
  children,
  hidesearch = false,
  className,
  ...otherProps
}) => {
  return (
    <>
      <Topbar hideSearch={hidesearch} />
      <main className={className} {...otherProps}>
        {children}
      </main>
      <Footer />
    </>
  );
};

export default LayoutContainer;

/**
 * 单栏居中布局
 * 
 * 转换逻辑 (Mobile First):
 * 1. 默认 (<580px): w-full max-w-full (padding 保持)
 * 2. >580px: max-w-[580px]
 * 3. >780px: w-[700px] (取消 max-w限制)
 * 4. >1080px: w-[800px]
 */
export const OneColLayout: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "mx-auto px-5 pb-12",
        "w-full max-w-full", // Mobile (<580px)
        "min-[580px]:max-w-145", // Tablet
        "min-[780px]:max-w-none min-[780px]:w-175", // Laptop
        "min-[1080px]:w-200", // Desktop
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * 双栏布局
 */
type TwoColProps = Props & {
  sep: number;
  siderLocation: "left" | "right";
};

export const TwoColLayout: React.FC<TwoColProps> = ({
  sep,
  siderLocation,
  children,
  className,
  ...otherProps
}) => {

  const safeSep = sep > 1 ? sep : 1;
  const list = React.Children.toArray(children);
  const mainColContent = list.slice(0, safeSep);
  const siderContent = list.slice(safeSep);

  // 定义子区域的样式
  const siderClass = cn(
    "flex flex-col flex-1",
    "sticky top-0 max-h-screen", // Sticky 效果
    // 响应式隐藏，可以在这里加 hidden md:flex 等
  );

  const mainClass = cn(
    "relative flex flex-col",
    "flex-[3_1_0]", // flex: 3 1 0
    "max-[780px]:flex-[1_1_0]" // 移动端 flex: 1 1 0
  );

  return (
    <div
      className={cn(
        "flex justify-center",
        "flex-col min-[780px]:flex-row", // <780px 纵向，>780px 横向
        className
      )}
      {...otherProps}
    >
      {siderLocation === "left" ? (
        <>
          <div className={siderClass}>{siderContent}</div>
          <div className={mainClass}>{mainColContent}</div>
        </>
      ) : (
        <>
          <div className={mainClass}>{mainColContent}</div>
          <div className={siderClass}>{siderContent}</div>
        </>
      )}
    </div>
  );
};
