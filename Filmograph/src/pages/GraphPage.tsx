import ForceGraph2D from "react-force-graph-2d";

const data = {
  nodes: [
    { id: "Inception" },
    { id: "Christopher Nolan" },
    { id: "Leonardo DiCaprio" }
  ],
  links: [
    { source: "Christopher Nolan", target: "Inception" },
    { source: "Leonardo DiCaprio", target: "Inception" }
  ]
};

export default function GraphPage() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ForceGraph2D graphData={data} />
    </div>
  );
}
