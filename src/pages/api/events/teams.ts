import { key } from "../../../assets/apikey.ts"

export const prerender = false

export async function GET(params: any) {
	/*
	* id= event id number
	* grade= the grade level of a team [College, High School, Middle School, Elementary School]
	*/

	let id = params.url.searchParams.get("id")
	let grade = params.url.searchParams.get("grade")

	try {
		id = parseInt(id)
		if (isNaN(id)) {
			return new Response("Please specify an id")
		}
	} catch (e) {
		return new Response("Invalid ID")
	}

	if (!!grade && !["college", "high school", "middle school", "elementary school"].includes(grade.toLowerCase())) {
		return new Response("Invalid grade")
	}

	const searchParams = new URLSearchParams()
	grade && searchParams.append("grade", grade)

	const teams = []

	const res = await fetch(`https://www.robotevents.com/api/v2/events/${id}/teams?per_page=250&${searchParams}`, {
		headers: {
			"accept": "application/json",
			"Authorization": `Bearer ${key}`
		}
	})
	const body = await res.json()
	teams.push(...body.data)
	if (body.meta.from != body.meta.last_page) {
		for (let i = 2; i <= body.meta.last_page; i++) {
			const iRes = await fetch(`https://www.robotevents.com/api/v2/events/${id}/teams?per_page=250&page=${i}&${searchParams}`, {
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