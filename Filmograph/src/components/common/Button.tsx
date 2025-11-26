interface ButtonProps {
  text: string;
  onClick?: () => void;
  isOpen?: boolean;
}

const Button = ({ text, onClick, isOpen }: ButtonProps) => {
  return (
    <button
      className={`px-4 py-2 rounded-full text-sm border  border-yellow-200 hover:bg-yellow-300 hover:text-[#0d5a5a] duration-400 cursor-pointer ${
        isOpen ? "bg-yellow-300 text-[#0d5a5a]" : "text-yellow-200"
      }`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
