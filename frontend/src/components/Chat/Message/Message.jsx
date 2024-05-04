import React, { memo } from "react";
import dateFormat from "dateformat";
import SVGIcon from "../../SVGIcon/SVGIcon";
const Message = ({
  message,
  user,
  color,
  handleContextMenu,
  isOwner = false,
}) => {
  return (
    <div>
      <div className={`chat-msg ${isOwner && "owner"}`}>
        <div className="chat-msg-profile">
          <img
            className="chat-msg-img"
            src={
              user.thumbnail
                ? user.thumbnail
                : `https://ui-avatars.com/api/?name=${user.full_name}&font-size=0.43&background=FF6600&color=fff&format=svg`
            }
            alt=""
          />

          <div
            className="chat-msg-date"
            style={{ color: isOwner ? color : "" }}
          >
            {isOwner && (<span style={{ margin: "3px 3px", verticalAlign: "middle" }}>
              {message.is_read ? (
                <SVGIcon
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="#009B77"
                  icon="M20.169,5.243l-10,9a1,1,0,0,1-1.376-.036l-5-5A1,1,0,1,1,5.207,7.793l4.329,4.329,9.3-8.365a1,1,0,1,1,1.338,1.486ZM18.831,9.757,9.536,18.122,5.207,13.793a1,1,0,0,0-1.414,1.414l5,5a1,1,0,0,0,1.376.036l10-9a1,1,0,0,0-1.338-1.486Z"
                />
              ) : (
                <SVGIcon
                  strokeLinejoin="round"
                  strokeMiterlimit="2"
                  clipRule="evenodd"
                  fillRule="evenodd"
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="#009B77"
                  icon="m2.25 12.321 7.27 6.491c.143.127.321.19.499.19.206 0 .41-.084.559-.249l11.23-12.501c.129-.143.192-.321.192-.5 0-.419-.338-.75-.749-.75-.206 0-.411.084-.559.249l-10.731 11.945-6.711-5.994c-.144-.127-.322-.19-.5-.19-.417 0-.75.336-.75.749 0 .206.084.412.25.56"
                />
              )}{" "}
            </span>) }



            {dateFormat(message.timestamp, "h:MM TT")}
            {message.is_edited && (
              <small style={{ marginLeft: "5px" }}>Edited</small>
            )}
          </div>
        </div>
        <div
          className="chat-msg-content"
          onContextMenu={(e) => handleContextMenu(e, message)}
        >
          <div
            className="chat-msg-text"
            style={{
              backgroundColor: isOwner ? color : "",
              color: isOwner ? "white" : "",
            }}
          >
            {message.message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Message);
