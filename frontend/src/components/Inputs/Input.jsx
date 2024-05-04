import React from "react";

export const Input = ({
  type,
  placeholder,
  name,
  value,
  onChange,
  ...rest
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
};

Input.defaultProps = {
  type: "text",
  placeholder: "placeholder",
  name: "",
  onChange: () => null,
};
