import { DesignVersionProvider, useDesignVersion } from "@/context/DesignVersionContext";
import { ClassicApp } from "@/classic/ClassicApp";
import { ModernApp } from "@/modern/ModernApp";

function AppContent() {
  const { isModern } = useDesignVersion();
  return isModern ? <ModernApp /> : <ClassicApp />;
}

export function App() {
  return (
    <DesignVersionProvider>
      <AppContent />
    </DesignVersionProvider>
  );
}
