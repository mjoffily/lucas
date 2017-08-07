export class Arbitrage {
  spotRate: number;
  amountInSourceCurrency: number;
  amountInDestinationCurrencyUsingSpotRate: number;
  numberOfBitcoinsBoughtAtOrigin: number;
  amountInDestinationCurrencyAfterBitcoinSale: number;
  exchangeSource: string;
  currencyPair: string
  exchangeDestination: string;
  sign: string;
  percentage: number;
}

