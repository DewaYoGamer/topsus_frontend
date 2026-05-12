<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/auth.js';
  import { api } from '$lib/api.js';
  import { get } from 'svelte/store';

  /** @type {any} */
  let data = null;
  let dosenList = [];
  let loading = true;
  let error = '';

  async function loadAdmin() {
    const [dosen, mhs] = await Promise.all([api('/dosen'), api('/mahasiswa')]);
    dosenList = dosen;
    data = { dosen, mahasiswa: mhs };
  }
  async function loadDosen() {
    data = await api('/dosen/me');
  }
  async function loadMahasiswa() {
    data = await api('/mahasiswa/me');
  }

  async function assign(mhsId, dosenId) {
    const value = dosenId === '' ? null : Number(dosenId);
    const updated = await api(`/mahasiswa/${mhsId}/pembimbing`, {
      method: 'PATCH',
      body: { dosen_id: value }
    });
    // swap the row in place
    data.mahasiswa = data.mahasiswa.map((m) => (m.id === updated.id ? updated : m));
  }

  onMount(async () => {
    const state = get(auth);
    if (!state) {
      goto('/login', { replaceState: true });
      return;
    }
    try {
      if (state.role === 'admin') await loadAdmin();
      else if (state.role === 'dosen') await loadDosen();
      else await loadMahasiswa();
    } catch (e) {
      error = String(e?.detail ?? e?.message ?? e);
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="py-16 text-center text-slate-500">Memuat data…</div>
{:else if error}
  <div class="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
{:else if $auth?.role === 'admin'}
  <h1 class="text-2xl font-semibold text-slate-900">Dashboard Admin</h1>
  <p class="text-sm text-slate-600">Kelola daftar dosen dan mahasiswa, assign dosen pembimbing.</p>

  <section class="mt-6">
    <h2 class="mb-3 text-lg font-semibold text-slate-900">Daftar Dosen</h2>
    <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-2">NIP</th>
            <th class="px-4 py-2">Nama</th>
            <th class="px-4 py-2">Email</th>
            <th class="px-4 py-2">Role</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#each data.dosen as d}
            <tr>
              <td class="px-4 py-2 font-mono text-xs">{d.nip}</td>
              <td class="px-4 py-2">{d.nama}</td>
              <td class="px-4 py-2">{d.email}</td>
              <td class="px-4 py-2">
                {#if d.role === 'admin'}<span class="badge-admin">admin</span>
                {:else}<span class="badge-dosen">dosen</span>{/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <section class="mt-8">
    <h2 class="mb-3 text-lg font-semibold text-slate-900">Daftar Mahasiswa</h2>
    <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-2">NIM</th>
            <th class="px-4 py-2">Nama</th>
            <th class="px-4 py-2">Email</th>
            <th class="px-4 py-2">Dosen Pembimbing</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#each data.mahasiswa as m (m.id)}
            <tr>
              <td class="px-4 py-2 font-mono text-xs">{m.nim}</td>
              <td class="px-4 py-2">{m.nama}</td>
              <td class="px-4 py-2">{m.email}</td>
              <td class="px-4 py-2">
                <select
                  class="input max-w-xs"
                  value={m.dosen_pembimbing_id ?? ''}
                  on:change={(e) => assign(m.id, e.currentTarget.value)}
                >
                  <option value="">— belum ditentukan —</option>
                  {#each dosenList.filter((d) => d.role === 'dosen') as d}
                    <option value={d.id}>{d.nama} ({d.nip})</option>
                  {/each}
                </select>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
{:else if $auth?.role === 'dosen'}
  <h1 class="text-2xl font-semibold text-slate-900">Dashboard Dosen</h1>

  <section class="mt-4 card">
    <h2 class="text-lg font-semibold text-slate-900">Profil</h2>
    <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
      <dt class="text-slate-500">Nama</dt><dd>{data.nama}</dd>
      <dt class="text-slate-500">NIP</dt><dd class="font-mono">{data.nip}</dd>
      <dt class="text-slate-500">Email</dt><dd>{data.email}</dd>
      <dt class="text-slate-500">Role</dt><dd><span class="badge-dosen">{data.role}</span></dd>
    </dl>
  </section>

  <section class="mt-6">
    <h2 class="mb-3 text-lg font-semibold text-slate-900">
      Mahasiswa Bimbingan ({data.mahasiswa_bimbingan.length})
    </h2>
    {#if data.mahasiswa_bimbingan.length === 0}
      <div class="rounded border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        Belum ada mahasiswa bimbingan.
      </div>
    {:else}
      <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th class="px-4 py-2">NIM</th>
              <th class="px-4 py-2">Nama</th>
              <th class="px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {#each data.mahasiswa_bimbingan as m}
              <tr>
                <td class="px-4 py-2 font-mono text-xs">{m.nim}</td>
                <td class="px-4 py-2">{m.nama}</td>
                <td class="px-4 py-2">{m.email}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
{:else}
  <!-- mahasiswa -->
  <h1 class="text-2xl font-semibold text-slate-900">Dashboard Mahasiswa</h1>

  <section class="mt-4 card">
    <h2 class="text-lg font-semibold text-slate-900">Profil</h2>
    <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
      <dt class="text-slate-500">Nama</dt><dd>{data.nama}</dd>
      <dt class="text-slate-500">NIM</dt><dd class="font-mono">{data.nim}</dd>
      <dt class="text-slate-500">Email</dt><dd>{data.email}</dd>
      <dt class="text-slate-500">Role</dt><dd><span class="badge-mahasiswa">{data.role}</span></dd>
    </dl>
  </section>

  <section class="mt-6 card">
    <h2 class="text-lg font-semibold text-slate-900">Dosen Pembimbing</h2>
    {#if data.dosen_pembimbing}
      <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
        <dt class="text-slate-500">Nama</dt><dd>{data.dosen_pembimbing.nama}</dd>
        <dt class="text-slate-500">NIP</dt><dd class="font-mono">{data.dosen_pembimbing.nip}</dd>
        <dt class="text-slate-500">Email</dt><dd>{data.dosen_pembimbing.email}</dd>
      </dl>
    {:else}
      <p class="mt-3 text-sm text-slate-500">Belum memiliki dosen pembimbing.</p>
    {/if}
  </section>
{/if}
