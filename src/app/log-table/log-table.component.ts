import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from '../api.service';
import * as moment from 'moment';

@Component({
  selector: 'app-log-table',
  templateUrl: './log-table.component.html',
  styleUrls: ['./log-table.component.scss']
})
export class LogTableComponent implements OnInit, OnChanges {

  total = 0;
  offset = 0;
  limit = 20;

  currentPage = 1;
  pages = 1;

  direction = 'DESC';

  moment = moment;

  logs: any = [];
  pageList: any = [];

  names = {};
  timestamps = {};

  constructor(private api: ApiService) { }

  @Input() pid: string;

  ngOnInit() {
    this.callAPI();

    setInterval(() => {
      this.renderTimestamps();
    }, 10 * 1000);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.pid) {
      this.callAPI();
    }
  }

  callAPI() {
    if (this.pid) {
      this.api.getLogsForPlayer(this.pid, this.limit, this.offset).subscribe((res: any) => {
        this.limit = res.limit;
        this.total = res.total;
        this.offset = res.offset;
        this.logs = res.data;

        this.requestNames();
        this.renderTimestamps();
        this.updatePagination();
      });
    } else {
      this.api.getLogs(this.limit, this.offset).subscribe((res: any) => {
        this.limit = res.limit;
        this.total = res.total;
        this.offset = res.offset;
        this.logs = res.data;

        this.requestNames();
        this.renderTimestamps();
        this.updatePagination();
      });
    }
  }

  requestNames() {
    const pids = [];
    this.logs.forEach(log => {
      if (!pids.includes(log.pid) && !this.names[log.pid]) {
        pids.push(log.pid);
      }
    });

    if (pids.length < 1) {
      return;
    }

    const sub = this.api.getPlayerNames(pids)
      .subscribe((res: any) => {

        if (res.statusCode !== 200) {
          return console.error('Failed to get Player Names');
        }

        res.data.forEach(name => {
          this.names[name.pid] = name.name;
        });

        sub.unsubscribe();
      });
  }

  renderTimestamps() {
    if (!this.logs) { return; }

    this.logs.forEach(log => {
      this.timestamps[log.id] = {
        from: this.parseFrom(log.time),
        timestamp: this.parseTimestamp(log.time),
      };
    });
  }

  updatePagination() {
    this.pages = Math.ceil(this.total / this.limit);
    this.currentPage = Math.ceil(this.offset / this.limit) + 1;

    this.pageList = [
      this.currentPage - 2,
      this.currentPage - 1,
      this.currentPage,
      this.currentPage + 1,
      this.currentPage + 2,
    ];
  }

  changePage(page: number) {
    page = page - 1;
    if (page < 0) { return; }
    if (page > this.pages) { return; }

    this.offset = this.limit * page;
    this.callAPI();
  }

  parseAction(action) {
    switch (action) {
      case 'bankChange':
        return 'Bank Changed';
      case 'cashChange':
        return 'Cash Changed';
      default:
        return action;
    }
  }

  parseTimestamp(time) {
    return moment.utc(time).local().subtract(1, 'hours').format('MMM DD, YYYY - h:mm:ss a');
  }

  parseFrom(time) {
    return moment.utc(time).local().subtract(1, 'hours').fromNow();
  }

  parseMoney(input) {
    const parts = input.split(':');
    const change = parseInt(Number(parts[1]).toPrecision(), 0);
    const updated = Number(parts[2]).toPrecision();
    let changeColor = 'red';

    if (change > 0) {
      changeColor = 'green';
    }

    return `<span class="${changeColor}">$${change}</span> - New Balance: $${updated}`;
  }

}
