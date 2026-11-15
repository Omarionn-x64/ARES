import L from 'leaflet';
import { MARS_SITES, NASA_TREK_TILES } from './siteData.js';

const MOLA_OPACITY = 0.65;

export class MarsSurfaceMapController {
  constructor(container, onStateChange) {
    if (!container) {
      throw new Error('The Mars map container is unavailable.');
    }

<<<<<<< HEAD
    this.L = L;
    this.onStateChange = onStateChange;
    this.map = this.L.map(container, {
=======
    this.L = window.L;
    this.view = document.getElementById('mars-trek-view');
    this.mapStatus = document.getElementById('trek-map-status');
    this.molaButton = document.getElementById('btn-toggle-mola');
    this.localMosaicButton = document.getElementById('btn-toggle-local-mosaic');
    this.heatButton = document.getElementById('btn-toggle-heat');
    this.weatherButton = document.getElementById('btn-toggle-weather');

    this.map = this.L.map(containerId, {
>>>>>>> 972d8fd0c5a8ef3d5ba4f7cc042da165300330fa
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

    this.heatLayer = this.L.tileLayer(NASA_TREK_TILES.heatMap, {
      attribution: 'NASA THEMIS Day IR',
      bounds: this.L.latLngBounds([[-90, -180], [90, 180]]),
      maxNativeZoom: 7,
      maxZoom: 18,
      noWrap: true,
      opacity: 0.6,
    });

    this.weatherLayer = this.L.tileLayer(NASA_TREK_TILES.weatherMap, {
      attribution: 'NASA MGS TES Albedo',
      bounds: this.L.latLngBounds([[-90, -180], [90, 180]]),
      // The TES Albedo WMTS publishes only matrix levels 0 and 1.
      maxNativeZoom: 1,
      maxZoom: 18,
      noWrap: true,
      opacity: 0.5,
    });

    this.molaLayer.on('tileerror', () => {
      if (!this.molaEnabled) return;
      this.molaEnabled = false;
      this.map.removeLayer(this.molaLayer);
      this.syncToolbar();
      this.showStatus('MOLA elevation tiles could not be loaded. The optical map remains available.');
    });
    this.heatLayer.on('tileerror', () => {
      if (!this.heatEnabled) return;
      this.heatEnabled = false;
      this.map.removeLayer(this.heatLayer);
      this.syncToolbar();
      this.showStatus('THEMIS heat-map tiles could not be loaded. The optical map remains available.');
    });
    this.weatherLayer.on('tileerror', () => {
      if (!this.weatherEnabled) return;
      this.weatherEnabled = false;
      this.map.removeLayer(this.weatherLayer);
      this.syncToolbar();
      this.showStatus('TES surface-map tiles could not be loaded. The optical map remains available.');
    });

    this.markersLayer = this.L.layerGroup().addTo(this.map);
    this.routeLayer = null;
    this.routeLayerFailed = false;
    this.localLayer = null;
    this.site = null;
    this.waypointMarkers = [];
    this.waypointIndex = 0;
    this.molaEnabled = false;
    this.localMosaicEnabled = false;
    this.localTileErrorReported = false;
    this.heatEnabled = false;
    this.weatherEnabled = false;
    this.routePolyline = null;

    this.L.control.scale({ imperial: false, maxWidth: 140 }).addTo(this.map);
    this.map.on('moveend resize', () => {
      this.updateLocalLayer();
      this.updateRouteLayer();
    });
  }

  open(siteId) {
    this.loadSite(siteId);
    requestAnimationFrame(() => this.map.invalidateSize({ pan: false }));
  }

  destroy() {
    window.clearTimeout(this.localLayerUpdateTimer);
    window.clearTimeout(this.routeLayerUpdateTimer);
    this.map.remove();
  }

  loadSite(siteId) {
    const site = MARS_SITES[siteId];
    if (!site) {
      throw new RangeError(`Unknown Mars surface site: ${siteId}`);
    }

    this.site = site;
    this.waypointIndex = 0;
    this.map.stop();
    this.clearStatus();
    this.removeOptionalLayers();
    this.clearSiteLayers();
    this.routeLayerFailed = false;
    this.map.setView(site.center, site.zoom, { animate: false });

<<<<<<< HEAD
    this.renderRoute();
=======
    document.getElementById('trek-kicker').textContent = site.kicker;
    document.getElementById('trek-site-title').textContent = site.title;
    document.querySelectorAll('.trek-site-switcher [data-site]').forEach((button) => {
      const active = button.dataset.site === site.id;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

>>>>>>> 972d8fd0c5a8ef3d5ba4f7cc042da165300330fa
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

  toggleHeat() {
    if (this.heatEnabled) {
      this.map.removeLayer(this.heatLayer);
      this.heatEnabled = false;
    } else {
      this.heatLayer.addTo(this.map);
      this.heatEnabled = true;
    }
    this.syncToolbar();
    return this.heatEnabled;
  }

  toggleWeather() {
    if (this.weatherEnabled) {
      this.map.removeLayer(this.weatherLayer);
      this.weatherEnabled = false;
    } else {
      this.weatherLayer.addTo(this.map);
      this.weatherEnabled = true;
    }
    this.syncToolbar();
    return this.weatherEnabled;
  }

  removeOptionalLayers() {
    if (this.molaEnabled) this.map.removeLayer(this.molaLayer);
    if (this.localLayer && this.localMosaicEnabled) {
      this.map.removeLayer(this.localLayer);
    }
    if (this.heatEnabled) this.map.removeLayer(this.heatLayer);
    if (this.weatherEnabled) this.map.removeLayer(this.weatherLayer);
    window.clearTimeout(this.localLayerUpdateTimer);
    this.molaEnabled = false;
    this.localMosaicEnabled = false;
    this.heatEnabled = false;
    this.weatherEnabled = false;
    this.localTileErrorReported = false;
  }

  clearSiteLayers() {
    this.markersLayer.clearLayers();
    this.waypointMarkers = [];
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
      this.routeLayer = null;
    }
    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline);
      this.routePolyline = null;
    }
    window.clearTimeout(this.routeLayerUpdateTimer);
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
    if (!this.site.traverseLayerName) return;

    const emptyImage = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    const layer = this.L.imageOverlay(
      emptyImage,
      this.L.latLngBounds([[-90, -180], [90, 180]]),
      { opacity: 0.95, interactive: false }
    );
    const site = this.site;
    this.routeLayer = layer;
    layer.on('error', () => {
      if (this.routeLayer !== layer || this.site !== site) return;
      this.routeLayerFailed = true;
      this.map.removeLayer(layer);
      this.showStatus(
        'The NASA traverse overlay is unavailable. The selected mission POIs remain available.'
      );
    });
    layer.addTo(this.map);
    this.updateRouteLayer();
  }

  updateRouteLayer() {
    if (!this.routeLayer || !this.site || this.routeLayerFailed) return;

    window.clearTimeout(this.routeLayerUpdateTimer);
    const layer = this.routeLayer;
    const site = this.site;
    this.routeLayerUpdateTimer = window.setTimeout(() => {
      if (
        this.routeLayer !== layer ||
        this.site !== site ||
        this.routeLayerFailed
      ) {
        return;
      }
      this.refreshRouteLayer(layer, site);
    }, 150);
  }

  refreshRouteLayer(layer, site) {
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
    const url = NASA_TREK_TILES.traverseMapServer.replace(
      '{layer}',
      encodeURIComponent(site.traverseLayerName)
    );

    layer.setBounds(bounds);
    layer.setUrl(`${url}?${params}`);
  }

  renderWaypoints() {
<<<<<<< HEAD
=======
    const waypointList = document.getElementById('drawer-waypoint-list');
    const coordinates = [];
>>>>>>> 972d8fd0c5a8ef3d5ba4f7cc042da165300330fa
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
<<<<<<< HEAD
=======
      coordinates.push(waypoint.coordinates);

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
      phase.textContent = `SOL ${waypoint.sol} · ${waypoint.date} · ${waypoint.phase}`;
      button.append(title, phase);
      waypointList.append(button);
>>>>>>> 972d8fd0c5a8ef3d5ba4f7cc042da165300330fa
    });

    // Draw red dashed connection line between all POIs
    if (coordinates.length > 1) {
      this.routePolyline = this.L.polyline(coordinates, {
        color: '#c1440e',
        weight: 3,
        opacity: 0.85,
        dashArray: '10, 8',
        lineJoin: 'round',
        interactive: false,
      }).addTo(this.map);
    }
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

    this.waypointIndex = index;
    this.waypointMarkers.forEach((marker, markerIndex) => {
      marker.setIcon(this.createPinIcon(markerIndex, markerIndex === index));
    });
    this.onStateChange({
      site: this.site,
      waypointIndex: index,
      molaEnabled: this.molaEnabled,
      localMosaicEnabled: this.localMosaicEnabled,
    });

<<<<<<< HEAD
=======
    document.getElementById('drawer-sol').textContent =
      `SOL ${waypoint.sol} · ${waypoint.date} · ${waypoint.phase}`;
    document.getElementById('drawer-title').textContent = waypoint.title;
    document.getElementById('drawer-coords').textContent =
      this.formatCoordinates(waypoint.coordinates);
    document.getElementById('drawer-elev').textContent = waypoint.elevation;
    document.getElementById('drawer-geology').textContent = waypoint.geology;
    document.getElementById('drawer-inst').textContent = waypoint.instruments.join(' · ');
    document.getElementById('drawer-summary').textContent = waypoint.summary;

    // Open POI popup on the map at the marker location
    const popupContent = `
      <div class="poi-popup">
        <div class="poi-popup-sol">${waypoint.sol} · ${waypoint.date} · ${waypoint.phase}</div>
        <h3 class="poi-popup-title">${waypoint.title}</h3>
        <div class="poi-popup-coords">${this.formatCoordinates(waypoint.coordinates)}</div>
        <div class="poi-popup-elev">${waypoint.elevation}</div>
        <div class="poi-popup-inst">${waypoint.instruments.join(' · ')}</div>
        <div class="poi-popup-summary">${waypoint.summary}</div>
      </div>
    `;
    const marker = this.waypointMarkers[index];
    marker.bindPopup(popupContent, { className: 'poi-leaflet-popup', offset: [0, -18] }).openPopup();

>>>>>>> 972d8fd0c5a8ef3d5ba4f7cc042da165300330fa
    if (flyTo) {
      this.map.flyTo(waypoint.coordinates, Math.min(17, this.site.zoom + 2), {
        duration: 0.8,
      });
    }
  }

  syncToolbar() {
<<<<<<< HEAD
    this.onStateChange({
      status: this.status || '',
      site: this.site,
      waypointIndex: this.waypointIndex,
      molaEnabled: this.molaEnabled,
      localMosaicEnabled: this.localMosaicEnabled,
    });
=======
    this.molaButton.textContent = `MOLA Elevation: ${this.molaEnabled ? 'ON' : 'OFF'}`;
    this.molaButton.setAttribute('aria-pressed', String(this.molaEnabled));
    this.localMosaicButton.classList.toggle('hidden', !this.site.localTileLayer);
    this.localMosaicButton.textContent =
      `Local Mosaic: ${this.localMosaicEnabled ? 'ON' : 'OFF'}`;
    this.localMosaicButton.setAttribute('aria-pressed', String(this.localMosaicEnabled));
    this.heatButton.textContent = `Heat Map: ${this.heatEnabled ? 'ON' : 'OFF'}`;
    this.heatButton.setAttribute('aria-pressed', String(this.heatEnabled));
    this.weatherButton.textContent = `Weather Map: ${this.weatherEnabled ? 'ON' : 'OFF'}`;
    this.weatherButton.setAttribute('aria-pressed', String(this.weatherEnabled));
>>>>>>> 972d8fd0c5a8ef3d5ba4f7cc042da165300330fa
  }

  showStatus(message) {
    this.status = message;
    this.onStateChange({ status: message });
  }

  clearStatus() {
    this.status = '';
    this.onStateChange({ status: '' });
  }
}
