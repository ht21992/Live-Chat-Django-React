import "./App.css";
import Layout from "./hoc/Layout";
import { Toaster } from "react-hot-toast";
import routes from "./routes";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Layout>
          <Routes>
            {routes.map((route) => (
              <Route
                exact
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </Layout>
      </Router>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </>
  );
}

export default App;
