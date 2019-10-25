import { Component } from '@angular/core';
import { setTheme } from 'ngx-bootstrap/utils';
import { AuthenticationService } from './authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  showLogout = false;
  constructor(
    private authenticationService: AuthenticationService,
  ) {
    setTheme('bs4');

    if (this.authenticationService.currentUserValue) {
      this.showLogout = true;
    }
  }

  logout() {
    this.authenticationService.logout();
    location.reload(true);
  }
}
