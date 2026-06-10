import { Route, Routes } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollToTop } from "@/components/ScrollToTop";
import { About } from "@/pages/About";
import { Corporate } from "@/pages/Corporate";
import { Faq } from "@/pages/Faq";
import { Home } from "@/pages/Home";

export function ClassicApp() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/corporate" element={<Corporate />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </>
  );
}
