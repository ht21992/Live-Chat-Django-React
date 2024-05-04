import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFirstErrorMessage } from "../utils/utils";
import toast from "react-hot-toast";


const initialState = {
  loading: true,
  friends_list : [],
  room_messages : []
};




export const updateMessageAsync = (MsgId,message,is_edited,is_read) => async (dispatch) =>{
  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  try{
    const body = JSON.stringify({message,is_edited,is_read});
    const res = await axios.post(`api/chat/update/${MsgId}/`, body, config);

    if (res.status === 200){

      dispatch(updateMessage(res.data));
    }
  }

  catch(error){
    toast.error(getFirstErrorMessage(error.response.data));
  }


}

export const deleteMessageAsync = (MsgId) => async (dispatch) =>{
  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  try{
    const res = await axios.delete(`api/chat/delete/${MsgId}/`, config);

    if (res.status === 200){

      dispatch(deleteMessage({"id":MsgId}));
    }
  }

  catch(error){
    toast.error(getFirstErrorMessage(error.response.data));
  }


}


// extra reducers

export const fetchFriendsListAsync = createAsyncThunk(
    "chat/fetchFriendsListAsync",
    async () => {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`api/user/users_list/`, config);
      return response.data;
    }
  );


export const fetchRoomMessagesListAsync = createAsyncThunk(
    "chat/fetchRoomMessagesListAsync",
    async ({sender_id,reciever_id}) => {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`api/chat/chat_list/${sender_id}/${reciever_id}`, config);
      return response.data;
    }
  );


// extra reducers


  const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {

      addMessage:(state,action) => {
        state.room_messages.push(action.payload);
      },

      updateMessage:(state,action) => {

        const roomMessages = state.room_messages;
        roomMessages.forEach((message) =>{


          if (message.id === action.payload.id) {
            message.is_read = action.payload.is_read;
            message.is_edited = action.payload.is_edited;
            message.message = action.payload.message;
          }

        })
        state.room_messages = [...roomMessages];
      },

      deleteMessage:(state,action) => {
        const roomMessages = state.room_messages;
        roomMessages.forEach((message,index) =>{

          if (message.id === action.payload.id) {
            roomMessages.splice(index, 1);

          }

        })
        state.room_messages = [...roomMessages];
      },
      updateReadStatus:(state,action) => {
        const roomMessages = state.room_messages;
        roomMessages.forEach((message,index) =>{

          if (message.id === action.payload) {
            message.is_read = true;

          }

        })
        state.room_messages = [...roomMessages];

      },

      updateUnreadCounter: (state,action) => {
        const frindsList = state.friends_list
        frindsList.forEach((friend) => {

          // Find the corresponding payload item based on sender__id matching friend.id
          const matchingPayload = action.payload.find((item) => item.sender__id === friend.id);

          // If a matching payload item is found, update the unread_messages_count
          if (matchingPayload) {
              friend.unread_messages_count = matchingPayload.count;
          }
      });

      state.friends_list = [...frindsList];
      }

    },
    extraReducers: (builder) => {
      builder.addCase(fetchFriendsListAsync.pending, (state, action) => {
        state.loading = true;
        state.friends_list = [];
      });
      builder.addCase(fetchFriendsListAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.friends_list = action.payload;
      });
      builder.addCase(fetchFriendsListAsync.rejected, (state, action) => {
        state.loading = false;
        state.friends_list = [];

      });

      builder.addCase(fetchRoomMessagesListAsync.pending, (state, action) => {
        state.loading = true;
        state.room_messages = [];
      });
      builder.addCase(fetchRoomMessagesListAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.room_messages = action.payload;
      });
      builder.addCase(fetchRoomMessagesListAsync.rejected, (state, action) => {
        state.loading = false;
        state.room_messages = [];

      });
    },
  });

  export const {updateUnreadCounter,updateReadStatus,updateMessage,deleteMessage,addMessage} = chatSlice.actions;
  export default chatSlice.reducer;