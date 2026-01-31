import { Routes, Route } from "react-router-dom";

import Home from "./pages/Index";
import BrowseWorkers from "./pages/BrowseWorkers";
import WorkerProfile from "./pages/WorkerProfile";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import HowItWorks from "./pages/HowItWorks";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/browse" element={<BrowseWorkers />} />
      <Route path="/worker/:id" element={<WorkerProfile />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
