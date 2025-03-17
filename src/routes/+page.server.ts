import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const url = data.get('url') as string;
		const canParse = URL.canParse(url);

		if (!canParse || url.length > 256) {
			return fail(400, { invalid: true });
		}

		const headers = new Headers();
		const headerKeys = data.getAll('header-key');
		const headerValues = data.getAll('header-value');

		for (let i = 0; i < headerKeys.length; i++) {
			headers.set(headerKeys[i] as string, headerValues[i] as string);
		}

		const startTime = Date.now();
		const response = await fetch(url, {
			headers
		});

		const endTime = Date.now();

		const returnable = {
			status: response.status,
			ok: response.ok,
			url: response.url,
			headers: Object.fromEntries(response.headers),
			body: await response.text(),
			took: endTime - startTime
		};

		return returnable;
	}
} satisfies Actions;
