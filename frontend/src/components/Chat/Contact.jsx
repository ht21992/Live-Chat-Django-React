import React, { memo } from "react";

const Contact = ({
  friend,
  connectToFriend,
  currentColor,
  currentRecipent,
}) => {

  return (
    <div
      onClick={() => connectToFriend(friend)}
      id={friend.id}
      title={!friend.online ? friend.last_seen : ""}
    >
      <div
        className={`msg ${friend.online && "online"} ${
          friend.id === currentRecipent.id && "active"
        }`}
      >
        <img
          className="msg-profile"
          src={
            friend.thumbnail
              ? friend.thumbnail
              : `https://ui-avatars.com/api/?name=${friend.full_name}&font-size=0.43&background=FF6600&color=fff&format=svg`
          }
          alt=""
        />
        <div className="msg-detail">
          <div className="msg-username" style={{ color: currentColor }}>
            {friend.full_name}{" "}
            {friend.unread_messages_count > 0 && (
              <span
                className="unread-msg-counter"
                style={{ backgroundColor: currentColor }}
              >
                {friend.unread_messages_count > 99
                  ? "+99"
                  : friend.unread_messages_count}
              </span>
            )}
          </div>
          <div className="msg-content">
            <span className="msg-message">{friend.last_message && friend.last_message.message}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Contact);
