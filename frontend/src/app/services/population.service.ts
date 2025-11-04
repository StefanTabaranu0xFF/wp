import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators';
import { PopulationSnapshot } from './population.types';

@Injectable({ providedIn: 'root' })
export class PopulationService {
  private readonly updates$: Observable<PopulationSnapshot>;

  constructor(private readonly http: HttpClient) {
    this.updates$ = timer(0, 5000).pipe(
      switchMap(() => this.http.get<PopulationSnapshot>('/api/population')),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getPopulationUpdates(): Observable<PopulationSnapshot> {
    return this.updates$;
  }
}
