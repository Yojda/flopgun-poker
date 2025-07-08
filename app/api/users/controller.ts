import { fetchUserDetails } from '@/services/userService';

export const handleGetUser = async (id: number) => {
  return await fetchUserDetails(id);
};