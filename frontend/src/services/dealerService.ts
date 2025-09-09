import api from './api';
import { Dealer } from '../types/api';

export const getMyDealerProfile = async (): Promise<Dealer> => {
  const response = await api.dealerApi.get<Dealer>('/dealers/my-profile');
  return response.data;
};
