const key = import.meta.env.KEY

export const prerender = false

export async function GET(params: any) {
	/*
	* team= team number
	*/

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
	} else {
		if (!teamId.data) return new Response("Team not specified")
	}

	const teams: Response[] = []

	for (const i of teamId.data) {
		const res = await fetch(`https://www.robotevents.com/api/v2/teams/${i.id}`, {
			headers: {
				"accept": "application/json",
				"Authorization": `Bearer ${key}`
			}
		})
		const body = await res.json()
		teams.push(body)
	}

	return new Response(JSON.stringify(teams), {
		headers: {
			"content-type": "application/json"
		}
	})
}