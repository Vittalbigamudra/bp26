<script>
  import { goto } from "$app/navigation";
  import NavBar from "$lib/components/NavBar.svelte";


  function goToAuth() {
    // Navigate to the auth route using SvelteKit client navigation
    goto("/login");
  }

  function goToSignup() {
    // Smooth-scroll to the product/feature section if present; fallback to
    // scrolling down by one viewport height.
    goto("/signup");
  }
</script>

<div class="min-h-screen bg-[#0d1117] text-slate-200">

  <NavBar/>

  <!-- Hero Section -->
  <section class="px-6 py-28 max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">

    <!-- Left: Text -->
    <div>
      <h2 class="text-5xl md:text-6xl mb-6 tracking-tight text-white jersey-10-regular">
        Busman.
      </h2>

      <p class="max-w-md text-slate-400 text-lg leading-relaxed mb-10 roboto-mono">
        A simple, reliable way to keep track of school buses in real time.
        Built for schools, parents, and students who want clarity—not clutter.
      </p>

      <div class="flex gap-4 pixelify-sans">
        <button
          on:click={goToAuth}
          class="px-7 py-3 rounded-lg bg-[#E94822] hover:bg-[#F2910A] text-black font-semibold transition"
        >
          Log In
        </button>

        <button
          on:click={goToSignup}
          class="px-7 py-3 rounded-lg border border-[#30363d] hover:bg-[#161b22] transition font-semibold text-white"
        >
          Get Started
        </button>
      </div>
    </div>

    <!-- Right: Illustration Placeholder -->
    <div class="flex justify-center md:justify-end">
      <img src=src/lib/assets/front_page_image.png 
            alt="Busman Illustration"
          class="w-full max-w-md h-64 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center justify-center text-slate-500"
      />
    </div>

  </section>

  <!-- Secondary Section -->
  <section id="product" class="py-20 text-center border-t border-[#30363d] bg-[#0d1117]">
    <h3 class="text-3xl font-semibold mb-4 text-white jersey-10-regular">Busman. at a Glance</h3>
    <p class="text-slate-400 max-w-2xl mx-auto roboto-mono">
      Have you ever missed the bus? Of course you have. Busman. provides a route overview and live bus analytics to school/system admins, while providing students accurate ETA information based on road, weather, and traffic conditions, as well as notifying if any accidents occur.

    </p>
  </section>

</div>
