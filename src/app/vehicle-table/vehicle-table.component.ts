import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-vehicle-table',
  templateUrl: './vehicle-table.component.html',
  styleUrls: ['./vehicle-table.component.scss']
})
export class VehicleTableComponent implements OnInit, OnChanges {

  @Input() pid: string;

  total = 0;
  offset = 0;
  limit = 5;

  currentPage = 1;
  pages = 1;

  direction = 'DESC';
  pageList: any = [];

  vehicles: any;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.callAPI();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.pid) {
      this.callAPI();
    }
  }

  callAPI() {
    const sub = this.api.getPlayerVehicles(this.pid, this.limit, this.offset)
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.vehicles = res.data;
        }
        sub.unsubscribe();
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

}
