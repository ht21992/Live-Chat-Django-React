import React from "react";

export const TextArea = ({ type, placeholder, value, onChange, onKeyDown }) => {
  return (
    <textarea
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  );
};

TextArea.defaultProps = {
  type: "text",
  placeholder: "placeholder",
  name: "",
  onChange: () => null,
  onKeyDown: () => null,
};
