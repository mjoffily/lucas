import { InMemoryDbService } from 'angular-in-memory-web-api';
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const countryList = [{'country': 'Australia', 'currencySymbol': 'AUD', 'name': 'Australian Dolar', 'exchanges':[{'name': 'Independente Reserve'}]},
                        {'country':'Brazil', 'currencySymbol':'BRL', 'name': 'Brazilian Real', 'exchanges':[{'name': 'Foxbit'}]},
                        {'country':'United States', 'currencySymbol':'USD', 'name': 'American dolar', 'exchanges':[{'name': 'Coinbase'}]},
                        {'country':'Thailand', 'currencySymbol':'THB', 'name': 'Thailand Baht', 'exchanges':[{'name': 'Coins.ph'}]},
                        {'country':'Russia', 'currencySymbol':'RUB', 'name': 'Russian Ruble', 'exchanges':[{'name': 'BTC-e'}]},
                        {'country':'South Africa', 'currencySymbol':'ZAR', 'name': 'South African Rand', 'exchanges':[{'name': 'luno'}]},
                        {'country':'Philippines', 'currencySymbol': 'PHP', 'name': 'Philipino Peso', 'exchanges':[{'name': 'Coins.ph'}]}];
    //const currencyList = [{"country":"Brazil", "currency":"BRL"},{"country":"USA", "currency": "USD"},{"country":"Australia", "currency":"AUD"}, {"country":"Philippines", "currency":"PHP"},
    //{"country":"Thailand", "currency":"BHA"}];
    return {countryList};
  }
}