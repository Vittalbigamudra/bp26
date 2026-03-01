<script>
  import { onMount } from "svelte";
  import maplibregl from "maplibre-gl";

  let student = null;
  let busDetails = null;
  let map;
  let marker;

  const MAPTILER_KEY = "8G5oreAn1PJYGuI6Xgi9";

  onMount(async () => {
    const stored = localStorage.getItem("student");
    if (!stored) {
      window.location.href = "/login";
      return;
    }

    student = JSON.parse(stored);

    await loadBusData();

    if (busDetails) {
      initMap();
    }

    setInterval(loadBusData, 5000);
  });

  async function loadBusData() {
    const res = await fetch(`/api/bus/${student.busNumber}`);
    const data = await res.json();

    if (!res.ok || !data || !data.lng || !data.lat) {
      console.error("Invalid bus data:", data);
      return;
    }

    busDetails = data;

    if (map && marker) {
      marker.setLngLat([busDetails.lng, busDetails.lat]);
    }
  }

  function initMap() {
    if (!busDetails || !busDetails.lng || !busDetails.lat) {
      console.error("Cannot init map, busDetails missing:", busDetails);
      return;
    }

    map = new maplibregl.Map({
      container: "map",
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
      center: [busDetails.lng, busDetails.lat],
      zoom: 14
    });

    map.addControl(new maplibregl.NavigationControl(), "top-left");

    marker = new maplibregl.Marker({ color: "#E94822" })
      .setLngLat([busDetails.lng, busDetails.lat])
      .addTo(map);

    setTimeout(() => map.resize(), 200);
  }
</script>

<div class="flex min-h-screen h-screen bg-[#0d1117] text-white">
  <div class="flex-1 relative">
    <div id="map" class="absolute inset-0"></div>

    {#if busDetails}
      <div class="absolute top-4 right-4 bg-[#3A3B44] text-white shadow-xl rounded p-4 w-80 border border-[#44454F]">
        <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full bg-[#E94822]"></span>
          <span>Bus {student.busNumber}</span>
        </h3>

        <div class="mb-3">
          <div class="text-xs uppercase text-gray-400">Scheduled Arrival</div>
          <div class="text-sm">{busDetails.scheduledArrival}</div>
        </div>

        <div class="mb-3">
          <div class="text-xs uppercase text-gray-400">Estimated Arrival</div>
          <div class="text-sm text-[#EFD510]">{busDetails.eta}</div>
        </div>

        <div class="mb-1">
          <div class="text-xs uppercase text-gray-400">Next Stop</div>
          <div class="text-sm font-semibold">{busDetails.next_stop}</div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  #map {
    width: 100%;
    height: 100%;
  }
</style>
