<script>
  import { onMount } from "svelte";

  let username = "";
  let password = "";
  let confirmPassword = "";
  let schools = [];
  let selectedSchool = "";
  let error = "";
  let success = "";

  onMount(async () => {
    const res = await fetch("/api/schools");
    if (res.ok) {
      schools = await res.json();
      if (schools.length) selectedSchool = schools[0];
    }
  });

  async function handleSignup() {
  error = "";
  success = "";

  if (password !== confirmPassword) {
    error = "Passwords do not match";
    return;
  }

  const res = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      schoolName: selectedSchool
    })
  });

  const data = await res.json();

  if (!res.ok) {
    error = data.error || "Signup failed";
    return;
  }

  // Redirect to verify page with username + school prefilled
  window.location.href =
    `/verify?username=${encodeURIComponent(username)}&school=${encodeURIComponent(selectedSchool)}`;
}

</script>


<div class="pixelify-sans relative min-h-screen bg-yellow-400 overflow-hidden flex items-center justify-center">

  <a href="/"><img class="absolute top-10 left-10 w-16 h-16" src="src/lib/assets/logodark.png" alt="dark logo"/></a>
  <div class="absolute -bottom-40 -left-40 w-125 h-125 bg-yellow-300 rounded-full opacity-80"></div>
  <div class="absolute top-0 -right-40 w-125 h-125 bg-yellow-300 rounded-full opacity-80"></div>
  <div class="absolute -bottom-20 -right-20 w-75 h-75 bg-yellow-300 rounded-full opacity-80"></div>

  <div class="relative bg-gray-100 w-125 p-10 rounded-3xl shadow-md">
    <h2 class="jersey-10-regular text-2xl font-semibold mb-6">Create Account</h2>

    {#if error}
      <p class="text-red-600 mb-4">{error}</p>
    {/if}

    {#if success}
      <p class="text-green-600 mb-4">{success}</p>
    {/if}

    <form on:submit|preventDefault={handleSignup} class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">School</label>
        <select id="school" bind:value={selectedSchool} class="w-full px-4 py-3 rounded-xl border-2 border-gray-400">
          {#each schools as s}
            <option value={s}>{s}</option>
          {/each}
        </select>
      </div>

      <input type="text" placeholder="username" bind:value={username}
        class="w-full px-4 py-3 rounded-xl border-2 border-gray-400" />

      <input type="password" placeholder="password" bind:value={password}
        class="w-full px-4 py-3 rounded-xl border-2 border-gray-400" />

      <input type="password" placeholder="confirm password" bind:value={confirmPassword}
        class="w-full px-4 py-3 rounded-xl border-2 border-gray-400" />

      <button type="submit"
        class="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-6 py-2 rounded-xl transition">
        Sign Up
      </button>

      <p class="text-sm text-gray-600 mt-2">
        Already have an account?
        <a href="/login" class="text-orange-600 hover:underline">Log in</a>
      </p>
    </form>
  </div>
</div>