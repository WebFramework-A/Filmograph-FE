import axios from "axios";

const axiosKobisInstance = axios.create({
  baseURL: import.meta.env.VITE_KOBIS_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosKobisInstance;
