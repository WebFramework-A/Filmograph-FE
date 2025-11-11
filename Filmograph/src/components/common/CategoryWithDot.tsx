interface CategoryWithDotProps {
  color: string;
  label: string;
}

const CategoryWithDot = ({ color, label }: CategoryWithDotProps) => {
  return (
    <>
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full`}
          style={{ backgroundColor: color }}
        ></div>
        <span className="text-sm">{label}</span>
      </div>
    </>
  );
};

export default CategoryWithDot;
