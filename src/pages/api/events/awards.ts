const key = import.meta.env.KEY

export const prerender = false

export async function GET(params: any) {
	/*
	* id= event id number
	* team= team number to filter by
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

	// get team id instead of number
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

	const res = await fetch(`https://www.robotevents.com/api/v2/events/${id}/awards?per_page=250&${searchParams}`, {
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