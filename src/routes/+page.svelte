<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/auth.js';
  import { get } from 'svelte/store';

  onMount(() => {
    const state = get(auth);
    goto(state ? '/dashboard' : '/login', { replaceState: true });
  });
</script>

<div class="flex items-center justify-center py-24 text-slate-500">Memuat…</div>
