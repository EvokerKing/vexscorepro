import { key } from "../../../assets/apikey.ts"

export const prerender = false

export async function GET(params: any) {
	/*
	* id= event id number
	* team= team number performing run
	*/

	let id = params.url.searchParams.get("id")

	try {
		id = parseInt(id)
		if (isNaN(id)) {
			return new Response("Please specify an id")
		}
	} catch (e) {
		return new Response("Invalid ID")
	}

	const teamParam = params.url.searchParams.get("team")
	let teamId: any = {}
	if (!!teamParam) {
		const teamIdRes = await fetch(`https://www.robotevents.com/api/v2/teams?number=${teamParam}`, {
			headers: {
				"accept": "application/json",
				"Authorization": `Bearer ${key}`
			}
		})
		teamId = await teamIdRes.json()
		if (!teamId.data) return new Response("Team not found")
	}

	const searchParams = new URLSearchParams()
	if (!!teamId.data) teamId.data.forEach((i: any) => {
		searchParams.append("team[]", i.id)
	})

	const runs = []
	const res = await fetch(`https://www.robotevents.com/api/v2/events/${id}/skills?per_page=250&${searchParams}`, {
		headers: {
			"accept": "application/json",
			"Authorization": `Bearer ${key}`
		}
	})
	const body = await res.json()
	runs.push(...body.data)
	if (body.meta.from != body.meta.last_page) {
		for (let i = 2; i <= body.meta.last_page; i++) {
			const iRes = await fetch(`https://www.robotevents.com/api/v2/events/${id}/skills?per_page=250&page=${i}&${searchParams}`, {
				headers: {
					"accept": "application/json",
					"Authorization": `Bearer ${key}`
				}
			})
			const iBody = await iRes.json()
			runs.push(...iBody.data)
		}
	}

	return new Response(JSON.stringify(runs), {
		headers: {
			"content-type": "application/json"
		}
	})
}