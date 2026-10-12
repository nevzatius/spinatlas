import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { City, Country } from '../data';

const OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const WORLD_VIEW: [L.LatLngTuple, number] = [[50, 14], 3];

export class AtlasMap {
  private map: L.Map;
  private marker: L.Marker | null = null;

  constructor(el: HTMLElement) {
    this.map = L.map(el, { worldCopyJump: true, minZoom: 2, zoomSnap: 0.5 }).setView(...WORLD_VIEW);

    // Standard OSM tiles; the dark look comes from a CSS filter on the tile pane (see main.css).
    this.addTiles(OSM, '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>');
  }

  private addTiles(url: string, attribution: string): L.TileLayer {
    return L.tileLayer(url, { attribution, maxZoom: 19 }).addTo(this.map);
  }

  private clearMarker(): void {
    this.marker?.remove();
    this.marker = null;
  }

  showWorld(): void {
    this.clearMarker();
    this.fly(() => this.map.flyTo(...WORLD_VIEW), () => this.map.setView(...WORLD_VIEW));
  }

  focusCountry(country: Country): void {
    this.clearMarker();
    const [s, w, n, e] = country.bbox;
    const bounds = L.latLngBounds([s, w], [n, e]);
    this.fly(() => this.map.flyToBounds(bounds, { padding: [24, 24], maxZoom: 8 }), () => this.map.fitBounds(bounds, { padding: [24, 24], maxZoom: 8 }));
  }

  focusCity(city: City, country: Country): void {
    this.clearMarker();
    const pin = L.divIcon({ className: 'pin', html: '<span></span>', iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -26] });
    this.marker = L.marker([city.lat, city.lon], { icon: pin, title: city.name }).addTo(this.map);
    const popup = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = city.name;
    popup.append(strong, document.createElement('br'), document.createTextNode(country.name));
    this.marker.bindPopup(popup);
    const zoom = city.pop > 500_000 ? 11 : 12;
    this.fly(() => this.map.flyTo([city.lat, city.lon], zoom, { duration: 2.2 }), () => this.map.setView([city.lat, city.lon], zoom));
    this.marker.openPopup();
  }

  /** Call when the container changes size (e.g. layout switch). */
  refresh(): void {
    this.map.invalidateSize();
  }

  private fly(animated: () => void, instant: () => void): void {
    (reducedMotion() ? instant : animated)();
  }
}
