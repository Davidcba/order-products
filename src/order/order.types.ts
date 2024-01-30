import { Types } from 'mongoose';

export type newProducts = {
  id: string | Types.ObjectId;
  action: 'add' | 'delete';
};
