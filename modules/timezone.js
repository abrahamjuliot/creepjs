export const getTimezone = imports => {

	const {
		require: {
			hashify,
			patch,
			html,
			note,
			modal,
			captureError,
			attempt,
			caniuse,
			documentLie,
			lieProps,
			contentWindow
		}
	} = imports
	
	return new Promise(async resolve => {
		try {
			let lied
			const contentWindowDate = contentWindow ? contentWindow.Date : Date
			const contentWindowIntl = contentWindow ? contentWindow.Intl : Date
			const computeTimezoneOffset = () => {
				const date = new contentWindowDate().getDate()
				const month = new contentWindowDate().getMonth()
				const year = contentWindowDate().split` `[3] // current year
				const format = n => (''+n).length == 1 ? `0${n}` : n
				const dateString = `${month+1}/${format(date)}/${year}`
				const dateStringUTC = `${year}-${format(month+1)}-${format(date)}`
				const utc = contentWindowDate.parse(
					new contentWindowDate(dateString)
				)
				const now = +new contentWindowDate(dateStringUTC)
				return +(((utc - now)/60000).toFixed(0))
			}
			// concept inspired by https://arkenfox.github.io/TZP
			const measureTimezoneOffset = timezone => {
				let lie = false
				const year = contentWindowDate().split` `[3] // current year
				const minute = 60000
				const winter = new contentWindowDate(`1/1/${year}`)
				const spring = new contentWindowDate(`4/1/${year}`)
				const summer = new contentWindowDate(`7/1/${year}`)
				const fall = new contentWindowDate(`10/1/${year}`)
				const winterUTCTime = +new contentWindowDate(`${year}-01-01`)
				const springUTCTime = +new contentWindowDate(`${year}-04-01`)
				const summerUTCTime = +new contentWindowDate(`${year}-07-01`)
				const fallUTCTime = +new contentWindowDate(`${year}-10-01`)
				const date = {
					winter: {
						calculated: (+winter - winterUTCTime)/minute,
						parsed: (contentWindowDate.parse(winter) - winterUTCTime)/minute
					},
					spring: {
						calculated: (+spring - springUTCTime)/minute,
						parsed: (contentWindowDate.parse(spring) - springUTCTime)/minute
					},
					summer: {
						calculated: (+summer - summerUTCTime)/minute,
						parsed: (contentWindowDate.parse(summer) - summerUTCTime)/minute
					},
					fall: {
						calculated: (+fall - fallUTCTime)/minute,
						parsed: (contentWindowDate.parse(fall) - fallUTCTime)/minute
					}
				}
				lie = !!Object.keys(date).filter(key => {
					const season = date[key]
					return season.calculated != season.parsed
				}).length
				const set = new Set(
					[].concat(
						...Object.keys(date).map(key => {
							const season = date[key]
							return [season.calculated, season.parsed]
						})
					)
				)
				lie = !set.has(timezone)
				if (lie) {
					set.add(timezone) // show in result
				}
				return { season: [...set], lie }
			}
			const getRelativeTime = () => {
				const locale = attempt(() => contentWindowIntl.DateTimeFormat().resolvedOptions().locale)
				if (!locale || !caniuse(() => new contentWindowIntl.RelativeTimeFormat)) {
					return undefined
				}
				const relativeTime = new contentWindowIntl.RelativeTimeFormat(locale, {
					localeMatcher: 'best fit',
					numeric: 'auto',
					style: 'long'
				})
				return {
					["format(-1, 'second')"]: relativeTime.format(-1, 'second'),
					["format(0, 'second')"]: relativeTime.format(0, 'second'),
					["format(1, 'second')"]: relativeTime.format(1, 'second'),
					["format(-1, 'minute')"]: relativeTime.format(-1, 'minute'),
					["format(0, 'minute')"]: relativeTime.format(0, 'minute'),
					["format(1, 'minute')"]: relativeTime.format(1, 'minute'),
					["format(-1, 'hour')"]: relativeTime.format(-1, 'hour'),
					["format(0, 'hour')"]: relativeTime.format(0, 'hour'),
					["format(1, 'hour')"]: relativeTime.format(1, 'hour'),
					["format(-1, 'day')"]: relativeTime.format(-1, 'day'),
					["format(0, 'day')"]: relativeTime.format(0, 'day'),
					["format(1, 'day')"]: relativeTime.format(1, 'day'),
					["format(-1, 'week')"]: relativeTime.format(-1, 'week'),
					["format(0, 'week')"]: relativeTime.format(0, 'week'),
					["format(1, 'week'),"]: relativeTime.format(1, 'week'),
					["format(-1, 'month')"]: relativeTime.format(-1, 'month'),
					["format(0, 'month'),"]: relativeTime.format(0, 'month'),
					["format(1, 'month')"]: relativeTime.format(1, 'month'),
					["format(-1, 'quarter')"]: relativeTime.format(-1, 'quarter'),
					["format(0, 'quarter')"]: relativeTime.format(0, 'quarter'),
					["format(1, 'quarter')"]: relativeTime.format(1, 'quarter'),
					["format(-1, 'year')"]: relativeTime.format(-1, 'year'),
					["format(0, 'year')"]: relativeTime.format(0, 'year'),
					["format(1, 'year')"]: relativeTime.format(1, 'year')
				}
			}
			const getLocale = () => {
				const constructors = [
					'Collator',
					'DateTimeFormat',
					'DisplayNames',
					'ListFormat',
					'NumberFormat',
					'PluralRules',
					'RelativeTimeFormat',
				]
				const languages = []
				constructors.forEach(name => {
					try {
						const obj = caniuse(() => new contentWindowIntl[name])
						if (!obj) {
							return
						}
						const { locale } = obj.resolvedOptions()
						return languages.push(locale)
					}
					catch (error) {
						return
					}
				})
				const lang = [...new Set(languages)]
				return { lang, lie: lang.length > 1 ? true : false }
			}
			const getWritingSystemKeys = async () => {
				const keys = [
					'Backquote',
					'Backslash',
					'Backspace',
					'BracketLeft',
					'BracketRight',
					'Comma',
					'Digit0',
					'Digit1',
					'Digit2',
					'Digit3',
					'Digit4',
					'Digit5',
					'Digit6',
					'Digit7',
					'Digit8',
					'Digit9',
					'Equal',
					'IntlBackslash',
					'IntlRo',
					'IntlYen',
					'KeyA',
					'KeyB',
					'KeyC',
					'KeyD',
					'KeyE',
					'KeyF',
					'KeyG',
					'KeyH',
					'KeyI',
					'KeyJ',
					'KeyK',
					'KeyL',
					'KeyM',
					'KeyN',
					'KeyO',
					'KeyP',
					'KeyQ',
					'KeyR',
					'KeyS',
					'KeyT',
					'KeyU',
					'KeyV',
					'KeyW',
					'KeyX',
					'KeyY',
					'KeyZ',
					'Minus',
					'Period',
					'Quote',
					'Semicolon',
					'Slash'
				]
				if (caniuse(() => navigator.keyboard.getLayoutMap)) {
					const keyoardLayoutMap = await navigator.keyboard.getLayoutMap()
					const writingSystemKeys= keys.map(key => {
						const value = keyoardLayoutMap.get(key)
						return { [key]: value }
					})
					return writingSystemKeys
				}
				return undefined
			}
			const writingSystemKeys = await getWritingSystemKeys()		
			const timezoneOffset = new contentWindowDate().getTimezoneOffset()
			const timezoneOffsetComputed = computeTimezoneOffset()
			const timezoneOffsetMeasured = measureTimezoneOffset(timezoneOffset)
			const measuredTimezones = timezoneOffsetMeasured.season.join(', ')
			const matchingOffsets = timezoneOffsetComputed == timezoneOffset
			const notWithinParentheses = /.*\(|\).*/g
			const timezoneLocation = contentWindowIntl.DateTimeFormat().resolvedOptions().timeZone
			const timezone = (''+new contentWindowDate()).replace(notWithinParentheses, '')
			const relativeTime = getRelativeTime()
			const locale = getLocale()
			// document lies
			lied = (
				lieProps['Date.getTimezoneOffset'] ||
				lieProps['Intl.Collator.resolvedOptions'] ||
				lieProps['Intl.DateTimeFormat.resolvedOptions'] ||
				lieProps['Intl.DisplayNames.resolvedOptions'] ||
				lieProps['Intl.ListFormat.resolvedOptions'] ||
				lieProps['Intl.NumberFormat.resolvedOptions'] ||
				lieProps['Intl.PluralRules.resolvedOptions'] ||
				lieProps['Intl.RelativeTimeFormat.resolvedOptions']
			)
			const seasonLie = timezoneOffsetMeasured.lie ? { fingerprint: '', lies: [{ ['timezone seasons disagree']: true }] } : false
			const localeLie = locale.lie ? { fingerprint: '', lies: [{ ['Intl locales mismatch']: true }] } : false
			const offsetLie = !matchingOffsets ? { fingerprint: '', lies: [{ ['timezone offsets mismatch']: true }] } : false
			if (seasonLie) {
				lied = true
				documentLie('Date', measuredTimezones, seasonLie)
			}
			if (localeLie) {
				lied = true
				documentLie('Intl', locale, localeLie)	
			}
			if (offsetLie) {
				lied = true
				documentLie('Date', timezoneOffset, offsetLie)
			}
			const data =  {
				timezone,
				timezoneLocation,
				timezoneOffset: timezoneOffset,
				timezoneOffsetComputed,
				timezoneOffsetMeasured: measuredTimezones,
				matchingOffsets,
				relativeTime,
				locale,
				writingSystemKeys,
				lied
			}
			
			const $hash = await hashify(data)
			resolve({...data, $hash })
			const id = 'creep-timezone'
			const el = document.getElementById(id)
			patch(el, html`
			<div>
				<strong>Date/Intl/Keyboard</strong>
				<div class="ellipsis">hash: ${lied ? `${note.lied} ` : ''}${$hash}</div>
				<div>timezone: ${timezone}</div>
				<div>timezone location: ${timezoneLocation}</div>
				<div>timezone offset: ${''+timezoneOffset}</div>
				<div>timezone offset computed: ${''+timezoneOffsetComputed}</div>
				<div>matching offsets: ${''+matchingOffsets}</div>
				<div>timezone measured: ${measuredTimezones}</div>
				<div>relativeTimeFormat: ${
					!relativeTime ? note.unsupported : 
					modal(`${id}-relative-time-format`, Object.keys(relativeTime).sort().map(key => `${key} => ${relativeTime[key]}`).join('<br>'))
				}</div>
				<div>locale language: ${locale.lang.join(', ')}</div>
				<div>writing system keys: ${
					!writingSystemKeys ? note.unsupported :
					modal(`${id}-writing-system-keys`, writingSystemKeys.map(systemKey => {
						const key = Object.keys(systemKey)[0]
						const value = systemKey[key]
						const style = `
							background: #f6f6f6;
							border-radius: 2px;
							padding: 0px 5px;
						`
						return `${key}: <span style="${style}">${value}</span>`
					}).join('<br>'))
				}</div>
			</div>
			`)
			return
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}