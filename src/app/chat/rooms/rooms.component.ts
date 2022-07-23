import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { SubSink } from 'subsink';
import { IRoom } from '../chat';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
})
export class RoomsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  rooms: IRoom[] = [];
  userId: string = '';

  constructor(
    private auth: AuthService,
    private chat: ChatService,
    public router: Router
  ) {
    this.chat.getMyRooms();
  }

  ngOnInit(): void {
    this.subs.sink = this.auth
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        if (authStatus) {
          this.userId = this.auth.getUserId();
        } else {
          this.router.navigate(['/login']);
        }
      });

    this.subs.sink = this.chat.RoomObservable.subscribe((rooms) => {
      this.rooms = rooms;
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
