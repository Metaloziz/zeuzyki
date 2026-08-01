import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Home } from "@/pages/Home";

/** Classic home shell (header + home + footer). Routing lives in App.tsx. */
export function ClassicApp() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Home />
      <Footer />
    </>
  );
}
