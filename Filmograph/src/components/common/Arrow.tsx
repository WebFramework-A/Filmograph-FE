interface ArrowProps {
  title?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  color?: "yellow" | "green";
}

const sizeClass = {
  sm: "text-base xl:text-lg",
  md: "text-lg xl:text-xl",
  lg: "text-xl xl:text-2xl",
};

const colorClass = {
  yellow: "text-yellow-200",
  green: "text-[#0d5a5a]",
};

const arrowBgClass = {
  yellow: "bg-yellow-100",
  green: "bg-[#0d5a5a]",
};

const Arrow = ({
  title,
  onClick,
  size = "md",
  color = "yellow",
}: ArrowProps) => {
  return (
    <div onClick={onClick} className="w-fit cursor-pointer group">
      <div className="flex flex-col w-full max-w-md xl:mt-2">
        <h1
          className={`${sizeClass[size]} font-light ${colorClass[color]} mb-1 xl:mb-2 tracking-widest`}
        >
          {title}
        </h1>

        <div
          className={`relative w-40 xl:w-50 h-px ${arrowBgClass[color]} origin-left group-hover:animate-[slide_0.8s_ease-in-out_forwards]`}
        >
          <div
            className={`absolute right-0 bottom-0 w-4 xl:w-5 h-px ${arrowBgClass[color]} origin-bottom-right -rotate-320`}
          ></div>
        </div>

        {/* (커스텀 애니메이션) 호버하면 화살표 애니메이션용  */}
        <style>
          {`
            @keyframes slide {
              0% { transform: scaleX(0); }
              100% { transform: scaleX(1); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Arrow;
