import React, { useEffect, useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { ColorRing } from "react-loader-spinner";
import axios from "axios";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setisLoggedIn] = useState(null);

  const navigate = useNavigate();

  const HandelEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const HandelPasswordChange = (e) => {
    setPassword(e.target.value);
  };

  var data = JSON.stringify({
    email: email,
    password: password,
  });

  var config = {
    method: "post",
    url: "https://location-api-xl.onrender.com/user/login/",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };
  //api
  const HandelSubmit = async (e) => {
    e.preventDefault();
    const response = await axios(config);
    const data = response.data;
    const token = data.token;
    setisLoggedIn(true);
    if (data) {
      window.localStorage.setItem("token", token);
      setisLoggedIn(false);
      navigate("/geolocation");
    } else {
      alert("Username/Password Incorrect");
    }
  };

  useEffect(() => {
    setisLoggedIn(true);
    setTimeout(() => {
      setisLoggedIn(false);
    }, 1000);
  }, []);

  return (
    <>
      <div classNameName="container-fluid">
        <div classNameName="row mt-5">
          <nav classNameName="navbar navbar-expand-lg navbar-light shadow-none">
            <div classNameName="container-fluid">
              <a class="navbar-brand fw-bold fs-5" style={{ color: "black" }}>
                <img
                  src="geo.png"
                  alt="Logo"
                  width="30"
                  height="38"
                  classNameName="d-inline-block"
                />
                <span classNameName="h4 fw-bold">GeoLocation Tracker</span>
              </a>
            </div>
          </nav>
        </div>
        {isLoggedIn ? (
          <div className="loader-container">
            <div className="spinner" style={{ marginTop: "290px" }}>
              <ColorRing
                visible={true}
                height="130"
                width="1780"
                ariaLabel="blocks-loading"
                wrapperClass="blocks-wrapper"
                colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
              />
            </div>
          </div>
        ) : (
          <div className="row main-content bg-success text-center">
            <div className="col-md-4 text-center company__info">
              <span className="company__logo">
                <h2>
                  <span className="fa fa-android">
                    {" "}
                    <img src="geo.png" width={"80px"} alt="conpany_logo" />
                  </span>
                </h2>
              </span>

              <h4 className="company_title" style={{ marginLeft: "10px" }}>
                GeoLocation Tracker
              </h4>
            </div>
            <div className="col-md-8 col-xs-12 col-sm-12 login_form ">
              <div className="container-fluid">
                <div className="row mt-4">
                  <h2>Log In</h2>
                </div>
                <div className="row">
                  <form control="" className="form-group">
                    <div className="row">
                      <input
                        type="email"
                        name="Email"
                        id="email"
                        className="form__input"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => HandelEmailChange(e)}
                      />
                    </div>
                    <div className="row">
                      <span className="fa fa-lock"></span>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        className="form__input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => HandelPasswordChange(e)}
                      />
                    </div>

                    <div className="row">
                      {(email && password && (
                        <button
                          type="submit"
                          value="Submit"
                          className="btn btn-success mt-4"
                          style={{ textAlign: "center" }}
                          onClick={HandelSubmit}
                        >
                          Submit
                        </button>
                      )) || (
                        <button
                          type="submit"
                          value="Submit"
                          className="btn btn-success mt-4"
                          style={{ textAlign: "center" }}
                          disabled
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </form>
                </div>
                <br />
                <br />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
