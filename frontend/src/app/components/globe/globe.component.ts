import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as THREE from 'three';
import Globe from 'three-globe';
import { Feature, FeatureCollection, Polygon } from 'geojson';
import countryPolygons from '../../../assets/country-polygons.json';
import { CountryPopulation } from '../../services/population.types';

interface CountryFeatureProperties {
  code: string;
  name: string;
  fill?: string;
}

type CountryFeature = Feature<Polygon, CountryFeatureProperties>;

type GlobeInstance = any;

const FEATURE_COLLECTION = countryPolygons as FeatureCollection<Polygon, { code: string; name: string }>;

@Component({
  selector: 'app-globe',
  templateUrl: './globe.component.html',
  styleUrls: ['./globe.component.css']
})
export class GlobeComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() countries: CountryPopulation[] | null = [];
  @ViewChild('globeContainer', { static: true }) globeContainer!: ElementRef<HTMLDivElement>;

  private renderer!: any;
  private camera!: any;
  private scene!: any;
  private globe!: GlobeInstance;
  private animationFrame?: number;
  private resizeObserver?: ResizeObserver;
  private readonly baseFeatures: CountryFeature[] = (FEATURE_COLLECTION.features as CountryFeature[]).map(feature => ({
    ...feature,
    properties: { ...feature.properties }
  }));

  constructor(private readonly ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.setupScene();
    this.updateGlobeCountries();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countries'] && this.globe) {
      this.updateGlobeCountries();
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrame ?? 0);
    this.resizeObserver?.disconnect();
    this.renderer.dispose();
  }

  private setupScene(): void {
    const container = this.globeContainer.nativeElement;
    const width = container.clientWidth || container.offsetWidth || 600;
    const height = container.clientHeight || 420;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    this.camera.position.set(0, 0, 400);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(200, 200, 400);
    this.scene.add(ambientLight, directionalLight);

    this.globe = new Globe();
    const globeMaterial = this.globe.globeMaterial() as any;
    globeMaterial.color = new THREE.Color('#0d1b2a');
    globeMaterial.emissive = new THREE.Color('#1b263b');
    globeMaterial.emissiveIntensity = 0.25;

    this.globe
      .showAtmosphere(true)
      .atmosphereColor('#4a90e2')
      .atmosphereAltitude(0.18)
      .polygonsTransitionDuration(400);

    const globeObject = this.globe as unknown as { rotation: { y: number } };
    this.scene.add(globeObject as any);

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === container) {
          const rect = entry.contentRect;
          this.camera.aspect = rect.width / rect.height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(rect.width, rect.height);
        }
      }
    });
    this.resizeObserver.observe(container);

    this.ngZone.runOutsideAngular(() => this.animate());
  }

  private updateGlobeCountries(): void {
    if (!this.globe) {
      return;
    }

    const countryLookup = new Map((this.countries ?? []).map(country => [country.code, country]));
    const features: CountryFeature[] = this.baseFeatures.map(feature => {
      const stats = feature.properties ? countryLookup.get(feature.properties.code) : undefined;
      const trendColor = stats
        ? stats.trend === 'up'
          ? '#4caf50'
          : stats.trend === 'down'
          ? '#ef5350'
          : '#ffb300'
        : 'rgba(255,255,255,0.18)';

      return {
        ...feature,
        properties: {
          ...feature.properties,
          fill: trendColor
        }
      } as CountryFeature;
    });

    const globe = this.globe as any;

    globe
      .polygonsData(features)
      .polygonCapColor((feature: CountryFeature) => feature.properties?.fill ?? 'rgba(255,255,255,0.18)')
      .polygonSideColor(() => 'rgba(15, 28, 46, 0.55)')
      .polygonStrokeColor(() => '#0f172a')
      .polygonAltitude((feature: CountryFeature) => {
        const stats = feature.properties ? countryLookup.get(feature.properties.code) : undefined;
        return stats ? 0.06 : 0.02;
      })
      .polygonLabel((feature: CountryFeature) => {
        const stats = feature.properties ? countryLookup.get(feature.properties.code) : undefined;
        const countryName = feature.properties?.name ?? 'Unknown';
        if (!stats) {
          return `<div class="globe-tooltip"><strong>${countryName}</strong><br/>No population data</div>`;
        }

        const trendText =
          stats.trend === 'up'
            ? 'Population increasing'
            : stats.trend === 'down'
            ? 'Population decreasing'
            : 'Stable population';

        return `<div class="globe-tooltip"><strong>${stats.name}</strong><br/>${stats.population.toLocaleString()} people<br/>${trendText}</div>`;
      });

    globe.pointsData([]);
  }

  private animate(): void {
    this.animationFrame = requestAnimationFrame(() => this.animate());
    if (this.globe) {
      const globeObject = this.globe as unknown as { rotation: { y: number } };
      globeObject.rotation.y += 0.0015;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
