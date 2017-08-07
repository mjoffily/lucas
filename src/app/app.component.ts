import { Component, NgModule } from '@angular/core';
import {Crypto1Services} from './app.services';
import {Observable} from "rxjs/Observable";
import {Country} from './country';
import {Arbitrage} from './arbitrage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [Crypto1Services]
})

export class AppComponent {
  amount: number = 1000;
  countryList: Country[];
  selectedSourceCountry: Country = new Country();
  selectedTargetCountry: Country = new Country();
  sourceCountryName: String = '';
  targetCountryName: String = '';
  selectedSourceExchange: String = '';
  selectedTargetExchange: String = '';
  errorMessage: String = '';
  selectUndefinedOptionValue: any;
  detailsOpen: boolean = false;
  arbitrage: Arbitrage = new Arbitrage();
  
  constructor(private crypto1Service: Crypto1Services) {
    const countryList$ = crypto1Service.getCurrencyList();
    
    countryList$.subscribe(countryList => {
          this.countryList = countryList;
          if (this.countryList.length === 1) {
            this.selectedSourceCountry = this.countryList[0];
            this.selectedTargetCountry = this.countryList[0];
          }
        });
  };
  
  findCountryDetails(country: string) :Country {
    for (let c of this.countryList) {
      if (c.country === country) {
        return c;
      }
    }
    return null;
  }
  
  details() {
    this.detailsOpen = !this.detailsOpen;
  }
  
  submit() {
    let data = {sourceCountry: this.selectedSourceCountry.country, targetCountry: this.selectedTargetCountry.country, amount: this.amount, sourceExchange: this.selectedSourceExchange, targetExchange: this.selectedTargetExchange};
    const arbitrage$ = this.crypto1Service.submitRequest(data);
    arbitrage$.subscribe(
      (response) => {
        console.log(response); 
        if (response.error) {
          this.errorMessage = response.error.code + ' ' + response.error.message;
        } else {
          this.errorMessage = '';
          this.arbitrage = response.data;
        }
      },
      (error) => {
        console.log(error);
        let err = JSON.parse(error.text());
        if (err.error) {
          this.errorMessage = err.error.code + ' ' + err.error.message;
        }
      },
      () => console.log('request complete!')
    );
  }
  
  // TODO try to combine these two methods
  onChangeSourceCountry(obj) {
    this.selectedSourceCountry = this.findCountryDetails(obj);
    console.log(this.selectedSourceCountry);
  }

  onChangeTargetCountry(obj) {
    this.selectedTargetCountry = this.findCountryDetails(obj);
    console.log(this.selectedTargetCountry);
  }

  onChangeSourceExchange(obj) {
    console.log(this.selectedSourceExchange);
  }
  onChangeTargetExchange(obj) {
    console.log(this.selectedTargetExchange);
  }
  
}