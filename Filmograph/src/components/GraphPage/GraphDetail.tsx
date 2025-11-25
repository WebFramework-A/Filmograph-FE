import { useParams } from "react-router-dom";
import BipartiteGraph from "./BipartiteGraph";
import CollabNetworkGraph from "./CollabNetworkGraph";
import EgoGraph from "./EgoGraph";

const GraphDetail = () => {
  const { graphType } = useParams();
  console.log(graphType);

  return (
    <div className="min-h-screen max-w-full pt-30 bg-[#0d5a5a] text-white overflow-x-hidden">
      {/* 제목 */}
      <div className="text-3xl text-center">
        {graphType === "movie" && <div>영화-영화인 네트워크</div>}
        {graphType === "ego" && <div>에고 네트워크</div>}
        {graphType === "collaboration" && <div>협업 네트워크</div>}
      </div>

      {/* 설명 */}
      <div className="text-lg text-center mt-2 text-yellow-100">
        {graphType === "movie" && <div>영화-영화인 네트워크 설명써두기</div>}
        {graphType === "ego" && <div>에고 네트워크 썰명 써두기</div>}
        {graphType === "collaboration" && <div>협업 네트워크 설명 써두기</div>}
      </div>

      {/* 설명 */}
      <div className="text-lg text-center mt-5 bg-black">
        여기에 나중에 검색바 넣어야됨
      </div>

      {/* 그래프 */}
      {graphType === "movie" && (
        <div className="w-full max-w-full">
          <BipartiteGraph resetViewFlag={false} />
        </div>
      )}
      {graphType === "ego" && (
        <div className="w-full max-w-full">
          <EgoGraph />
        </div>
      )}
      {graphType === "collaboration" && (
        <div className="w-full max-w-full">
          <CollabNetworkGraph resetViewFlag={false} />
        </div>
      )}
    </div>
  );
};

export default GraphDetail;
