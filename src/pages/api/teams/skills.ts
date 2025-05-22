import { key } from "../../../assets/apikey.ts"

export const prerender = false

export async function GET(params: any) {
	/*
	* team= team number
	* game= vex competition game name
	*/

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

	// get season id instead of game name
	const gameParam = params.url.searchParams.get("game")
	let seasons: string[] = []
	if (!!gameParam) {
		const seasonIdRes = await fetch(`https://www.robotevents.com/api/v2/seasons?per_page=250`, {
			headers: {
				"accept": "application/json",
				"Authorization": `Bearer ${key}`
			}
		})
		const seasonId = await seasonIdRes.json()
		for (const i of seasonId.data) {
			if (i.name.toLowerCase().includes(params.url.searchParams.get("game").toLowerCase())) {
				seasons.push(i.id)
			}
		}
		if (!seasonId.data) return new Response("Season not found")
	}

	const searchParams = new URLSearchParams()
	if (!!seasons) seasons.forEach((i: any) => {
		searchParams.append("season[]", i)
	})

	const runs: any = {}

	for (const team of teamId.data) {
		const selfRuns = []
		const res = await fetch(`https://www.robotevents.com/api/v2/teams/${team.id}/skills?per_page=250&${searchParams}`, {
			headers: {
				"accept": "application/json",
				"Authorization": `Bearer ${key}`
			}
		})
		const body = await res.json()
		selfRuns.push(...body.data)
		if (body.meta.from != body.meta.last_page) {
			for (let i = 2; i <= body.meta.last_page; i++) {
				const iRes = await fetch(`https://www.robotevents.com/api/v2/teams/${team.id}/skills?per_page=250&page=${i}&${searchParams}`, {
					headers: {
						"accept": "application/json",
						"Authorization": `Bearer ${key}`
					}
				})
				const iBody = await iRes.json()
				selfRuns.push(...iBody.data)
			}
		}

		selfRuns.sort((a, b) => b.score - a.score)

		runs[`${team.id}:${team.team_name}:${team.program.name}`] = selfRuns
	}


	return new Response(JSON.stringify(runs), {
		headers: {
			"content-type": "application/json"
		}
	})
}