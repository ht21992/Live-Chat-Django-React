import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFirstErrorMessage } from "../utils/utils";
import toast from "react-hot-toast";


const initialState = {
  isAuthenticated: false,
  loading: true,
  user: {},
  friends_list : []
};




export const updateAvatarAsync = createAsyncThunk(
  "auth/updateAvatarAsync",
  async (avatarData) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
    return axios
      .post("/api/user/update_user/", avatarData, config)
      .then((response) => response.data);
  }
);


export const loginAsync = (email, password) => async (dispatch) => {
  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify(email, password);

  try {
    const res = await axios.post("/api/user/login/", body, config);

    if (res.status === 200) {
      dispatch(login(res.data));
      toast.success("Succesful Login");
    }
  } catch (error) {

    toast.error(getFirstErrorMessage(error.response.data));

  }
};

export const registerAsync = (email, password, full_name) => async (dispatch) => {
  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify(email, password, full_name);

  try {
    const res = await axios.post("/api/user/register/", body, config);

    if (res.status === 201) {
      toast.success("Succesful Register");
    }
  } catch (error) {
    console.log(error)

    toast.error(getFirstErrorMessage(error.response.data));

  }
};

export const isAuthenticatedAsync = (token) => async (dispatch) => {
  const user = localStorage.getItem("user");

  if (!user) {
    dispatch(logout());
    return;
  }

  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const res = await axios.get("/api/user/is_authenticated", config);

    if (res.status === 200) {
      if (res.data.is_authenticated) {
        dispatch(is_authenticated(user));
      } else {
        dispatch(logout());
      }
    }
  } catch (error) {
    toast.error(getFirstErrorMessage(error.response.data));
  }
};

export const logoutAsync = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    await axios.post("/api/user/logout/", null, config);
    dispatch(logout());
  } catch (error) {
    toast.error(getFirstErrorMessage(error.response.data));
  }
};






export const updateUserAsync = (full_name, bio) => async (dispatch) => {
  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const body = JSON.stringify(full_name, bio);


  try {
    const res = await axios.post("/api/user/update_user/", body, config);
    if (res.status === 200) {
      dispatch(updateUser(res.data));
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Succesfully Updated");
    }
    else{
      toast.error("Error updating user");
    }
  } catch (error) {
    toast.error(error.message);
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.loading = false;
      // set token in local storage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.user = {};
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    register: (state, action) => {
      // state.isAuthenticated = true;
      // state.user = action.payload.user;
      // state.loading = false;

    },
    is_authenticated: (state, action) => {
      state.isAuthenticated = true;
      state.user = JSON.parse(action.payload);
      state.loading = false;
    },
    updateUser : (state, action) =>{
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(updateAvatarAsync.pending, (state, action) => {
      // state.loading = true;
      // state.room_messages = [];

    });
    builder.addCase(updateAvatarAsync.fulfilled, (state, action) => {
      // state.loading = false;
      // state.room_messages = action.payload;
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    });
    builder.addCase(updateAvatarAsync.rejected, (state, action) => {
      // state.loading = false;
      // state.room_messages = [];

    });
  },
});

export const { login, logout, register,updateUser, is_authenticated } = authSlice.actions;
export default authSlice.reducer;
