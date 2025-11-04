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
import { CountryPopulation } from '../../services/population.types';

interface GlobePoint {
  lat: number;
  lng: number;
  size: number;
  altitude: number;
  color: string;
  name: string;
  value: number;
}

type GlobeInstance = InstanceType<typeof Globe> & {
  pointsData(data: GlobePoint[]): GlobeInstance;
};

@Component({
  selector: 'app-globe',
  templateUrl: './globe.component.html',
  styleUrls: ['./globe.component.css']
})
export class GlobeComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() countries: CountryPopulation[] | null = [];
  @ViewChild('globeContainer', { static: true }) globeContainer!: ElementRef<HTMLDivElement>;

  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private globe!: GlobeInstance;
  private animationFrame?: number;
  private resizeObserver?: ResizeObserver;

  constructor(private readonly ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.setupScene();
    this.updateGlobePoints();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countries'] && this.globe) {
      this.updateGlobePoints();
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
    const globeMaterial = this.globe.globeMaterial() as THREE.MeshPhongMaterial;
    globeMaterial.color = new THREE.Color('#0d1b2a');
    globeMaterial.emissive = new THREE.Color('#1b263b');
    globeMaterial.emissiveIntensity = 0.25;

    this.globe
      .showAtmosphere(true)
      .atmosphereColor('#4a90e2')
      .atmosphereAltitude(0.18)
      .pointAltitude('altitude')
      .pointColor('color')
      .pointLat('lat')
      .pointLng('lng')
      .pointRadius('size');

    this.scene.add(this.globe as unknown as THREE.Object3D);

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

  private updateGlobePoints(): void {
    if (!this.globe || !this.countries) {
      return;
    }

    const points: GlobePoint[] = this.countries.map(country => {
      const magnitude = Math.log10(country.population || 1);
      const normalized = Math.max(0.2, magnitude / 10);
      const altitude = 0.05 + normalized * 0.3;
      let color = '#ffb300';
      if (country.trend === 'up') {
        color = '#4caf50';
      } else if (country.trend === 'down') {
        color = '#ef5350';
      }

      return {
        lat: country.lat,
        lng: country.lng,
        size: normalized * 0.9,
        altitude,
        color,
        name: country.name,
        value: country.population
      };
    });

    this.globe.pointsData(points);
  }

  private animate(): void {
    this.animationFrame = requestAnimationFrame(() => this.animate());
    if (this.globe) {
      (this.globe as unknown as THREE.Object3D).rotation.y += 0.0015;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
