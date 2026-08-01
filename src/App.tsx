import { Route, Routes } from "react-router-dom";
import { DesignVersionProvider, useDesignVersion } from "@/context/DesignVersionContext";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ModernApp } from "@/modern/ModernApp";
import { About } from "@/pages/About";
import { Corporate } from "@/pages/Corporate";
import { Faq } from "@/pages/Faq";
import { Home } from "@/pages/Home";
import { NotFound } from "@/pages/NotFound";
import type { ReactNode } from "react";

function ClassicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <ScrollToTop />
      <Header />
      {children}
      <Footer />
    </>
  );
}

function AppRoutes() {
  const { isModern } = useDesignVersion();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isModern ? (
            <ModernApp />
          ) : (
            <ClassicShell>
              <Home />
            </ClassicShell>
          )
        }
      />
      <Route
        path="/about"
        element={
          <ClassicShell>
            <About />
          </ClassicShell>
        }
      />
      <Route
        path="/corporate"
        element={
          <ClassicShell>
            <Corporate />
          </ClassicShell>
        }
      />
      <Route
        path="/faq"
        element={
          <ClassicShell>
            <Faq />
          </ClassicShell>
        }
      />
      <Route
        path="*"
        element={
          <ClassicShell>
            <NotFound />
          </ClassicShell>
        }
      />
    </Routes>
  );
}

export function App() {
  return (
    <DesignVersionProvider>
      <AppRoutes />
    </DesignVersionProvider>
  );
}
