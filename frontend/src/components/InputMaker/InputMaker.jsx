import React, { useRef } from "react";
import toast from "react-hot-toast";
import Button from "../Button/Button";
const InputMaker = (props) => {
  const InputBox = useRef(null);

  const handleSubmit = (e) => {
    if (e.target.tagName == "INPUT") {
      if (e.which == 13 || e.keyCode == 13) {
        if (InputBox.current.value.length <= 0) {
          props.handleChange(props.value);
          toast("Nothing Changed", {
            icon: "💡",
          });
          props.handleBlur();
        } else {
          props.handleChange(InputBox.current.value);
          props.handleBlur();
        }
      }
    }
    // pressing Change Button
    else {
      if (InputBox.current.value.length <= 0) {
        props.handleChange("");
        toast("Nothing Changed", {
          icon: "💡",
        });
        props.handleBlur();

      } else {
        props.handleChange(InputBox.current.value);
        props.handleBlur();
      }
    }
  };

  return (
    <span>
      {props.showInputElement ? (
        <>
          <input
            ref={InputBox}
            type="text"
            placeholder={props.value}
            autoFocus
            onKeyDown={handleSubmit}
          />
          <Button btnText={props.buttonValue} title="Confirm" type="submit"   onClick={handleSubmit} style={{backgroundColor:props.buttonBgcolor}} />
        </>
      ) : (
        <>
          <span
            onDoubleClick={props.handleDoubleClick}
            title="Double Click to Edit"
          >
            {props.value}
          </span>
          <span onDoubleClick={props.handleDoubleClick} style={{ marginLeft: "3px" }}>{props.icon}</span>
        </>
      )}
    </span>
  );
};

export default InputMaker;
