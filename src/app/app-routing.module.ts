import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ChatsComponent } from './chat/chats/chats.component';
import { CreateRoomComponent } from './chat/create-room/create-room.component';
import { RoomsComponent } from './chat/rooms/rooms.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'create-room',
    component: CreateRoomComponent,
    canActivate: [AuthGuard],
  },
  { path: 'rooms', component: RoomsComponent, canActivate: [AuthGuard] },
  { path: 'chat/:roomId', component: ChatsComponent, canActivate: [AuthGuard] },
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
