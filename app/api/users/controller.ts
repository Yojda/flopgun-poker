import { fetchUserDetails } from '@/main/services/userService';

export const handleGetUser = async (id: number) => {
  return await fetchUserDetails(id);
};