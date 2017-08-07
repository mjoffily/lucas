import { Injectable } from '@angular/core';

import { Headers, Http, RequestOptions } from '@angular/http';
import {Country} from './country';
import {Arbitrage} from './arbitrage';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import {Observable} from "rxjs/Observable";



@Injectable()
export class Crypto1Services {
    
    private countriesURL: string = '/api/countries';  // URL to web api
    private arbitrageURL: string = '/api/arbitrage';  // URL to web api
 
    constructor(private http: Http) { }

    getCurrencyList(): Observable<Country[]> {
        return this.http.get(this.countriesURL).map(res => res.json())
    }
    
    submitRequest(data): Observable<any> {
        let myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');    
        
        let myParams: String = '?sourceCountry=' + data.sourceCountry + '&targetCountry=' + data.targetCountry + '&amount=' + data.amount + '&sourceExchange=' + data.sourceExchange + '&targetExchange=' + data.targetExchange;
        
        return this.http.get(this.arbitrageURL + myParams).map(res => res.json());
    }
    
    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
