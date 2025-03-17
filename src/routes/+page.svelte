<script lang="ts">
	import HeaderPicker from './../components/HeaderPicker.svelte';
	import { enhance } from '$app/forms';
	import { writable } from 'svelte/store';
	import type { PageProps } from './$types';
	import CloudflareLogo from '../components/CloudflareLogo.svelte';

	let { form }: PageProps = $props();

	const showModal = writable(false);
	const headerPickers = writable(1);

	function titleCaseHeader(header: string) {
		return header
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join('-');
	}

	function injectBase(data: string): string {
		const baseUrl = new URL(form?.url ?? '');
		return data.replace(/<head>/, `<head><base href="${baseUrl.origin}">`);
	}
</script>

<svelte:head>
	<title>
		Am I Blocked? - Find out if a website is properly blocking Cloudflare's IP addresses
	</title>
</svelte:head>

{#if form}
	<div
		class={`w-screen h-screen ${!$showModal ? 'opacity-0 pointer-events-none fixed' : ''} items-center justify-center flex transition-all`}
		id="modal"
	>
		<div
			class="bg-white bordered border rounded-md w-[96vw] md:w-[34rem] lg:w-[50vw] z-20 fixed flex flex-col my-8 p-4 h-fit max-h-screen overflow-y-scroll overflow-x-hidden shadow-2xl"
		>
			<h2>{new URL(form?.url ?? '').hostname}</h2>
			{#if form?.headers}
				<h3>Headers</h3>
				<p>The headers returned by the server.</p>
				<table>
					<tbody>
						{#each Object.entries(form?.headers ?? {}) as [key, value]}
							<tr>
								<th
									class="copy"
									onclick={() => {
										navigator.clipboard.writeText(value);
									}}>{titleCaseHeader(key)}</th
								>
								<td
									class="max-w-8 overflow-x-auto overflow-ellipsis text-nowrap copy pl-2"
									onclick={() => {
										navigator.clipboard.writeText(value);
									}}>{value}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
			{#if form?.body?.toLowerCase().includes('<!doctype html>')}
				<div class="flex flex-row mt-4">
					<h3>Preview</h3>
					<button
						class="ml-2.5"
						onclick={() => {
							const iframe = document.querySelector('iframe');
							iframe?.requestFullscreen();
						}}>fullscreen</button
					>
				</div>
				<iframe class="bordered" srcdoc={injectBase(form.body)} title="Preview" allow="fullscreen"
				></iframe>
			{:else if form?.body}
				<h3 class="mt-4">Raw</h3>
				<pre class="overflow-scroll h-32">{form?.body}</pre>
			{/if}
		</div>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-background w-screen h-screen z-10" onclick={() => showModal.set(false)}></div>
	</div>
{/if}
<main class="flex flex-col items-center justify-center h-screen">
	<div class="w-96 mb-96">
		<CloudflareLogo />
		<form method="POST" use:enhance class="w-full flex flex-col">
			<div class="w-full flex flex-row items-stretch">
				<input
					type="url"
					name="url"
					minlength="5"
					maxlength="256"
					required
					class="bordered py-2 px-2.5 bg-white rounded-l-md border-r-0 border rounded-r-none text-sm outline-blue-600 focus:outline-2 outline-offset-2 w-full"
					placeholder="Request a site from Cloudflare servers"
				/>
				<button
					class="rounded-r-md px-3 border border-blue-600 text-blue-600 text-sm bg-white hover:bg-[#dcebff] transition-colors"
					type="submit">Submit</button
				>
			</div>
			<div class="flex flex-col mt-2 gap-y-2">
				<div
					class="flex flex-col w-full gap-y-2 max-h-10 overflow-y-scroll snap-y"
					id="header-pickers"
				>
					{#each Array.from({ length: $headerPickers }, (_, i) => i)}
						<HeaderPicker />
					{/each}
				</div>
				<div class="flex flex-row gap-x-2">
					<button
						class="border border-blue-600 text-blue-600 text-sm bg-white hover:bg-[#dcebff] rounded-md py-2.5 transition-colors w-1/2"
						type="button"
						onclick={() => headerPickers.update((e) => e + 1)}>Add Header</button
					>
					<button
						class="border border-red-600 text-red-600 text-sm bg-white hover:bg-[#ffdcdc] rounded-md py-2.5 transition-colors w-1/2"
						type="button"
						onclick={() => headerPickers.update((e) => Math.max(e - 1, 1))}>Remove Header</button
					>
				</div>
			</div>
		</form>
		{#if form}
			<div class="text-sm mt-2 flex flex-row items-stretch justify-between w-full">
				<div class="flex flex-col p-2 w-full bordered border-r-0 border rounded-md rounded-r-none">
					<span>{form?.status} {form?.ok ? 'OK' : ''}</span>
					<span class="text-xs text-gray-500">{form?.took}ms</span>
				</div>
				<button
					onclick={() => showModal.set(true)}
					class="border border-[#f38020] rounded-r-md w-9 flex items-center hover:w-21.5 ease-in-out transition-all justify-center text-[#f38020] hover:bg-[#f38020] hover:text-white font-bold"
				>
					>
				</button>
			</div>
		{/if}
	</div>
</main>

<style lang="postcss">
	@reference "tailwindcss";

	.copy {
		@apply hover:opacity-80 transition-all active:opacity-50 select-none duration-150;
	}

	#modal th {
		@apply text-left py-1 font-normal max-w-4;
	}
	#modal td {
		@apply py-1;
	}
	#modal tr {
		@apply border-b;
	}
	#modal table {
		@apply table-auto w-full mt-2;
	}
	#modal h2 {
		@apply font-semibold opacity-70;
	}
	#modal h3 {
		@apply font-semibold text-3xl;
	}

	form {
		display: flex;
	}

	.bordered {
		border-color: rgb(49, 49, 49);
	}

	.modal-background {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	iframe {
		border: none;
	}

	#header-pickers {
		/* scroll */
		scrollbar-width: thin;
		scrollbar-color: #e9e9e9 #ffffff;
	}
</style>
