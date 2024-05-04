import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginAsync } from "../slices/authSlice";
import { Link } from "react-router-dom";
import './form.css'
import { Input } from "../components/Inputs/Input";
import Button from "../components/Button/Button";
const Login = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(loginAsync({ email, password }));
  };

  return (
    <div className="form-container">
      <div className="custom-form">
        <h2>Login</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <Input type="email" placeholder="Email" name="email" value={email} onChange={onChange} required />
          </div>
          <div className="form-group">
            <Input type="password" placeholder="password" name="password" value={password} onChange={onChange} />
          </div>
          <Button type="submit" btnText="Login" />
        </form>
        <p>Do not have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;