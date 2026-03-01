<script>
  import { onMount } from "svelte";
  import maplibregl from "maplibre-gl";

  const MAPTILER_KEY = "8G5oreAn1PJYGuI6Xgi9";

  let student = null;
  let overview = null;
  let routeStops = [];
  let map;
  let marker;

  const routeSourceId = "student-route-source";
  const routeLayerId = "student-route-layer";

  async function loadOverview() {
    const stored = localStorage.getItem("student");
    if (!stored) return window.location.href = "/login";

    student = JSON.parse(stored).user;

    const res = await fetch(`/api/student/${student.id}/overview`);
    if (!res.ok) return;

    overview = await res.json();
  }

  async function loadRoute() {
    if (!overview?.busId) return;

    const res = await fetch(`/api/buses/${overview.busId}/route`);
    if (!res.ok) return;

    routeStops = await res.json();
  }

  async function loadLive() {
    if (!overview?.busId) return;

    const res = await fetch(`/api/buses/${overview.busId}/live`);
    if (!res.ok) return;

    const loc = await res.json();
    if (marker) marker.setLngLat([loc.lng, loc.lat]);
  }

  function drawRoute() {
    if (!map || !routeStops.length) return;

    const coords = routeStops.map(s => [s.lng, s.lat]);

    if (map.getLayer(routeLayerId)) map.removeLayer(routeLayerId);
    if (map.getSource(routeSourceId)) map.removeSource(routeSourceId);

    map.addSource(routeSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords }
      }
    });

    map.addLayer({
      id: routeLayerId,
      type: "line",
      source: routeSourceId,
      paint: { "line-color": "#F2910A", "line-width": 5 }
    });

    const bounds = new maplibregl.LngLatBounds();
    coords.forEach(c => bounds.extend(c));
    map.fitBounds(bounds, { padding: 40 });
  }

  function initMap() {
    const { lat, lng } = overview.location;

    map = new maplibregl.Map({
      container: "map",
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
      center: [lng, lat],
      zoom: 13
    });

    map.addControl(new maplibregl.NavigationControl(), "top-left");

    map.on("load", () => {
      marker = new maplibregl.Marker({ color: "#E94822" })
        .setLngLat([lng, lat])
        .addTo(map);

      drawRoute();
      setTimeout(() => map.resize(), 200);
    });
  }

  onMount(async () => {
    await loadOverview();
    await loadRoute();
    initMap();

    setInterval(loadLive, 5000);
  });
</script>

<div class="flex h-screen bg-[#2C2D34] text-white">
  <div class="w-80 bg-[#2C2D34] border-r border-[#3A3B44] p-4 overflow-y-auto">
    <h1 class="text-xl font-bold mb-4 text-[#EFD510]">Student Dashboard</h1>

    {#if overview}
      <div class="mb-4">
        <div class="text-xs uppercase text-gray-400">Bus</div>
        <div class="text-sm font-semibold">Bus {overview.busNumber}</div>
      </div>

      <div class="mb-4">
        <div class="text-xs uppercase text-gray-400">Scheduled</div>
        <div class="text-sm">{overview.scheduledArrival}</div>
      </div>

      <div class="mb-4">
        <div class="text-xs uppercase text-gray-400">ETA</div>
        <div class="text-sm text-[#EFD510]">{overview.eta}</div>
      </div>

      <div class="mb-4">
        <div class="text-xs uppercase text-gray-400">Next Stop</div>
        <div class="text-sm font-semibold">{overview.nextStop?.name}</div>
        <div class="text-xs text-gray-300">{overview.nextStop?.time}</div>
      </div>
    {/if}
  </div>

  <div class="flex-1 relative">
    <div id="map" class="absolute inset-0"></div>
  </div>
</div>

<style>
  #map { width: 100%; height: 100%; }
</style>
