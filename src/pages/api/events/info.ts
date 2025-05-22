const key = import.meta.env.KEY

export const prerender = false

export async function GET(params: any) {
	/*
	* id= event id number
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

	const res = await fetch(`https://www.robotevents.com/api/v2/events/${id}`, {
		headers: {
			"accept": "application/json",
			"Authorization": `Bearer ${key}`
		}
	})

	const body = await res.json()
	return new Response(JSON.stringify(body), {
		headers: {
			"content-type": "application/json"
		}
	})
}