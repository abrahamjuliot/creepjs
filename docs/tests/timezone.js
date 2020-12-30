(async () => {

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

const epochCities2 = [
	["UTC","-27028684800000"],
	["GMT",null],
	["Etc/GMT+0",null],
	["Etc/GMT+1","-27028681200000"],
	["Etc/GMT+10","-27028648800000"],
	["Etc/GMT+11","-27028645200000"],
	["Etc/GMT+12","-27028641600000"],
	["Etc/GMT+2","-27028677600000"],
	["Etc/GMT+3","-27028674000000"],
	["Etc/GMT+4","-27028670400000"],
	["Etc/GMT+5","-27028666800000"],
	["Etc/GMT+6","-27028663200000"],
	["Etc/GMT+7","-27028659600000"],
	["Etc/GMT+8","-27028656000000"],
	["Etc/GMT+9","-27028652400000"],
	["Etc/GMT-1","-27028688400000"],
	["Etc/GMT-10","-27028720800000"],
	["Etc/GMT-11","-27028724400000"],
	["Etc/GMT-12","-27028728000000"],
	["Etc/GMT-13","-27028731600000"],
	["Etc/GMT-14","-27028735200000"],
	["Etc/GMT-2","-27028692000000"],
	["Etc/GMT-3","-27028695600000"],
	["Etc/GMT-4","-27028699200000"],
	["Etc/GMT-5","-27028702800000"],
	["Etc/GMT-6","-27028706400000"],
	["Etc/GMT-7","-27028710000000"],
	["Etc/GMT-8","-27028713600000"],
	["Etc/GMT-9","-27028717200000"],
	["Etc/GMT",null],
	["Africa/Abidjan","-27028683832000"],
	["Africa/Accra","-27028684748000"],
	["Africa/Addis_Ababa","-27028693636000"],
	["Africa/Algiers","-27028685532000"],
	["Africa/Asmara","-27028693636000"],
	["Africa/Bamako","-27028683832000"],
	["Africa/Bangui","-27028685616000"],
	["Africa/Banjul","-27028683832000"],
	["Africa/Bissau","-27028681060000"],
	["Africa/Blantyre","-27028692620000"],
	["Africa/Brazzaville","-27028685616000"],
	["Africa/Bujumbura","-27028692620000"],
	["Africa/Cairo","-27028692309000"],
	["Africa/Casablanca","-27028682980000"], 
	["Africa/Ceuta","-27028683524000"],
	["Africa/Conakry","-27028683832000"],
	["Africa/Dakar","-27028683832000"],
	["Africa/Dar_es_Salaam","-27028693636000"],
	["Africa/Djibouti","-27028693636000"],
	["Africa/Douala","-27028685616000"],
	["Africa/El_Aaiun","-27028681632000"],
	["Africa/Freetown","-27028683832000"],
	["Africa/Gaborone","-27028692620000"],
	["Africa/Harare","-27028692620000"],
	["Africa/Johannesburg","-27028691520000"],
	["Africa/Juba","-27028692388000"],
	["Africa/Kampala","-27028693636000"],
	["Africa/Khartoum","-27028692608000"],
	["Africa/Kigali","-27028692620000"],
	["Africa/Kinshasa","-27028685616000"],
	["Africa/Lagos","-27028685616000"],
	["Africa/Libreville","-27028685616000"],
	["Africa/Lome",null],
	["Africa/Luanda",null],
	["Africa/Lubumbashi",null],
	["Africa/Lusaka",null],
	["Africa/Malabo",null],
	["Africa/Maputo",null],
	["Africa/Maseru",null],
	["Africa/Mbabane",null],
	["Africa/Mogadishu",null],
	["Africa/Monrovia",null],
	["Africa/Nairobi","-27028693636000"],
	["Africa/Ndjamena",null],
	["Africa/Niamey",null],
	["Africa/Nouakchott",null],
	["Africa/Ouagadougou",null],
	["Africa/Porto-Novo",null],
	["Africa/Sao_Tome","-27028686416000"],
	["Africa/Tripoli","-27028687964000"],
	["Africa/Tunis",null],
	["Africa/Windhoek","-27028688904000"],
	["America/Adak","-27028728802000"],
	["America/Anchorage","-27028735224000"],
	["America/Anguilla",null],
	["America/Antigua",null],
	["America/Araguaina","-27028673232000"],
	["America/Argentina/Buenos_Aires",null],
	["America/Argentina/Catamarca",null],
	["America/Argentina/Cordoba",null],
	["America/Argentina/Jujuy",null],
	["America/Argentina/La_Rioja",null],
	["America/Argentina/Mendoza",null],
	["America/Argentina/Rio_Gallegos",null],
	["America/Argentina/Salta",null],
	["America/Argentina/San_Juan",null],
	["America/Argentina/San_Luis",null],
	["America/Argentina/Tucuman",null],
	["America/Argentina/Ushuaia",null],
	["America/Aruba",null],
	["America/Asuncion","-27028670960000"],
	["America/Atikokan",null],
	["America/Bahia","-27028675556000"],
	["America/Bahia_Banderas",null],
	["America/Barbados",null],
	["America/Belem",null],
	["America/Belize",null],
	["America/Blanc-Sablon",null],
	["America/Boa_Vista",null],
	["America/Bogota","-27028667024000"],
	["America/Boise",null],
	["America/Cambridge_Bay",null],
	["America/Campo_Grande",null],
	["America/Cancun","-27028663976000"],
	["America/Caracas","-27028668736000"],
	["America/Cayenne","-27028672240000"],
	["America/Cayman",null],
	["America/Chicago","-27028663764000"],
	["America/Chihuahua","-27028659340000"],
	["America/Costa_Rica",null],
	["America/Creston",null],
	["America/Cuiaba","-27028671340000"],
	["America/Curacao",null],
	["America/Danmarkshavn",null],
	["America/Dawson",null],
	["America/Dawson_Creek",null],
	["America/Denver","-27028659604000"],
	["America/Detroit",null],
	["America/Dominica",null],
	["America/Edmonton",null],
	["America/Eirunepe",null],
	["America/El_Salvador",null],
	["America/Fort_Nelson",null],
	["America/Fortaleza",null],
	["America/Glace_Bay",null],
	["America/Godthab","-27028672384000"],
	["America/Goose_Bay",null],
	["America/Grand_Turk","-27028667728000"],
	["America/Grenada",null],
	["America/Guadeloupe",null],
	["America/Guatemala","-27028663076000"],
	["America/Guayaquil",null],
	["America/Guyana",null],
	["America/Halifax","-27028669536000"],
	["America/Havana","-27028665032000"],
	["America/Hermosillo",null],
	["America/Indiana/Indianapolis",null],
	["America/Indiana/Knox",null],
	["America/Indiana/Marengo",null],
	["America/Indiana/Petersburg",null],
	["America/Indiana/Tell_City",null],
	["America/Indiana/Vevay",null],
	["America/Indiana/Vincennes",null],
	["America/Indiana/Winamac",null],
	["America/Inuvik",null],
	["America/Iqaluit",null],
	["America/Jamaica",null],
	["America/Juneau",null],
	["America/Kentucky/Louisville",null],
	["America/Kentucky/Monticello",null],
	["America/Kralendijk",null],
	["America/La_Paz","-27028668444000"],
	["America/Lima",null],
	["America/Los_Angeles","-27028656422000"],
	["America/Lower_Princes",null],
	["America/Maceio",null],
	["America/Managua",null],
	["America/Manaus",null],
	["America/Marigot",null],
	["America/Martinique",null],
	["America/Matamoros",null],
	["America/Mazatlan",null],
	["America/Menominee",null],
	["America/Merida",null],
	["America/Metlakatla",null],
	["America/Mexico_City","-27028661004000"],
	["America/Miquelon","-27028671320000"],
	["America/Moncton",null],
	["America/Monterrey",null],
	["America/Montevideo","-27028671309000"],
	["America/Montserrat",null],
	["America/Nassau",null],
	["America/New_York","-27028667038000"],
	["America/Nipigon",null],
	["America/Nome",null],
	["America/Noronha",null],
	["America/North_Dakota/Beulah",null],
	["America/North_Dakota/Center",null],
	["America/North_Dakota/New_Salem",null],
	["America/Ojinaga",null],
	["America/Panama",null],
	["America/Pangnirtung",null],
	["America/Paramaribo",null],
	["America/Phoenix","-27028657902000"],
	["America/Port-au-Prince","-27028667440000"],
	["America/Port_of_Spain",null],
	["America/Porto_Velho",null],
	["America/Puerto_Rico",null],
	["America/Punta_Arenas","-27028667780000"],
	["America/Rainy_River",null],
	["America/Rankin_Inlet",null],
	["America/Recife",null],
	["America/Regina","-27028659684000"],
	["America/Resolute",null],
	["America/Rio_Branco",null],
	["America/Santarem",null],
	["America/Santiago","-27028667834000"],
	["America/Santo_Domingo",null],
	["America/Sao_Paulo","-27028673612000"],
	["America/Scoresbysund",null],
	["America/Sitka",null],
	["America/St_Barthelemy",null],
	["America/St_Johns","-27028672148000"],
	["America/St_Kitts",null],
	["America/St_Lucia",null],
	["America/St_Thomas",null],
	["America/St_Vincent",null],
	["America/Swift_Current",null],
	["America/Tegucigalpa",null],
	["America/Thule",null],
	["America/Thunder_Bay",null],
	["America/Tijuana","-27028656716000"],
	["America/Toronto",null],
	["America/Tortola",null],
	["America/Vancouver",null],
	["America/Whitehorse",null],
	["America/Winnipeg",null],
	["America/Yakutat",null],
	["America/Yellowknife",null],
	["Antarctica/Casey",null],
	["Antarctica/Davis",null],
	["Antarctica/DumontDUrville",null],
	["Antarctica/Macquarie",null],
	["Antarctica/Mawson",null],
	["Antarctica/McMurdo",null],
	["Antarctica/Palmer",null],
	["Antarctica/Rothera",null],
	["Antarctica/Syowa",null],
	["Antarctica/Troll",null],
	["Antarctica/Vostok",null],
	["Arctic/Longyearbyen",null],
	["Asia/Aden",null],
	["Asia/Almaty","-27028703268000"],
	["Asia/Amman","-27028693424000"],
	["Asia/Anadyr",null],
	["Asia/Aqtau",null],
	["Asia/Aqtobe",null],
	["Asia/Ashgabat",null],
	["Asia/Atyrau",null],
	["Asia/Baghdad","-27028695460000"],
	["Asia/Bahrain",null],
	["Asia/Baku","-27028696764000"],
	["Asia/Bangkok","-27028708924000"],
	["Asia/Barnaul","-27028704900000"],
	["Asia/Beirut","-27028693320000"],
	["Asia/Bishkek",null],
	["Asia/Brunei",null],
	["Asia/Calcutta","-27028706008000"],
	["Asia/Chita","-27028712032000"],
	["Asia/Choibalsan",null],
	["Asia/Colombo","-27028703964000"],
	["Asia/Damascus","-27028693512000"],
	["Asia/Dhaka","-27028706500000"],
	["Asia/Dili",null],
	["Asia/Dubai","-27028698072000"],
	["Asia/Dushanbe",null],
	["Asia/Famagusta",null],
	["Asia/Gaza",null],
	["Asia/Hebron","-27028693223000"],
	["Asia/Ho_Chi_Minh",null],
	["Asia/Hong_Kong",null],
	["Asia/Hovd","-27028706796000"],
	["Asia/Irkutsk","-27028709825000"],
	["Asia/Jakarta",null],
	["Asia/Jayapura",null],
	["Asia/Jerusalem","-27028693254000"],
	["Asia/Kabul","-27028701408000"],
	["Asia/Kamchatka","-27028722876000"],
	["Asia/Karachi","-27028700892000"],
	["Asia/Kathmandu",null],
	["Asia/Khandyga",null],
	["Asia/Kolkata",null],
	["Asia/Krasnoyarsk","-27028707086000"],
	["Asia/Kuala_Lumpur",null],
	["Asia/Kuching",null],
	["Asia/Kuwait",null],
	["Asia/Macau",null],
	["Asia/Magadan","-27028720992000"],
	["Asia/Makassar",null],
	["Asia/Manila",null],
	["Asia/Muscat",null],
	["Asia/Nicosia",null],
	["Asia/Novokuznetsk",null],
	["Asia/Novosibirsk","-27028704700000"],
	["Asia/Omsk","-27028702410000"],
	["Asia/Oral",null],
	["Asia/Phnom_Penh",null],
	["Asia/Pontianak",null],
	["Asia/Pyongyang","-27028714980000"],
	["Asia/Qatar",null],
	["Asia/Qostanay",null],
	["Asia/Qyzylorda","-27028700512000"],
	["Asia/Riyadh","-27028696012000"],
	["Asia/Sakhalin","-27028719048000"],
	["Asia/Samarkand",null],
	["Asia/Seoul","-27028715272000"],
	["Asia/Shanghai","-27028713943000"],
	["Asia/Singapore","-27028709725000"],
	["Asia/Srednekolymsk","-27028721692000"],
	["Asia/Taipei","-27028713960000"],
	["Asia/Tashkent","-27028701431000"],
	["Asia/Tbilisi","-27028695551000"],
	["Asia/Tehran","-27028697144000"],
	["Asia/Thimphu",null],
	["Asia/Tokyo","-27028718339000"],
	["Asia/Tomsk","-27028705191000"],
	["Asia/Ulaanbaatar","-27028710452000"],
	["Asia/Urumqi",null],
	["Asia/Ust-Nera",null],
	["Asia/Vientiane",null],
	["Asia/Vladivostok","-27028716451000"],
	["Asia/Yakutsk","-27028715938000"],
	["Asia/Yangon",null],
	["Asia/Yekaterinburg","-27028699353000"],
	["Asia/Yerevan","-27028695480000"],
	["Atlantic/Azores","-27028678640000"],
	["Atlantic/Bermuda",null],
	["Atlantic/Canary",null],
	["Atlantic/Cape_Verde","-27028679156000"],
	["Atlantic/Faroe",null],
	["Atlantic/Madeira",null],
	["Atlantic/Reykjavik","-27028679520000"],
	["Atlantic/South_Georgia",null],
	["Atlantic/St_Helena",null],
	["Atlantic/Stanley",null],
	["Australia/Adelaide","-27028718060000"],
	["Australia/Brisbane","-27028721528000"],
	["Australia/Broken_Hill",null],
	["Australia/Currie",null],
	["Australia/Darwin","-27028716200000"],
	["Australia/Eucla","-27028715728000"],
	["Australia/Hobart","-27028720156000"],
	["Australia/Lindeman",null],
	["Australia/Lord_Howe","-27028722980000"],
	["Australia/Melbourne",null],
	["Australia/Perth","-27028712604000"],
	["Australia/Sydney","-27028721092000"],
	["Europe/Amsterdam",null],
	["Europe/Andorra",null],
	["Europe/Astrakhan","-27028696332000"],
	["Europe/Athens",null],
	["Europe/Belgrade",null],
	["Europe/Berlin","-27028688008000"],
	["Europe/Bratislava",null],
	["Europe/Brussels",null],
	["Europe/Bucharest","-27028691064000"],
	["Europe/Budapest","-27028689380000"],
	["Europe/Busingen",null],
	["Europe/Chisinau","-27028691720000"],
	["Europe/Copenhagen",null],
	["Europe/Dublin",null],
	["Europe/Gibraltar",null],
	["Europe/Guernsey",null],
	["Europe/Helsinki",null],
	["Europe/Isle_of_Man",null],
	["Europe/Istanbul","-27028691752000"],
	["Europe/Jersey",null],
	["Europe/Kaliningrad","-27028689720000"],
	["Europe/Kiev","-27028692124000"],
	["Europe/Kirov",null],
	["Europe/Lisbon",null],
	["Europe/Ljubljana",null],
	["Europe/London","-27028684725000"],
	["Europe/Luxembourg",null],
	["Europe/Madrid",null],
	["Europe/Malta",null],
	["Europe/Mariehamn",null],
	["Europe/Minsk","-27028691416000"],
	["Europe/Monaco",null],
	["Europe/Moscow","-27028693817000"],
	["Europe/Oslo",null],
	["Europe/Paris","-27028685361000"],
	["Europe/Podgorica",null],
	["Europe/Prague",null],
	["Europe/Riga",null],
	["Europe/Rome",null],
	["Europe/Samara","-27028696820000"],
	["Europe/San_Marino",null],
	["Europe/Sarajevo",null],
	["Europe/Saratov","-27028695858000"],
	["Europe/Simferopol",null],
	["Europe/Skopje",null],
	["Europe/Sofia",null],
	["Europe/Stockholm",null],
	["Europe/Tallinn",null],
	["Europe/Tirane",null],
	["Europe/Ulyanovsk",null],
	["Europe/Uzhgorod",null],
	["Europe/Vaduz",null],
	["Europe/Vatican",null],
	["Europe/Vienna",null],
	["Europe/Vilnius",null],
	["Europe/Volgograd",null],
	["Europe/Warsaw","-27028689840000"],
	["Europe/Zagreb",null],
	["Europe/Zaporozhye",null],
	["Europe/Zurich",null],
	["Indian/Antananarivo",null],
	["Indian/Chagos",null],
	["Indian/Christmas",null],
	["Indian/Cocos",null],
	["Indian/Comoro",null],
	["Indian/Kerguelen",null],
	["Indian/Mahe",null],
	["Indian/Maldives",null],
	["Indian/Mauritius","-27028698600000"],
	["Indian/Mayotte",null],
	["Indian/Reunion",null],
	["Pacific/Apia","-27028729984000"],
	["Pacific/Auckland","-27028726744000"],
	["Pacific/Bougainville","-27028722136000"],
	["Pacific/Chatham","-27028728828000"],
	["Pacific/Chuuk",null],
	["Pacific/Easter","-27028658552000"],
	["Pacific/Efate","-27028725196000"],
	["Pacific/Enderbury",null],
	["Pacific/Fakaofo",null],
	["Pacific/Fiji","-27028727744000"],
	["Pacific/Funafuti",null],
	["Pacific/Galapagos",null],
	["Pacific/Gambier",null],
	["Pacific/Guadalcanal",null],
	["Pacific/Guam",null],
	["Pacific/Honolulu","-27028646914000"],
	["Pacific/Kiritimati","-27028647040000"],
	["Pacific/Kosrae",null],
	["Pacific/Kwajalein",null],
	["Pacific/Majuro",null],
	["Pacific/Marquesas","-27028651320000"],
	["Pacific/Midway",null],
	["Pacific/Nauru",null],
	["Pacific/Niue",null],
	["Pacific/Norfolk","-27028725112000"],
	["Pacific/Noumea",null],
	["Pacific/Pago_Pago",null],
	["Pacific/Palau",null],
	["Pacific/Pitcairn",null],
	["Pacific/Pohnpei",null],
	["Pacific/Port_Moresby","-27028720120000"],
	["Pacific/Rarotonga",null],
	["Pacific/Saipan",null],
	["Pacific/Tahiti",null],
	["Pacific/Tarawa",null],
	["Pacific/Tongatapu","-27028729160000"],
	["Pacific/Wake",null],
	["Pacific/Wallis",null]
]

getTimezoneEpoch = (year, city) => {
    const minute = 60000
    const format = {
		timeZone: '',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	}
	const options = {
		...format,
		timeZone: city
	}
	const formatter = new Intl.DateTimeFormat('en', options)
	const summer = +new Date(formatter.format(new Date(`7/1/${year}`)))
	return summer
}

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

const getNowTime = () => {
	const d = new Date()
	const now = Date.now()
	return {
		now,
		dateValue: +d,
		valueOf: d.getTime(),
		getTime: d.valueOf()
	}
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
const detectPrivacy = async () => {
	let n = 0
	const regex = n => new RegExp(`${n}+$`)
	const a = await new Promise(resolve => setTimeout(() => {
		const date = +new Date()
		n = +(''+date).slice(-1)
		const res = regex(n).test(date) ? regex(n).exec(date)[0] : date
		return resolve(res)
	}, 1))
	const b = await new Promise(resolve => setTimeout(() => {
		const date = +new Date()
		const res = regex(n).test(date) ? regex(n).exec(date)[0] : date
		return resolve(res)
	}, 2))
	const c = await new Promise(resolve => setTimeout(() => {
		const date = +new Date()
		const res = regex(n).test(date) ? regex(n).exec(date)[0] : date
		return resolve(res)
	}, 3))
	const d = await new Promise(resolve => setTimeout(() => {
		const date = +new Date()
		const res = regex(n).test(date) ? regex(n).exec(date)[0] : date
		return resolve(res)
	}, 4))
	const e = await new Promise(resolve => setTimeout(() => {
		const date = +new Date()
		const res = regex(n).test(date) ? regex(n).exec(date)[0] : date
		return resolve(res)
	}, 5))
	
	const lastCharA = (''+a).slice(-1)
	const lastCharB = (''+b).slice(-1)
	const lastCharC = (''+c).slice(-1)
	const lastCharD = (''+d).slice(-1)
	const lastCharE = (''+e).slice(-1)
	const resist = (
		lastCharA == lastCharB &&
		lastCharB == lastCharC &&
		lastCharC == lastCharD &&
		lastCharD == lastCharE
	)
	const baseLen = (''+a).length
	return {
		resist,
		delays: [a, b, c, d, e].map(n => (''+n).length > baseLen ? (''+n).slice(-baseLen) : n),
		precision: resist ? Math.min(...[''+a, ''+b, ''+c, ''+d, ''+e].map(str => str.length)) : undefined,
		precisionValue: resist ? lastCharA : undefined
	}
}

const perf = performance.now() - start

const epochLocation = +new Date(new Date(`7/1/1113`))
const notWithinParentheses = /.*\(|\).*/g
const zone = (''+new Date()).replace(notWithinParentheses, '')

// tests
const getRand = (min, max) => ~~(Math.random() * (max - min + 1)) + min
const rand = getRand(0, 23)
const { methods: utcMethods, stringify, toJSON, toISOString } = getUTCTime()
const { now, dateValue, valueOf, getTime } = getNowTime()
const time = new Date()
const midnight = new Date('7, 1 1970')
const decriptionSet = new Set(decryption)
const timezoneOffset = getTimezoneOffset()
const hours = ''+time.getHours()
const minutes = ''+pad(time.getMinutes())
const seconds = ''+pad(time.getSeconds())
const timeString = `${hours > 12 ? hours-12 : hours}:${minutes}:${seconds} ${hours< 12 ? 'AM' : 'PM'}`

time.setHours(rand)
time.setMinutes(rand)
time.setSeconds(rand)

const valid = {
	time: (
		time.getHours() == rand &&
		time.getMinutes() == rand &&
		time.getSeconds() == rand
	),
	clock: (
		midnight.getHours() == 0 &&
		midnight.getMinutes() == 0 &&
		midnight.getSeconds() == 0 &&
		midnight.getMilliseconds() == 0
	),
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
	nowTime: (
		dateValue == getTime && dateValue == now && dateValue == valueOf
	),
	utcTime: (
		utcMethods == stringify && utcMethods == toJSON && utcMethods == toISOString
	)
}

const { resist, delays, precision, precisionValue } = await detectPrivacy()

console.log(binarySearch(cities, filter))
console.log(epochCities2.filter(city => city[1] == epochLocation).map(city => city.join(': ')).join('\n'))

// template
const styleResult = (valid) => valid ? `<span class="pass">&#10004;</span>` : `<span class="fail">&#10006;</span>`
//const formatLocation = x => x.replace(/_/, ' ').split('/').join(', ') 
const decrypted = (
	decriptionSet.size == 1 ? decryption[0] : 
	!valid.location && !decriptionSet.size ? 'Dysfunctional Machine' : 
	!valid.location ? 'Deceptive Machine' : timeZone
)
const fake = x => `<span class="fake">${x}</span>`
const el = document.getElementById('fingerprint-data')
patch(el, html`
	<style>
		#fingerprint-data > .jumbo {
			font-size: 32px;
		}
		.pass, .fail, .entropy {
			margin: 0 10px 0 0;
			padding: 1px 5px;
			border-radius: 3px;
		}
		.pass {
			color: #2da568;
			background: #2da5681a;
		}
		.fail, .fake, .erratic {
			color: #ca656e;
			background: #ca656e0d;
		}
		.erratic {
			font-weight: bold;
		}
		.fake {
			border-radius: 2px;
			margin: 0 5px;
			padding: 1px 3px;
		}
		.lighten {
			color: #bbb
		}
		.privacy {
			border: 1px solid #eee;
			border-radius: 3px;
			padding: 10px 15px;
			margin: 10px auto;
		}
		.entropy {
			color: #94653dc9;
    		background: #ffe06624;
		}
	</style>
	<div id="fingerprint-data">
		<div class="visitor-info">
			<span class="aside-note">${perf.toFixed(2)}ms</span>
			<strong>Timezone</strong>
		</div>
		<div class="jumbo">
			<div>${hashMini(decrypted)}</div>
		</div>
		<div>
			<div>${styleResult(valid.date && valid.clock)}date: ${
				!valid.date || !valid.clock ? `${new Date()}${fake('fake')}` : new Date()
			}</div>
			<div>${styleResult(valid.time)}time: ${
				!valid.time ? `${timeString}${fake('fake')}` : timeString
			}</div>
			<div>${styleResult(valid.invalidDate && valid.date && valid.clock)}zone: ${
				!valid.invalidDate || !valid.date || !valid.clock ? `${zone}${fake('fake')}` : zone
			}</div>
			<div>${styleResult(valid.location)}reported location: ${
				!valid.location ? `${timeZone}${fake('fake')}` : timeZone
			}</div>
			
			<div>${styleResult(valid.matchingOffset)}reported offset: ${
				!valid.matchingOffset ? `${''+timezoneOffset.key}${fake('fake')}` : ''+timezoneOffset.key
			}</div>
			${(() => {
				const base = (''+dateValue).split('')
				const style = (a, b) => b.map((char,i) => char != a[i] ? `<span class="erratic">${char}</span>` : char).join('')
				return `
					<div>${styleResult(valid.nowTime)}now epoch time: ${!valid.nowTime ? fake('erratic') : ''}
						<br>${dateValue} <span class="lighten">[+new Date()]</span>
						<br>${style(base, (''+now).split(''))} <span class="lighten">[Date.now()]</span>
						<br>${style(base, (''+getTime).split(''))} <span class="lighten">[new Date().getTime()]</span>
						<br>${style(base, (''+valueOf).split(''))} <span class="lighten">[new Date().valueOf()]</span>
					</div>
				`
			})()}
			${(() => {
				const base = utcMethods.split('')
				const style = (a, b) => b.map((char,i) => char != a[i] ? `<span class="erratic">${char}</span>` : char).join('')
				return `
					<div>${styleResult(valid.utcTime)}utc ISO time: ${!valid.utcTime ? fake('erratic') : ''}
						<br>${utcMethods} <span class="lighten">[getUTC... Methods]</span>
						<br>${style(base, toJSON.split(''))} <span class="lighten">[new Date().toJSON()]</span>
						<br>${style(base, toISOString.split(''))} <span class="lighten">[new Date().toISOString()]</span>
						<br>${style(base, stringify.split(''))} <span class="lighten">[JSON.stringify(new Date()).slice(1,-1)]</span>
					</div>
				`
			})()}
			<div>${styleResult(true)}computed offset: ${''+timezoneOffset.computed}</div>
			<div>${styleResult(true)}epoch: ${
				epochCities[epochLocation] ? epochCities[epochLocation] : epochLocation
			}</div>
			<div>${styleResult(true)}measured location: ${
				/machine/i.test(decrypted) ? `<span class="entropy">${decrypted}</span>`: decrypted
			}</div>
			${
				decryption.length ? `
				<div>${styleResult(true)}measured region set:${decryption.length > 1 ? '<br>' : ' '}${
					decryption.map(city => city == epochCities[epochLocation] ? city : `<span class="lighten">${city}</span>`).join('<br>')
				}</div>
				` : ''
			}
			<div class="privacy">
				<div>reduced timer precision: ${!resist ? 'unknown' : `${''+resist} <span class="fail">protection detected</span>`}</div>
				<div>delays: ${delays.join(', ')}</div>
				<div>precision level: ${''+precision}</div>
				<div>microseconds: ${resist ? ''+(1000*Math.pow(10,precision)) : 'undefined'}</div>
				<div>repeat value: ${''+precisionValue}</div>
			</div>
		</div>
	</div>
	`		
)
})()