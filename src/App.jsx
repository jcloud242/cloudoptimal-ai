import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DesignPage from "./pages/DesignPage";
import MigratePage from "./pages/MigratePage";
import OptimizePage from "./pages/OptimizePage";
import ComparePage from "./pages/ComparePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/design" element={<DesignPage />} />
      <Route path="/migrate" element={<MigratePage />} />
      <Route path="/optimize" element={<OptimizePage />} />
      <Route path="/compare" element={<ComparePage />} />
    </Routes>
  );
}
