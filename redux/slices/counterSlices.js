// redux/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: {},
  schools:[]
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
   
    userData: (state, action) => { state.user = action.payload }
  }
});

export const {  userData } = counterSlice.actions;

export default counterSlice.reducer;
