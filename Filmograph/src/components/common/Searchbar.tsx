import { Search } from "lucide-react";

interface SearchbarProps {
  inputValue: string;                 // 입력 중 텍스트
  setInputValue: (value: string) => void; 
  onSearch: () => void;               // 엔터 또는 검색 버튼 누르면 실행
  placeholder?: string;
}

const Searchbar = ({
  inputValue,
  setInputValue,
  onSearch,
  placeholder,
}: SearchbarProps) => {

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();      
    }
  };

  return (
    <div className="flex-1 max-w-sm">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder || "배우나 감독, 영화를 검색해보세요."}
          value={inputValue}                    
          onChange={(e) => setInputValue(e.target.value)}   
          onKeyDown={handleKeyDown}             // 엔터 검색
          className="w-full px-4 py-2.5 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
        />
        <Search
          size={20}
          onClick={onSearch}
          className="cursor-pointer text-white/50 absolute left-3 top-1/2 -translate-y-1/2"
        />
      </div>
    </div>
  );
};

export default Searchbar;
