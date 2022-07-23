import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomsComponent } from './rooms/rooms.component';
import { ChatsComponent } from './chats/chats.component';
import { AngularMaterialModule } from '../angular-material.module';
import { CreateRoomComponent } from './create-room/create-room.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [RoomsComponent, ChatsComponent, CreateRoomComponent],
  imports: [CommonModule, AngularMaterialModule, RouterModule],
})
export class ChatModule {}
