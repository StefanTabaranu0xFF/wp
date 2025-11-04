import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { select, Selection } from 'd3-selection';
import { geoMercator, geoPath } from 'd3-geo';
import { scaleOrdinal } from 'd3-scale';
import { CountryPopulation } from '../../services/population.types';
import countryPolygons from '../../../assets/country-polygons.json';
import { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';

type CountryGeometry = Polygon | MultiPolygon;

const FEATURE_COLLECTION = countryPolygons as FeatureCollection<CountryGeometry, { code: string; name: string }>;

@Component({
  selector: 'app-world-map',
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.css']
})
export class WorldMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() countries: CountryPopulation[] | null = [];
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private svg?: Selection<SVGGElement, unknown, null, undefined>;
  private projection = geoMercator().scale(120).translate([200, 160]);
  private readonly pathGenerator = geoPath(this.projection);
  private resizeObserver?: ResizeObserver;
  private readonly colorScale = scaleOrdinal<string, string>()
    .domain(['up', 'down', 'steady'])
    .range(['#4caf50', '#ef5350', '#ffb300']);

  ngAfterViewInit(): void {
    this.createSvg();
    this.drawMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countries']) {
      this.updateCountryStyles();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.svg?.remove();
  }

  private createSvg(): void {
    const container = this.mapContainer.nativeElement;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 320;

    const svgRoot = select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    this.svg = svgRoot.append('g') as Selection<SVGGElement, unknown, null, undefined>;

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === container) {
          const rect = entry.contentRect;
          svgRoot.attr('width', rect.width).attr('height', rect.height);
        }
      }
    });
    this.resizeObserver.observe(container);
  }

  private drawMap(): void {
    if (!this.svg) {
      return;
    }

    const features = FEATURE_COLLECTION.features as Feature<CountryGeometry, { code: string; name: string }>[];

    this.svg
      .selectAll('path')
      .data(features)
      .enter()
      .append('path')
      .attr('d', feature => this.pathGenerator(feature) ?? '')
      .attr('class', 'country-region')
      .append('title')
      .text(feature => feature.properties?.name ?? '');

    this.updateCountryStyles();
  }

  private updateCountryStyles(): void {
    if (!this.svg) {
      return;
    }

    const countryLookup = new Map((this.countries ?? []).map(country => [country.code, country]));

    this.svg
      .selectAll<SVGPathElement, Feature<CountryGeometry, { code: string; name: string }>>('path')
      .attr('fill', feature => {
        const stats = feature.properties ? countryLookup.get(feature.properties.code) : undefined;
        if (!stats) {
          return 'rgba(255,255,255,0.1)';
        }
        return this.colorScale(stats.trend);
      })
      .attr('stroke', 'rgba(255,255,255,0.25)')
      .attr('stroke-width', 1.2)
      .attr('opacity', 0.95)
      .select('title')
      .text(feature => {
        const stats = feature.properties ? countryLookup.get(feature.properties.code) : undefined;
        if (!stats) {
          return feature.properties?.name ?? '';
        }
        const direction = stats.trend === 'up' ? 'increasing' : stats.trend === 'down' ? 'decreasing' : 'stable';
        return `${stats.name}: ${stats.population.toLocaleString()} people (${direction})`;
      });
  }
}
