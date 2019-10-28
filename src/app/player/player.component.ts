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

  logInFocus: any;

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
          if (res.statusCode !== 200) {
            return this.router.navigateByUrl('/logs');
          }

          this.player = res.data;
          sub.unsubscribe();
        });

      const sub2 = this.api.getPlayerMoneyHistory(this.pid)
        .subscribe((res: any) => {
          if (res.statusCode === 200) {
            this.parseData(res.data);
          }
          sub2.unsubscribe();
        });

      this.getNonMoneyLogData();
   });
  }

  getNonMoneyLogData() {
    const sub3 = this.api.getLogsForPlayerNoMoney(this.pid, 60 * this.hours)
    .subscribe((res: any) => {
      this.lineChartOptions.annotation.annotations = [];

      res.data.forEach(log => {
        (this.chart.chart.options as any).annotation.annotations.push({
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: moment.utc(log.time).local(),
          borderColor: 'rgba(75, 192, 192, 0.5)',
          borderWidth: 4,
          label: {
            enabled: true,
            content: log.action
          },
          onClick: () => {
            this.logInFocus = log;
          }
        });

        this.chart.chart.update();

        sub3.unsubscribe();
      });
    });
  }

  parseData(data: any) {
    data.forEach(log => {

      const chartPoint: ChartPoint = {
        x: (moment.utc(log.time).local() as any),
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
    this.logInFocus = false;
  }

}
