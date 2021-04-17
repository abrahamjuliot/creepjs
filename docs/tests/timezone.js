(async () => {

	// Safari's implementation of toLocaleString and DateTimeFormat
	// is not consistent with Chrome anf Firefox
	const isChrome = 'chrome' in window
	const isFirefox = typeof InstallTrigger !== 'undefined'

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
		["UTC", "-27028684800000"],
		["GMT", "-27028684800000"],
		["Etc/GMT+0", "-27028684800000"],
		["Etc/GMT+1", "-27028681200000"],
		["Etc/GMT+10", "-27028648800000"],
		["Etc/GMT+11", "-27028645200000"],
		["Etc/GMT+12", "-27028641600000"],
		["Etc/GMT+2", "-27028677600000"],
		["Etc/GMT+3", "-27028674000000"],
		["Etc/GMT+4", "-27028670400000"],
		["Etc/GMT+5", "-27028666800000"],
		["Etc/GMT+6", "-27028663200000"],
		["Etc/GMT+7", "-27028659600000"],
		["Etc/GMT+8", "-27028656000000"],
		["Etc/GMT+9", "-27028652400000"],
		["Etc/GMT-1", "-27028688400000"],
		["Etc/GMT-10", "-27028720800000"],
		["Etc/GMT-11", "-27028724400000"],
		["Etc/GMT-12", "-27028728000000"],
		["Etc/GMT-13", "-27028731600000"],
		["Etc/GMT-14", "-27028735200000"],
		["Etc/GMT-2", "-27028692000000"],
		["Etc/GMT-3", "-27028695600000"],
		["Etc/GMT-4", "-27028699200000"],
		["Etc/GMT-5", "-27028702800000"],
		["Etc/GMT-6", "-27028706400000"],
		["Etc/GMT-7", "-27028710000000"],
		["Etc/GMT-8", "-27028713600000"],
		["Etc/GMT-9", "-27028717200000"],
		["Etc/GMT", "-27028684800000"],
		["Africa/Abidjan", "-27028683832000"],
		["Africa/Accra", "-27028684748000"],
		["Africa/Addis_Ababa", "-27028693636000"],
		["Africa/Algiers", "-27028685532000"],
		["Africa/Asmara", "-27028693636000"],
		["Africa/Bamako", "-27028683832000"],
		["Africa/Bangui", "-27028685616000"],
		["Africa/Banjul", "-27028683832000"],
		["Africa/Bissau", "-27028681060000"],
		["Africa/Blantyre", "-27028692620000"],
		["Africa/Brazzaville", "-27028685616000"],
		["Africa/Bujumbura", "-27028692620000"],
		["Africa/Cairo", "-27028692309000"],
		["Africa/Casablanca", "-27028682980000"],
		["Africa/Ceuta", "-27028683524000"],
		["Africa/Conakry", "-27028683832000"],
		["Africa/Dakar", "-27028683832000"],
		["Africa/Dar_es_Salaam", "-27028693636000"],
		["Africa/Djibouti", "-27028693636000"],
		["Africa/Douala", "-27028685616000"],
		["Africa/El_Aaiun", "-27028681632000"],
		["Africa/Freetown", "-27028683832000"],
		["Africa/Gaborone", "-27028692620000"],
		["Africa/Harare", "-27028692620000"],
		["Africa/Johannesburg", "-27028691520000"],
		["Africa/Juba", "-27028692388000"],
		["Africa/Kampala", "-27028693636000"],
		["Africa/Khartoum", "-27028692608000"],
		["Africa/Kigali", "-27028692620000"],
		["Africa/Kinshasa", "-27028685616000"],
		["Africa/Lagos", "-27028685616000"],
		["Africa/Libreville", "-27028685616000"],
		["Africa/Lome", "-27028683832000"],
		["Africa/Luanda", "-27028685616000"],
		["Africa/Lubumbashi", "-27028692620000"],
		["Africa/Lusaka", "-27028692620000"],
		["Africa/Malabo", "-27028685616000"],
		["Africa/Maputo", "-27028692620000"],
		["Africa/Maseru", "-27028691520000"],
		["Africa/Mbabane", "-27028691520000"],
		["Africa/Mogadishu", "-27028693636000"],
		["Africa/Monrovia", "-27028682212000"],
		["Africa/Nairobi", "-27028693636000"],
		["Africa/Ndjamena", "-27028688412000"],
		["Africa/Niamey", "-27028685616000"],
		["Africa/Nouakchott", "-27028683832000"],
		["Africa/Ouagadougou", "-27028683832000"],
		["Africa/Porto-Novo", "-27028685616000"],
		["Africa/Sao_Tome", "-27028686416000"],
		["Africa/Tripoli", "-27028687964000"],
		["Africa/Tunis", "-27028687244000"],
		["Africa/Windhoek", "-27028688904000"],
		["America/Adak", "-27028728802000"],
		["America/Anchorage", "-27028735224000"],
		["America/Anguilla", "-27028670036000"],
		["America/Antigua", "-27028670036000"],
		["America/Araguaina", "-27028673232000"],
		["America/Argentina/Buenos_Aires", "-27028670772000"],
		["America/Argentina/Catamarca", "-27028669012000"],
		["America/Argentina/Cordoba", "-27028669392000"],
		["America/Argentina/Jujuy", "-27028669128000"],
		["America/Argentina/La_Rioja", "-27028668756000"],
		["America/Argentina/Mendoza", "-27028668284000"],
		["America/Argentina/Rio_Gallegos", "-27028668188000"],
		["America/Argentina/Salta", "-27028669100000"],
		["America/Argentina/San_Juan", "-27028668356000"],
		["America/Argentina/San_Luis", "-27028668876000"],
		["America/Argentina/Tucuman", "-27028669148000"],
		["America/Argentina/Ushuaia", "-27028668408000"],
		["America/Aruba", "-27028668253000"],
		["America/Asuncion", "-27028670960000"],
		["America/Atikokan", "-27028662812000"],
		["America/Bahia", "-27028675556000"],
		["America/Bahia_Banderas", "-27028659540000"],
		["America/Barbados", "-27028670491000"],
		["America/Belem", "-27028673164000"],
		["America/Belize", "-27028663632000"],
		["America/Blanc-Sablon", "-27028671092000"],
		["America/Boa_Vista", "-27028670240000"],
		["America/Bogota", "-27028667024000"],
		["America/Boise", "-27028656911000"],
		["America/Cambridge_Bay", "-27028684800000"],
		["America/Campo_Grande", "-27028671692000"],
		["America/Cancun", "-27028663976000"],
		["America/Caracas", "-27028668736000"],
		["America/Cayenne", "-27028672240000"],
		["America/Cayman", "-27028665712000"],
		["America/Chicago", "-27028663764000"],
		["America/Chihuahua", "-27028659340000"],
		["America/Costa_Rica", "-27028664627000"],
		["America/Creston", "-27028656836000"],
		["America/Cuiaba", "-27028671340000"],
		["America/Curacao", "-27028668253000"],
		["America/Danmarkshavn", "-27028680320000"],
		["America/Dawson", "-27028651340000"],
		["America/Dawson_Creek", "-27028655944000"],
		["America/Denver", "-27028659604000"],
		["America/Detroit", "-27028664869000"],
		["America/Dominica", "-27028670036000"],
		["America/Edmonton", "-27028657568000"],
		["America/Eirunepe", "-27028668032000"],
		["America/El_Salvador", "-27028663392000"],
		["America/Fort_Nelson", "-27028655353000"],
		["America/Fortaleza", "-27028675560000"],
		["America/Glace_Bay", "-27028670412000"],
		["America/Godthab", "-27028672384000"],
		["America/Goose_Bay", "-27028670412000"],
		["America/Grand_Turk", "-27028667728000"],
		["America/Grenada", "-27028670036000"],
		["America/Guadeloupe", "-27028670036000"],
		["America/Guatemala", "-27028663076000"],
		["America/Guayaquil", "-27028665640000"],
		["America/Guyana", "-27028670840000"],
		["America/Halifax", "-27028669536000"],
		["America/Havana", "-27028665032000"],
		["America/Hermosillo", "-27028658168000"],
		["America/Indiana/Indianapolis", "-27028664122000"],
		["America/Indiana/Knox", "-27028664010000"],
		["America/Indiana/Marengo", "-27028664077000"],
		["America/Indiana/Petersburg", "-27028663853000"],
		["America/Indiana/Tell_City", "-27028663977000"],
		["America/Indiana/Vevay", "-27028664384000"],
		["America/Indiana/Vincennes", "-27028663793000"],
		["America/Indiana/Winamac", "-27028664015000"],
		["America/Inuvik", "-27028684800000"],
		["America/Iqaluit", "-27028684800000"],
		["America/Jamaica", "-27028666370000"],
		["America/Juneau", "-27028738939000"],
		["America/Kentucky/Louisville", "-27028664218000"],
		["America/Kentucky/Monticello", "-27028664436000"],
		["America/Kralendijk", "-27028668253000"],
		["America/La_Paz", "-27028668444000"],
		["America/Lima", "-27028666308000"],
		["America/Los_Angeles", "-27028656422000"],
		["America/Lower_Princes", "-27028668253000"],
		["America/Maceio", "-27028676228000"],
		["America/Managua", "-27028664092000"],
		["America/Manaus", "-27028670396000"],
		["America/Marigot", "-27028670036000"],
		["America/Martinique", "-27028670140000"],
		["America/Matamoros", "-27028660800000"],
		["America/Mazatlan", "-27028659260000"],
		["America/Menominee", "-27028663773000"],
		["America/Merida", "-27028663292000"],
		["America/Metlakatla", "-27028739622000"],
		["America/Mexico_City", "-27028661004000"],
		["America/Miquelon", "-27028671320000"],
		["America/Moncton", "-27028669252000"],
		["America/Monterrey", "-27028660724000"],
		["America/Montevideo", "-27028671309000"],
		["America/Montserrat", "-27028670036000"],
		["America/Nassau", "-27028666230000"],
		["America/New_York", "-27028667038000"],
		["America/Nipigon", "-27028663616000"],
		["America/Nome", "-27028731502000"],
		["America/Noronha", "-27028677020000"],
		["America/North_Dakota/Beulah", "-27028660373000"],
		["America/North_Dakota/Center", "-27028660488000"],
		["America/North_Dakota/New_Salem", "-27028660461000"],
		["America/Ojinaga", "-27028659740000"],
		["America/Panama", "-27028665712000"],
		["America/Pangnirtung", "-27028684800000"],
		["America/Paramaribo", "-27028671560000"],
		["America/Phoenix", "-27028657902000"],
		["America/Port-au-Prince", "-27028667440000"],
		["America/Port_of_Spain", "-27028670036000"],
		["America/Porto_Velho", "-27028669464000"],
		["America/Puerto_Rico", "-27028668935000"],
		["America/Punta_Arenas", "-27028667780000"],
		["America/Rainy_River", "-27028662104000"],
		["America/Rankin_Inlet", "-27028684800000"],
		["America/Recife", "-27028676424000"],
		["America/Regina", "-27028659684000"],
		["America/Resolute", "-27028684800000"],
		["America/Rio_Branco", "-27028668528000"],
		["America/Santarem", "-27028671672000"],
		["America/Santiago", "-27028667834000"],
		["America/Santo_Domingo", "-27028668024000"],
		["America/Sao_Paulo", "-27028673612000"],
		["America/Scoresbysund", "-27028679528000"],
		["America/Sitka", "-27028738727000"],
		["America/St_Barthelemy", "-27028670036000"],
		["America/St_Johns", "-27028672148000"],
		["America/St_Kitts", "-27028670036000"],
		["America/St_Lucia", "-27028670036000"],
		["America/St_Thomas", "-27028670036000"],
		["America/St_Vincent", "-27028670036000"],
		["America/Swift_Current", "-27028658920000"],
		["America/Tegucigalpa", "-27028663868000"],
		["America/Thule", "-27028668292000"],
		["America/Thunder_Bay", "-27028663380000"],
		["America/Tijuana", "-27028656716000"],
		["America/Toronto", "-27028665748000"],
		["America/Tortola", "-27028670036000"],
		["America/Vancouver", "-27028655252000"],
		["America/Whitehorse", "-27028652388000"],
		["America/Winnipeg", "-27028661484000"],
		["America/Yakutat", "-27028737665000"],
		["America/Yellowknife", "-27028684800000"],
		["Antarctica/Casey", "-27028684800000"],
		["Antarctica/Davis", "-27028684800000"],
		["Antarctica/DumontDUrville", "-27028684800000"],
		["Antarctica/Macquarie", "-27028684800000"],
		["Antarctica/Mawson", "-27028684800000"],
		["Antarctica/McMurdo", "-27028726744000"],
		["Antarctica/Palmer", "-27028684800000"],
		["Antarctica/Rothera", "-27028684800000"],
		["Antarctica/Syowa", "-27028684800000"],
		["Antarctica/Troll", "-27028684800000"],
		["Antarctica/Vostok", "-27028684800000"],
		["Arctic/Longyearbyen", "-27028687380000"],
		["Asia/Aden", "-27028696012000"],
		["Asia/Almaty", "-27028703268000"],
		["Asia/Amman", "-27028693424000"],
		["Asia/Anadyr", "-27028727396000"],
		["Asia/Aqtau", "-27028696864000"],
		["Asia/Aqtobe", "-27028698520000"],
		["Asia/Ashgabat", "-27028698812000"],
		["Asia/Atyrau", "-27028697264000"],
		["Asia/Baghdad", "-27028695460000"],
		["Asia/Bahrain", "-27028697168000"],
		["Asia/Baku", "-27028696764000"],
		["Asia/Bangkok", "-27028708924000"],
		["Asia/Barnaul", "-27028704900000"],
		["Asia/Beirut", "-27028693320000"],
		["Asia/Bishkek", "-27028702704000"],
		["Asia/Brunei", "-27028712380000"],
		["Asia/Calcutta", "-27028706008000"],
		["Asia/Chita", "-27028712032000"],
		["Asia/Choibalsan", "-27028712280000"],
		["Asia/Colombo", "-27028703964000"],
		["Asia/Damascus", "-27028693512000"],
		["Asia/Dhaka", "-27028706500000"],
		["Asia/Dili", "-27028714940000"],
		["Asia/Dubai", "-27028698072000"],
		["Asia/Dushanbe", "-27028701312000"],
		["Asia/Famagusta", "-27028692948000"],
		["Asia/Gaza", "-27028693072000"],
		["Asia/Hebron", "-27028693223000"],
		["Asia/Ho_Chi_Minh", "-27028710400000"],
		["Asia/Hong_Kong", "-27028712202000"],
		["Asia/Hovd", "-27028706796000"],
		["Asia/Irkutsk", "-27028709825000"],
		["Asia/Jakarta", "-27028710432000"],
		["Asia/Jayapura", "-27028718568000"],
		["Asia/Jerusalem", "-27028693254000"],
		["Asia/Kabul", "-27028701408000"],
		["Asia/Kamchatka", "-27028722876000"],
		["Asia/Karachi", "-27028700892000"],
		["Asia/Katmandu", "-27028705276000"],
		["Asia/Khandyga", "-27028717333000"],
		["Asia/Kolkata", "-27028706008000"],
		["Asia/Krasnoyarsk", "-27028707086000"],
		["Asia/Kuala_Lumpur", "-27028709206000"],
		["Asia/Kuching", "-27028711280000"],
		["Asia/Kuwait", "-27028696012000"],
		["Asia/Macau", "-27028712050000"],
		["Asia/Magadan", "-27028720992000"],
		["Asia/Makassar", "-27028713456000"],
		["Asia/Manila", "-27028627440000"],
		["Asia/Muscat", "-27028698072000"],
		["Asia/Nicosia", "-27028692808000"],
		["Asia/Novokuznetsk", "-27028705728000"],
		["Asia/Novosibirsk", "-27028704700000"],
		["Asia/Omsk", "-27028702410000"],
		["Asia/Oral", "-27028697124000"],
		["Asia/Phnom_Penh", "-27028708924000"],
		["Asia/Pontianak", "-27028711040000"],
		["Asia/Pyongyang", "-27028714980000"],
		["Asia/Qatar", "-27028697168000"],
		["Asia/Qostanay", "-27028700068000"],
		["Asia/Qyzylorda", "-27028700512000"],
		["Asia/Rangoon", "-27028707887000"],
		["Asia/Riyadh", "-27028696012000"],
		["Asia/Sakhalin", "-27028719048000"],
		["Asia/Samarkand", "-27028700873000"],
		["Asia/Seoul", "-27028715272000"],
		["Asia/Shanghai", "-27028713943000"],
		["Asia/Singapore", "-27028709725000"],
		["Asia/Srednekolymsk", "-27028721692000"],
		["Asia/Taipei", "-27028713960000"],
		["Asia/Tashkent", "-27028701431000"],
		["Asia/Tbilisi", "-27028695551000"],
		["Asia/Tehran", "-27028697144000"],
		["Asia/Thimphu", "-27028706316000"],
		["Asia/Tokyo", "-27028718339000"],
		["Asia/Tomsk", "-27028705191000"],
		["Asia/Ulaanbaatar", "-27028710452000"],
		["Asia/Urumqi", "-27028705820000"],
		["Asia/Ust-Nera", "-27028719174000"],
		["Asia/Vientiane", "-27028708924000"],
		["Asia/Vladivostok", "-27028716451000"],
		["Asia/Yakutsk", "-27028715938000"],
		["Asia/Yangon", "-27028707887000"],
		["Asia/Yekaterinburg", "-27028699353000"],
		["Asia/Yerevan", "-27028695480000"],
		["Atlantic/Azores", "-27028678640000"],
		["Atlantic/Bermuda", "-27028669242000"],
		["Atlantic/Canary", "-27028681104000"],
		["Atlantic/Cape_Verde", "-27028679156000"],
		["Atlantic/Faroe", "-27028683176000"],
		["Atlantic/Madeira", "-27028680744000"],
		["Atlantic/Reykjavik", "-27028679520000"],
		["Atlantic/South_Georgia", "-27028676032000"],
		["Atlantic/St_Helena", "-27028683832000"],
		["Atlantic/Stanley", "-27028670916000"],
		["Australia/Adelaide", "-27028718060000"],
		["Australia/Brisbane", "-27028721528000"],
		["Australia/Broken_Hill", "-27028718748000"],
		["Australia/Currie", "-27028719328000"],
		["Australia/Darwin", "-27028716200000"],
		["Australia/Eucla", "-27028715728000"],
		["Australia/Hobart", "-27028720156000"],
		["Australia/Lindeman", "-27028720556000"],
		["Australia/Lord_Howe", "-27028722980000"],
		["Australia/Melbourne", "-27028719592000"],
		["Australia/Perth", "-27028712604000"],
		["Australia/Sydney", "-27028721092000"],
		["Europe/Amsterdam", "-27028685972000"],
		["Europe/Andorra", "-27028685164000"],
		["Europe/Astrakhan", "-27028696332000"],
		["Europe/Athens", "-27028690492000"],
		["Europe/Belgrade", "-27028689720000"],
		["Europe/Berlin", "-27028688008000"],
		["Europe/Bratislava", "-27028688264000"],
		["Europe/Brussels", "-27028685850000"],
		["Europe/Bucharest", "-27028691064000"],
		["Europe/Budapest", "-27028689380000"],
		["Europe/Busingen", "-27028686848000"],
		["Europe/Chisinau", "-27028691720000"],
		["Europe/Copenhagen", "-27028687820000"],
		["Europe/Dublin", "-27028683300000"],
		["Europe/Gibraltar", "-27028683516000"],
		["Europe/Guernsey", "-27028684725000"],
		["Europe/Helsinki", "-27028690789000"],
		["Europe/Isle_of_Man", "-27028684725000"],
		["Europe/Istanbul", "-27028691752000"],
		["Europe/Jersey", "-27028684725000"],
		["Europe/Kaliningrad", "-27028689720000"],
		["Europe/Kiev", "-27028692124000"],
		["Europe/Kirov", "-27028696728000"],
		["Europe/Lisbon", "-27028682595000"],
		["Europe/Ljubljana", "-27028689720000"],
		["Europe/London", "-27028684725000"],
		["Europe/Luxembourg", "-27028686276000"],
		["Europe/Madrid", "-27028683916000"],
		["Europe/Malta", "-27028688284000"],
		["Europe/Mariehamn", "-27028690789000"],
		["Europe/Minsk", "-27028691416000"],
		["Europe/Monaco", "-27028686572000"],
		["Europe/Moscow", "-27028693817000"],
		["Europe/Oslo", "-27028687380000"],
		["Europe/Paris", "-27028685361000"],
		["Europe/Podgorica", "-27028689720000"],
		["Europe/Prague", "-27028688264000"],
		["Europe/Riga", "-27028690594000"],
		["Europe/Rome", "-27028687796000"],
		["Europe/Samara", "-27028696820000"],
		["Europe/San_Marino", "-27028687796000"],
		["Europe/Sarajevo", "-27028689720000"],
		["Europe/Saratov", "-27028695858000"],
		["Europe/Simferopol", "-27028692984000"],
		["Europe/Skopje", "-27028689720000"],
		["Europe/Sofia", "-27028690396000"],
		["Europe/Stockholm", "-27028689132000"],
		["Europe/Tallinn", "-27028690740000"],
		["Europe/Tirane", "-27028689560000"],
		["Europe/Ulyanovsk", "-27028696416000"],
		["Europe/Uzhgorod", "-27028690152000"],
		["Europe/Vaduz", "-27028686848000"],
		["Europe/Vatican", "-27028687796000"],
		["Europe/Vienna", "-27028688721000"],
		["Europe/Vilnius", "-27028690876000"],
		["Europe/Volgograd", "-27028695460000"],
		["Europe/Warsaw", "-27028689840000"],
		["Europe/Zagreb", "-27028689720000"],
		["Europe/Zaporozhye", "-27028693240000"],
		["Europe/Zurich", "-27028686848000"],
		["Indian/Antananarivo", "-27028693636000"],
		["Indian/Chagos", "-27028702180000"],
		["Indian/Christmas", "-27028710172000"],
		["Indian/Cocos", "-27028708060000"],
		["Indian/Comoro", "-27028693636000"],
		["Indian/Kerguelen", "-27028684800000"],
		["Indian/Mahe", "-27028698108000"],
		["Indian/Maldives", "-27028702440000"],
		["Indian/Mauritius", "-27028698600000"],
		["Indian/Mayotte", "-27028693636000"],
		["Indian/Reunion", "-27028698112000"],
		["Pacific/Apia", "-27028729984000"],
		["Pacific/Auckland", "-27028726744000"],
		["Pacific/Bougainville", "-27028722136000"],
		["Pacific/Chatham", "-27028728828000"],
		["Pacific/Chuuk", "-27028634828000"],
		["Pacific/Easter", "-27028658552000"],
		["Pacific/Efate", "-27028725196000"],
		["Pacific/Enderbury", "-27028643740000"],
		["Pacific/Fakaofo", "-27028643704000"],
		["Pacific/Fiji", "-27028727744000"],
		["Pacific/Funafuti", "-27028727812000"],
		["Pacific/Galapagos", "-27028663296000"],
		["Pacific/Gambier", "-27028652412000"],
		["Pacific/Guadalcanal", "-27028723188000"],
		["Pacific/Guam", "-27028633140000"],
		["Pacific/Honolulu", "-27028646914000"],
		["Pacific/Kiritimati", "-27028647040000"],
		["Pacific/Kosrae", "-27028637516000"],
		["Pacific/Kwajalein", "-27028724960000"],
		["Pacific/Majuro", "-27028725888000"],
		["Pacific/Marquesas", "-27028651320000"],
		["Pacific/Midway", "-27028730232000"],
		["Pacific/Nauru", "-27028724860000"],
		["Pacific/Niue", "-27028644020000"],
		["Pacific/Norfolk", "-27028725112000"],
		["Pacific/Noumea", "-27028724748000"],
		["Pacific/Pago_Pago", "-27028730232000"],
		["Pacific/Palau", "-27028630676000"],
		["Pacific/Pitcairn", "-27028653580000"],
		["Pacific/Pohnpei", "-27028636372000"],
		["Pacific/Port_Moresby", "-27028720120000"],
		["Pacific/Rarotonga", "-27028646456000"],
		["Pacific/Saipan", "-27028633140000"],
		["Pacific/Tahiti", "-27028648904000"],
		["Pacific/Tarawa", "-27028726324000"],
		["Pacific/Tongatapu", "-27028729160000"],
		["Pacific/Wake", "-27028724788000"],
		["Pacific/Wallis", "-27028728920000"]
	]

	const getTimezoneOffset = () => {
		const [year, month, day] = JSON.stringify(new Date())
			.slice(1, 11)
			.split('-')
		const dateString = `${month}/${day}/${year}`
		const dateStringUTC = `${year}-${month}-${day}`
		const now = +new Date(dateString)
		const utc = +new Date(dateStringUTC)
		const computed = +((now - utc) / 60000)
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
		const month = now.getUTCMonth() + 1
		const date = now.getUTCDate()
		const hh = now.getUTCHours()
		const mm = now.getUTCMinutes()
		const ss = now.getUTCSeconds()
		const ms = now.getUTCMilliseconds()

		const methods = `${year}-${pad(month)}-${pad(date)}T${pad(hh)}:${pad(mm)}:${pad(ss)}.${pad(ms, 2)}Z`
		const stringify = JSON.stringify(now).slice(1, -1)
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

	// detect precision protection
	const regex = n => new RegExp(`${n}+$`)
	const delay = (ms, baseNumber, baseDate = null) => new Promise(resolve => setTimeout(() => {
		const date = baseDate ? baseDate : +new Date()
		const value = regex(baseNumber).test(date) ? regex(baseNumber).exec(date)[0] : date
		return resolve(value)
	}, ms))
	const detectProtection = async () => {
		const baseDate = +new Date()
		const baseNumber = +('' + baseDate).slice(-1)

		const a = await delay(0, baseNumber, baseDate)
		const b = await delay(1, baseNumber)
		const c = await delay(2, baseNumber)
		const d = await delay(3, baseNumber)
		const e = await delay(4, baseNumber)
		const f = await delay(5, baseNumber)
		const g = await delay(6, baseNumber)
		const h = await delay(7, baseNumber)
		const i = await delay(8, baseNumber)
		const j = await delay(9, baseNumber)

		const lastCharA = ('' + a).slice(-1)
		const lastCharB = ('' + b).slice(-1)
		const lastCharC = ('' + c).slice(-1)
		const lastCharD = ('' + d).slice(-1)
		const lastCharE = ('' + e).slice(-1)
		const lastCharF = ('' + f).slice(-1)
		const lastCharG = ('' + g).slice(-1)
		const lastCharH = ('' + h).slice(-1)
		const lastCharI = ('' + i).slice(-1)
		const lastCharJ = ('' + j).slice(-1)

		const protection = (
			lastCharA == lastCharB &&
			lastCharA == lastCharC &&
			lastCharA == lastCharD &&
			lastCharA == lastCharE &&
			lastCharA == lastCharF &&
			lastCharA == lastCharG &&
			lastCharA == lastCharH &&
			lastCharA == lastCharI &&
			lastCharA == lastCharJ
		)
		const baseLen = ('' + a).length
		const collection = [a, b, c, d, e, f, g, h, i, j]
		return {
			protection,
			delays: collection.map(n => ('' + n).length > baseLen ? ('' + n).slice(-baseLen) : n),
			precision: protection ? Math.min(...collection.map(val => ('' + val).length)) : undefined,
			precisionValue: protection ? lastCharA : undefined
		}
	}

	const binarySearch = (list, fn) => {
		const end = list.length
		const middle = Math.floor(end / 2)
		const [left, right] = [list.slice(0, middle), list.slice(middle, end)]
		const found = fn(left)
		return end == 1 || found.length ? found : binarySearch(right, fn)
	}

	const getTimezoneHistory = ({ year, city }) => {
		const options = {
			timeZone: city,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric'
		}
		const formatter = new Intl.DateTimeFormat('en', options)
		const epoch = +new Date(formatter.format(new Date(`7/1/${year}`)))
		return epoch
	}

	const start = performance.now()

	// base year
	const year = 1113

	// get reported location
	const { timeZone } = Intl.DateTimeFormat().resolvedOptions()

	// get epoch location
	const resolvedOptionsEpoch = getTimezoneHistory({ year, city: timeZone })
	const systemEpoch = +new Date(new Date(`7/1/${year}`))
	const epochCities = cities.filter(city => city[1] == systemEpoch)
	const epochCitySet = (
		resolvedOptionsEpoch == systemEpoch ? new Set([timeZone]) :
			epochCities.length ? new Set(epochCities.map(city => city[0])) : new Set([])
	)

	const perf = performance.now() - start

	const notWithinParentheses = /.*\(|\).*/g
	const zone = ('' + new Date()).replace(notWithinParentheses, '')

	// tests
	const getRand = (min, max) => ~~(Math.random() * (max - min + 1)) + min
	const rand = getRand(0, 23)
	const { methods: utcMethods, stringify, toJSON, toISOString } = getUTCTime()
	const { now, dateValue, valueOf, getTime } = getNowTime()
	const time = new Date()
	const midnight = new Date('07/01/1970')
	const timezoneOffset = getTimezoneOffset()
	const hours = '' + time.getHours()
	const minutes = '' + pad(time.getMinutes())
	const seconds = '' + pad(time.getSeconds())
	const timeString = `${hours > 12 ? hours - 12 : hours}:${minutes}:${seconds} ${hours < 12 ? 'AM' : 'PM'}`

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
			/^function Date\(\) {(\n    | )\[native code\](\n| )}$/.test(Date + '') &&
			Date.length == 7 &&
			Date.name == 'Date' &&
			new Date() == Date() &&
			'' + new Date(Date.parse(new Date())) == '' + new Date()
		),
		invalidDate: /^Invalid Date$/.test(new Date(10000000000000000000000000)),
		location: epochCitySet.has(timeZone),
		offset: (() => {
			try {
				new Date.prototype.getTimezoneOffset
				return false
			}
			catch (error) {
				const { name, message } = error
				return (
					name == 'TypeError' && /not a constructor/.test(message) &&
						/^function getTimezoneOffset\(\) {(\n    | )\[native code\](\n| )}$/.test(Date.prototype.getTimezoneOffset + '') ?
						true : false
				)
			}
		})(),
		matchingOffset: timezoneOffset.key == timezoneOffset.computed,
		nowTime: (
			dateValue == getTime && dateValue == now && dateValue == valueOf
		),
		utcTime: (
			utcMethods == stringify && utcMethods == toJSON && utcMethods == toISOString
		)
	}

	const { protection, delays, precision, precisionValue } = await detectProtection()
	// template
	const locationHash = hashMini([...epochCitySet])
	const styleWarn = valid => valid ? `<span class="pass">&#10004;</span>` : `<span class="warn">&#9888;</span>`
	const styleResult = valid => valid ? `<span class="pass">&#10004;</span>` : `<span class="fail">&#10006;</span>`
	const fake = x => `<span class="fake">${x}</span>`
	const el = document.getElementById('fingerprint-data')
	patch(el, html`
	<style>
		#fingerprint-data > .jumbo {
			font-size: 32px;
		}
		.pass, .fail, .entropy, .warn, .location {
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
		.group {
			border: 1px solid #eee;
			border-radius: 3px;
			padding: 10px 15px;
			margin: 10px auto;
		}
		.entropy, .warn {
			color: #94653dc9;
    		background: #ffe06624;
		}
		.location {
			color: #643c98fa;
    		background: #643c980f;
		}
		@media (prefers-color-scheme: dark) { 
			.entropy, .warn {
				color: #d28c50;
				background: #ffe06624;
			}
			.group {
				border: 1px solid #eeeeee54;
			}
			.location {
				color: #baaacefa;
				background: #643c984f;
			}
			.lighten {
				color: #bbbbbb7a;
			}
		}
	</style>
	<div id="fingerprint-data">
		<div class="visitor-info">
			<span class="aside-note">${perf.toFixed(2)}ms</span>
			<strong>Timezone</strong>
		</div>
		<div class="jumbo">
			<div>${locationHash}</div>
		</div>
		<div>
			<div>${styleWarn(valid.time && valid.clock)}system health: ${
		valid.time && valid.clock ? 'functional' : '<span class="entropy">dysfunctional</span>'
		}</div>
			<div>${styleResult(valid.date && valid.clock)}date: ${
		valid.date && valid.clock ? new Date() : `${new Date()}${fake('fake')}`
		}</div>
			<div>${styleResult(valid.time && valid.clock)}time: ${
		valid.time && valid.clock ? timeString : `${timeString}${fake('fake')}`
		}</div>
			<div>${styleResult(valid.invalidDate && valid.date && valid.clock)}zone: ${
		valid.invalidDate && valid.date && valid.clock ? zone : `${zone}${fake('fake')}`
		}</div>
			<div>${styleResult(valid.matchingOffset && valid.offset)}reported offset: ${
		valid.matchingOffset && valid.offset ? '' + timezoneOffset.key : `${'' + timezoneOffset.key}${fake('fake')}`
		}</div>
			<div>${styleResult(true)}computed offset: ${'' + timezoneOffset.computed}</div>
			<div>${styleResult(isChrome || isFirefox ? valid.location : true)}reported location: ${
		valid.location ? timeZone : (isChrome || isFirefox) ? `${timeZone}${fake('fake')}` : timeZone
		}</div>
			${
		epochCitySet.size ? `
				<div>${styleResult(true)}computed location: ${
			(epochCitySet.size == 1 && [...epochCitySet][0] != timeZone) ||
				epochCitySet.size > 1 ? locationHash : ''}${
			[...epochCitySet].map(city => {
				city = city.replace(/\/.+\//, '/')
				return (
					city == timeZone || (
						epochCitySet.size == 1 && [...epochCitySet][0] == timeZone
					) ?
						`<span class="location">${city}</span>` :
						`<div><span class="lighten">${city}</span></div>`
				)
			}).join('')
			}</div>
				` : ''
		}
			${(() => {
			const base = ('' + dateValue).split('')
			const style = (a, b) => b.map((char, i) => char != a[i] ? `<span class="erratic">${char}</span>` : char).join('')
			return `
					<div>${styleResult(valid.nowTime)}now epoch time: ${!valid.nowTime ? fake('erratic') : ''}</div>
					<div class="group">
						<div>${dateValue} <span class="lighten">[+new Date()]</span></div>
						<div>${style(base, ('' + now).split(''))} <span class="lighten">[Date.now()]</span></div>
						<div>${style(base, ('' + getTime).split(''))} <span class="lighten">[new Date().getTime()]</span></div>
						<div>${style(base, ('' + valueOf).split(''))} <span class="lighten">[new Date().valueOf()]</span></div>
					</div>
				`
		})()}
			${(() => {
			const base = utcMethods.split('')
			const style = (a, b) => b.map((char, i) => char != a[i] ? `<span class="erratic">${char}</span>` : char).join('')
			return `
					<div>${styleResult(valid.utcTime)}utc ISO time: ${!valid.utcTime ? fake('erratic') : ''}</div>
					<div class="group">
						<div>${utcMethods} <span class="lighten">[getUTC... Methods]</span></div>
						<div>${style(base, toJSON.split(''))} <span class="lighten">[new Date().toJSON()]</span></div>
						<div>${style(base, toISOString.split(''))} <span class="lighten">[new Date().toISOString()]</span></div>
						<div>${style(base, stringify.split(''))} <span class="lighten">[JSON.stringify(new Date()).slice(1,-1)]</span></div>
					</div>
				`
		})()}
			<div>${styleWarn(!protection)}reduced timer precision: ${!protection ? 'unknown' : '<span class="entropy">protection detected</span>'}</div>
			<div class="group">
				<div>delays: ${delays.join(', ')}</div>
				<div>precision level: ${'' + precision}</div>
				<div>microseconds: ${protection ? '' + (1000 * Math.pow(10, precision)) : 'undefined'}</div>
				<div>repeat value: ${'' + precisionValue}</div>
			</div>
		</div>
	</div>
	`
	)
})()