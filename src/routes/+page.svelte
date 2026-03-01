<script>
  import { goto } from "$app/navigation";

  function goToLog() {
    console.log("Live Log");
  }

  function goToMap() {
    console.log("Live Map");
  }

  function goToAuth() {
    // Navigate to the auth route using SvelteKit client navigation
    goto("/auth");
  }

  function goToProduct() {
    // Smooth-scroll to the product/feature section if present; fallback to
    // scrolling down by one viewport height.
    const el = document.getElementById("product");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    }
  }
</script>

<div class="min-h-screen bg-[#0d1117] text-slate-200">

  <!-- Navbar -->
  <nav class="flex justify-between items-center px-12 py-6 border-b border-[#30363d] bg-[#0d1117]">
    <h1 class="text-2xl font-semibold tracking-wide text-white">Busman</h1>

    <div class="space-x-8 text-sm uppercase tracking-wide text-slate-400">
      <a href="/" class="hover:text-white transition">Home</a>
      <a href="/about" class="hover:text-white transition">About</a>
      <a href="/contact" class="hover:text-white transition">Contact</a>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="px-6 py-28 max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">

    <!-- Left: Text -->
    <div>
      <h2 class="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">
        Busman
      </h2>

      <p class="max-w-md text-slate-400 text-lg leading-relaxed mb-10">
        A simple, reliable way to keep track of school buses in real time.
        Built for schools, parents, and students who want clarity—not clutter.
      </p>

      <div class="flex gap-4">
        <button
          on:click={goToAuth}
          class="px-7 py-3 rounded-lg bg-[#E94822] hover:bg-[#F2910A] text-black font-semibold transition"
        >
          Sign In
        </button>

        <button
          on:click={goToProduct}
          class="px-7 py-3 rounded-lg border border-[#30363d] hover:bg-[#161b22] transition font-semibold text-white"
        >
          Get Started
        </button>
      </div>
    </div>

    <!-- Right: Illustration Placeholder -->
    <div class="flex justify-center md:justify-end">
      <div class="w-full max-w-md h-64 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center justify-center text-slate-500">
        Image Placeholder
      </div>
    </div>

  </section>

  <!-- Secondary Section -->
  <section id="product" class="py-20 text-center border-t border-[#30363d] bg-[#0d1117]">
    <h3 class="text-3xl font-semibold mb-4 text-white">Busman at a Glance</h3>
    <p class="text-slate-400 max-w-2xl mx-auto">
      Add quick highlights, metrics, or important system information here.
    </p>
  </section>

</div>
