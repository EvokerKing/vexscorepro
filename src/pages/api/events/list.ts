const key = import.meta.env.KEY
import lunr from "lunr";

export const prerender = false

export async function GET(params: any) {
	/*
	* team= team number
	* game= vex competition game name
	* start= start time in format 2025-05-11T22:00:11.040Z
	* end= end time in format 2025-05-11T22:00:11.040Z
	* region= region (state) written out
	* level= event level [World, National, Regional, Signature, Other]
	* pages= number of pages to render, maximum of 25, default of 3
	* search= search for an event
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

	const start = params.url.searchParams.get("start")
	const end = params.url.searchParams.get("end")
	const region = params.url.searchParams.get("region")
	const level = params.url.searchParams.get("level")

	const searchParams = new URLSearchParams()
	if (!!teamId.data) teamId.data.forEach((i: any) => {
		searchParams.append("team[]", i.id)
	})
	if (!!seasons) seasons.forEach((i: any) => {
		searchParams.append("season[]", i)
	})
	start && searchParams.append("start", start)
	end && searchParams.append("end", end)
	region && searchParams.append("region", region)
	level && searchParams.append("level", level)

	let events: any[] = []

	const res = await fetch(`https://www.robotevents.com/api/v2/events?per_page=250&${searchParams}`, {
		headers: {
			"accept": "application/json",
			"Authorization": `Bearer ${key}`
		}
	})
	const body = await res.json()

	const pages = params.url.searchParams.get("pages") ? (params.url.searchParams.get("pages") > 25 ? 25 : params.url.searchParams.get("pages")) : 3

	events.push(...body.data)
	if (body.meta.from != body.meta.last_page) {
		for (let i = 2; i <= (body.meta.last_page > pages ? pages : body.meta.last_page); i++) {
			const iRes = await fetch(`https://www.robotevents.com/api/v2/events?per_page=250&page=${i}&${searchParams}`, {
				headers: {
					"accept": "application/json",
					"Authorization": `Bearer ${key}`
				}
			})
			const iBody = await iRes.json()
			events.push(...iBody.data)
		}
	}

	if (params.url.searchParams.get("search")) {
		const idx = lunr(function () {
			this.ref("name")
			this.field("name")

			events.forEach(doc => {
				this.add(doc)
			})
		})

		const results = idx.search(params.url.searchParams.get("search"))
		const resultsList: any[] = []
		results.forEach(i => {
			resultsList.push(i.ref)
		})
		const eventsFiltered: any[] = []
		events.forEach(i => {
			if (resultsList.includes(i.name)) {
				eventsFiltered.push(i)
			}
		})
		eventsFiltered.sort((a, b) => {
			return resultsList.findIndex(el => el == a.name) - resultsList.findIndex(el => el == b.name)
		})
		events = eventsFiltered
	}

	return new Response(JSON.stringify(events), {
		headers: {
			"content-type": "application/json"
		}
	})
}
