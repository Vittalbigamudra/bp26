<script>
  import NavBar from "$lib/components/NavBar.svelte"; 
  let name = "";
  let email = "";
  let message = "";
  let status = "";
  let loading = false;

  async function handleSubmit(e) {
    e.preventDefault();
    status = "";
    loading = true;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (res.ok) {
        status = 'Thanks — your message was sent.';
        name = '';
        email = '';
        message = '';
      } else {
        const body = await res.json().catch(() => ({}));
        status = body.error || body.message || 'Failed to send message.';
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      status = 'Network error while sending message.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-[#0d1117] text-slate-200">
<NavBar/>
<section class="max-w-2xl mx-auto py-16 px-6 min-h-screen bg-[#0d1117] text-slate-200 border border-[#202428]">
  <h1 class="text-3xl font-bold mb-4 jersey-10-regular">Contact Us</h1>

  <p class="text-slate-400 mb-6 roboto-mono">Have a question or need support? Send us a message below.</p>

  <form on:submit={handleSubmit} class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1 roboto-mono">Name</label>
      <input bind:value={name} class="w-full px-4 py-3 rounded-lg bg-[#071019] border border-[#1f2a2f] text-slate-200 pixelify-sans" placeholder="Your name" />
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1 roboto-mono">Email</label>
      <input type="email" bind:value={email} class="w-full px-4 py-3 rounded-lg bg-[#071019] border border-[#1f2a2f] text-slate-200 pixelify-sans" placeholder="you@example.com" />
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1 roboto-mono">Message</label>
      <textarea bind:value={message} rows="6" class="w-full px-4 py-3 rounded-lg bg-[#071019] border border-[#1f2a2f] text-slate-200 pixelify" placeholder="How can we help?"></textarea>
    </div>

    <div class="flex items-center gap-4">
      <button type="submit" class="px-5 py-2 bg-[#2563EB] text-white rounded-lg pixelify-sans" disabled={loading}>
        {#if loading}Sending...{:else}Send Message{/if}
      </button>
      {#if status}
        <div class="text-green-400">{status}</div>
      {/if}
    </div>
  </form>
</section>
</div>  