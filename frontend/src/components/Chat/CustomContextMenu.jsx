import React, { useContext } from "react";
import { deleteMessageAsync } from "../../slices/chatSlice";
import { useDispatch } from "react-redux";
import { ChatContext } from "../../context/chatContext";
const CustomContextMenu = ({
  position,
  setContextMenuPosition,
  contextValue,
  setInput,
  setEditMode,
}) => {
  const { user } = useContext(ChatContext);

  const { x, y } = position;

  const dispatch = useDispatch();

  const actions = [
    {
      actionId: 1,
      text: "Copy Text",
      icon: "copy-icon",
    },
  ];

  const restricted_actions = [
    {
      actionId: 2,
      text: "Edit Message",
      icon: "edit-icon",
    },
    {
      actionId: 3,
      text: "Delete Message",
      icon: "delete-icon",
    },
  ];

  if (parseInt(user.id) === contextValue.sender.id) {
    actions.push(...restricted_actions);
  }

  const handleMenuClicked = (action) => {
    if (action.actionId === 1) {
      navigator.clipboard.writeText(contextValue.message);
      setContextMenuPosition({ x: 0, y: 0 });
    } else if (action.actionId === 2) {
      setInput(contextValue.message);
      setEditMode(true);
      setContextMenuPosition({ x: 0, y: 0 });
    } else if (action.actionId === 3) {
      if (contextValue.id) {
        dispatch(deleteMessageAsync(contextValue.id));
        setContextMenuPosition({ x: 0, y: 0 });
      }
    }
  };

  return (
    <div
      className="custom-context-menu"
      style={{
        position: "absolute",
        top: y,
        left: x,
        backgroundColor: "white",
        border: "1px solid black",
      }}
    >
      <ul>
        {actions.map((action, index) => (
          <li
            style={{ fontSize: "12px" }}
            key={index}
            onClick={() => handleMenuClicked(action)}
          >
            <span
              style={{ marginRight: "5px", paddingTop: "5px" }}
              className={action.icon}
            ></span>
            {action.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomContextMenu;
