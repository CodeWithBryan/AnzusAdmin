import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartPoint, ChartOptions } from 'chart.js';
import 'chartjs-plugin-annotation';
import 'chartjs-plugin-zoom';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  @ViewChild(BaseChartDirective, { static: false }) chart: BaseChartDirective;

  pid = '';
  player: any = {};

  cashHistory = [];
  bankHistory = [];

  hours = 6;

  moment = moment;

  public lineChartType = 'line';
  public lineChartData: any[] = [
    { data: [ ], label: 'Bank', fill: false, pointRadius: 5, pointHoverRadius: 8, pointStyle: 'rectRounded' },
    { data: [ ], label: 'Cash', fill: false, pointRadius: 5, pointHoverRadius: 8, pointStyle: 'rectRounded' },
  ];
  public lineChartOptions: any = {
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
        ticks: {
          callback: (value, index, values) => {
            return `$${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
          },
        },
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
      },
    },
    annotation: {
      events: [ 'click' ],
      annotations: [],
    }
  };

  noMoneyHistory: boolean;
  noLogHistory: boolean;
  logsInFocus = [];
  lastClickedLog: any;
  nonMoneyLogs: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.pid = params.pid;

      const sub = this.api.getPlayerInformation(this.pid)
        .subscribe((res: any) => {
          this.player = res.data;
          sub.unsubscribe();
        }, err => {
          return this.router.navigateByUrl('/logs');
        });

      const sub2 = this.api.getPlayerMoneyHistory(this.pid)
        .subscribe((res: any) => {
          if (res.statusCode === 200) {
            this.parseData(res.data);
          }

          sub2.unsubscribe();
        }, err => {
          if (err.status === 404) {
            this.noMoneyHistory = true;
          }
        });

      this.getNonMoneyLogData();
   });
  }

  getNonMoneyLogData() {
    const sub3 = this.api.getLogsForPlayerNoMoney(this.pid, 60 * this.hours)
    .subscribe((res: any) => {
      this.nonMoneyLogs = res.data;
      this.lineChartOptions.annotation.annotations = [];

      res.data.forEach(log => {
        (this.chart.chart.options as any).annotation.annotations.push({
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: moment.utc(log.time).local().subtract(1, 'hours'),
          borderColor: 'rgba(75, 192, 192, 0.5)',
          borderWidth: 4,
          label: {
            enabled: true,
            content: log.action
          },
          onClick: e => {
            this.addLogInFocus(log, e.shiftKey);
          }
        });

        this.chart.chart.update();

        sub3.unsubscribe();
      });
    }, err => {
      if (err.status === 404) {
        this.noLogHistory = true;
      }
    });
  }

  addLogInFocus(log, addMultiple) {

    // If we're holding shift, select all logs between logs
    if (addMultiple && this.lastClickedLog && this.lastClickedLog.id !== log.id) {
      const firstId = this.lastClickedLog.id > log.id ? log.id : this.lastClickedLog.id;
      const lastId = this.lastClickedLog.id === firstId ? log.id : this.lastClickedLog.id;

      this.nonMoneyLogs.forEach(l => {
        if (l.id > firstId && l.id < lastId) {
          const exist = this.logsInFocus.find(lo => lo.id === l.id);
          if (!exist) {
            this.logsInFocus.push(l);
          }
        }
      });
    }

    // Add the log we clicked
    const exists = this.logsInFocus.find(l => l.id === log.id);
    if (!exists) {
      this.logsInFocus.push(log);
      this.logsInFocus.sort((a, b) => a.id < b.id ? -1 : 1);
    }

    // Update our last clicked log for multiple selections
    this.lastClickedLog = log;
  }

  parseData(data: any) {
    data.forEach(log => {

      const chartPoint: ChartPoint = {
        x: (moment.utc(log.time).local().subtract(1, 'hours') as any),
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

  parseFrom(time) {
    return moment.utc(time).local().subtract(1, 'hours').fromNow();
  }

  parseUIMoney(input) {
    const parts = input.split(':');
    const change = parseInt(Number(parts[1]).toPrecision(), 0);
    const updated = Number(parts[2]).toPrecision();
    let changeColor = 'red';

    if (change > 0) {
      changeColor = 'green';
    }

    return `<span class="${changeColor}">$${change}</span> - New Balance: $${updated}`;
  }

  clearInFocus() {
    this.logsInFocus = [];
  }

}
