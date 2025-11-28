const Footer = () => {
  return (
    <div className="flex justify-center items-center gap-5 p-3 xl:px-6 bg-yellow-200">
      <img
        src="/icon/github-icon.webp"
        className="w-6 h-6 cursor-pointer"
        alt="GitHub 아이콘"
        onClick={() =>
          window.open("https://github.com/WebFramework-A/Filmograph-FE")
        }
      ></img>
      <span className="text-xs text-center md:text-sm text-[#0d5a5a] backdrop-blur-lg">
        © 2025 Filmograph, All rights reserved.
      </span>
    </div>
  );
};

export default Footer;
