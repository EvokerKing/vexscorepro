import { key } from "../../assets/apikey.ts"

export const prerender = false

export async function GET(params: any) {
	/**
	* active= whether to only show active seasons
	*/

	const res = await fetch(`https://www.robotevents.com/api/v2/seasons?per_page=250${params.url.searchParams.get("active") && "&active=true"}`, {
		headers: {
			"accept": "application/json",
			"Authorization": `Bearer ${key}`
		}
	})

	const body = await res.json()
	return new Response(JSON.stringify(body.data), {
		headers: {
			"content-type": "application/json"
		}
	})
}