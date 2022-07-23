import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { SubSink } from 'subsink';
import { IUser } from '../chat';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss'],
})
export class CreateRoomComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  userId: string = '';
  users: IUser[] = [];

  constructor(
    private auth: AuthService,
    private chat: ChatService,
    private router: Router,
    private snackbarService: MatSnackBar
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

    this.subs.sink = this.chat.getUsersList().subscribe((response) => {
      console.log(response.message);
      this.users = response.users;
    });
  }

  ngOnInit(): void {}

  onSubmit(memberId: string) {
    this.subs.sink = this.chat
      .createRoom({
        member1: this.userId,
        member2: memberId,
      })
      .subscribe((response) => {
        console.log(response.message);
        if (response.data.new) {
          this.chat.getMyRooms();
          this.router.navigate(['/rooms']);
        } else {
          this.snackbarService.open('Room already exist');
          this.router.navigate(['/chat', response.data.room._id]);
        }
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
