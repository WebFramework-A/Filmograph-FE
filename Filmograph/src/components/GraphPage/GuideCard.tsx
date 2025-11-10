interface GuideCardProps {
  title: string;
  description: string;
}

const GuideCard = ({ title, description }: GuideCardProps) => {
  return (
    <>
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <h3 className="text-[#FFD700] font-semibold mb-2">{title}</h3>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </>
  );
};

export default GuideCard;
