import React, { useContext, useState, useEffect } from "react";
import { ChatContext } from "../../context/chatContext";
import InputMaker from "../InputMaker/InputMaker";
import { useDispatch } from "react-redux";
import { updateUserAsync, updateAvatarAsync } from "../../slices/authSlice";
import { toast } from "react-hot-toast";
import SVGIcon from "../SVGIcon/SVGIcon";
const ChatSettings = () => {
  const dispatch = useDispatch();
  const [showFullNameEditor, setShowFullNameEditor] = useState(false);
  const [showBioEditor, setShowBioEditor] = useState(false);

  const backGroundsArray = [
    "https://ui-avatars.com/api/?name=No&font-size=0.21&background=ccc&color=fff&format=svg",
    "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2168&q=80",
    "https://images.unsplash.com/photo-1516085216930-c93a002a8b01?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80",
    "https://images.unsplash.com/photo-1458819714733-e5ab3d536722?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=933&q=80",
    "https://t3.ftcdn.net/jpg/02/90/89/76/360_F_290897614_7RdAsk2GmumcGWZ2qklmV74hKlNmznSx.jpg",
    "https://e1.pxfuel.com/desktop-wallpaper/97/437/desktop-wallpaper-chat-themes-for-whatsapp-wechat-and-telegram-app-theme-red.jpg",
    "https://png.pngtree.com/thumb_back/fh260/background/20210902/pngtree-comic-dialog-chat-dialog-image_785782.jpg",
    "https://repository-images.githubusercontent.com/276388704/eb978200-fe82-11ea-9259-ef8e06646d61",
    "https://e0.pxfuel.com/wallpapers/497/150/desktop-wallpaper-hopped-the-original-background-if-you-want-to-use-whatsapp-dark-mode-go-to-settings-chats-background-and-use-this-r-whatsapp.jpg",
    "https://wallpapers.com/images/featured/whatsapp-chat-rmzlyx15fhausbaf.jpg",
    "https://wallpapers.com/images/hd/fun-chat-app-stickers-pattern-a7mhh6ay9qqcpyfh.jpg",
    "https://t3.ftcdn.net/jpg/03/27/51/56/360_F_327515607_Hcps04aaEc7Ki43d1XZPxwcv0ZaIaorh.jpg",
  ];

  const {
    currentColor,
    handleColorChange,
    setBackground,
    setIsSettings,
    user,
  } = useContext(ChatContext);

  const onUpdateUser = (full_name, bio) => {
    dispatch(updateUserAsync({ full_name, bio }));
  };

  const handleImageChanged = (e) => {
    e.preventDefault();
    const avatarImage = e.target.files[0];
    const fileSize = avatarImage.size / 1024 / 1024;

    if (fileSize > 1) {
      toast.error("Image size exceeds 1 MB");
      return;
    }

    if (
      ["png", "jpg", "jpeg", "webp", "jfif"].includes(
        avatarImage.name.split(".").pop()
      )
    ) {
      const uploadData = new FormData();

      uploadData.append("thumbnail", avatarImage, avatarImage.name);

      dispatch(updateAvatarAsync(uploadData));
    } else {
      toast.error("Please upload an image with valid format");
    }
  };

  return (
    <div className="detail-area">
      <div
        className="settings"
        title="settings"
        onClick={() => setIsSettings(false)}
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
          <div className="image-upload">
            <label htmlFor="file-input">
              <img
                className="user-profile input-avatar"
                src={
                  user.thumbnail
                    ? user.thumbnail
                    : `https://ui-avatars.com/api/?name=${user.full_name}&font-size=0.43&background=FF6600&color=fff&format=svg`
                }
                alt=""
                style={{ width: "60px", height: "60px" }}
              />
            </label>
            <input
              id="file-input"
              type="file"
              extra_style={{ display: "none" }}
              accept=".png, .jpg, .jpeg, .webp, .jfif"
              onChange={(e) => handleImageChanged(e)}
            />
          </div>
        </div>
        <div
          className="detail-title"
          style={{ color: currentColor, cursor: "pointer" }}
        >
          {user && (
            <>
              {" "}
              <InputMaker
                value={user.full_name}
                handleChange={(newValue) => {
                  newValue.trim().length > 0 &&
                    onUpdateUser(newValue.trim(), user.bio);
                }}
                handleDoubleClick={() => setShowFullNameEditor(true)}
                handleBlur={() => setShowFullNameEditor(false)}
                showInputElement={showFullNameEditor}
                styles={{ fontSize: "24px", fontWeight: "bolder" }}
                buttonValue="Edit Full Name"
                buttonBgcolor={currentColor}
                icon={
                  <SVGIcon
                    icon="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"
                    stroke={currentColor}
                    fill={currentColor}
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                  />
                }
              />
            </>
          )}{" "}
        </div>
        <div
          className="detail-subtitle"
          style={{ color: currentColor, cursor: "pointer" }}
        >
          <InputMaker
            value={user.bio}
            handleChange={(newValue) => {
              newValue.trim().length > 0 &&
                onUpdateUser(user.full_name, newValue.trim());
            }}
            handleDoubleClick={() => setShowBioEditor(true)}
            handleBlur={() => setShowBioEditor(false)}
            showInputElement={showBioEditor}
            styles={{ fontSize: "24px", fontWeight: "bolder" }}
            buttonValue="Edit Bio"
            buttonBgcolor={currentColor}
            icon={
              <SVGIcon
                icon="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"
                stroke={currentColor}
                fill={currentColor}
                width={10}
                height={10}
                viewBox="0 0 24 24"
              />
            }
          />
        </div>
      </div>
      <div className="detail-changes">
        <div className="detail-change">
          Change Color
          <div className="colors">
            <div
              className={`color  blue ${
                currentColor === "#387ADF" ? "selected" : ""
              }`}
              onClick={() => handleColorChange("#387ADF")}
            ></div>
            <div
              className={`color purple ${
                currentColor === "#5B5EA6" ? "selected" : ""
              }`}
              onClick={() => handleColorChange("#5B5EA6")}
            ></div>
            <div
              className={`color green ${
                currentColor === "#009B77" ? "selected" : ""
              }`}
              onClick={() => handleColorChange("#009B77")}
            ></div>
            <div
              className={`color orange ${
                currentColor === "#FBA834" ? "selected" : ""
              }`}
              onClick={() => handleColorChange("#FBA834")}
            ></div>
            <div
              className={`color pink ${
                currentColor === "#C3447A" ? "selected" : ""
              }`}
              onClick={() => handleColorChange("#C3447A")}
            ></div>
          </div>
        </div>
      </div>
      <div className="detail-photos">
        <div className="view-more" style={{ color: currentColor }}>
          Set Background
        </div>
        <div className="detail-photo-grid">
          {backGroundsArray.map((bg, index) => (
            <img
              key={index}
              onClick={() => {
                setBackground(index === 0 ? "" : bg);
                localStorage.setItem("background", index === 0 ? "" : bg)
              }}
              src={bg}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSettings;
