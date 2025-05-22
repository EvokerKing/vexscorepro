import { key } from "../../../assets/apikey.ts"

export const prerender = false

export async function GET(params: any) {
	/*
	* team= team number
	* event= event id number
	*/

	let id = params.url.searchParams.get("event")
	if (!!id) {
		try {
			id = parseInt(id)
		} catch (e) {
			return new Response("Invalid ID")
		}
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
	id && searchParams.append("event", id)

	const matches: any = {}

	for (const team of teamId.data) {
		const selfMatches = []
		const res = await fetch(`https://www.robotevents.com/api/v2/teams/${team.id}/matches?per_page=250&${searchParams}`, {
			headers: {
				"accept": "application/json",
				"Authorization": `Bearer ${key}`
			}
		})
		const body = await res.json()
		selfMatches.push(...body.data)
		if (body.meta.from != body.meta.last_page) {
			for (let i = 2; i <= body.meta.last_page; i++) {
				const iRes = await fetch(`https://www.robotevents.com/api/v2/teams/${team.id}/matches?per_page=250&page=${i}&${searchParams}`, {
					headers: {
						"accept": "application/json",
						"Authorization": `Bearer ${key}`
					}
				})
				const iBody = await iRes.json()
				selfMatches.push(...iBody.data)
			}
		}

		let wins = 0
		let losses = 0
		let ties = 0
		for (const i of selfMatches) {
			const blue = i.alliances[0]
			const red = i.alliances[1]
			let color
			let opp
			if (blue.teams[0].team.id == team.id || blue.teams[1]?.team.id == team.id) {
				color = blue
				opp = red
			} else if (red.teams[0].team.id == team.id || red.teams[1]?.team.id == team.id) {
				color = red
				opp = blue
			} else {
				return new Response("INTERNAL SERVER ERROR: Match with team on neither alliances")
			}

			if (!color.score || !opp.score) {
				continue
			}
			if (color.score == opp.score) {
				ties++
			} else if (color.score > opp.score) {
				wins++
			} else if (color.score < opp.score) {
				losses++
			}
		}

		matches[`${team.id}:${team.team_name}:${team.program.name}`] = {
			wins: wins,
			losses: losses,
			ties: ties,
			matches: selfMatches
		}
	}


	return new Response(JSON.stringify(matches), {
		headers: {
			"content-type": "application/json"
		}
	})
}