import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {Crypto1Services} from './app.services'
//import { InMemoryWebApiModule } from 'angular-in-memory-web-api/in-memory-web-api.module';
//import { InMemoryDataService }  from './in-memory-data.service';

import { AppComponent } from './app.component'; 

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, 
    HttpModule,
    FormsModule//,
//    InMemoryWebApiModule.forRoot(InMemoryDataService)
  ],
  providers: [Crypto1Services],
  bootstrap: [AppComponent]
})
export class AppModule { }
