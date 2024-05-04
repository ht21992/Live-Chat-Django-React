import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { registerAsync } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import './form.css'
import { Input } from "../components/Inputs/Input";
import Button from "../components/Button/Button";
export const Register = () => {
  const dispatch = useDispatch()
  let navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name:""
  });

  const { email, password, full_name } = formData;


  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(registerAsync({ email, password, full_name })).then(() => {
      navigate("/login");
    })
  };


  return (
    <div className="form-container">
      <div className="custom-form">
        <h2>Register</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <Input type="email" placeholder="Email" name="email" value={email} onChange={onChange} required />
          </div>
          <div className="form-group">
            <Input placeholder="Full Name" name="full_name" value={full_name} onChange={onChange} required />
          </div>
          <div className="form-group">
            <Input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required />
          </div>
          <Button type="submit" btnText="Register" />
        </form>
        <p>Already a member? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

