import "./App.css";
import { useState } from "react";
import Jela from "./components/jela";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/navBar";
import Filter from "./components/filter";
import ContactPage from "./components/contactPage";
import Login from "./components/login";
import Register from "./components/register";
import RecipePage from "./components/recipepage";
import ForgotPassword from "./components/forgotPassword";

function App() {

  const [token,setToken]=useState();

  function addToken(token){
    setToken(token);
  }

  return (

    <BrowserRouter>

      <div className="cssjela">

        <Routes>
          <Route path="/login" element={<Login addToken={addToken}/>} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/" element={<NavBar token={token} />} >
          <Route path="recipes" element={<Jela/>} />
          <Route path="filter" element={<Filter/>} />
          <Route path="/recipe/:id" element={<RecipePage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;