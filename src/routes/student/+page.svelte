<script>
    import { onMount } from "svelte";

    // Data State
    let buses = {};          
    let busStatus = {};      
    let selectedBus = null;
    let busDetails = null;
    let messages = [];
    let pendingAccounts = [];

    // Helper to format seconds into HH:MM AM/PM
    function formatETA(secondsToAdd) {
        const now = new Date();
        const etaDate = new Date(now.getTime() + secondsToAdd * 1000);
        return etaDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    async function fetchBusLocations() {
        try {
            const res = await fetch("/api/buses/live");
            const rows = await res.json();
            const normalized = {};
            for (const r of rows) {
                const id = String(r.bus_id ?? r.id);
                normalized[id] = { 
                    lat: Number(r.latitude ?? r.lat), 
                    lng: Number(r.longitude ?? r.lng),
                    updated_at: r.updated_at 
                };
            }
            buses = normalized;
        } catch (e) { console.error("GPS Fetch Error:", e); }
    }

    async function fetchBusStatus() {
        const res = await fetch("/api/buses/status");
        busStatus = await res.json();
    }

    async function fetchBusDetails(id) {
        selectedBus = String(id);
        try {
            const [dRes, rRes] = await Promise.all([
                fetch(`/api/buses/${selectedBus}/details`),
                fetch(`/api/buses/${selectedBus}/route`)
            ]);
            
            const detailsData = await dRes.json();
            const stops = await rRes.json();
            
            const gps = buses[selectedBus];
            // Use assigned next stop OR the first stop from the route as fallback
            let target = (detailsData.nextStop && detailsData.nextStop.lat) 
                         ? detailsData.nextStop 
                         : (stops[0] || null);

            // Calculate ETA via OSRM (API only, no map drawing)
            if (gps && target && target.lat && target.lng) {
                const url = `https://router.project-osrm.org/route/v1/driving/${gps.lng},${gps.lat};${target.lng},${target.lat}?overview=false`;
                const osrmRes = await fetch(url);
                const data = await osrmRes.json();
                
                if (data.routes?.[0]) {
                    busDetails = { 
                        ...detailsData, 
                        nextStop: target, 
                        eta: formatETA(data.routes[0].duration) 
                    };
                }
            } else {
                busDetails = { ...detailsData, nextStop: target, eta: "Stationary" };
            }
        } catch (err) { 
            console.error("Details Fetch Error:", err); 
        }
    }

    async function fetchMessages() {
        const res = await fetch('/api/admin/messages');
        if (res.ok) messages = await res.json();
    }

    async function fetchPending() {
        const res = await fetch('/api/admin/pending');
        if (res.ok) pendingAccounts = await res.json();
    }

    async function approve(id) {
        await fetch("/api/admin/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        fetchPending();
    }

    async function reject(id) {
        await fetch("/api/admin/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        fetchPending();
    }

    onMount(() => {
        fetchBusLocations();
        fetchBusStatus();
        fetchMessages();
        fetchPending();

        const i1 = setInterval(fetchBusLocations, 3000);
        const i2 = setInterval(fetchBusStatus, 5000);
        const i3 = setInterval(fetchPending, 5000);

        return () => { 
            clearInterval(i1); 
            clearInterval(i2); 
            clearInterval(i3); 
        };
    });
</script>
<div class="pixelfy-sans flex h-screen bg-[#2C2D34] text-white">
    <div class="w-80 bg-[#2C2D34] border-r border-[#3A3B44] p-4 overflow-y-auto">
        <h1 class="text-xl font-bold mb-4 text-[#EFD510]">Student Dashboard</h1>

        <section class="mb-6">
            <h2 class="text-sm font-semibold mb-2 text-[#F2910A] uppercase tracking-wide">On Route</h2>
            {#each Object.entries(busStatus).filter(([id, s]) => s === "on-route" && id !== "999") as [id, status]}
                <button
                    type="button"
                    class="w-full text-left bg-[#3A3B44] p-3 rounded mb-3 hover:bg-[#44454F] border-l-4 transition-colors
                    {selectedBus === id ? 'border-[#E94822]' : 'border-transparent'}"
                    on:click={() => fetchBusDetails(id)}
                >
                    <div class="font-bold text-sm">Bus {id}</div>
                    <div class="text-[10px] text-gray-400">ID: {id}</div>
                </button>
            {/each}
        </section>

        <section class="mb-6">
            <h2 class="text-sm font-semibold mb-2 text-[#EFD510] uppercase tracking-wide">Completed</h2>
            {#each Object.entries(busStatus).filter(([id, s]) => s === "completed" && id !== "999") as [id, status]}
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
        </section>

        </div>

    <div class="flex-1 p-8 bg-[#23242A] flex flex-col items-center justify-center">
        {#if busDetails && selectedBus !== "999"}
            <div class="max-w-md w-full bg-[#3A3B44] border-t-4 border-[#E94822] shadow-2xl rounded-lg p-8">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-3xl font-bold">Bus {selectedBus}</h2>
                        <p class="text-[#EFD510] text-sm uppercase tracking-widest mt-1">Live Tracking</p>
                    </div>
                    <div class="bg-[#44454F] px-3 py-1 rounded text-xs text-green-400 animate-pulse">
                        ● Active
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-6">
                    <div class="bg-[#2C2D34] p-4 rounded border border-[#44454F]">
                        <div class="text-xs text-gray-400 uppercase mb-1">Estimated Arrival (ETA)</div>
                        <div class="text-4xl font-mono text-[#EFD510]">{busDetails.eta || '---'}</div>
                    </div>

                    <div class="bg-[#2C2D34] p-4 rounded border border-[#44454F]">
                        <div class="text-xs text-gray-400 uppercase mb-1">Next Destination</div>
                        <div class="text-xl font-semibold">{busDetails.nextStop?.name || 'No Stop Assigned'}</div>
                        <div class="text-sm text-gray-400 mt-1">Scheduled: {busDetails.nextStop?.time || '--:--'}</div>
                    </div>
                </div>
            </div>
        {:else}
            <div class="text-center text-gray-500">
                <div class="text-5xl mb-4">🚌</div>
                <p>Select a bus from the sidebar to view live arrival times.</p>
            </div>
        {/if}
    </div>
</div>