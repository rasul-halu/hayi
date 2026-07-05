import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";

import { UserProvider }
from "./context/UserContext";
import { prepareTelegramWebApp } from "./utils/telegram";

function App() {
  useEffect(() => {
    prepareTelegramWebApp();
  }, []);

  return (
    <UserProvider>

      <AppRoutes />

    </UserProvider>
  );
}

export default App;
