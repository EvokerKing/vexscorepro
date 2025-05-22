import { key } from "../../../assets/apikey.ts"

export const prerender = false

export async function GET(params: any) {
	/*
	* team= team number
	* event= event id teams have attended
	* registered= only show registered teams
	* program= team vex program
	* grade= team grade level [College, High School, Middle School, Elementary School]
	*/

	// get program id instead of abbreviation
	const programParam = params.url.searchParams.get("program")
	let program
	if (!!programParam) {
		const programIdRes = await fetch(`https://www.robotevents.com/api/v2/programs?per_page=250`, {
			headers: {
				"accept": "application/json",
				"Authorization": `Bearer ${key}`
			}
		})
		const programId = await programIdRes.json()
		for (const i of programId.data) {
			if (i.abbr.toLowerCase() == params.url.searchParams.get("program").toLowerCase()) {
				program = i.id
			}
		}
		if (!programId.data) return new Response("Program not found")
	}

	const team = params.url.searchParams.get("team")
	const event = params.url.searchParams.get("event")
	const registered = params.url.searchParams.get("registered")
	const grade = params.url.searchParams.get("grade")

	const searchParams = new URLSearchParams()
	program && searchParams.append("program", program)
	team && searchParams.append("number", team)
	event && searchParams.append("event", event)
	registered && searchParams.append("registered", "true")
	grade && searchParams.append("grade", grade)

	let teams: any[] = []
	const res = await fetch(`https://www.robotevents.com/api/v2/teams?per_page=250&${searchParams}`, {
		headers: {
			"accept": "application/json",
			"Authorization": `Bearer ${key}`
		}
	})
	const body = await res.json()

	const pages = params.url.searchParams.get("pages") ? (params.url.searchParams.get("pages") > 25 ? 25 : params.url.searchParams.get("pages")) : 3

	teams.push(...body.data)
	if (body.meta.from != body.meta.last_page) {
		for (let i = 2; i <= (body.meta.last_page > pages ? pages : body.meta.last_page); i++) {
			const iRes = await fetch(`https://www.robotevents.com/api/v2/teams?per_page=250&page=${i}&${searchParams}`, {
				headers: {
					"accept": "application/json",
					"Authorization": `Bearer ${key}`
				}
			})
			const iBody = await iRes.json()
			teams.push(...iBody.data)
		}
	}

	return new Response(JSON.stringify(teams), {
		headers: {
			"content-type": "application/json"
		}
	})
}
