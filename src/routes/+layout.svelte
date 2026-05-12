<script>
  import '../app.css';
  import { auth } from '$lib/auth.js';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  async function logout() {
    await auth.logout();
    goto('/login');
  }

  $: onLogin = $page.url.pathname === '/login';
</script>

{#if $auth && !onLogin}
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <a href="/dashboard" class="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <span class="text-indigo-600">●</span> Aplikasi Akademik
      </a>
      <div class="flex items-center gap-3">
        <span class="text-sm text-slate-600">
          {$auth.nama}
          {#if $auth.role === 'admin'}<span class="badge-admin ml-1">admin</span>
          {:else if $auth.role === 'dosen'}<span class="badge-dosen ml-1">dosen</span>
          {:else}<span class="badge-mahasiswa ml-1">mahasiswa</span>{/if}
        </span>
        <button class="btn-secondary" on:click={logout}>Logout</button>
      </div>
    </div>
  </header>
{/if}

<main class="mx-auto max-w-6xl px-4 py-6">
  <slot />
</main>
