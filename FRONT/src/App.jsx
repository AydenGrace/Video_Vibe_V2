import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import styles from "./App.module.scss";
import { Outlet } from "react-router-dom";
import UserProvider from "./Providers/UserProvider";
import VideoProvider from "./Providers/VideoProvider";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className={`d-flex flex-column ${styles.appContainer}`}>
      <UserProvider>
        <Header />
        <VideoProvider>
          <div className="d-flex flex-fill">
            <Outlet />
          </div>
        </VideoProvider>
        <Footer />
      </UserProvider>
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}
export default App;
