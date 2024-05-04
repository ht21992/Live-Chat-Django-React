import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { ChatContext } from "../../context/chatContext";
import dateFormat from "dateformat";
import CustomContextMenu from "./CustomContextMenu";
import { useDispatch } from "react-redux";
import {
  updateUnreadCounter,
  updateReadStatus,
  updateMessageAsync,
  addMessage,
} from "../../slices/chatSlice";
import { toast } from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import { TextArea } from "../Inputs/TextArea";
import SVGIcon from "../SVGIcon/SVGIcon";
import Message from "./Message/Message";
const ChatView = () => {





  // Emoji

  const [showEmojiPopup, setShowEmojiPopup] = useState(false);

  // Emoji

  // context
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [clickedContextMsg, setClickedContextMsg] = useState({});

  const handleContextMenu = useCallback((e, message) => {
    e.preventDefault();
    const isOutsideChatMsgContent = !e.target.closest(".chat-msg-content");

    if (isOutsideChatMsgContent) {
      setContextMenuPosition({ x: 0, y: 0 });
      setClickedContextMsg({});
      return;
    }

    if (message) {
      // Set the position of the context menu
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setClickedContextMsg(message);
    }
  }, []);

  // context

  const [editMode, setEditMode] = useState(false);

  const dispatch = useDispatch();
  const {
    currentColor,
    webSocket,
    setWebSocket,
    messages,
    setMessages,
    background,
    currentRecipent,
    showingDetails,
    setShowingDetails,
    user,
  } = useContext(ChatContext);

  // first unread message
  let unreadDisplayed = false;

  // first unread message

  const lastReadMessageRef = useRef(null);

  // Find the index of the last message with is_read as true
  useEffect(() => {
    const seventhLastIndex = messages.findIndex(message => !message.is_read && message.sender.id != user.id) - 7;

    if (seventhLastIndex >= 0) {
      // Set the ref to the DOM element of the last 'is_read' message

      lastReadMessageRef.current = document.querySelector(`.msg-container[data-message-id="${messages[seventhLastIndex].id}"]`);
      // Scroll to the last 'is_read' message element after rendering
      if (lastReadMessageRef.current) {
        lastReadMessageRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }

    else{


        const lastMessage = [...messages].pop();
        if(lastMessage){


        lastReadMessageRef.current = document.querySelector(`.msg-container[data-message-id="${lastMessage.id}"]`);
        if (lastReadMessageRef.current) {
          lastReadMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }


  }, [messages]);



  // first unread message

  // update unread indicator
  const [unreadCounter, SetUnreadCounter] = useState(0);

  useEffect(() => {
    SetUnreadCounter(currentRecipent.unread_messages_count);
  }, [currentRecipent]);

  // updae unread indicator

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState({ isTyping: false, text: "" });
  let lastDisplayedDate = "";

  // read functionality

  const chatContainerRef = useRef(null);

  const handleScroll = () => {
    const chatContainer = chatContainerRef.current;

    if (chatContainer) {
      const chatContainerRect = chatContainer.getBoundingClientRect();
      const visibleMessages = Array.from(
        chatContainer.querySelectorAll(".msg-container")
      );

      visibleMessages.forEach((msgElement) => {
        const msgRect = msgElement.getBoundingClientRect();
        const messageId = msgElement.getAttribute("data-message-id");

        if (
          msgRect.top >= chatContainerRect.top &&
          msgRect.bottom <= chatContainerRect.bottom
        ) {
          const currentMsg = messages.find((msg) => msg.id == messageId);

          if (!currentMsg.is_read && currentMsg.sender.id != user.id) {
            // Mark message as read and update local state
            webSocket.send(
              JSON.stringify({
                message_read: messageId,
                sender: user,
                recipient: currentRecipent,
              })
            );
          }
        }
      });
    }
  };

  const ShowLastesTMessages = () => {
    const result = messages.filter((msg) => !msg.is_read).pop();
    if (result) {
      const messageContainer = document.querySelector(
        `.msg-container[data-message-id="${result.id}"]`
      );
      if (messageContainer) {
        messageContainer.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  useEffect(() => {
    handleScroll();
    const chatContainer = chatContainerRef.current;
    chatContainer.addEventListener("scroll", handleScroll);

    return () => {
      chatContainer.removeEventListener("scroll", handleScroll);
    };
  }, [messages]);

  //  read functionality

  const handleMessageChange = (e) => {
    if (webSocket.readyState === 1) {
      setMessage(e.target.value);
      webSocket.send(JSON.stringify({ typing: true, sender: user }));
    } else if (webSocket.readyState === 3) {
      const token = localStorage.getItem("token");
      const ws = new WebSocket(
        `ws://127.0.0.1:8000/ws/chat/${currentRecipent.id}/?token=${token}`
      );
      setWebSocket(ws);
    }
  };

  const handleOnKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      if (editMode) {
        handleEditMessage();
        setEditMode(false);
      } else {
        sendMessage();
      }
    }
  };

  const sendMessage = () => {
    if (message.trim() !== "") {
      const messageData = JSON.stringify({
        message,
        sender: user,
        recipient: currentRecipent,
      });
      webSocket.send(messageData);
      setMessage("");
    }
  };

  useEffect(() => {
    if (webSocket) {
      webSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.read_msg) {
          dispatch(
            updateUnreadCounter([
              { sender__id: currentRecipent.id, count: data.unread_counter },
            ])
          );
          dispatch(updateReadStatus(data.msg_id));
          SetUnreadCounter(data.unread_counter);
        }

        if (data.typing) {
          setIsTyping({ isTyping: true, text: data.text });
          setTimeout(() => setIsTyping({ isTyping: false, text: "" }), 2000);
        }
        if (data.message) {
          console.log(data.unread_count_list);
          dispatch(updateUnreadCounter(data.unread_count_list));
          setMessages((prevMessages) => [...prevMessages, data.message]);
          dispatch(addMessage(data.message));
        }
      };
    }

    // Clean up WebSocket event listener on component unmount
    return () => {
      if (webSocket) {
        webSocket.onmessage = null;
      }
    };
  }, [webSocket]);


  const getDateFragment = (messageDate) => {
    const formattedDate = dateFormat(messageDate, "dddd, mmmm dS, yyyy");

    if (formattedDate !== lastDisplayedDate) {
      lastDisplayedDate = formattedDate;
      return (
        <div className="date-container">
          <span>{formattedDate}</span>
        </div>
      );
    }

    return null;
  };

  const handleEditMessage = () => {
    dispatch(
      updateMessageAsync(
        clickedContextMsg.id,
        message,
        true,
        clickedContextMsg.is_read
      )
    )
      .then(() => {
        setEditMode(false);
        setMessage("");
        toast.success("Message Edited");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Sth went wrong");
      });
  };

  return (
    <div
      className="chat-area"
      ref={chatContainerRef}
      onScroll={(e) => {
        e.preventDefault();
        handleContextMenu(e, "");
      }}
    >
      <div
        className="chat-area-header"
        style={{
          borderBottom: `2px solid ${currentColor}`,
          boxShadow: `3px 1px 1px ${currentColor}`,
        }}
        onClick={() => setShowingDetails(!showingDetails)}
      >
        <div className="chat-area-title">
          <b style={{ margin: "0px", fontSize: "14px" }}>
            {currentRecipent.full_name}
          </b>
          {isTyping.isTyping ? (
            <p style={{ fontSize: "10px", color: currentColor }}>
              {isTyping.text}...
            </p>
          ) : (
            <>
              {currentRecipent.online ? (
                <p className="online" style={{ margin: "0px" }}>
                  <small style={{ fontSize: "10px" }}>Online</small>
                </p>
              ) : (
                <p style={{ margin: "0px" }}>
                  <small style={{ fontSize: "10px" }}>
                    {currentRecipent.last_seen
                      ? currentRecipent.last_seen
                      : "long time ago"}
                  </small>
                </p>
              )}
            </>
          )}
        </div>
        <div className="chat-area-group">
          <img
            className="chat-area-profile"
            src={
              currentRecipent.thumbnail
                ? currentRecipent.thumbnail
                : `https://ui-avatars.com/api/?name=${currentRecipent.full_name}&font-size=0.43&background=FF6600&color=fff&format=svg`
            }
            alt=""
          />
          {/* <span>+4</span> */}
        </div>
      </div>
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          handleContextMenu(e, "");
        }}
        onClick={(e) => {
          e.preventDefault();
          handleContextMenu(e, "");
        }}
        className="chat-area-main "
        style={{
          backgroundSize: "contain",
          backgroundImage: `url(${background})`,
        }}
      >
        {messages.length > 0 ? (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className="msg-container"
                data-message-id={message.id}
                ref={message.is_read ? lastReadMessageRef : null}
              >
                {/* Check if the message is unread and display "Unread Messages" once */}
                {!unreadDisplayed && !message.is_read && message.sender.id != user.id &&  (

                    <div id="firstUnreadMessage" className="date-container">
                    <span>Unread Messages </span>
                  </div>
                )}


                {/* {!startChatIndex  && setStartChat(message.id, message.is_read)} */}
                {getDateFragment(message.timestamp)}

                {parseInt(message.sender.id) === parseInt(user.id) ? (
                  <Message
                    message={message}
                    user={user}
                    color={currentColor}
                    handleContextMenu={handleContextMenu}
                    isOwner={true}
                  />
                ) : (
                  <Message
                    message={message}
                    user={currentRecipent}
                    color={currentColor}
                    handleContextMenu={handleContextMenu}
                  />
                )}

                {/* Update the flag once an unread message is displayed */}
                {!unreadDisplayed && !message.is_read && (unreadDisplayed = true)}
              </div>
            ))}{" "}

            {isTyping.isTyping && (
            <div className="chat-bubble">
              <div className="typing">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>)}

          </>
        ) : (
          <div className="empty-container">
            {" "}
            <p style={{ backgroundColor: currentColor }}>No Message</p>
          </div>
        )}
      </div>

      <div className="chat-area-footer">
        {editMode && (
          <small style={{ marginLeft: "10px", color: currentColor }}>
            Edit Mode
          </small>
        )}
        <TextArea
          placeholder="Type something here..."
          value={message}
          onChange={(e) => {
            handleMessageChange(e);
            setShowEmojiPopup(false);
          }}
          onKeyDown={(e) => handleOnKeyDown(e)}
        />
        {editMode ? (
          <>
            <SVGIcon
              title="Confirm Edit"
              onClick={() => handleEditMessage()}
              icon="M4 12.6111L8.92308 17.5L20 6.5"
              width={24}
              height={24}
              color="none"
              stroke="#45B8AC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            />
            <SVGIcon
              onClick={() => {
                setEditMode(false);
                setMessage("");
              }}
              title="Cancel Edit"
              icon=""
              width={16}
              height={16}
              color="none"
              stroke="red"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path
                d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </SVGIcon>
          </>
        ) : (
          <>
            <SVGIcon
              onClick={() => {
                sendMessage();
              }}
              title="Send Message"
              icon=""
              width={24}
              height={24}
              color="none"
              stroke={currentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </SVGIcon>

            <SVGIcon
              onClick={() => setShowEmojiPopup(!showEmojiPopup)}
              title={!showEmojiPopup ? "Show Emoji Box" : "Hide Emoji Box"}
              icon=""
              width={24}
              height={24}
              color="none"
              stroke={currentColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              className="feather feather-smile"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
            </SVGIcon>
            {/*
            <SVGIcon
              title="Like"
              width={24}
              height={24}
              color="none"
              stroke={currentColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              icon="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
            /> */}
          </>
        )}
      </div>

      <div className="emoji-popup-container">
        {showEmojiPopup && (
          <EmojiPicker
            skinTonesDisabled={true}
            onEmojiClick={(emoji) =>
              setMessage((prevMessage) =>
                prevMessage === ""
                  ? emoji.emoji
                  : `${prevMessage} ${emoji.emoji}`
              )
            }
          />
        )}
      </div>

      {unreadCounter > 0 && (
        <span
          onClick={() => ShowLastesTMessages()}
          className="unreads-indicator"
        >
          +{unreadCounter < 100 ? unreadCounter: 99}
        </span>
      )}
      {/* Render custom context menu if contextMenuPosition is set */}
      {contextMenuPosition.x !== 0 && contextMenuPosition.y !== 0 && (
        <CustomContextMenu
          position={contextMenuPosition}
          setContextMenuPosition={setContextMenuPosition}
          contextValue={clickedContextMsg}
          setInput={setMessage}
          setEditMode={setEditMode}
        />
      )}
    </div>
  );
};

export default ChatView;
