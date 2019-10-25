import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.httpClient.get(`${environment.apiUrl}/logs/${pid}`, { params: { limit, offset } });
  }

  public getPlayerInformation(pid) {
    return this.httpClient.get(`${environment.apiUrl}/player/${pid}`);
  }

  public getPlayerNames(pids) {
    return this.httpClient.get(`${environment.apiUrl}/playernames`, { params: { pids }});
  }

  public getPlayerMoneyHistory(pid) {
    return this.httpClient.get(`${environment.apiUrl}/player/${pid}/moneyHistory`);
  }

  public getPlayerVehicles(pid, limit?, offset?) {
    return this.httpClient.get(`${environment.apiUrl}/player/${pid}/vehicles`, { params: { limit, offset } });
  }

}
