const getLocale = intl => {
	const constructors = [
		'Collator',
		'DateTimeFormat',
		'DisplayNames',
		'ListFormat',
		'NumberFormat',
		'PluralRules',
		'RelativeTimeFormat'
	]
	const locale = constructors.reduce((acc, name) => {
		try {
			const obj = new intl[name]
			if (!obj) {
				return acc
			}
			const { locale } = obj.resolvedOptions() || {}
			return [...acc, locale]
		}
		catch (error) {
			return acc
		}
	}, [])

	return [...new Set(locale)]
}

export const getIntl = async imports => {

	const {
		require: {
			phantomDarkness,
			lieProps,
			caniuse,
			captureError,
			logTestResult
		}
	} = imports

	try {
		const start = performance.now()
		let lied = (
			lieProps['Intl.Collator.resolvedOptions'] ||
			lieProps['Intl.DateTimeFormat.resolvedOptions'] ||
			lieProps['Intl.DisplayNames.resolvedOptions'] ||
			lieProps['Intl.ListFormat.resolvedOptions'] ||
			lieProps['Intl.NumberFormat.resolvedOptions'] ||
			lieProps['Intl.PluralRules.resolvedOptions'] ||
			lieProps['Intl.RelativeTimeFormat.resolvedOptions']
		) || false

		const phantomIntl = phantomDarkness ? phantomDarkness.Intl : Intl

		const dateTimeFormat = caniuse(() => {
			return new phantomIntl.DateTimeFormat(undefined, {
				month: 'long',
				timeZoneName: 'long'
			}).format(963644400000)
		})

		const displayNames = caniuse(() => {
			return new phantomIntl.DisplayNames(undefined, {
				type: 'language'
			}).of('en-US')
		})

		const listFormat = caniuse(() => {
			return new phantomIntl.ListFormat(undefined, {
				style: 'long',
				type: 'disjunction'
			}).format(['0', '1'])
		})
		
		const numberFormat = caniuse(() => {
			return new phantomIntl.NumberFormat(undefined, {
				notation: 'compact',
				compactDisplay: 'long'
			}).format(21000000)
		})

		const pluralRules = caniuse(() => {
			return new phantomIntl.PluralRules().select(1)
		})

		const relativeTimeFormat = caniuse(() => {
			return new phantomIntl.RelativeTimeFormat(undefined, {
				localeMatcher: 'best fit',
				numeric: 'auto',
				style: 'long'
			}).format(1, 'year')
		})

		const locale = getLocale(phantomIntl)

		logTestResult({ start, test: 'intl', passed: true })
		return {
			dateTimeFormat,
			displayNames,
			listFormat,
			numberFormat,
			pluralRules,
			relativeTimeFormat,
			locale: ''+locale,
			lied
		}
	}
	catch (error) {
		logTestResult({ test: 'intl', passed: false })
		captureError(error)
		return
	}
}

export const intlHTML = ({ fp, modal, note, hashSlice, count }) => {
	if (!fp.htmlElementVersion) {
		return `
		<div class="col-four undefined">
			<strong>Intl</strong>
			<div>locale: ${note.blocked}</div>
			<div>date: ${note.blocked}</div>
			<div>display: ${note.blocked}</div>
			<div>list: ${note.blocked}</div>
			<div>number: ${note.blocked}</div>
			<div>plural: ${note.blocked}</div>
			<div>relative: ${note.blocked}</div>
		</div>`
	}
	const {
		intl: {
			$hash,
			dateTimeFormat,
			displayNames,
			listFormat,
			numberFormat,
			pluralRules,
			relativeTimeFormat,
			locale,
			lied
		}
	} = fp

	return `
	<div class="col-four${lied ? ' rejected' : ''}">
		<strong>Intl</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="block-text help"  title="Intl.Collator\nIntl.DateTimeFormat\nIntl.DisplayNames\nIntl.ListFormat\nIntl.NumberFormat\nIntl.PluralRules\nIntl.RelativeTimeFormat">
			${locale ? locale : ''}
			${dateTimeFormat ? `<br>${dateTimeFormat}` : ''}
			${displayNames ? `<br>${displayNames}` : ''}
			${numberFormat ? `<br>${numberFormat}` : ''}
			${relativeTimeFormat ? `<br>${relativeTimeFormat}` : ''}
			${listFormat ? `<br>${listFormat}` : ''}
			${pluralRules ? `<br>${pluralRules}` : ''}
		</div>
	</div>
	`
}