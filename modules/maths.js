export const getMaths = async imports => {

	const {
		require: {
			hashMini,
			captureError,
			attempt,
			documentLie,
			lieProps,
			phantomDarkness,
			logTestResult						
		}
	} = imports

	try {
		const start = performance.now()
		// detect failed math equality lie
		const check = [
			'acos',
			'acosh',
			'asin',
			'asinh',
			'atan',
			'atanh',
			'atan2',
			'cbrt',
			'cos',
			'cosh',
			'expm1',
			'exp',
			'hypot',
			'log',
			'log1p',
			'log10',
			'sin',
			'sinh',
			'sqrt',
			'tan',
			'tanh',
			'pow'
		]
		let lied = false
		let liedCalc = false
		const phantomMath = phantomDarkness ? phantomDarkness.Math : Math
		check.forEach(prop => {
			if (!!lieProps[`Math.${prop}`]) {
				lied = true
			}
			const test = (
				prop == 'cos' ? [1e308] :
				prop == 'acos' || prop == 'asin' || prop == 'atanh' ? [0.5] :
				prop == 'pow' || prop == 'atan2' ? [Math.PI, 2] : 
				[Math.PI]
			)
			const res1 = Math[prop](...test)
			const res2 = Math[prop](...test)
			const matching = isNaN(res1) && isNaN(res2) ? true : res1 == res2
			if (!matching) {
				liedCalc = true
				const mathLie = `expected x and got y`
				documentLie(`Math.${prop}`, mathLie)
			}
			return
		})
		

		const n = 0.123
		const bigN = 5.860847362277284e+38
		const fns = [
			['acos', [n], `acos(${n})`, 1.4474840516030247, NaN, NaN, 1.4474840516030245],
			['acos', [Math.SQRT1_2], 'acos(Math.SQRT1_2)', 0.7853981633974483, NaN, NaN, NaN],
			
			['acosh', [1e308], 'acosh(1e308)', 709.889355822726, NaN, NaN, NaN],
			['acosh', [Math.PI], 'acosh(Math.PI)', 1.811526272460853, NaN, NaN, NaN],
			['acosh', [Math.SQRT2], 'acosh(Math.SQRT2)', 0.881373587019543, NaN, NaN, 0.8813735870195432],

			['asin', [n], `asin(${n})`, 0.12331227519187199, NaN, NaN, NaN],

			['asinh', [1e300], 'asinh(1e308)', 691.4686750787736, NaN, NaN, NaN],
			['asinh', [Math.PI], 'asinh(Math.PI)', 1.8622957433108482, NaN, NaN, NaN],

			['atan', [2], 'atan(2)', 1.1071487177940904, NaN, NaN, 1.1071487177940906],
			['atan', [Math.PI], 'atan(Math.PI)', 1.2626272556789115, NaN, NaN, NaN],

			['atanh', [0.5], 'atanh(0.5)', 0.5493061443340548, NaN, NaN, 0.5493061443340549],

			['atan2', [1e-310, 2], 'atan2(1e-310, 2)', 5e-311, NaN, NaN, NaN],
			['atan2', [Math.PI, 2], 'atan2(Math.PI)', 1.0038848218538872, NaN, NaN, NaN],

			['cbrt', [100], 'cbrt(100)', 4.641588833612779, NaN, NaN, NaN],
			['cbrt', [Math.PI], 'cbrt(Math.PI)', 1.4645918875615231, NaN, NaN, 1.4645918875615234],
			
			['cos', [n], `cos(${n})`, 0.9924450321351935, NaN, NaN, NaN],
			['cos', [Math.PI], 'cos(Math.PI)', -1, NaN, NaN, NaN],
			['cos', [bigN], `cos(${bigN})`, -0.10868049424995659, NaN, -0.9779661551196617, NaN],
			['cos', [-1e308], 'cos(-1e308)', -0.8913089376870335, NaN, 0.99970162388838, NaN],
			['cos', [13*Math.E], 'cos(13*Math.E)', -0.7108118501064331, -0.7108118501064332, NaN, NaN],
			['cos', [57*Math.E], 'cos(57*Math.E)', -0.536911695749024, -0.5369116957490239, NaN, NaN],
			['cos', [21*Math.LN2], 'cos(21*Math.LN2)', -0.4067775970251724, -0.40677759702517235, -0.6534063185820197, NaN],
			['cos', [51*Math.LN2], 'cos(51*Math.LN2)', -0.7017203400855446, -0.7017203400855445, NaN, NaN],
			['cos', [21*Math.LOG2E], 'cos(21*Math.LOG2E)', 0.4362848063618998, 0.43628480636189976, NaN, NaN],
			['cos', [25*Math.SQRT2], 'cos(25*Math.SQRT2)', -0.6982689820462377, -0.6982689820462376, NaN, NaN],
			['cos', [50*Math.SQRT1_2], 'cos(50*Math.SQRT1_2)', -0.6982689820462377, -0.6982689820462376, NaN, NaN],
			['cos', [21*Math.SQRT1_2], 'cos(21*Math.SQRT1_2)', -0.6534063185820198, NaN, NaN, NaN],
			['cos', [17*Math.LOG10E], 'cos(17*Math.LOG10E)', 0.4537557425982784, 0.45375574259827833, NaN, NaN],
			['cos', [2*Math.LOG10E], 'cos(2*Math.LOG10E)', 0.6459044007438142, NaN, 0.6459044007438141, NaN],

			['cosh', [1], 'cosh(1)', 1.5430806348152437, NaN, NaN, NaN],
			['cosh', [Math.PI], 'cosh(Math.PI)', 11.591953275521519, NaN, NaN, NaN],
			['cosh', [492*Math.LOG2E], 'cosh(492*Math.LOG2E)', 9.199870313877772e+307, 9.199870313877774e+307, NaN, NaN],
			['cosh', [502*Math.SQRT2], 'cosh(502*Math.SQRT2)', 1.0469199669023138e+308, 1.046919966902314e+308, NaN, NaN],

			['expm1', [1], 'expm1(1)', 1.718281828459045, NaN, NaN, 1.7182818284590453],
			['expm1', [Math.PI], 'expm1(Math.PI)', 22.140692632779267, NaN, NaN, NaN],

			['exp', [n], `exp(${n})`, 1.1308844209474893, NaN, NaN, NaN],
			['exp', [Math.PI], 'exp(Math.PI)', 23.140692632779267, NaN, NaN, NaN],

			['hypot', [1, 2, 3, 4, 5, 6], 'hypot(1, 2, 3, 4, 5, 6)', 9.539392014169456, NaN, NaN, NaN],
			['hypot', [bigN, bigN], `hypot(${bigN}, ${bigN})`, 8.288489826731116e+38, 8.288489826731114e+38, NaN, NaN],
			['hypot', [2*Math.E, -100], 'hypot(2*Math.E, -100)', 100.14767208675259, 100.14767208675258, NaN, NaN],
			['hypot', [6*Math.PI, -100], 'hypot(6*Math.PI, -100)', 101.76102278593319, 101.7610227859332, NaN, NaN],
			['hypot', [2*Math.LN2, -100], 'hypot(2*Math.LN2, -100)', 100.0096085986525, 100.00960859865252, NaN, NaN],
			['hypot', [Math.LOG2E, -100], 'hypot(Math.LOG2E, -100)', 100.01040630344929, 100.01040630344927, NaN, NaN],
			['hypot', [Math.SQRT2, -100], 'hypot(Math.SQRT2, -100)', 100.00999950004999, 100.00999950005, NaN, NaN],
			['hypot', [Math.SQRT1_2, -100], 'hypot(Math.SQRT1_2, -100)', 100.0024999687508, 100.00249996875078, NaN, NaN],
			['hypot', [2*Math.LOG10E, -100], 'hypot(2*Math.LOG10E, -100)', 100.00377216279416, 100.00377216279418, NaN, NaN],

			['log', [n], `log(${n})`, -2.0955709236097197, NaN, NaN, NaN],
			['log', [Math.PI], 'log(Math.PI)', 1.1447298858494002, NaN, NaN, NaN],

			['log1p', [n], `log1p(${n})`, 0.11600367575630613, NaN, NaN, NaN],
			['log1p', [Math.PI], 'log1p(Math.PI)', 1.4210804127942926, NaN, NaN, NaN],

			['log10', [n], `log10(${n})`, -0.9100948885606021, NaN, NaN, NaN],
			['log10', [Math.PI], 'log10(Math.PI)', 0.4971498726941338, 0.49714987269413385, NaN, NaN],
			['log10', [Math.E], 'log10(Math.E)', 0.4342944819032518, NaN, NaN, NaN],
			['log10', [34*Math.E], 'log10(34*Math.E)', 1.9657733989455068, 1.965773398945507, NaN, NaN],
			['log10', [Math.LN2], 'log10(Math.LN2)', -0.1591745389548616, NaN, NaN, NaN],
			['log10', [11*Math.LN2], 'log10(11*Math.LN2)', 0.8822181462033634, 0.8822181462033635, NaN, NaN],
			['log10', [Math.LOG2E], 'log10(Math.LOG2E)', 0.15917453895486158, NaN, NaN, NaN],
			['log10', [43*Math.LOG2E], 'log10(43*Math.LOG2E)', 1.792642994534448, 1.7926429945344482, NaN, NaN],
			['log10', [Math.LOG10E], 'log10(Math.LOG10E)', -0.36221568869946325, NaN, NaN, NaN],
			['log10', [7*Math.LOG10E], 'log10(7*Math.LOG10E)', 0.4828823513147936, 0.48288235131479357, NaN, NaN],
			['log10', [Math.SQRT1_2], 'log10(Math.SQRT1_2)', -0.15051499783199057, NaN, NaN, NaN],
			['log10', [2*Math.SQRT1_2], 'log10(2*Math.SQRT1_2)', 0.1505149978319906, 0.15051499783199063, NaN, NaN],
			['log10', [Math.SQRT2], 'log10(Math.SQRT2)', 0.1505149978319906, 0.15051499783199063, NaN, NaN],
			
			['sin', [bigN], `sin(${bigN})`, 0.994076732536068, NaN, -0.20876350121720488, NaN],
			['sin', [Math.PI], 'sin(Math.PI)', 1.2246467991473532e-16, NaN, 1.2246063538223773e-16, NaN],

			['sin', [39*Math.E], 'sin(39*Math.E)', -0.7181630308570677, -0.7181630308570678, NaN, NaN],
			['sin', [35*Math.LN2], 'sin(35*Math.LN2)', -0.7659964138980511, -0.765996413898051, NaN, NaN],
			['sin', [110*Math.LOG2E], 'sin(110*Math.LOG2E)', 0.9989410140273756, 0.9989410140273757, NaN, NaN],
			['sin', [7*Math.LOG10E], 'sin(7*Math.LOG10E)', 0.10135692924965616, 0.10135692924965614, NaN, NaN],
			['sin', [35*Math.SQRT1_2], 'sin(35*Math.SQRT1_2)', -0.3746357547858202, -0.37463575478582023, NaN, NaN],
			['sin', [21*Math.SQRT2], 'sin(21*Math.SQRT2)', -0.9892668187780498, -0.9892668187780497, NaN, NaN],

			['sinh', [1], 'sinh(1)', 1.1752011936438014, NaN, NaN, NaN],
			['sinh', [Math.PI], 'sinh(Math.PI)', 11.548739357257748, NaN, NaN, 11.548739357257746],
			['sinh', [Math.E], 'sinh(Math.E)', 7.544137102816975, NaN, NaN, NaN],
			['sinh', [Math.LN2], 'sinh(Math.LN2)', 0.75, NaN, NaN, NaN],
			['sinh', [Math.LOG2E], 'sinh(Math.LOG2E)', 1.9978980091062795, NaN, NaN, NaN],
			['sinh', [492*Math.LOG2E], 'sinh(492*Math.LOG2E)', 9.199870313877772e+307, 9.199870313877774e+307, NaN, NaN],
			['sinh', [Math.LOG10E], 'sinh(Math.LOG10E)', 0.44807597941469024, NaN, NaN, NaN],
			['sinh', [Math.SQRT1_2], 'sinh(Math.SQRT1_2)', 0.7675231451261164, NaN, NaN, NaN],
			['sinh', [Math.SQRT2], 'sinh(Math.SQRT2)', 1.935066822174357, NaN, NaN, 1.9350668221743568],
			['sinh', [502*Math.SQRT2], 'sinh(502*Math.SQRT2)', 1.0469199669023138e+308, 1.046919966902314e+308, NaN, NaN],

			['sqrt', [n], `sqrt(${n})`, 0.3507135583350036, NaN, NaN, NaN],
			['sqrt', [Math.PI], 'sqrt(Math.PI)', 1.7724538509055159, NaN, NaN, NaN],
			
			['tan', [-1e308], 'tan(-1e308)', 0.5086861259107568, NaN, NaN, 0.5086861259107567],
			['tan', [Math.PI], 'tan(Math.PI)', -1.2246467991473532e-16, NaN, NaN, NaN],

			['tan', [6*Math.E], 'tan(6*Math.E)', 0.6866761546452431, 0.686676154645243, NaN, NaN],
			['tan', [6*Math.LN2], 'tan(6*Math.LN2)', 1.6182817135715877, 1.618281713571588, NaN, 1.6182817135715875],
			['tan', [10*Math.LOG2E], 'tan(10*Math.LOG2E)', -3.3537128705376014, -3.353712870537601, NaN, -3.353712870537602],
			['tan', [17*Math.SQRT2], 'tan(17*Math.SQRT2)', -1.9222955461799982, -1.922295546179998, NaN, NaN],
			['tan', [34*Math.SQRT1_2], 'tan(34*Math.SQRT1_2)', -1.9222955461799982, -1.922295546179998, NaN, NaN],
			['tan', [10*Math.LOG10E], 'tan(10*Math.LOG10E)', 2.5824856130712432, 2.5824856130712437, NaN, NaN], 
								
			['tanh', [n], `tanh(${n})`, 0.12238344189440875, NaN, NaN, 0.12238344189440876],
			['tanh', [Math.PI], 'tanh(Math.PI)', 0.99627207622075, NaN, NaN, NaN],

			['pow', [n, -100], `pow(${n}, -100)`, 1.022089333584519e+91, 1.0220893335845176e+91, NaN, NaN],
			['pow', [Math.PI, -100], 'pow(Math.PI, -100)', 1.9275814160560204e-50, 1.9275814160560185e-50, NaN, 1.9275814160560206e-50],
			['pow', [Math.E, -100], 'pow(Math.E, -100)', 3.7200759760208555e-44, 3.720075976020851e-44, NaN, NaN],
			['pow', [Math.LN2, -100], 'pow(Math.LN2, -100)', 8269017203802394, 8269017203802410, NaN, NaN],
			['pow', [Math.LN10, -100], 'pow(Math.LN10, -100)', 6.003867926738829e-37, 6.003867926738811e-37, NaN, NaN],
			['pow', [Math.LOG2E, -100], 'pow(Math.LOG2E, -100)', 1.20933355845501e-16, 1.2093335584550061e-16, NaN, NaN],
			['pow', [Math.LOG10E, -100], 'pow(Math.LOG10E, -100)', 1.6655929347585958e+36, 1.665592934758592e+36, NaN, 1.6655929347585955e+36],
			['pow', [Math.SQRT1_2, -100], 'pow(Math.SQRT1_2, -100)', 1125899906842616.2, 1125899906842611.5, NaN, NaN],
			['pow', [Math.SQRT2, -100], 'pow(Math.SQRT2, -100)', 8.881784197001191e-16, 8.881784197001154e-16, NaN, NaN],
			
			['polyfill', [2e-3 ** -100], 'polyfill pow(2e-3, -100)', 7.888609052210102e+269, 7.888609052210126e+269, NaN, NaN]
		]
		
		const data = {}
		fns.forEach(fn => {
			data[fn[2]] = attempt(() => {
				const result = fn[0] != 'polyfill' ? phantomMath[fn[0]](...fn[1]) : fn[1]
				const chrome = result == fn[3]
				const firefox = fn[4] ? result == fn[4] : false
				const torBrowser = fn[5] ? result == fn[5] : false
				const safari = fn[6] ? result == fn[6] : false
				return { result, chrome, firefox, torBrowser, safari }
			})
		})

		logTestResult({ start, test: 'math', passed: true })
		return { data, lied }
	}
	catch (error) {
		logTestResult({ test: 'math', passed: false })
		captureError(error)
		return
	}
}

export const mathsHTML = ({ fp, modal, note, hashSlice }) => {
	if (!fp.maths) {
		return `
		<div class="col-six undefined">
			<strong>Math</strong>
			<div>0% of samples</div>
			<div>0% of class</div>
			<div>engine: ${note.blocked}</div>
			<div>results: ${note.blocked}</div>
		</div>`
	}
	const {
		maths: {
			data,
			$hash,
			lied
		}
	} = fp

	const decryptionData = {"SpiderMonkey":[{"id":"03050b59b3b218df396977f314c284d9ebadd3e6b07de6b70d036608335cb8af","systems":["Android"]},{"id":"09525011e48d69f97b4486a09a7d84dcb702ecb091f28d27b15fdf422960b874","systems":["Windows"]},{"id":"2d6e452c59bce6d48f99f74773a0743875ff51654b96a29c1543a1de6e33bc65","systems":["Windows"]},{"id":"30acab98e0dfbe3a0263e5a8d290e363bc18dc2ce55ae2d7ff7b9086986ea896","systems":["Linux"]},{"id":"41141d85c8cee2ea78ad023124f0ee02e35f509d00742978c7b460e5737919de","systems":["Windows"]},{"id":"7eddeeb8f3046d6f473174b0351f4426f3723cd7f50716374ed496dc861b72bb","systems":["Windows"]},{"id":"870471782bc768a4dae3198669358f0d199b92d9e1c4441a3399141ff502a486","systems":["Android"]},{"id":"87b691d273993fb305b44cecf3429cdd5c5f4d387fb0e66bccaaf7670ca46915","systems":["Android","Linux","Mac","Other","Windows"]},{"id":"8edfa16a45b64ecfd3ea19845d5648eb9e54cefa46c0260ebe9f2a24b0aa7bd5","systems":["Android","Linux","Mac","Windows"]},{"id":"97c2c5b24e5a5d8ef9416e8414789e1a62839846ed63f30cfb88b05a9d3e356d","systems":["Android"]},{"id":"9fc36dcbe858faed7f5c285f6e094be4adf7a1c8255c071feec7c3bbb6c5bce6","systems":["Mac"]},{"id":"bfe705e491590fba17e322c91ef54b4993ffc120c4e72138354d0233261961d0","systems":["Windows"]},{"id":"c0cfd6235e1d51d17dff731d7931ec8375b34ac21225e13dca9963bb1541f1f5","systems":["Windows"]},{"id":"c5caa31a8076a8262b01e69e930460874c141ef82e499ca7a32e1f5d32f3744e","systems":["Windows"]},{"id":"db3f6704dd3e8feed2b5553a95a8a8575beb904af89ce64aa85d537b36b19319","systems":["Windows"]},{"id":"ddc8837ab98695120dae774f04dcf295d2414ffc03431360d46b70380224547a","systems":["Mac"]},{"id":"f631e068c862af0d29de6e1f8e26e871026181d87399df2ecec3ca03fdb95697","systems":["Android"]},{"id":"fa16daafee424c0773328418121d7a80cbb3e44909b56f2c6878a37c03c7144c","systems":["Mac"]}],"V8":[{"id":"2607501c5033cc3ca19e835f701baf381e813f6bacfd5d50955364b078b24ecf","systems":["Android","Linux","Other","Windows"]},{"id":"26b503eba678b005dca85ba4925562be0fbb2be9990159bc169d0eb00c0d2ccc","systems":["Windows"]},{"id":"87455ebb9765644fb98068ec68fbad7fcaaf2768b2cb6e1bd062eee5790c00e8","systems":["Windows"]},{"id":"89455ebb9765644fb98068ec68fbad7fcaaf2768b2cb6e1bd062eee5790c00e8","systems":["Android","Chrome OS","Linux","Mac","Windows","Windows Phone","iPhone"]}],"JavaScriptCore":[{"id":"491869fc2170fe88b6170bab918b3736d3d90188e267175a86a33fcdbb1df93f","systems":["Mac","iPhone"]},{"id":"99740c3678fd95585c1bd0b40e2fabfcf4043a7608a4e67fff2786fc3a59cf8a","systems":["Mac","iPad","iPhone"]},{"id":"b7becd10892e09fe9bd2c63a4fee0b74c2abe122f854f9b9a8088fd85c2d5e9f","systems":["Mac"]},{"id":"c1141e10c4d38a4ca1a49d9c7335fdfdcd7625b4ba04053a2f335434ec7e4d36","systems":["Mac"]}]}


	const decryptHash = (hash, data) => {
		let systems = []
		let poolTotal = 0
		const metricTotal = Object.keys(data).reduce((acc,item) => acc+= data[item].length, 0)
		const decryption = Object.keys(data).find(key => data[key].find(item => {
			if (!(item.id == hash)) {
				return false
			}
			systems = item.systems
			poolTotal = data[key].length
			return true
		}))

		const icon = {
			blink: '<span class="icon blink"></span>',
			webkit: '<span class="icon webkit"></span>',
			tor: '<span class="icon tor"></span>',
			firefox: '<span class="icon firefox"></span>',
			cros: '<span class="icon cros"></span>',
			linux: '<span class="icon linux"></span>',
			apple: '<span class="icon apple"></span>',
			windows: '<span class="icon windows"></span>',
			android: '<span class="icon android"></span>'
		}
		const engineIcon = (
			!decryption ? '' :
				/SpiderMonkey/.test(decryption) ? icon.firefox :
					/JavaScriptCore/.test(decryption) ? icon.webkit :
						/V8/.test(decryption) ? icon.blink :
							''
		)
		const systemIcon = (
			!decryption || systems.length != 1 ? '' :
				/windows/i.test(systems[0]) ? icon.windows :
					/linux/i.test(systems[0]) ? icon.linux :
						/ipad|iphone|ipod|ios|mac/i.test(systems[0]) ? icon.apple :
							/android/.test(systems[0]) ? icon.android :
								/chrome os/i.test(systems[0]) ? icon.cros :
									''
		)
		const formatPercent = n => n.toFixed(2).replace('.00', '')
		return {
			engine: decryption || 'unknown',
			engineSystem: (
				!decryption ? undefined : 
					`${engineIcon}${systemIcon}${decryption}${systems.length != 1 ? '' : ` on ${systems[0]}`}`
			),
			uniqueMetric: !decryption ? '0' : formatPercent(1/metricTotal*100),
			uniqueEngine: !decryption ? '0' : formatPercent(1/poolTotal*100)
		}
	}

	const { engine, engineSystem, uniqueMetric, uniqueEngine } = decryptHash($hash, decryptionData)

	const header = `
	<style>
		.math-chromium,
		.math-firefox,
		.math-tor-browser,
		.math-safari,
		.math-blank-false {
			padding: 2px 8px;
		}
		.math-chromium {
			background: #657fca26;
		}
		.math-firefox {
			background: #657fca54;
		}
		.math-tor-browser {
			background: #ca65b424;
		}
		.math-safari {
			background: #ca65b459;
		}

		.math-metric-rating {
			background: linear-gradient(90deg, var(${uniqueMetric < 10 ? '--unique' : '--grey-glass'}) ${uniqueMetric}%, #fff0 ${uniqueMetric}%, #fff0 100%);
		}
		.math-class-rating {
			background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
		}
	</style>
	<div>
	<br><span class="math-chromium">C - Chromium</span>
	<br><span class="math-firefox">F - Firefox</span>
	<br><span class="math-tor-browser">T - Tor Browser</span>
	<br><span class="math-safari">S - Safari</span>
	</div>`

	const results = Object.keys(data).map(key => {
		const value = data[key]
		const { result, chrome, firefox, torBrowser, safari } = value
		return `
		${chrome ? '<span class="math-chromium">C</span>' : '<span class="math-blank-false">-</span>'}${firefox ? '<span class="math-firefox">F</span>' : '<span class="math-blank-false">-</span>'}${torBrowser ? '<span class="math-tor-browser">T</span>' : '<span class="math-blank-false">-</span>'}${safari ? '<span class="math-safari">S</span>' : '<span class="math-blank-false">-</span>'} ${key}`
	})

	return `
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>Math</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="math-metric-rating help" title="% of math samples">${uniqueMetric}% of samples</div>
		<div class="math-class-rating help" title="% of ${engine} class">${uniqueEngine}% of class</div>
		<div>engine: ${engineSystem || note.unknown}</div>
		<div>results: ${
			!data ? note.blocked : 
			modal(
				'creep-maths',
				header+results.join('<br>')
			)
		}</div>
	</div>
	`
}