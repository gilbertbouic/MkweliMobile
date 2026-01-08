import axios from 'axios';
import { screenClient, fetchReports } from '../src/services/apiService';
import Config from '../src/config.js';

// Mock axios
jest.mock('axios');

describe('API Service Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('screenClient', () => {
    it('should successfully post data and return response', async () => {
      // Arrange
      const mockData = { userId: '123', screenType: 'mental-health' };
      const mockResponse = {
        data: {
          success: true,
          message: 'Screening completed successfully',
          result: {
            score: 85,
            recommendation: 'Consult with a professional'
          }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await screenClient(mockData);

      // Assert
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        `${Config.BASE_API_URL}/screen`,
        mockData
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle failed response', async () => {
      // Arrange
      const mockData = { userId: '123', screenType: 'mental-health' };
      const mockError = new Error('Network Error');
      mockError.response = {
        status: 500,
        data: { error: 'Internal Server Error' }
      };
      axios.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(screenClient(mockData)).rejects.toThrow('Network Error');
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        `${Config.BASE_API_URL}/screen`,
        mockData
      );
    });

    it('should handle failed response with 400 status', async () => {
      // Arrange
      const mockData = { userId: '', screenType: 'invalid' };
      const mockError = new Error('Bad Request');
      mockError.response = {
        status: 400,
        data: { error: 'Invalid data provided' }
      };
      axios.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(screenClient(mockData)).rejects.toThrow('Bad Request');
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('should handle network timeout error', async () => {
      // Arrange
      const mockData = { userId: '123', screenType: 'mental-health' };
      const mockError = new Error('timeout of 5000ms exceeded');
      axios.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(screenClient(mockData)).rejects.toThrow('timeout of 5000ms exceeded');
      expect(axios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchReports', () => {
    it('should successfully fetch reports', async () => {
      // Arrange
      const mockResponse = {
        data: {
          success: true,
          reports: [
            {
              id: 1,
              title: 'Mental Health Report',
              date: '2024-01-01',
              status: 'completed'
            },
            {
              id: 2,
              title: 'Wellness Check',
              date: '2024-01-15',
              status: 'pending'
            }
          ]
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await fetchReports();

      // Assert
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(`${Config.BASE_API_URL}/reports`);
      expect(result).toEqual(mockResponse.data);
      expect(result.reports).toHaveLength(2);
    });

    it('should return empty reports array when successful but no data', async () => {
      // Arrange
      const mockResponse = {
        data: {
          success: true,
          reports: []
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await fetchReports();

      // Assert
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(result.reports).toEqual([]);
    });

    it('should handle failed response for fetchReports', async () => {
      // Arrange
      const mockError = new Error('Failed to fetch reports');
      mockError.response = {
        status: 404,
        data: { error: 'Reports not found' }
      };
      axios.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(fetchReports()).rejects.toThrow('Failed to fetch reports');
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(`${Config.BASE_API_URL}/reports`);
    });
  });
});
