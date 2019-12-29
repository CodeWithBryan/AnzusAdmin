import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import * as moment from 'moment';

@Component({
  selector: 'app-find-player',
  templateUrl: './find-player.component.html',
  styleUrls: ['./find-player.component.scss']
})
export class FindPlayerComponent implements OnInit {

  error = '';
  searchInput = '';
  loading = false;
  results = [];

  constructor(private api: ApiService) { }

  ngOnInit() {
  }

  searchForPlayer() {
    if (this.loading) { return; }
    if (this.searchInput === '') { return; }

    this.loading = true;

    const sub = this.api.findPlayer(this.searchInput)
      .subscribe((res: any) => {
        this.loading = false;
        this.results = res.data;

        sub.unsubscribe();
      },
      err => {
        if (err === 'No Players Found') {
          this.results = [];
        }

        this.loading = false;
        this.error = err;
      });
  }

  parseTimestamp(time) {
    return moment.utc(time).local().subtract(1, 'hours').format('MMM DD, YYYY - h:mm:ss a');
  }

}
