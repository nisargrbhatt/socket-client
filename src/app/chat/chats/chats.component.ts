import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ScrollToBottomDirective } from 'src/app/directives/scroll-to-bottom.directive';
import { SubSink } from 'subsink';
import { IChat, IRoom } from '../chat';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
})
export class ChatsComponent implements OnInit, OnDestroy {
  @ViewChild(ScrollToBottomDirective) scroll:
    | ScrollToBottomDirective
    | undefined;

  private subs = new SubSink();

  chats: IChat[] = [];
  currentRoomId = '';
  currentRoomData: IRoom | undefined;
  paramRoomId = '';
  typing: { userId: string; typing: boolean } = {
    userId: '',
    typing: false,
  };

  userId = '';
  senderId = '';
  senderData: any;
  receiverId = '';
  receiverData: any;

  userMessage: string = '';

  typingBool = false;
  time: any;

  userConnected: string[] = [];

  constructor(
    private auth: AuthService,
    private chat: ChatService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.subs.sink = this.auth
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        if (authStatus) {
          this.userId = this.auth.getUserId();
        } else {
          this.router.navigate(['/login']);
        }
      });

    this.subs.sink = this.chat.ChatObservable.subscribe((chats) => {
      this.chats = chats;
    });

    this.subs.sink = this.chat.RoomIdObservable.subscribe((roomId) => {
      this.currentRoomId = roomId;
    });

    this.subs.sink = this.chat.TypingObservable.subscribe((typingObj) => {
      this.typing = typingObj;
    });

    this.subs.sink = this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('roomId')) {
        this.paramRoomId = paramMap.get('roomId') as string;
      }
    });

    this.subs.sink = this.chat.UserConnectedObservable.subscribe((users) => {
      this.userConnected = users;
    });
  }

  ngOnInit(): void {
    this.chat.connectRoom(this.paramRoomId);
    this.chat.getRoomChats(this.paramRoomId);
    this.currentRoomData = this.chat.getRoomData(this.paramRoomId);
    if (
      this.currentRoomData?.member1Id?._id === this.userId &&
      this.currentRoomData?.member2Id?._id !== this.userId
    ) {
      this.senderId = this.currentRoomData?.member1Id?._id;
      this.senderData = this.currentRoomData?.member1Id;
      this.receiverId = this.currentRoomData?.member2Id?._id;
      this.receiverData = this.currentRoomData?.member2Id;
    } else {
      this.senderId = this.currentRoomData?.member2Id?._id;
      this.senderData = this.currentRoomData?.member2Id;
      this.receiverId = this.currentRoomData?.member1Id?._id;
      this.receiverData = this.currentRoomData?.member1Id;
    }
    if (!this.currentRoomData) {
      this.router.navigate(['/rooms']);
    }
  }

  onMessage() {
    if (this.userMessage.trim().length > 0) {
      this.chat.sendMessage(this.senderId, this.receiverId, this.userMessage);
      this.userMessage = '';
    } else {
      return;
    }
  }

  sentByMe(chat: IChat): boolean {
    if (typeof chat.senderId === 'string') {
      if (chat.senderId === this.userId) {
        return true;
      } else {
        return false;
      }
    }
    if (typeof chat.senderId === 'object') {
      if (chat.senderId._id === this.userId) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  enterKeyLocate(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onMessage();
    }
  }

  typingstopped() {
    this.typingBool = false;
    this.chat.typingStop();
  }

  onKeyDown() {
    if (this.typingBool === false) {
      this.typingBool = true;
      this.chat.typingStart();
      this.time = setTimeout(() => {
        this.typingstopped();
      }, 500);
    } else {
      clearTimeout(this.time);
      this.time = setTimeout(() => {
        this.typingstopped();
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.chat.leaveRoom();
    this.subs.unsubscribe();
  }
}
