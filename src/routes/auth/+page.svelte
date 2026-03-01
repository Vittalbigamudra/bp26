<script>
  import { onMount } from "svelte";

  let username = "";
  let password = "";
  let schools = [];
  let selectedSchool = "";

  onMount(async () => {
    try {
      const res = await fetch("/api/schools");
      if (res.ok) {
        schools = await res.json();
        if (schools.length) selectedSchool = String(schools[0].id);
      } else {
        console.error("Failed to load schools", res.status);
      }
    } catch (err) {
      console.error("Error fetching schools:", err);
    }
  });

  function handleSubmit() {
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("Selected school:", selectedSchool);
    // TODO: send auth request including selectedSchool to backend
  }
</script>

<div class="relative min-h-screen bg-yellow-400 overflow-hidden flex items-center justify-center">

  <!-- Background Shapes -->
  <div class="absolute top-10 left-10 w-24 h-24 bg-gray-800 rounded-full"></div>

  <div class="absolute -bottom-40 -left-40 w-125 h-125 bg-yellow-300 rounded-full opacity-80"></div>

  <div class="absolute top-0 -right-40 w-125 h-125 bg-yellow-300 rounded-full opacity-80"></div>

  <div class="absolute -bottom-20 -right-20 w-75 h-75 bg-yellow-300 rounded-full opacity-80"></div>

  <!-- Login Card -->
  <div class="relative bg-gray-100 w-125 p-10 rounded-3xl shadow-md">
    <h2 class="text-2xl font-semibold mb-6">Log In</h2>

    <form on:submit|preventDefault={handleSubmit} class="space-y-5">
      <div>
        <label for="school" class="block text-sm font-medium text-gray-700 mb-1">School</label>
        <select id="school" bind:value={selectedSchool} class="w-full px-4 py-3 rounded-xl border-2 border-gray-400 outline-none focus:border-gray-600">
          {#each schools as s}
            <option value={s.id}>{s.name}</option>
          {/each}
          {#if schools.length === 0}
            <option value="">No schools available</option>
          {/if}
        </select>
      </div>
      <div>
        <label for="username" class="sr-only">Username</label>
        <input
          id="username"
          type="text"
          placeholder="username"
          bind:value={username}
          class="w-full px-4 py-3 rounded-xl border-2 border-gray-400 outline-none focus:border-gray-600"
        />
      </div>

      <div>
        <label for="password" class="sr-only">Password</label>
        <input
          id="password"
          type="password"
          placeholder="password"
          bind:value={password}
          class="w-full px-4 py-3 rounded-xl border-2 border-gray-400 outline-none focus:border-gray-600"
        />
      </div>

      <button
        type="submit"
        class="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-6 py-2 rounded-xl transition"
      >
        Sign In
      </button>
    </form>
  </div>
</div>