import axios from "axios";

const API_ADDRESS = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({ baseURL: API_ADDRESS });

const userId = localStorage.getItem("userId");

const defaultConfig = { headers: { userId } };

const httpCallers = {
  get: async (path: string) => {
    return await axiosInstance.get(path, defaultConfig);
  },
  post: async <T>(path: string, data?: T) => {
    return await axiosInstance.post(path, data, defaultConfig);
  },
  put: async <T>(path: string, data?: T) => {
    return await axiosInstance.put(path, data, defaultConfig);
  },
  patch: async <T>(path: string, data?: T) => {
    return await axiosInstance.patch(path, data, defaultConfig);
  },
  delete: async (path: string) => {
    return await axiosInstance.delete(path, defaultConfig);
  }
};

export default httpCallers;