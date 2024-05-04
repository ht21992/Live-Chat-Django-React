import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriendsListAsync } from "../../slices/chatSlice";
import { ChatContext } from "../../context/chatContext";
import Contact from "./Contact";
import { Input } from "../Inputs/Input";
import Button from "../Button/Button";
const ContactList = () => {
  const {
    currentColor,
    setWebSocket,
    webSocket,
    setMessages,
    currentRecipent,
    setCurrentRecipent,
  } = useContext(ChatContext);

  const friendsList = useSelector((state) => state.chat.friends_list);
  const [friends, setFriends] = useState([]);
  const chat_loading = useSelector((state) => state.chat.loading);
  const dispatch = useDispatch();

  const handleSearchContact = (e) => {
    if (e.target.value === "") {
      setFriends(friendsList);
      return;
    }
    setFriends(
      friends.filter((friend) => friend.full_name.toLowerCase().includes(e.target.value.toLowerCase()))
    );
  };

  // Periodically fetch friends list if WebSocket is inactive
  useEffect(() => {
    const fetchFriends = () => {
      dispatch(fetchFriendsListAsync());
    };

    // Fetch friends list initially
    fetchFriends();

    // Set interval to fetch friends list every 20 seconds if WebSocket is inactive
    const intervalId = setInterval(() => {
      // if (!webSocket) {
      //   fetchFriends();
      // }
      fetchFriends();
    }, 20000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [dispatch, webSocket]);

  const connectToFriend = (friend) => {
    if (currentRecipent.id === friend.id) return;
    const token = localStorage.getItem("token");
    if (webSocket) {
      webSocket.close();
    }
    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${friend.id}/?token=${token}`
    );
    setWebSocket(ws);
    setCurrentRecipent(friend);
    setMessages([]);
  };

  useEffect(() => {
    setFriends(friendsList);
  }, [friendsList]);

  return (
    <div className="conversation-area">
      <div className="search-bar">
        <Input
          placeholder="Search..."
          onChange={(e) => handleSearchContact(e)}
        />
      </div>

      {!chat_loading && friends.length > 0 ? (
        <>
          {friends.map((friend, index) => (
            <Contact
              key={index}
              friend={friend}
              currentColor={currentColor}
              connectToFriend={connectToFriend}
              currentRecipent={currentRecipent}
            />
          ))}
        </>
      ) : chat_loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="empty-container">
          {" "}
          <p style={{ backgroundColor: currentColor, fontSize: "10px" }}>
            Nothing Found
          </p>
        </div>
      )}

      <div className="overlay"></div>
    </div>
  );
};

export default ContactList;
