import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { GlobeComponent } from './components/globe/globe.component';
import { WorldMapComponent } from './components/world-map/world-map.component';

@NgModule({
  declarations: [AppComponent, GlobeComponent, WorldMapComponent],
  imports: [BrowserModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
