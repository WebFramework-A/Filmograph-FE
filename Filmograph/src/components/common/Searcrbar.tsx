import { Search } from "lucide-react";

interface SearchbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder?: string;
}

const Searchbar = ({
  searchTerm,
  setSearchTerm,
  placeholder,
}: SearchbarProps) => {
  return (
    <>
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <input
            type="text"
            placeholder={placeholder || "배우나 감독, 영화를 검색해보세요."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
          />
          <Search
            size={20}
            className="text-white/50 absolute left-3 top-1/2 -translate-y-1/2"
          />
        </div>
      </div>
    </>
  );
};

export default Searchbar;
