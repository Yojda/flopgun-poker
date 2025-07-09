import { getUserById } from '@/main/dao/userDAO';

export const fetchUserDetails = async (id: number) => {
  const user = await getUserById(id);
  if (!user) throw new Error("User not found");
  return user;
};
