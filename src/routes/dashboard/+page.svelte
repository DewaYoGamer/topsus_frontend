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

  // --- Add Dosen form state ---
  let showDosenForm = false;
  let dosenForm = { nama: '', nip: '', email: '', password: '', role: 'dosen' };
  let dosenSubmitting = false;
  let dosenError = '';
  let dosenSuccess = '';

  // --- Add Mahasiswa form state ---
  let showMhsForm = false;
  let mhsForm = {
    nama: '',
    nim: '',
    email: '',
    password: '',
    dosen_pembimbing_id: ''
  };
  let mhsSubmitting = false;
  let mhsError = '';
  let mhsSuccess = '';

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
    data.mahasiswa = data.mahasiswa.map((m) => (m.id === updated.id ? updated : m));
  }

  function resetDosenForm() {
    dosenForm = { nama: '', nip: '', email: '', password: '', role: 'dosen' };
    dosenError = '';
  }
  function resetMhsForm() {
    mhsForm = { nama: '', nim: '', email: '', password: '', dosen_pembimbing_id: '' };
    mhsError = '';
  }

  async function submitDosen() {
    dosenSubmitting = true;
    dosenError = '';
    dosenSuccess = '';
    try {
      await api('/dosen', { method: 'POST', body: dosenForm });
      dosenSuccess = `Dosen "${dosenForm.nama}" berhasil ditambahkan.`;
      resetDosenForm();
      showDosenForm = false;
      await loadAdmin();
    } catch (e) {
      dosenError = String(e?.detail ?? e?.message ?? e);
    } finally {
      dosenSubmitting = false;
    }
  }

  async function submitMhs() {
    mhsSubmitting = true;
    mhsError = '';
    mhsSuccess = '';
    try {
      const payload = {
        nama: mhsForm.nama,
        nim: mhsForm.nim,
        email: mhsForm.email,
        password: mhsForm.password,
        dosen_pembimbing_id:
          mhsForm.dosen_pembimbing_id === ''
            ? null
            : Number(mhsForm.dosen_pembimbing_id)
      };
      await api('/mahasiswa', { method: 'POST', body: payload });
      mhsSuccess = `Mahasiswa "${mhsForm.nama}" berhasil ditambahkan.`;
      resetMhsForm();
      showMhsForm = false;
      await loadAdmin();
    } catch (e) {
      mhsError = String(e?.detail ?? e?.message ?? e);
    } finally {
      mhsSubmitting = false;
    }
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

  <!-- ===== DOSEN SECTION ===== -->
  <section class="mt-6">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-900">Daftar Dosen</h2>
      <button
        class="btn-primary"
        on:click={() => {
          showDosenForm = !showDosenForm;
          if (!showDosenForm) resetDosenForm();
        }}
      >
        {showDosenForm ? 'Batal' : '+ Tambah Dosen'}
      </button>
    </div>

    {#if dosenSuccess}
      <div class="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
        {dosenSuccess}
      </div>
    {/if}

    {#if showDosenForm}
      <form
        class="card mb-4 space-y-4"
        on:submit|preventDefault={submitDosen}
      >
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700" for="d-nama">Nama</label>
            <input id="d-nama" class="input" bind:value={dosenForm.nama} required maxlength="100" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700" for="d-nip">NIP</label>
            <input id="d-nip" class="input" bind:value={dosenForm.nip} required maxlength="20" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700" for="d-email">Email</label>
            <input id="d-email" type="email" class="input" bind:value={dosenForm.email} required />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700" for="d-pass">Password</label>
            <input id="d-pass" type="password" class="input" bind:value={dosenForm.password} required minlength="6" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700" for="d-role">Role</label>
            <select id="d-role" class="input" bind:value={dosenForm.role}>
              <option value="dosen">Dosen</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {#if dosenError}
          <div class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{dosenError}</div>
        {/if}

        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary" on:click={() => { showDosenForm = false; resetDosenForm(); }}>
            Batal
          </button>
          <button type="submit" class="btn-primary" disabled={dosenSubmitting}>
            {dosenSubmitting ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </form>
    {/if}

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

  <!-- ===== MAHASISWA SECTION ===== -->
  <section class="mt-8">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-900">Daftar Mahasiswa</h2>
      <button
        class="btn-primary"
        on:click={() => {
          showMhsForm = !showMhsForm;
          if (!showMhsForm) resetMhsForm();
        }}
      >
        {showMhsForm ? 'Batal' : '+ Tambah Mahasiswa'}
      </button>
    </div>

    {#if mhsSuccess}
      <div class="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
        {mhsSuccess}
      </div>
    {/if}

    {#if showMhsForm}
      <form
        class="card mb-4 space-y-4"
        on:submit|preventDefault={submitMhs}
      >
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700" for="m-nama">Nama</label>
            <input id="m-nama" class="input" bind:value={mhsForm.nama} required maxlength="100" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700" for="m-nim">NIM</label>
            <input id="m-nim" class="input" bind:value={mhsForm.nim} required maxlength="20" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700" for="m-email">Email</label>
            <input id="m-email" type="email" class="input" bind:value={mhsForm.email} required />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700" for="m-pass">Password</label>
            <input id="m-pass" type="password" class="input" bind:value={mhsForm.password} required minlength="6" />
          </div>
          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700" for="m-dosen">Dosen Pembimbing (opsional)</label>
            <select id="m-dosen" class="input" bind:value={mhsForm.dosen_pembimbing_id}>
              <option value="">— belum ditentukan —</option>
              {#each dosenList.filter((d) => d.role === 'dosen') as d}
                <option value={d.id}>{d.nama} ({d.nip})</option>
              {/each}
            </select>
          </div>
        </div>

        {#if mhsError}
          <div class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{mhsError}</div>
        {/if}

        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary" on:click={() => { showMhsForm = false; resetMhsForm(); }}>
            Batal
          </button>
          <button type="submit" class="btn-primary" disabled={mhsSubmitting}>
            {mhsSubmitting ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </form>
    {/if}

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
