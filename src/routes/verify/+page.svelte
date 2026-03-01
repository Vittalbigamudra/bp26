<script>
  import { onMount } from "svelte";

  let username = "";
  let otp = "";
  let schools = [];
  let selectedSchool = "";
  let error = "";
  let success = "";

  onMount(async () => {
    // Load schools
    const res = await fetch("/api/schools");
    if (res.ok) {
      schools = await res.json();
      if (schools.length) selectedSchool = schools[0];
    }

    // Prefill from query params
    const params = new URLSearchParams(window.location.search);
    username = params.get("username") || "";
    const schoolFromParams = params.get("school");
    if (schoolFromParams) selectedSchool = schoolFromParams;
  });

  async function handleVerify() {
    error = "";
    success = "";

    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        schoolName: selectedSchool,
        otp
      })
    });

    const data = await res.json();

    if (!res.ok) {
      error = data.error || "Verification failed";
      return;
    }

    success = "Account verified! You can now log in.";
    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-yellow-400">
  <div class="bg-gray-100 p-10 rounded-3xl shadow-md w-125">
    <h2 class="text-2xl font-semibold mb-6">Verify Account</h2>

    {#if error}
      <p class="text-red-600 mb-4">{error}</p>
    {/if}

    {#if success}
      <p class="text-green-600 mb-4">{success}</p>
    {/if}

    <form on:submit|preventDefault={handleVerify} class="space-y-5">

      <input
        type="text"
        placeholder="username"
        bind:value={username}
        class="w-full px-4 py-3 rounded-xl border-2 border-gray-400"
      />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">School</label>
        <select bind:value={selectedSchool} class="w-full px-4 py-3 rounded-xl border-2 border-gray-400">
          {#each schools as s}
            <option value={s}>{s}</option>
          {/each}
        </select>
      </div>

      <input
        type="text"
        placeholder="Access Code (OTP)"
        bind:value={otp}
        class="w-full px-4 py-3 rounded-xl border-2 border-gray-400"
      />

      <button
        type="submit"
        class="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-6 py-2 rounded-xl transition"
      >
        Verify
      </button>
    </form>
  </div>
</div>
