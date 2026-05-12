<script>
  import { goto } from '$app/navigation';
  import { api, ApiError } from '$lib/api.js';
  import { auth } from '$lib/auth.js';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';

  onMount(() => {
    if (get(auth)) goto('/dashboard', { replaceState: true });
  });

  async function submit() {
    loading = true;
    error = '';
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      auth.login(data);
      goto('/dashboard', { replaceState: true });
    } catch (e) {
      error = e instanceof ApiError ? String(e.detail) : 'Login gagal';
    } finally {
      loading = false;
    }
  }
</script>

<div class="mx-auto flex min-h-[80vh] max-w-md items-center">
  <div class="card w-full">
    <h1 class="text-2xl font-semibold text-slate-900">Masuk</h1>
    <p class="mt-1 text-sm text-slate-600">Aplikasi Akademik — Login dengan akun kampus</p>

    <form class="mt-6 space-y-4" on:submit|preventDefault={submit}>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700" for="email">Email</label>
        <input id="email" type="email" class="input" bind:value={email} required autocomplete="username" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700" for="password">Password</label>
        <input id="password" type="password" class="input" bind:value={password} required autocomplete="current-password" />
      </div>

      {#if error}
        <div class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      {/if}

      <button type="submit" class="btn-primary w-full" disabled={loading}>
        {loading ? 'Memproses…' : 'Masuk'}
      </button>
    </form>

    <div class="mt-6 rounded bg-slate-50 p-3 text-xs text-slate-600">
      <p class="font-medium text-slate-700">Akun demo:</p>
      <ul class="mt-1 space-y-0.5">
        <li>admin@kampus.ac.id / admin123</li>
        <li>budi@kampus.ac.id / dosen123</li>
        <li>ani@kampus.ac.id / mhs123</li>
        <li>chandra@kampus.ac.id / mhs123</li>
      </ul>
    </div>
  </div>
</div>
