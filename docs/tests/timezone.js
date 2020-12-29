(() => {

const hashMini = str => {
	const json = `${JSON.stringify(str)}`
	let i, len, hash = 0x811c9dc5
	for (i = 0, len = json.length; i < len; i++) {
		hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	}
	return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
}

// ie11 fix for template.content
function templateContent(template) {
	// template {display: none !important} /* add css if template is in dom */
	if ('content' in document.createElement('template')) {
		return document.importNode(template.content, true)
	} else {
		const frag = document.createDocumentFragment()
		const children = template.childNodes
		for (let i = 0, len = children.length; i < len; i++) {
			frag.appendChild(children[i].cloneNode(true))
		}
		return frag
	}
}

// tagged template literal (JSX alternative)
const patch = (oldEl, newEl, fn = null) => {
	oldEl.parentNode.replaceChild(newEl, oldEl)
	return typeof fn === 'function' ? fn() : true
}
const html = (stringSet, ...expressionSet) => {
	const template = document.createElement('template')
	template.innerHTML = stringSet.map((str, i) => `${str}${expressionSet[i] || ''}`).join('')
	return templateContent(template) // ie11 fix for template.content
}

const note = {
	unsupported: '<span class="blocked">unsupported</span>',
	blocked: '<span class="blocked">blocked</span>',
	lied: '<span class="lies">lied</span>'
}

// inspired by https://arkenfox.github.io/TZP
// https://github.com/vvo/tzdb/blob/master/time-zones-names.json
const cities = [
	"UTC",
	"GMT",
	"Etc/GMT+0",
	"Etc/GMT+1",
	"Etc/GMT+10",
	"Etc/GMT+11",
	"Etc/GMT+12",
	"Etc/GMT+2",
	"Etc/GMT+3",
	"Etc/GMT+4",
	"Etc/GMT+5",
	"Etc/GMT+6",
	"Etc/GMT+7",
	"Etc/GMT+8",
	"Etc/GMT+9",
	"Etc/GMT-1",
	"Etc/GMT-10",
	"Etc/GMT-11",
	"Etc/GMT-12",
	"Etc/GMT-13",
	"Etc/GMT-14",
	"Etc/GMT-2",
	"Etc/GMT-3",
	"Etc/GMT-4",
	"Etc/GMT-5",
	"Etc/GMT-6",
	"Etc/GMT-7",
	"Etc/GMT-8",
	"Etc/GMT-9",
	"Etc/GMT",
	"Africa/Abidjan",
	"Africa/Accra",
	"Africa/Addis_Ababa",
	"Africa/Algiers",
	"Africa/Asmara",
	"Africa/Bamako",
	"Africa/Bangui",
	"Africa/Banjul",
	"Africa/Bissau",
	"Africa/Blantyre",
	"Africa/Brazzaville",
	"Africa/Bujumbura",
	"Africa/Cairo",
	"Africa/Casablanca",
	"Africa/Ceuta",
	"Africa/Conakry",
	"Africa/Dakar",
	"Africa/Dar_es_Salaam",
	"Africa/Djibouti",
	"Africa/Douala",
	"Africa/El_Aaiun",
	"Africa/Freetown",
	"Africa/Gaborone",
	"Africa/Harare",
	"Africa/Johannesburg",
	"Africa/Juba",
	"Africa/Kampala",
	"Africa/Khartoum",
	"Africa/Kigali",
	"Africa/Kinshasa",
	"Africa/Lagos",
	"Africa/Libreville",
	"Africa/Lome",
	"Africa/Luanda",
	"Africa/Lubumbashi",
	"Africa/Lusaka",
	"Africa/Malabo",
	"Africa/Maputo",
	"Africa/Maseru",
	"Africa/Mbabane",
	"Africa/Mogadishu",
	"Africa/Monrovia",
	"Africa/Nairobi",
	"Africa/Ndjamena",
	"Africa/Niamey",
	"Africa/Nouakchott",
	"Africa/Ouagadougou",
	"Africa/Porto-Novo",
	"Africa/Sao_Tome",
	"Africa/Tripoli",
	"Africa/Tunis",
	"Africa/Windhoek",
	"America/Adak",
	"America/Anchorage",
	"America/Anguilla",
	"America/Antigua",
	"America/Araguaina",
	"America/Argentina/Buenos_Aires",
	"America/Argentina/Catamarca",
	"America/Argentina/Cordoba",
	"America/Argentina/Jujuy",
	"America/Argentina/La_Rioja",
	"America/Argentina/Mendoza",
	"America/Argentina/Rio_Gallegos",
	"America/Argentina/Salta",
	"America/Argentina/San_Juan",
	"America/Argentina/San_Luis",
	"America/Argentina/Tucuman",
	"America/Argentina/Ushuaia",
	"America/Aruba",
	"America/Asuncion",
	"America/Atikokan",
	"America/Bahia",
	"America/Bahia_Banderas",
	"America/Barbados",
	"America/Belem",
	"America/Belize",
	"America/Blanc-Sablon",
	"America/Boa_Vista",
	"America/Bogota",
	"America/Boise",
	"America/Cambridge_Bay",
	"America/Campo_Grande",
	"America/Cancun",
	"America/Caracas",
	"America/Cayenne",
	"America/Cayman",
	"America/Chicago",
	"America/Chihuahua",
	"America/Costa_Rica",
	"America/Creston",
	"America/Cuiaba",
	"America/Curacao",
	"America/Danmarkshavn",
	"America/Dawson",
	"America/Dawson_Creek",
	"America/Denver",
	"America/Detroit",
	"America/Dominica",
	"America/Edmonton",
	"America/Eirunepe",
	"America/El_Salvador",
	"America/Fort_Nelson",
	"America/Fortaleza",
	"America/Glace_Bay",
	"America/Godthab",
	"America/Goose_Bay",
	"America/Grand_Turk",
	"America/Grenada",
	"America/Guadeloupe",
	"America/Guatemala",
	"America/Guayaquil",
	"America/Guyana",
	"America/Halifax",
	"America/Havana",
	"America/Hermosillo",
	"America/Indiana/Indianapolis",
	"America/Indiana/Knox",
	"America/Indiana/Marengo",
	"America/Indiana/Petersburg",
	"America/Indiana/Tell_City",
	"America/Indiana/Vevay",
	"America/Indiana/Vincennes",
	"America/Indiana/Winamac",
	"America/Inuvik",
	"America/Iqaluit",
	"America/Jamaica",
	"America/Juneau",
	"America/Kentucky/Louisville",
	"America/Kentucky/Monticello",
	"America/Kralendijk",
	"America/La_Paz",
	"America/Lima",
	"America/Los_Angeles",
	"America/Lower_Princes",
	"America/Maceio",
	"America/Managua",
	"America/Manaus",
	"America/Marigot",
	"America/Martinique",
	"America/Matamoros",
	"America/Mazatlan",
	"America/Menominee",
	"America/Merida",
	"America/Metlakatla",
	"America/Mexico_City",
	"America/Miquelon",
	"America/Moncton",
	"America/Monterrey",
	"America/Montevideo",
	"America/Montserrat",
	"America/Nassau",
	"America/New_York",
	"America/Nipigon",
	"America/Nome",
	"America/Noronha",
	"America/North_Dakota/Beulah",
	"America/North_Dakota/Center",
	"America/North_Dakota/New_Salem",
	"America/Ojinaga",
	"America/Panama",
	"America/Pangnirtung",
	"America/Paramaribo",
	"America/Phoenix",
	"America/Port-au-Prince",
	"America/Port_of_Spain",
	"America/Porto_Velho",
	"America/Puerto_Rico",
	"America/Punta_Arenas",
	"America/Rainy_River",
	"America/Rankin_Inlet",
	"America/Recife",
	"America/Regina",
	"America/Resolute",
	"America/Rio_Branco",
	"America/Santarem",
	"America/Santiago",
	"America/Santo_Domingo",
	"America/Sao_Paulo",
	"America/Scoresbysund",
	"America/Sitka",
	"America/St_Barthelemy",
	"America/St_Johns",
	"America/St_Kitts",
	"America/St_Lucia",
	"America/St_Thomas",
	"America/St_Vincent",
	"America/Swift_Current",
	"America/Tegucigalpa",
	"America/Thule",
	"America/Thunder_Bay",
	"America/Tijuana",
	"America/Toronto",
	"America/Tortola",
	"America/Vancouver",
	"America/Whitehorse",
	"America/Winnipeg",
	"America/Yakutat",
	"America/Yellowknife",
	"Antarctica/Casey",
	"Antarctica/Davis",
	"Antarctica/DumontDUrville",
	"Antarctica/Macquarie",
	"Antarctica/Mawson",
	"Antarctica/McMurdo",
	"Antarctica/Palmer",
	"Antarctica/Rothera",
	"Antarctica/Syowa",
	"Antarctica/Troll",
	"Antarctica/Vostok",
	"Arctic/Longyearbyen",
	"Asia/Aden",
	"Asia/Almaty",
	"Asia/Amman",
	"Asia/Anadyr",
	"Asia/Aqtau",
	"Asia/Aqtobe",
	"Asia/Ashgabat",
	"Asia/Atyrau",
	"Asia/Baghdad",
	"Asia/Bahrain",
	"Asia/Baku",
	"Asia/Bangkok",
	"Asia/Barnaul",
	"Asia/Beirut",
	"Asia/Bishkek",
	"Asia/Brunei",
	"Asia/Calcutta",
	"Asia/Chita",
	"Asia/Choibalsan",
	"Asia/Colombo",
	"Asia/Damascus",
	"Asia/Dhaka",
	"Asia/Dili",
	"Asia/Dubai",
	"Asia/Dushanbe",
	"Asia/Famagusta",
	"Asia/Gaza",
	"Asia/Hebron",
	"Asia/Ho_Chi_Minh",
	"Asia/Hong_Kong",
	"Asia/Hovd",
	"Asia/Irkutsk",
	"Asia/Jakarta",
	"Asia/Jayapura",
	"Asia/Jerusalem",
	"Asia/Kabul",
	"Asia/Kamchatka",
	"Asia/Karachi",
	"Asia/Kathmandu",
	"Asia/Khandyga",
	"Asia/Kolkata",
	"Asia/Krasnoyarsk",
	"Asia/Kuala_Lumpur",
	"Asia/Kuching",
	"Asia/Kuwait",
	"Asia/Macau",
	"Asia/Magadan",
	"Asia/Makassar",
	"Asia/Manila",
	"Asia/Muscat",
	"Asia/Nicosia",
	"Asia/Novokuznetsk",
	"Asia/Novosibirsk",
	"Asia/Omsk",
	"Asia/Oral",
	"Asia/Phnom_Penh",
	"Asia/Pontianak",
	"Asia/Pyongyang",
	"Asia/Qatar",
	"Asia/Qostanay",
	"Asia/Qyzylorda",
	"Asia/Riyadh",
	"Asia/Sakhalin",
	"Asia/Samarkand",
	"Asia/Seoul",
	"Asia/Shanghai",
	"Asia/Singapore",
	"Asia/Srednekolymsk",
	"Asia/Taipei",
	"Asia/Tashkent",
	"Asia/Tbilisi",
	"Asia/Tehran",
	"Asia/Thimphu",
	"Asia/Tokyo",
	"Asia/Tomsk",
	"Asia/Ulaanbaatar",
	"Asia/Urumqi",
	"Asia/Ust-Nera",
	"Asia/Vientiane",
	"Asia/Vladivostok",
	"Asia/Yakutsk",
	"Asia/Yangon",
	"Asia/Yekaterinburg",
	"Asia/Yerevan",
	"Atlantic/Azores",
	"Atlantic/Bermuda",
	"Atlantic/Canary",
	"Atlantic/Cape_Verde",
	"Atlantic/Faroe",
	"Atlantic/Madeira",
	"Atlantic/Reykjavik",
	"Atlantic/South_Georgia",
	"Atlantic/St_Helena",
	"Atlantic/Stanley",
	"Australia/Adelaide",
	"Australia/Brisbane",
	"Australia/Broken_Hill",
	"Australia/Currie",
	"Australia/Darwin",
	"Australia/Eucla",
	"Australia/Hobart",
	"Australia/Lindeman",
	"Australia/Lord_Howe",
	"Australia/Melbourne",
	"Australia/Perth",
	"Australia/Sydney",
	"Europe/Amsterdam",
	"Europe/Andorra",
	"Europe/Astrakhan",
	"Europe/Athens",
	"Europe/Belgrade",
	"Europe/Berlin",
	"Europe/Bratislava",
	"Europe/Brussels",
	"Europe/Bucharest",
	"Europe/Budapest",
	"Europe/Busingen",
	"Europe/Chisinau",
	"Europe/Copenhagen",
	"Europe/Dublin",
	"Europe/Gibraltar",
	"Europe/Guernsey",
	"Europe/Helsinki",
	"Europe/Isle_of_Man",
	"Europe/Istanbul",
	"Europe/Jersey",
	"Europe/Kaliningrad",
	"Europe/Kiev",
	"Europe/Kirov",
	"Europe/Lisbon",
	"Europe/Ljubljana",
	"Europe/London",
	"Europe/Luxembourg",
	"Europe/Madrid",
	"Europe/Malta",
	"Europe/Mariehamn",
	"Europe/Minsk",
	"Europe/Monaco",
	"Europe/Moscow",
	"Europe/Oslo",
	"Europe/Paris",
	"Europe/Podgorica",
	"Europe/Prague",
	"Europe/Riga",
	"Europe/Rome",
	"Europe/Samara",
	"Europe/San_Marino",
	"Europe/Sarajevo",
	"Europe/Saratov",
	"Europe/Simferopol",
	"Europe/Skopje",
	"Europe/Sofia",
	"Europe/Stockholm",
	"Europe/Tallinn",
	"Europe/Tirane",
	"Europe/Ulyanovsk",
	"Europe/Uzhgorod",
	"Europe/Vaduz",
	"Europe/Vatican",
	"Europe/Vienna",
	"Europe/Vilnius",
	"Europe/Volgograd",
	"Europe/Warsaw",
	"Europe/Zagreb",
	"Europe/Zaporozhye",
	"Europe/Zurich",
	"Indian/Antananarivo",
	"Indian/Chagos",
	"Indian/Christmas",
	"Indian/Cocos",
	"Indian/Comoro",
	"Indian/Kerguelen",
	"Indian/Mahe",
	"Indian/Maldives",
	"Indian/Mauritius",
	"Indian/Mayotte",
	"Indian/Reunion",
	"Pacific/Apia",
	"Pacific/Auckland",
	"Pacific/Bougainville",
	"Pacific/Chatham",
	"Pacific/Chuuk",
	"Pacific/Easter",
	"Pacific/Efate",
	"Pacific/Enderbury",
	"Pacific/Fakaofo",
	"Pacific/Fiji",
	"Pacific/Funafuti",
	"Pacific/Galapagos",
	"Pacific/Gambier",
	"Pacific/Guadalcanal",
	"Pacific/Guam",
	"Pacific/Honolulu",
	"Pacific/Kiritimati",
	"Pacific/Kosrae",
	"Pacific/Kwajalein",
	"Pacific/Majuro",
	"Pacific/Marquesas",
	"Pacific/Midway",
	"Pacific/Nauru",
	"Pacific/Niue",
	"Pacific/Norfolk",
	"Pacific/Noumea",
	"Pacific/Pago_Pago",
	"Pacific/Palau",
	"Pacific/Pitcairn",
	"Pacific/Pohnpei",
	"Pacific/Port_Moresby",
	"Pacific/Rarotonga",
	"Pacific/Saipan",
	"Pacific/Tahiti",
	"Pacific/Tarawa",
	"Pacific/Tongatapu",
	"Pacific/Wake",
	"Pacific/Wallis"
]

const epochCities = {
	[-27028641600000]: "Etc/GMT+12",
	[-27028645200000]: "Etc/GMT+11",
	[-27028646914000]: "Pacific/Honolulu",
	[-27028647040000]: "Pacific/Kiritimati",
	[-27028651320000]: "Pacific/Marquesas",
	[-27028652400000]: "Etc/GMT+9",
	[-27028656000000]: "Etc/GMT+8",
	[-27028656422000]: "America/Los_Angeles",
	[-27028656716000]: "America/Tijuana",
	[-27028657902000]: "America/Phoenix",
	[-27028658552000]: "Pacific/Easter",
	[-27028659340000]: "America/Chihuahua",
	[-27028659604000]: "America/Denver",
	[-27028659684000]: "America/Regina",
	[-27028661004000]: "America/Mexico_City",
	[-27028663076000]: "America/Guatemala",
	[-27028663764000]: "America/Chicago",
	[-27028663976000]: "America/Cancun",
	[-27028664122000]: "America/Indianapolis",
	[-27028665032000]: "America/Havana",
	[-27028667024000]: "America/Bogota",
	[-27028667038000]: "America/New_York",
	[-27028667440000]: "America/Port-au-Prince",
	[-27028667728000]: "America/Grand_Turk",
	[-27028667780000]: "America/Punta_Arenas",
	[-27028667834000]: "America/Santiago",
	[-27028668444000]: "America/La_Paz",
	[-27028668736000]: "America/Caracas",
	[-27028669536000]: "America/Halifax",
	[-27028670772000]: "America/Buenos_Aires",
	[-27028670960000]: "America/Asuncion",
	[-27028671309000]: "America/Montevideo",
	[-27028671320000]: "America/Miquelon",
	[-27028671340000]: "America/Cuiaba",
	[-27028672148000]: "America/St_Johns",
	[-27028672240000]: "America/Cayenne",
	[-27028672384000]: "America/Godthab",
	[-27028673232000]: "America/Araguaina",
	[-27028673612000]: "America/Sao_Paulo",
	[-27028675556000]: "America/Bahia",
	[-27028677600000]: "Etc/GMT+2",
	[-27028678640000]: "Atlantic/Azores",
	[-27028679156000]: "Atlantic/Cape_Verde",
	[-27028679520000]: "Atlantic/Reykjavik",
	[-27028682980000]: "Africa/Casablanca",
	[-27028684725000]: "Europe/London",
	[-27028684800000]: "UTC",
	[-27028685361000]: "Europe/Paris",
	[-27028685616000]: "Africa/Lagos",
	[-27028686416000]: "Africa/Sao_Tome",
	[-27028687964000]: "Africa/Tripoli",
	[-27028688008000]: "Europe/Berlin",
	[-27028688904000]: "Africa/Windhoek",
	[-27028689380000]: "Europe/Budapest",
	[-27028689720000]: "Europe/Kaliningrad",
	[-27028689840000]: "Europe/Warsaw",
	[-27028691064000]: "Europe/Bucharest",
	[-27028691416000]: "Europe/Minsk",
	[-27028691520000]: "Africa/Johannesburg",
	[-27028691720000]: "Europe/Chisinau",
	[-27028691752000]: "Europe/Istanbul",
	[-27028692124000]: "Europe/Kiev",
	[-27028692309000]: "Africa/Cairo",
	[-27028692608000]: "Africa/Khartoum",
	[-27028693223000]: "Asia/Hebron",
	[-27028693254000]: "Asia/Jerusalem",
	[-27028693320000]: "Asia/Beirut",
	[-27028693424000]: "Asia/Amman",
	[-27028693512000]: "Asia/Damascus",
	[-27028693636000]: "Africa/Nairobi",
	[-27028693817000]: "Europe/Moscow",
	[-27028695460000]: "Asia/Baghdad",
	[-27028695480000]: "Asia/Yerevan",
	[-27028695551000]: "Asia/Tbilisi",
	[-27028695858000]: "Europe/Saratov",
	[-27028696012000]: "Asia/Riyadh",
	[-27028696332000]: "Europe/Astrakhan",
	[-27028696764000]: "Asia/Baku",
	[-27028696820000]: "Europe/Samara",
	[-27028697144000]: "Asia/Tehran",
	[-27028698072000]: "Asia/Dubai",
	[-27028698600000]: "Indian/Mauritius",
	[-27028699353000]: "Asia/Yekaterinburg",
	[-27028700512000]: "Asia/Qyzylorda",
	[-27028700892000]: "Asia/Karachi",
	[-27028701408000]: "Asia/Kabul",
	[-27028701431000]: "Asia/Tashkent",
	[-27028702410000]: "Asia/Omsk",
	[-27028703268000]: "Asia/Almaty",
	[-27028703964000]: "Asia/Colombo",
	[-27028704700000]: "Asia/Novosibirsk",
	[-27028704900000]: "Asia/Barnaul",
	[-27028705191000]: "Asia/Tomsk",
	[-27028705276000]: "Asia/Katmandu",
	[-27028706008000]: "Asia/Calcutta",
	[-27028706500000]: "Asia/Dhaka",
	[-27028706796000]: "Asia/Hovd",
	[-27028707086000]: "Asia/Krasnoyarsk",
	[-27028707887000]: "Asia/Rangoon",
	[-27028708924000]: "Asia/Bangkok",
	[-27028709725000]: "Asia/Singapore",
	[-27028709825000]: "Asia/Irkutsk",
	[-27028710452000]: "Asia/Ulaanbaatar",
	[-27028712032000]: "Asia/Chita",
	[-27028712604000]: "Australia/Perth",
	[-27028713943000]: "Asia/Shanghai",
	[-27028713960000]: "Asia/Taipei",
	[-27028714980000]: "Asia/Pyongyang",
	[-27028715272000]: "Asia/Seoul",
	[-27028715728000]: "Australia/Eucla",
	[-27028715938000]: "Asia/Yakutsk",
	[-27028716200000]: "Australia/Darwin",
	[-27028716451000]: "Asia/Vladivostok",
	[-27028718060000]: "Australia/Adelaide",
	[-27028718339000]: "Asia/Tokyo",
	[-27028719048000]: "Asia/Sakhalin",
	[-27028720120000]: "Pacific/Port_Moresby",
	[-27028720156000]: "Australia/Hobart",
	[-27028720992000]: "Asia/Magadan",
	[-27028721092000]: "Australia/Sydney",
	[-27028721528000]: "Australia/Brisbane",
	[-27028721692000]: "Asia/Srednekolymsk",
	[-27028722136000]: "Pacific/Bougainville",
	[-27028722876000]: "Asia/Kamchatka",
	[-27028722980000]: "Australia/Lord_Howe",
	[-27028725112000]: "Pacific/Norfolk",
	[-27028725196000]: "Pacific/Efate",
	[-27028726744000]: "Pacific/Auckland",
	[-27028727744000]: "Pacific/Fiji",
	[-27028728000000]: "Etc/GMT-12",
	[-27028728802000]: "America/Adak",
	[-27028728828000]: "Pacific/Chatham",
	[-27028729160000]: "Pacific/Tongatapu",
	[-27028729984000]: "Pacific/Apia",
	[-27028731600000]: "Etc/GMT-13",
	[-27028735224000]: "America/Anchorage"
}

const getTimezoneOffset = () => {
	const [year, month, day] = JSON.stringify(new Date())
		.slice(1,11)
		.split('-')
	const dateString = `${month}/${day}/${year}`
	const dateStringUTC = `${year}-${month}-${day}`
	const now = +new Date(dateString)
	const utc = +new Date(dateStringUTC)
	const computed = +((now - utc)/60000)
	const key = new Date(dateString).getTimezoneOffset()
	return { computed: ~~computed, key: ~~key } 
}

const pad = (x, n = 1) => {
	if (n == 2) {
		return (x / 1000).toFixed(3).slice(2, 5)
	}
	return (x / 100).toFixed(2).slice(2, 4)
}

const getUTCTime = () => {
	const now = new Date() 
	const year = now.getUTCFullYear()
	const month = now.getUTCMonth()+1
	const date = now.getUTCDate()
	const hh = now.getUTCHours()
	const mm = now.getUTCMinutes()
	const ss = now.getUTCSeconds()
	const ms = now.getUTCMilliseconds()

	const methods = `${year}-${pad(month)}-${pad(date)}T${pad(hh)}:${pad(mm)}:${pad(ss)}.${pad(ms, 2)}Z`
	const stringify = JSON.stringify(now).slice(1,-1)
	const toISOString = now.toISOString()
	const toJSON = now.toJSON()
	return { methods, stringify, toISOString, toJSON }
}

const start = performance.now()

const year = 1113
const format = {
    timeZone: '',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
}
const getTimezoneOffsetHistory = (year, city = null) => {
    const minute = 60000
    let formatter, summer
    if (city) {
        const options = {
            ...format,
            timeZone: city
        }
        formatter = new Intl.DateTimeFormat('en', options)
        summer = +new Date(formatter.format(new Date(`7/1/${year}`)))
    } else {
        summer = +new Date(`7/1/${year}`)
    }
    const summerUTCTime = +new Date(`${year}-07-01`)
    const offset = (summer - summerUTCTime) / minute
    return offset
}
const system = getTimezoneOffsetHistory(year)
const { timeZone } = Intl.DateTimeFormat().resolvedOptions()
const resolvedOptions = getTimezoneOffsetHistory(year, timeZone)
const binarySearch = (list, fn) => {
    const end = list.length
    const middle = Math.floor(end / 2)
    const [left, right] = [list.slice(0, middle), list.slice(middle, end)]
    const found = fn(left)
    return end == 1 || found.length ? found : binarySearch(right, fn)
}
const filter = cities => cities.filter(city => system == getTimezoneOffsetHistory(year, city))
const decryption = (
	system == resolvedOptions ? [timeZone] : binarySearch(cities, filter)
)
const perf = performance.now() - start

const epochLocation = +new Date(new Date(`7/1/1113`))
const notWithinParentheses = /.*\(|\).*/g
const zone = (''+new Date()).replace(notWithinParentheses, '')

// tests
const { methods: utcMethods, stringify, toJSON, toISOString } = getUTCTime()
const decriptionSet = new Set(decryption)
const timezoneOffset = getTimezoneOffset()

const valid = {
	date: (
		/^function Date\(\) {(\n    | )\[native code\](\n| )}$/.test(Date+'') &&
		Date.length == 7 && 
		Date.name == 'Date' && 
		new Date() == Date() &&
		''+new Date(Date.parse(new Date())) == ''+new Date()
	),
	invalidDate: /^Invalid Date$/.test(new Date(10000000000000000000000000)),
	location: decriptionSet.has(timeZone),
	matchingOffset: timezoneOffset.key == timezoneOffset.computed,
	utcTime: (
		utcMethods == stringify && utcMethods == toJSON && utcMethods == toISOString
	)
}

// template
const formatLocation = x => x.replace(/_/, ' ').split('/').join(', ') 
const decrypted = decriptionSet.size == 1 ? decryption[0] : !valid.location ? `Earth/UniqueVille` : timeZone
const fake = x => `<span class="fake">${x}</span>`
const entropy = x => `<span class="entropy">${x}</span>`
const el = document.getElementById('fingerprint-data')
patch(el, html`
	<style>
		#fingerprint-data > .jumbo {
			font-size: 32px;
		}
		.fake, .entropy {
			border-radius: 2px;
			margin: 0 5px;
			padding: 2px 3px;
		}
		.fake {
			background: #e281a92e;
		}
		.entropy {
			background: #e8d48c3d;
		}
	</style>
	<div id="fingerprint-data">
		<div class="visitor-info">
			<span class="aside-note">${perf.toFixed(2)}ms</span>
			<strong>Timezone</strong>
		</div>
		<div class="jumbo">
			<div>${hashMini(formatLocation(decrypted))}</div>
		</div>
		<div>
			<div>date: ${!valid.date ? `${new Date()}${fake('fake')}` : new Date() }</div>
			<div>zone: ${!valid.invalidDate ? `${zone}${fake('fake')}` : zone }</div>
			<div>reported location: ${
				!valid.location ? `${formatLocation(timeZone)}${fake('fake')}` : formatLocation(timeZone)
			}</div>
			<div>measured location: ${
				!valid.location && !decriptionSet.size ? `${formatLocation(decrypted)}${entropy('high entropy')}`: formatLocation(decrypted)
			}</div>
			<div>epoch: ${epochCities[epochLocation] ? formatLocation(epochCities[epochLocation]) : epochLocation}</div>
			<div>reported offset: ${
				!valid.matchingOffset ? `${''+timezoneOffset.key}${fake('fake')}` : ''+timezoneOffset.key
			}</div>
			<div>computed offset: ${''+timezoneOffset.computed}</div>
			<div>utc time: ${!valid.utcTime ? fake('erratic') : ''}
				<br>${utcMethods} [methods]
				<br>${stringify} [stringify]
				<br>${toJSON} [toJSON]
				<br>${toISOString} [toISOString]
			</div>
			${decriptionSet.size > 1 ? `<div>computed region: ${decryption.join(', ')}</div>` : '' }
		</div>


	</div>
	`		
)
})()