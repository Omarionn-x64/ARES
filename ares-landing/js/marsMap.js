import { MARS_SITES, NASA_TREK_TILES } from './siteData.js';

const MOLA_OPACITY = 0.65;

export class MarsSurfaceMapController {
  constructor(containerId) {
    if (!window.L) {
      throw new Error('Leaflet did not load; Mars surface maps are unavailable.');
    }

    this.L = window.L;
    this.view = document.getElementById('mars-trek-view');
    this.mapStatus = document.getElementById('trek-map-status');
    this.molaButton = document.getElementById('btn-toggle-mola');
    this.localMosaicButton = document.getElementById('btn-toggle-local-mosaic');
    this.map = this.L.map(containerId, {
      crs: this.L.CRS.EPSG4326,
      minZoom: 0,
      maxZoom: 18,
      noWrap: true,
      zoomControl: true,
      attributionControl: true,
    });

    this.baseLayer = this.L.tileLayer(NASA_TREK_TILES.vikingOptical, {
      attribution: 'Mars imagery: NASA / USGS',
      bounds: this.L.latLngBounds([[-90, -180], [90, 180]]),
      maxNativeZoom: 7,
      maxZoom: 18,
      noWrap: true,
    }).addTo(this.map);
    this.baseLayer.on('tileerror', () => {
      this.showStatus('Some optical map tiles could not be loaded. Check your connection and try again.');
    });

    this.molaLayer = this.L.tileLayer(NASA_TREK_TILES.molaElevation, {
      attribution: 'MOLA shaded elevation',
      bounds: this.L.latLngBounds([[-90, -180], [90, 180]]),
      maxNativeZoom: 7,
      maxZoom: 18,
      noWrap: true,
      opacity: MOLA_OPACITY,
    });
    this.molaLayer.on('tileerror', () => {
      if (!this.molaEnabled) return;
      this.molaEnabled = false;
      this.map.removeLayer(this.molaLayer);
      this.syncToolbar();
      this.showStatus('MOLA elevation tiles could not be loaded. The optical map remains available.');
    });

    this.markersLayer = this.L.layerGroup().addTo(this.map);
    this.routeLayer = null;
    this.localLayer = null;
    this.site = null;
    this.waypointMarkers = [];
    this.molaEnabled = false;
    this.localMosaicEnabled = false;
    this.localTileErrorReported = false;

    this.L.control.scale({ imperial: false, maxWidth: 140 }).addTo(this.map);
    this.map.on('moveend resize', () => this.updateLocalLayer());
  }

  open(siteId) {
    this.view.classList.remove('hidden');
    this.view.classList.add('is-open');
    this.loadSite(siteId);
    requestAnimationFrame(() => this.map.invalidateSize({ pan: false }));
  }

  close() {
    this.view.classList.remove('is-open');
    this.view.classList.add('hidden');
  }

  loadSite(siteId) {
    const site = MARS_SITES[siteId];
    if (!site) {
      throw new RangeError(`Unknown Mars surface site: ${siteId}`);
    }

    this.site = site;
    this.map.stop();
    this.clearStatus();
    this.removeOptionalLayers();
    this.clearSiteLayers();
    this.map.setView(site.center, site.zoom, { animate: false });

    document.getElementById('trek-kicker').textContent = site.kicker;
    document.getElementById('trek-site-title').textContent = site.title;
    document.querySelectorAll('.trek-site-switcher [data-site]').forEach((button) => {
      const active = button.dataset.site === site.id;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    this.renderRoute();
    this.renderWaypoints();
    this.prepareLocalLayer();
    this.syncToolbar();
    this.selectWaypoint(0, false);
  }

  toggleMola() {
    if (this.molaEnabled) {
      this.map.removeLayer(this.molaLayer);
      this.molaEnabled = false;
    } else {
      this.molaLayer.addTo(this.map);
      this.molaEnabled = true;
    }
    this.syncToolbar();
    return this.molaEnabled;
  }

  toggleLocalMosaic() {
    if (!this.localLayer || !this.site.localTileLayer) return false;
    if (this.localMosaicEnabled) {
      this.map.removeLayer(this.localLayer);
      this.localMosaicEnabled = false;
    } else {
      this.localLayer.addTo(this.map);
      this.localMosaicEnabled = true;
      this.updateLocalLayer();
    }
    this.syncToolbar();
    return this.localMosaicEnabled;
  }

  removeOptionalLayers() {
    if (this.molaEnabled) this.map.removeLayer(this.molaLayer);
    if (this.localLayer && this.localMosaicEnabled) {
      this.map.removeLayer(this.localLayer);
    }
    window.clearTimeout(this.localLayerUpdateTimer);
    this.molaEnabled = false;
    this.localMosaicEnabled = false;
    this.localTileErrorReported = false;
  }

  clearSiteLayers() {
    this.markersLayer.clearLayers();
    this.waypointMarkers = [];
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
      this.routeLayer = null;
    }
    document.getElementById('drawer-waypoint-list').replaceChildren();
  }

  prepareLocalLayer() {
    this.localLayer = null;
    if (!this.site.localTileLayer) return;

    const site = this.site;
    const layer = this.L.imageOverlay(
      'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
      this.L.latLngBounds([[-90, -180], [90, 180]]),
      {
        opacity: 0.88,
      }
    );
    this.localLayer = layer;
    layer.on('error', () => {
      if (this.localLayer !== layer || this.site !== site || !this.localMosaicEnabled) {
        return;
      }
      if (this.localTileErrorReported) return;
      this.localTileErrorReported = true;
      this.localMosaicEnabled = false;
      this.map.removeLayer(layer);
      this.syncToolbar();
      this.showStatus(
        `The ${site.localTileLayer} mosaic is unavailable here. The global optical map remains active.`
      );
    });
  }

  updateLocalLayer() {
    if (!this.localMosaicEnabled || !this.localLayer || !this.site) return;

    window.clearTimeout(this.localLayerUpdateTimer);
    const layer = this.localLayer;
    const site = this.site;
    this.localLayerUpdateTimer = window.setTimeout(() => {
      if (
        !this.localMosaicEnabled ||
        this.localLayer !== layer ||
        this.site !== site
      ) {
        return;
      }
      this.refreshLocalLayer(layer, site);
    }, 150);
  }

  refreshLocalLayer(layer, site) {
    const bounds = this.map.getBounds();
    const size = this.map.getSize();
    if (!size.x || !size.y) return;

    const southwest = bounds.getSouthWest();
    const northeast = bounds.getNorthEast();
    const params = new URLSearchParams({
      bbox: [
        southwest.lng,
        southwest.lat,
        northeast.lng,
        northeast.lat,
      ].join(','),
      bboxSR: '104905',
      imageSR: '104905',
      size: `${Math.min(2048, Math.ceil(size.x))},${Math.min(2048, Math.ceil(size.y))}`,
      format: 'png32',
      transparent: 'true',
      f: 'image',
    });
    const url = NASA_TREK_TILES.localImageServer.replace(
      '{layer}',
      encodeURIComponent(site.localTileLayer)
    );

    layer.setBounds(bounds);
    layer.setUrl(`${url}?${params}`);
  }

  renderRoute() {
    if (this.site.waypoints.length < 2) return;
    this.routeLayer = this.L.polyline(
      this.site.waypoints.map((waypoint) => waypoint.coordinates),
      {
        color: '#ff8c5a',
        dashArray: '9 7',
        lineCap: 'round',
        lineJoin: 'round',
        opacity: 0.95,
        weight: 4,
      }
    ).addTo(this.map);
  }

  renderWaypoints() {
    const waypointList = document.getElementById('drawer-waypoint-list');
    this.site.waypoints.forEach((waypoint, index) => {
      const marker = this.L.marker(waypoint.coordinates, {
        alt: waypoint.title,
        icon: this.createPinIcon(index, false),
        keyboard: true,
        riseOnHover: true,
        title: waypoint.title,
      }).addTo(this.markersLayer);
      marker.bindTooltip(waypoint.title, { direction: 'top', offset: [0, -14] });
      marker.on('click', () => this.selectWaypoint(index, true));
      this.waypointMarkers.push(marker);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'drawer-waypoint-button';
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => this.selectWaypoint(index, true));

      const title = document.createElement('span');
      title.className = 'drawer-waypoint-title';
      title.textContent = waypoint.title;
      const phase = document.createElement('span');
      phase.className = 'drawer-waypoint-phase';
      phase.textContent = `SOL ${waypoint.sol} · ${waypoint.phase}`;
      button.append(title, phase);
      waypointList.append(button);
    });
  }

  createPinIcon(index, active) {
    const stateClass = active ? ' is-active' : '';
    return this.L.divIcon({
      className: 'ares-map-pin-icon',
      html: `<span class="ares-map-pin${stateClass}"><span>${index + 1}</span></span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }

  selectWaypoint(index, flyTo) {
    const waypoint = this.site.waypoints[index];
    if (!waypoint) return;

    this.waypointMarkers.forEach((marker, markerIndex) => {
      marker.setIcon(this.createPinIcon(markerIndex, markerIndex === index));
    });
    document.querySelectorAll('.drawer-waypoint-button').forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    document.getElementById('drawer-sol').textContent =
      `SOL ${waypoint.sol} · ${waypoint.phase}`;
    document.getElementById('drawer-title').textContent = waypoint.title;
    document.getElementById('drawer-coords').textContent =
      this.formatCoordinates(waypoint.coordinates);
    document.getElementById('drawer-elev').textContent = waypoint.elevation;
    document.getElementById('drawer-geology').textContent = waypoint.geology;
    document.getElementById('drawer-inst').textContent = waypoint.instruments.join(' · ');
    document.getElementById('drawer-summary').textContent = waypoint.summary;

    if (flyTo) {
      this.map.flyTo(waypoint.coordinates, Math.min(17, this.site.zoom + 2), {
        duration: 0.8,
      });
    }
  }

  formatCoordinates([latitude, longitude]) {
    const latitudeHemisphere = latitude < 0 ? 'S' : 'N';
    const longitudeHemisphere = longitude < 0 ? 'W' : 'E';
    return `${Math.abs(latitude).toFixed(4)}° ${latitudeHemisphere}, ${Math.abs(longitude).toFixed(4)}° ${longitudeHemisphere}`;
  }

  syncToolbar() {
    this.molaButton.textContent = `MOLA Elevation: ${this.molaEnabled ? 'ON' : 'OFF'}`;
    this.molaButton.setAttribute('aria-pressed', String(this.molaEnabled));
    this.localMosaicButton.classList.toggle('hidden', !this.site.localTileLayer);
    this.localMosaicButton.textContent =
      `Local Mosaic: ${this.localMosaicEnabled ? 'ON' : 'OFF'}`;
    this.localMosaicButton.setAttribute('aria-pressed', String(this.localMosaicEnabled));
  }

  showStatus(message) {
    this.mapStatus.textContent = message;
    this.mapStatus.classList.remove('hidden');
  }

  clearStatus() {
    this.mapStatus.textContent = '';
    this.mapStatus.classList.add('hidden');
  }
}
