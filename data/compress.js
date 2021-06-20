// last update: June 20, 2020

await (async source => {
	const res = await fetch(source).catch(error => console.error(error))
	const data = await res.json().catch(error => console.error(error))
	const decryption = data.reduce((acc, item) => {
		const { decrypted: name, id, systems } = item
		const collection = acc[name]
		if (collection) {
			collection.push({ id, systems: systems.sort() })
		}
		else {
			acc[name] = [{ id, systems: systems.sort() }]
		}
		return acc
	}, {})
    return console.log(JSON.stringify(decryption))
})('data/math.json')


