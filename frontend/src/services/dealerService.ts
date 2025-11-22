import api from './api';
import { Dealer } from '../types/api';

export const getMyDealerProfile = async (): Promise<Dealer> => {
  const response = await api.dealerApi.get<Dealer>('/dealers/my-profile');
  return response.data;
};

export const getAllDealers = async (): Promise<Dealer[]> => {
  const response = await api.dealerApi.get<Dealer[]>('/dealers/admin/all');
  return response.data;
};
