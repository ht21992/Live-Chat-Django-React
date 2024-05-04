const Button = ({ type, btnText, Children, onClick, ...rest }) => {
  return (
    <button onClick={onClick} type={type} {...rest}>
      {btnText} {Children}
    </button>
  );
};

Button.defaultProps = {
  classes: "",
  type: "button",
  onClick: () => null,
};

export default Button;
