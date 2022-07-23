export interface IChat {
  _id: string;
  senderId: string | any;
  receiverId: string | any;
  message: string;
  roomId: string | any;
  read: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface IRoom {
  _id: string;
  member1Id: string | any;
  member2Id: string | any;
  createdAt: number;
  updatedAt: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  createdAt: number;
  updatedAt: number;
}
