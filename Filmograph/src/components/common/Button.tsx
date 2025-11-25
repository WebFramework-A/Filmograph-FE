interface ButtonProps {
  text: string;
}

const Button = ({ text }: ButtonProps) => {
  return (
    <button className="px-4 py-2 rounded-full text-sm border text-yellow-200 border-yellow-200 hover:bg-yellow-300 hover:text-[#0d5a5a] duration-400">
      {text}
    </button>
  );
};

export default Button;
