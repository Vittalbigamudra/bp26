<script>
    let currentPath = "undefined";
    if (typeof window !== 'undefined') {
        currentPath = window.location.pathname;
    }
</script>

<!-- Navbar -->
<nav class="flex justify-between items-center px-12 py-6 border-b border-[#30363d] bg-[#0d1117]">
<!-- <h1 class="text-2xl font-semibold tracking-wide text-white">Busman</h1> -->
<a href="/"><img src="src\lib\assets\logo.png" alt="Busman Logo" class="h-8 w-auto" /></a>

<div class="space-x-8 text-sm uppercase tracking-wide text-slate-400">
    <a href="/" class={(currentPath === 'undefined' || currentPath === "/") ? "text-[#E94822]" : "hover:text-white transition"}>Home</a>
    <a href="/about" class={(currentPath === '/about') ? "text-[#E94822]" : "hover:text-white transition"}>About</a>
    <a href="/contact" class={(currentPath === '/contact') ? "text-[#E94822]" : "hover:text-white transition"}>Contact</a>
</div>

</nav>