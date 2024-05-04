import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutAsync } from "../slices/authSlice";
import ContactList from "../components/Chat/ContactList";
import ChatView from "../components/Chat/ChatView";
import ChatDetails from "../components/Chat/ChatDetails";
import { ChatContext } from "../context/chatContext";
import { fetchRoomMessagesListAsync } from "../slices/chatSlice";
import ChatSettings from "../components/Chat/ChatSettings";
import "./chat.css";
export const Chat = () => {
  const [isSettings, setIsSettings] = useState(false);
  const [showingDetails, setShowingDetails] = useState(false);
  const [messages, setMessages] = useState([]);
  const [webSocket, setWebSocket] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [currentColor, setCurrentColor] = useState(
    localStorage.getItem("color") || "#387ADF"
  );
  const [background, setBackground] = useState(localStorage.getItem("background") || null);
  const [currentRecipent, setCurrentRecipent] = useState({});
  const user = useSelector((state) => state.auth.user);
  const roomMesseges = useSelector((state) => state.chat.room_messages);

  const dispatch = useDispatch();

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    }
  }, [theme]);

  const handleLogout = () => {
    document.body.classList.remove("dark-mode");
    dispatch(logoutAsync());
  };

  const handleColorChange = (color) => {
    setCurrentColor(color);
    localStorage.setItem("color", color);
  };

  const handleThemeToggle = (themeMode) => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", themeMode);
    setTheme(themeMode);
  };

  useEffect(() => {
    if (Object.keys(currentRecipent).length !== 0) {
      dispatch(
        fetchRoomMessagesListAsync({
          sender_id: user.id,
          reciever_id: currentRecipent.id,
        })
      );
    } else {
    }
  }, [currentRecipent]);

  useEffect(() => {
    setMessages(roomMesseges);
  }, [roomMesseges]);

  return (
    <ChatContext.Provider
      value={{
        currentColor,
        webSocket,
        setWebSocket,
        messages,
        setMessages,
        background,
        setBackground,
        handleColorChange,
        currentRecipent,
        setCurrentRecipent,
        showingDetails,
        setShowingDetails,
        setIsSettings,
        user,
      }}
    >
      <div className={`app ${theme === "dark" ? "dark-mode" : ""}`}>
        <div className="header">
          <div className="logo">
            <svg
              viewBox="0 0 513 513"
              fill={currentColor}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M256.025.05C117.67-2.678 3.184 107.038.025 245.383a240.703 240.703 0 0085.333 182.613v73.387c0 5.891 4.776 10.667 10.667 10.667a10.67 10.67 0 005.653-1.621l59.456-37.141a264.142 264.142 0 0094.891 17.429c138.355 2.728 252.841-106.988 256-245.333C508.866 107.038 394.38-2.678 256.025.05z" />
              <path
                d="M330.518 131.099l-213.825 130.08c-7.387 4.494-5.74 15.711 2.656 17.97l72.009 19.374a9.88 9.88 0 007.703-1.094l32.882-20.003-10.113 37.136a9.88 9.88 0 001.083 7.704l38.561 63.826c4.488 7.427 15.726 5.936 18.003-2.425l65.764-241.49c2.337-8.582-7.092-15.72-14.723-11.078zM266.44 356.177l-24.415-40.411 15.544-57.074c2.336-8.581-7.093-15.719-14.723-11.078l-50.536 30.744-45.592-12.266L319.616 160.91 266.44 356.177z"
                fill="#fff"
              />
            </svg>
          </div>

          <div className="user-settings">
            <div
              className="dark-light"
              title="Toggle Theme"
              onClick={() =>
                handleThemeToggle(theme === "light" ? "dark" : "light")
              }
            >
              <svg
                viewBox="0 0 24 24"
                stroke={currentColor}
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            </div>
            <div className="settings" title="logout" onClick={handleLogout}>
              <svg
                fill={currentColor}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M16 9v-4l8 7-8 7v-4h-8v-6h8zm-2 10v-.083c-1.178.685-2.542 1.083-4 1.083-4.411 0-8-3.589-8-8s3.589-8 8-8c1.458 0 2.822.398 4 1.083v-2.245c-1.226-.536-2.577-.838-4-.838-5.522 0-10 4.477-10 10s4.478 10 10 10c1.423 0 2.774-.302 4-.838v-2.162z" />
              </svg>
            </div>
            <div
              className="settings"
              title="settings"
              onClick={() => {
                setIsSettings(!isSettings);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke={currentColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </div>
            <img
              className="user-profile"
              src={
                user.thumbnail
                  ? user.thumbnail
                  : `https://ui-avatars.com/api/?name=${user.full_name}&font-size=0.43&background=FF6600&color=fff&format=svg`
              }
              alt=""
            />
          </div>
        </div>
        <div className="wrapper">
          <ContactList />
          {currentRecipent.id ? (
            <ChatView />
          ) : (
            <div className="chat-area">
              <div className="animated-text-container">
                <h1 className="animated-text" style={{color:currentColor}}>Welcome to Chat App!</h1>
                <img src="https://i.gifer.com/ZAbi.gif" />
              </div>
            </div>
          )}
          {isSettings && <ChatSettings />}
          {showingDetails && <ChatDetails />}
        </div>
      </div>
    </ChatContext.Provider>
  );
};
