<script>
  import { onMount } from "svelte";

  let messages = [];

  onMount(async () => {
    const res = await fetch("/api/sysadmin/messages");
    messages = await res.json();
  });
</script>

<div class="p-10 text-white bg-[#0d1117] min-h-screen">
  <h1 class="text-3xl font-bold mb-6">Sysadmin Messages</h1>

  {#if messages.length === 0}
    <p class="text-slate-400">No messages yet.</p>
  {/if}

  {#each messages as m}
    <div class="bg-[#161b22] border border-[#30363d] p-5 rounded-lg mb-4">
      <p class="text-lg font-semibold">{m.name} <span class="text-slate-400">({m.email})</span></p>
      <p class="mt-2">{m.message}</p>
      <p class="text-xs text-slate-500 mt-3">{m.created_at}</p>
    </div>
  {/each}
</div>
