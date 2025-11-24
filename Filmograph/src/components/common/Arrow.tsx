interface ArrowProps {
  title?: string;
  onClick?: () => void;
}

const Arrow = ({ title, onClick }: ArrowProps) => {
  return (
    <div onClick={onClick} className="w-fit cursor-pointer group">
      <div className="flex flex-col w-full max-w-md xl:mt-2">
        <h1 className="text-lg xl:text-xl font-light text-yellow-100 mb-1 xl:mb-2 tracking-widest">
          {title}
        </h1>

        <div className="relative w-40 xl:w-50 h-px bg-yellow-100 origin-left group-hover:animate-[slide_0.8s_ease-in-out_forwards]">
          <div className="absolute right-0 bottom-0 w-4 xl:w-5 h-px bg-yellow-100 origin-bottom-right -rotate-320"></div>
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
