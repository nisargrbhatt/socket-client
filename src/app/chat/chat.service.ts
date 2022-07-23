import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { IChat, IRoom, IUser } from './chat';

const BACKEND_URL = environment.apiUrls;
const BACKEND_API_URL = environment.apiUrls + '/api/v1/';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;

  private userId = '';

  private chats: IChat[] = [];
  private rooms: IRoom[] = [];
  private roomId: string = '';
  private typing: { userId: string; typing: boolean } = {
    userId: '',
    typing: false,
  };
  private userConnected = new Set<string>();

  private chatSubject = new BehaviorSubject<IChat[]>([]);
  private roomSubject = new BehaviorSubject<IRoom[]>([]);
  private roomIdSubject = new BehaviorSubject<string>('');
  private typingSubject = new BehaviorSubject<{
    userId: string;
    typing: boolean;
  }>({
    userId: '',
    typing: false,
  });
  private userConnectedSubject = new BehaviorSubject<string[]>([]);

  constructor(private http: HttpClient, private auth: AuthService) {
    this.userId = this.auth.getUserId();

    this.socket = io(BACKEND_URL);

    this.socket.on('user-connected', (...users) => {
      this.userConnected = new Set(users);
      this.userConnectedSubject.next([...this.userConnected]);
    });
    // this.socket.on('user-connected', (userId) => {
    //   this.userConnected.add(userId);
    //   this.userConnectedSubject.next([...this.userConnected]);
    // });

    this.socket.on('user-disconnect', (roomId, userId) => {
      this.userConnected.delete(userId);
      this.userConnectedSubject.next([...this.userConnected]);
    });

    this.socket.on('new-message', (message: IChat) => {
      this.chats.push(message);
      this.chatSubject.next([...this.chats]);
    });

    this.socket.on('user-typing-start', (userId) => {
      this.typing = {
        userId: userId,
        typing: true,
      };
      this.typingSubject.next({ ...this.typing });
    });

    this.socket.on('user-typing-stop', (userId) => {
      this.typing = {
        userId: userId,
        typing: false,
      };
      this.typingSubject.next({ ...this.typing });
    });

    this.socket.on('user-message-read', (chatId) => {
      let mappedChats = this.chats.map((chat) => {
        if (chat._id === chatId && chat.senderId === this.userId) {
          return {
            ...chat,
            read: true,
          };
        } else {
          return {
            ...chat,
          };
        }
      });

      this.chats = mappedChats;
      this.chatSubject.next([...this.chats]);
    });
  }

  connectToServer(userId: string) {
    this.socket = io(BACKEND_URL);
    this.userId = userId;
  }

  disconnectToServer() {
    this.socket.disconnect();
  }

  connectRoom(roomId: string) {
    this.userConnected.clear();
    this.userConnectedSubject.next([...this.userConnected]);
    this.socket.emit('join-room', roomId, this.userId);
  }

  leaveRoom() {
    this.socket.emit('disconnect-user');
  }

  typingStart() {
    this.socket.emit('typing-start');
  }

  typingStop() {
    this.socket.emit('typing-stop');
  }

  readMessage(chatId: string) {
    this.socket.emit('message-read', chatId);
  }

  sendMessage(senderId: string, receiverId: string, message: string) {
    this.socket.emit('message', senderId, receiverId, message);
  }

  get ChatObservable() {
    return this.chatSubject.asObservable();
  }

  get RoomObservable() {
    return this.roomSubject.asObservable();
  }

  get RoomIdObservable() {
    return this.roomIdSubject.asObservable();
  }

  get TypingObservable() {
    return this.typingSubject.asObservable();
  }

  get UserConnectedObservable() {
    return this.userConnectedSubject.asObservable();
  }

  get Chats() {
    return this.chats;
  }

  get Rooms() {
    return this.rooms;
  }

  get RoomId() {
    return this.roomId;
  }

  getRoomData(roomId: string): IRoom | undefined {
    return this.rooms.find((room) => room._id === roomId);
  }

  //* APIs
  getRoomChats(roomId: string) {
    this.http
      .get<{ message: string; chats: IChat[] }>(
        BACKEND_API_URL + 'chat/getroomchats',
        {
          params: {
            roomId: roomId,
          },
        }
      )
      .subscribe((response) => {
        console.log(response.message);
        this.roomId = roomId;
        this.roomIdSubject.next(this.roomId);

        this.chats = response.chats;
        this.chatSubject.next([...this.chats]);
      });
  }

  createRoom(body: { member1: string; member2: string }) {
    return this.http.post<{
      message: string;
      data: {
        room: IRoom;
        new: boolean;
      };
    }>(BACKEND_API_URL + 'room/createroom', body);
  }

  getMyRooms() {
    this.http
      .get<{ message: string; rooms: IRoom[] }>(
        BACKEND_API_URL + 'room/getmyrooms'
      )
      .subscribe((response) => {
        console.log(response.message);
        this.rooms = response.rooms;
        this.roomSubject.next([...this.rooms]);
      });
  }

  getUsersList() {
    return this.http.get<{ message: string; users: IUser[] }>(
      BACKEND_API_URL + 'user/users'
    );
  }
}
