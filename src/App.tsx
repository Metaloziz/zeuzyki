import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header } from "./components/Header/Header";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Corporate } from "./pages/Corporate";
import { SplavDetails } from "./pages/SplavDetails";
import { Faq } from "./pages/Faq";

/** Scrolls to top on every route change — important for stacked-banners → details page. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/corporate" element={<Corporate />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/splav/:id" element={<SplavDetails />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
