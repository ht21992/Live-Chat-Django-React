import React, { useContext, useState } from "react";
import { ChatContext } from "../../context/chatContext";
import dateFormat from "dateformat";
import { Input } from "../Inputs/Input";
import SVGIcon from "../SVGIcon/SVGIcon";
const ChatDetails = () => {
  const {
    messages,
    currentColor,
    currentRecipent,
    setShowingDetails,
  } = useContext(ChatContext);

  const [searchedMessages, setSearchedMessages] = useState([]);


  function handleScroll(messageIdToScrollTo) {
      const messageContainer = document.querySelector(`.msg-container[data-message-id="${messageIdToScrollTo}"]`);
      if (messageContainer) {
          messageContainer.scrollIntoView({ behavior: 'smooth',block: 'center'});
      }
  }

  const handleSearchInOneRoom = (e) => {
    setSearchedMessages(
      messages.filter((message) => {
        return message.message
          .toLowerCase()
          .includes(e.target.value.toLowerCase());
      })
    );
  };

  return (
    <div className="detail-area">
      <div
        className="settings"
        title="settings"
        onClick={() => setShowingDetails(false)}
      >

          <SVGIcon

              title={"Close window"}
              icon="M 7.71875 6.28125 L 6.28125 7.71875 L 23.5625 25 L 6.28125 42.28125 L 7.71875 43.71875 L 25 26.4375 L 42.28125 43.71875 L 43.71875 42.28125 L 26.4375 25 L 43.71875 7.71875 L 42.28125 6.28125 L 25 23.5625 Z"
              width={15}
              height={15}
              color="none"
              stroke={currentColor}
              strokeWidth="5.5"
              viewBox="0 0 50 50"
            />
      </div>
      <div className="detail-area-header">
        <div className="msg-profile">
          <img
            className="user-profile"
            src={
              currentRecipent.thumbnail
                ? currentRecipent.thumbnail
                : `https://ui-avatars.com/api/?name=${currentRecipent.full_name}&font-size=0.43&background=FF6600&color=fff&format=svg`
            }
            alt=""
            style={{ width: "55px", height: "55px" }}
          />
        </div>
        <div className="detail-title " style={{ color: currentColor }}>
          {currentRecipent && <>{currentRecipent.full_name}</>}{" "}
        </div>
        <div className="detail-subtitle">{currentRecipent.bio}</div>
      </div>
      <div className="detail-changes">
        <Input type="text" placeholder="Search in Conversation"  className="search-icon" onChange={(e) => handleSearchInOneRoom(e)}  />
      </div>
      {searchedMessages &&
        searchedMessages.map((fMsg) => (
          <div className="chat-search-container" onClick={() => handleScroll(fMsg.id)} >
            <p >
              {fMsg.message.slice(0, 20)}
              {fMsg.message.length > 20 && "..."}
            </p>
            <small >
              {fMsg.sender.full_name}{" "}
            </small>
            <small >
              {dateFormat(fMsg.timestamp, "dddd, mmmm dS, yyyy h:MM TT")}
            </small>
          </div>
        ))}
    </div>
  );
};

export default ChatDetails;
