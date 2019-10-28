import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient) {}

  public getLogs(limit?, offset?) {
    return this.httpClient.get(`${environment.apiUrl}/logs`, { params: { limit, offset } });
  }

  public getLogsForPlayer(pid, limit?, offset?) {
    return this.httpClient.get(`${environment.apiUrl}/player/${pid}/logs`, { params: { limit, offset } });
  }

  public getLogsForPlayerNoMoney(pid, duration?) {
    return this.httpClient.get(`${environment.apiUrl}/player/${pid}/logs/nomoney`, { params: { duration } });
  }

  public getPlayerInformation(pid) {
    return this.httpClient.get(`${environment.apiUrl}/player/${pid}`);
  }

  public getPlayerMoneyHistory(pid) {
    return this.httpClient.get(`${environment.apiUrl}/player/${pid}/money/history`);
  }

  public getPlayerVehicles(pid, limit?, offset?) {
    return this.httpClient.get(`${environment.apiUrl}/player/${pid}/vehicles`, { params: { limit, offset } });
  }

  public getPlayerNames(pids) {
    return this.httpClient.get(`${environment.apiUrl}/playernames`, { params: { pids }});
  }

  public findPlayer(search) {
    return this.httpClient.get(`${environment.apiUrl}/search/player/${search}`);
  }

}
