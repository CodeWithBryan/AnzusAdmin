import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { ActivatedRoute } from '@angular/router';
import { ChartPoint, ChartOptions } from 'chart.js';
import 'chartjs-plugin-zoom';
import * as moment from 'moment';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  pid = '';
  player: any = {};

  cashHistory = [];
  bankHistory = [];

  public lineChartType = 'line';
  public lineChartData: any[] = [
    { data: [ ], label: 'Bank', fill: false, pointRadius: 5, pointHoverRadius: 8, pointStyle: 'rectRounded' },
    { data: [ ], label: 'Cash', fill: false, pointRadius: 5, pointHoverRadius: 8, pointStyle: 'rectRounded' },
  ];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    title: {
      display: true,
      text: 'Money over time'
    },
    elements: {
      line: {
        tension: 0
      }
    },
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          tooltipFormat: 'MMM DD, YYYY - h:mm:ss a'
        },
        scaleLabel: {
          display: true,
          labelString: 'Date'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'value'
        }
      }]
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x'
        },
        zoom: {
          enabled: true,
          mode: 'x'
        }
      }
    },
  };

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.pid = params.pid;

      const sub = this.api.getPlayerInformation(this.pid)
        .subscribe((res: any) => {
          this.player = res.player[0];
          sub.unsubscribe();
        });

      const sub2 = this.api.getPlayerMoneyHistory(this.pid)
        .subscribe((res: any) => {
          this.parseData(res);
          sub2.unsubscribe();
        });
   });
  }

  parseData(data: any) {
    data.forEach(log => {

      const chartPoint: ChartPoint = {
        x: (moment.utc(log.time).local().add(1, 'hours') as any),
        y: this.parseMoney(log.info),
      };

      if (log.action === 'bankChange') {
        this.lineChartData[0].data.push(chartPoint);
      }

      if (log.action === 'cashChange') {
        this.lineChartData[1].data.push(chartPoint);
      }
    });
  }

  parseMoney(input) {
    const parts = input.split(':');
    return parseInt(Number(parts[2]).toPrecision(), 0);
  }

}
