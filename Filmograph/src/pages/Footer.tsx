interface FooterProps {
  textColor?: string;
}

const Footer = ({ textColor = "text-[#0d5a5a]" }: FooterProps) => {
  return (
    <div className="flex justify-center items-center gap-5 p-3 xl:px-6 backdrop-blur-lg">
      <img
        src="/icon/github-icon.webp"
        className={`w-6 h-6 cursor-pointer ${textColor}`}
        alt="GitHub 아이콘"
        onClick={() =>
          window.open("https://github.com/WebFramework-A/Filmograph-FE")
        }
      ></img>
      <span className={`text-xs text-center md:text-sm ${textColor} `}>
        © 2025 Filmograph, All rights reserved.
      </span>
    </div>
  );
};

export default Footer;
