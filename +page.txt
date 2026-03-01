<script>
    import { onMount } from "svelte";
    import maplibre from "maplibre-gl";

    let map;
    let markers = {};

    let buses = {};          // live GPS
    let busStatus = {};      // on-route / completed
    let selectedBus = null;
    let busDetails = null;
    let messages = [];

    let routeLayerId = "bus-route";
    let routeSourceId = "bus-route-source";
    const MAPTILER_KEY = "8G5oreAn1PJYGuI6Xgi9";

    async function fetchRoadRoute(stops) {
        // Fetch the actual road route from OSRM (Open Source Routing Machine)
        if (stops.length < 2) return null;

        const coords = stops.map(s => `${s.lng},${s.lat}`).join(";");
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes && data.routes[0] && data.routes[0].geometry) {
                return data.routes[0].geometry.coordinates; // [lng, lat] pairs
            }
        } catch (err) {
            console.error("Error fetching road route:", err);
        }
        return null;
    }

    async function fetchBusLocations() {
        const res = await fetch("/api/buses/live");
        const rows = await res.json();

        // Normalize array of rows into object keyed by bus_id
        const normalized = {};
        for (const r of rows) {
            // some rows may use latitude/longitude keys
            const lat = Number(r.latitude ?? r.lat ?? r.latitude);
            const lng = Number(r.longitude ?? r.lng ?? r.long ?? r.longitude);
            const id = String(r.bus_id ?? r.id ?? r.busId);

            if (!isFinite(lat) || !isFinite(lng) || !id) continue;

            normalized[id] = { lat, lng, updated_at: r.updated_at };
        }

        buses = normalized;
        updateMarkers();
    }

    async function fetchBusStatus() {
        const res = await fetch("/api/buses/status");
        busStatus = await res.json();
    }

    async function fetchBusDetails(id) {
        const res = await fetch(`/api/buses/${id}/details`);
        busDetails = await res.json();
        selectedBus = id;

        const routeRes = await fetch(`/api/buses/${id}/route`);
        const stops = await routeRes.json();

        drawRoute(stops);
    }

    function updateMarkers() {
        // Add/update markers only for valid numeric coordinates
        for (const id in buses) {
            const bus = buses[id];
            if (!isFinite(bus.lat) || !isFinite(bus.lng)) {
                // remove any existing invalid marker
                if (markers[id]) {
                    try { markers[id].remove(); } catch (e) {}
                    delete markers[id];
                }
                continue;
            }

            const coords = [bus.lng, bus.lat];

            if (!markers[id]) {
                markers[id] = new maplibre.Marker({ color: "#E94822" })
                    .setLngLat(coords)
                    .addTo(map);
            } else {
                markers[id].setLngLat(coords);
            }
        }

        // Remove markers for buses no longer present
        for (const id in Object.keys(markers)) {
            if (!buses[id]) {
                try { markers[id].remove(); } catch (e) {}
                delete markers[id];
            }
        }
    }

    function drawRoute(stops) {
        fetchRoadRoute(stops).then(roadCoords => {
            if (map.getLayer(routeLayerId)) map.removeLayer(routeLayerId);
            if (map.getSource(routeSourceId)) map.removeSource(routeSourceId);

            // Use road route if available, otherwise use straight lines
            const coords = roadCoords || stops.map(s => [s.lng, s.lat]);

            map.addSource(routeSourceId, {
                type: "geojson",
                data: {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: coords
                    }
                }
            });

            map.addLayer({
                id: routeLayerId,
                type: "line",
                source: routeSourceId,
                paint: {
                    "line-color": "#F2910A",
                    "line-width": 5
                }
            });

            // Fit map to bounds
            const bounds = new maplibre.LngLatBounds();
            stops.forEach(s => bounds.extend([s.lng, s.lat]));
            map.fitBounds(bounds, { padding: 40 });
        });
    }

    onMount(() => {
        map = new maplibre.Map({
            container: "map",
            style: "https://api.maptiler.com/maps/streets/style.json?key=8G5oreAn1PJYGuI6Xgi9",
            center: [-84.2291, 34.1472],
            zoom: 12
        });

        map.addControl(new maplibre.NavigationControl(), "top-left");

        // avoid console noise if the style contains icons the dev server can't load
        map.on('styleimagemissing', e => {
            console.warn('style image missing:', e.id);
            // if desired, supply a dummy icon:
            // const img = new Image(); img.src = '/transparent.png'; map.addImage(e.id, img);
        });

        fetchBusLocations();
        fetchBusStatus();

        setInterval(fetchBusLocations, 3000);
        setInterval(fetchBusStatus, 5000);
        fetchMessages();
    });

    async function fetchMessages() {
        try {
            const res = await fetch('/api/admin/messages');
            if (res.ok) {
                messages = await res.json();
            } else {
                console.error('Failed to fetch messages', res.status);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    }
    let pendingAccounts = [];

async function fetchPending() {
  const res = await fetch('/api/admin/pending');
  if (res.ok) {
    pendingAccounts = await res.json();
  }
}

onMount(() => {
  fetchPending();
  setInterval(fetchPending, 5000);
});
async function reject(id) {
  const res = await fetch("/api/admin/reject", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });

  if (res.ok) {
    fetchPending(); // refresh list
  }
}


</script>

<div class="flex h-screen bg-[#2C2D34] text-white">
    <!-- Sidebar -->
    <div class="w-80 bg-[#2C2D34] border-r border-[#3A3B44] p-4 overflow-y-auto">
        <h1 class="text-xl font-bold mb-4 text-[#EFD510]">Admin Dashboard</h1>

        <h2 class="text-sm font-semibold mb-2 text-[#F2910A] uppercase tracking-wide">
            On Route
        </h2>

        {#each Object.entries(busStatus).filter(([id, s]) => s === "on-route") as [id, status]}
            <button
                type="button"
                class="w-full text-left bg-[#3A3B44] p-3 rounded mb-3 hover:bg-[#44454F] border-l-4 transition-colors
                {selectedBus === id ? 'border-[#E94822]' : 'border-transparent'}"
                on:click={() => fetchBusDetails(id)}
            >
                <div class="font-bold text-sm">Bus {id}</div>
                <div class="text-xs text-gray-300">Lat: {buses[id]?.lat}</div>
                <div class="text-xs text-gray-300">Lng: {buses[id]?.lng}</div>
            </button>
        {/each}

        <h2 class="text-sm font-semibold mt-6 mb-2 text-[#EFD510] uppercase tracking-wide">
            Completed
        </h2>

        {#each Object.entries(busStatus).filter(([id, s]) => s === "completed") as [id, status]}
            <button
                type="button"
                class="w-full text-left bg-[#3A3B44] p-3 rounded mb-3 hover:bg-[#44454F] border-l-4 transition-colors
                {selectedBus === id ? 'border-[#E94822]' : 'border-transparent'}"
                on:click={() => fetchBusDetails(id)}
            >
                <div class="font-bold text-sm">Bus {id}</div>
                <div class="text-xs text-gray-400">Route Completed</div>
            </button>
        {/each}

        <h2 class="text-sm font-semibold mt-6 mb-2 text-[#EFD510] uppercase tracking-wide">
            Messages
        </h2>
        {#if messages.length === 0}
            <div class="text-xs text-gray-300">No messages</div>
        {:else}
            {#each messages as msg}
                <div class="bg-[#3A3B44] p-3 rounded mb-3 text-xs">
                    <div class="font-bold">{msg.name} &lt;{msg.email}&gt;</div>
                    <div class="mt-1 whitespace-pre-wrap">{msg.message}</div>
                    <div class="mt-1 text-right text-gray-400 text-[10px]">{new Date(msg.created_at).toLocaleString()}</div>
                </div>
            {/each}
        {/if}
        <h2 class="text-sm font-semibold mt-6 mb-2 text-[#EFD510] uppercase tracking-wide">
  Pending Accounts
</h2>

{#each pendingAccounts as p}
  <div class="bg-[#3A3B44] p-3 rounded mb-3 text-xs">
    <div class="font-bold">{p.username}</div>
    <div class="text-gray-300">{p.school_name}</div>
    <div class="mt-1 text-[#EFD510]">OTP: {p.otp}</div>
    <div class="mt-1 text-gray-400 text-[10px]">
      {new Date(p.created_at).toLocaleString()}
    </div>

    <div class="flex gap-2 mt-3">
      <button
        class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
        on:click={() => approve(p.id)}
      >
        Approve
      </button>

      <button
        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        on:click={() => reject(p.id)}
      >
        Reject
      </button>
    </div>
  </div>
{/each}


    </div>

    <!-- Map + Details -->
    <div class="flex-1 relative">
        <div id="map" class="absolute inset-0"></div>

        {#if busDetails}
            <div class="absolute top-4 right-4 bg-[#3A3B44] text-white shadow-xl rounded p-4 w-80 border border-[#44454F]">
                <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
                    <span class="inline-block w-2 h-2 rounded-full bg-[#E94822]"></span>
                    <span>Bus {selectedBus}</span>
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
                    <div class="text-sm font-semibold">{busDetails.nextStop.name}</div>
                    <div class="text-xs text-gray-300">{busDetails.nextStop.time}</div>
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
