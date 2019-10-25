import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogsComponent } from './logs/logs.component';
import { PlayerComponent } from './player/player.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logs', component: LogsComponent, canActivate: [AuthGuard] },
  { path: 'player/:pid', component: PlayerComponent, canActivate: [AuthGuard] },
  { path: '**',
    redirectTo: '/logs',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
