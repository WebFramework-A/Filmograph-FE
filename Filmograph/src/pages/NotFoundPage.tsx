import { useNavigate } from "react-router-dom";
import Arrow from "../components/common/Arrow";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col gap-20 justify-center items-center bg-[#0b4747]">
      <div className="text-5xl text-yellow-300">페이지를 찾을 수 없습니다.</div>
      <Arrow title="시작 화면으로" onClick={() => navigate("/")} />
    </div>
  );
};

export default NotFoundPage;
