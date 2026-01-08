import axios from 'axios';
import Config from '../config.js';

export const screenClient = async (data) => {
  const response = await axios.post(`${Config.BASE_API_URL}/screen`, data);
  return response.data;
};

export const fetchReports = async () => {
  const response = await axios.get(`${Config.BASE_API_URL}/reports`);
  return response.data;
};
