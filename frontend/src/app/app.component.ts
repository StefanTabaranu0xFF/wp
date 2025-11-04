import { Component } from '@angular/core';
import { PopulationService } from './services/population.service';
import { Observable } from 'rxjs';
import { PopulationSnapshot } from './services/population.types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  readonly snapshot$: Observable<PopulationSnapshot>;

  constructor(private readonly populationService: PopulationService) {
    this.snapshot$ = this.populationService.getPopulationUpdates();
  }
}
