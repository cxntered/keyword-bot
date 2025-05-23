import type { youtube_v3 } from '@googleapis/youtube';
import type { Context } from 'hono';

import type { Bindings } from '../types/bindings';

export const searchVideos = async (query: string, maxResults: number, c: Context<{ Bindings: Bindings }>): Promise<youtube_v3.Schema$Video[]> => {
	const url = new URL('https://www.googleapis.com/youtube/v3/search');
	const params = {
		maxResults: maxResults.toString(),
		key: c.env.YOUTUBE_API_KEY,
		part: 'id',
		q: query
	};
	url.search = new URLSearchParams(params).toString();

	const results = (await fetch(url).then((res) => res.json())) as youtube_v3.Schema$SearchListResponse;
	const ids = results?.items?.map((item) => item.id?.videoId ?? '');

	return await fetchVideos(ids ?? [], c);
};

const fetchVideos = async (ids: string[], c: Context<{ Bindings: Bindings }>): Promise<youtube_v3.Schema$Video[]> => {
	const url = new URL('https://www.googleapis.com/youtube/v3/videos');
	const params = {
		key: c.env.YOUTUBE_API_KEY,
		id: ids.toString(),
		part: 'snippet'
	};
	url.search = new URLSearchParams(params).toString();

	const results = (await fetch(url).then((res) => res.json())) as youtube_v3.Schema$VideoListResponse;
	const videos = results?.items ?? [];

	return videos;
};
