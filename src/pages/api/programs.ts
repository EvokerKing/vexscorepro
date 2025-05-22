import { key } from "../../assets/apikey.ts"

export const prerender = false

export async function GET() {
	const res = await fetch(`https://www.robotevents.com/api/v2/programs?per_page=250`, {
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