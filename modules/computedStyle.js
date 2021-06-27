const computeStyle = (type, { require: [captureError] }) => {
	try {
		// get CSSStyleDeclaration
		const cssStyleDeclaration = (
			type == 'getComputedStyle' ? getComputedStyle(document.body) :
				type == 'HTMLElement.style' ? document.body.style :
					type == 'CSSRuleList.style' ? document.styleSheets[0].cssRules[0].style :
						undefined
		)
		if (!cssStyleDeclaration) {
			throw new TypeError('invalid argument string')
		}
		// get properties
		const proto = Object.getPrototypeOf(cssStyleDeclaration)
		const prototypeProperties = Object.getOwnPropertyNames(proto)
		const ownEnumerablePropertyNames = []
		const cssVar = /^--.*$/
		Object.keys(cssStyleDeclaration).forEach(key => {
			const numericKey = !isNaN(key)
			const value = cssStyleDeclaration[key]
			const customPropKey = cssVar.test(key)
			const customPropValue = cssVar.test(value)
			if (numericKey && !customPropValue) {
				return ownEnumerablePropertyNames.push(value)
			} else if (!numericKey && !customPropKey) {
				return ownEnumerablePropertyNames.push(key)
			}
			return
		})
		// get properties in prototype chain (required only in chrome)
		const propertiesInPrototypeChain = {}
		const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
		const uncapitalize = str => str.charAt(0).toLowerCase() + str.slice(1)
		const removeFirstChar = str => str.slice(1)
		const caps = /[A-Z]/g
		ownEnumerablePropertyNames.forEach(key => {
			if (propertiesInPrototypeChain[key]) {
				return
			}
			// determine attribute type
			const isNamedAttribute = key.indexOf('-') > -1
			const isAliasAttribute = caps.test(key)
			// reduce key for computation
			const firstChar = key.charAt(0)
			const isPrefixedName = isNamedAttribute && firstChar == '-'
			const isCapitalizedAlias = isAliasAttribute && firstChar == firstChar.toUpperCase()
			key = (
				isPrefixedName ? removeFirstChar(key) :
					isCapitalizedAlias ? uncapitalize(key) :
						key
			)
			// find counterpart in CSSStyleDeclaration object or its prototype chain
			if (isNamedAttribute) {
				const aliasAttribute = key.split('-').map((word, index) => index == 0 ? word : capitalize(word)).join('')
				if (aliasAttribute in cssStyleDeclaration) {
					propertiesInPrototypeChain[aliasAttribute] = true
				} else if (capitalize(aliasAttribute) in cssStyleDeclaration) {
					propertiesInPrototypeChain[capitalize(aliasAttribute)] = true
				}
			} else if (isAliasAttribute) {
				const namedAttribute = key.replace(caps, char => '-' + char.toLowerCase())
				if (namedAttribute in cssStyleDeclaration) {
					propertiesInPrototypeChain[namedAttribute] = true
				} else if (`-${namedAttribute}` in cssStyleDeclaration) {
					propertiesInPrototypeChain[`-${namedAttribute}`] = true
				}
			}
			return
		})
		// compile keys
		const keys = [
			...new Set([
				...prototypeProperties,
				...ownEnumerablePropertyNames,
				...Object.keys(propertiesInPrototypeChain)
			])
		]
		const interfaceName = ('' + proto).match(/\[object (.+)\]/)[1]

		return { keys, interfaceName }
	}
	catch (error) {
		captureError(error)
		return
	}
}

const getSystemStyles = (instanceId, { require: [captureError, parentPhantom] }) => {
	try {
		const colors = [
			'ActiveBorder',
			'ActiveCaption',
			'ActiveText',
			'AppWorkspace',
			'Background',
			'ButtonBorder',
			'ButtonFace',
			'ButtonHighlight',
			'ButtonShadow',
			'ButtonText',
			'Canvas',
			'CanvasText',
			'CaptionText',
			'Field',
			'FieldText',
			'GrayText',
			'Highlight',
			'HighlightText',
			'InactiveBorder',
			'InactiveCaption',
			'InactiveCaptionText',
			'InfoBackground',
			'InfoText',
			'LinkText',
			'Mark',
			'MarkText',
			'Menu',
			'MenuText',
			'Scrollbar',
			'ThreeDDarkShadow',
			'ThreeDFace',
			'ThreeDHighlight',
			'ThreeDLightShadow',
			'ThreeDShadow',
			'VisitedText',
			'Window',
			'WindowFrame',
			'WindowText'
		]
		const fonts = [
			'caption',
			'icon',
			'menu',
			'message-box',
			'small-caption',
			'status-bar'
		]

		let rendered
		if (!parentPhantom) {
			const id = 'creep-system-styles'
			const el = document.createElement('div')
			el.setAttribute('id', id)
			document.body.append(el)
			rendered = document.getElementById(id)
		}
		else {
			rendered = parentPhantom
		}
		const system = {
			colors: [],
			fonts: []
		}
		
		system.colors = colors.map(color => {
			rendered.setAttribute('style', `background-color: ${color} !important`)
			return {
				[color]: getComputedStyle(rendered).backgroundColor
			}
		})

		fonts.forEach(font => {
			rendered.setAttribute('style', `font: ${font} !important`)
			const computedStyle = getComputedStyle(rendered)
			system.fonts.push({
				[font]: `${computedStyle.fontSize} ${computedStyle.fontFamily}`
			})
		})

		if (!parentPhantom) {
			rendered.parentNode.removeChild(rendered)
		}
		return { ...system }
	}
	catch (error) {
		captureError(error)
		return
	}
}

export const getCSS = async imports => {

	const {
		require: {
			instanceId,
			captureError,
			logTestResult,
			parentPhantom
		}
	} = imports

	try {
		const start = performance.now()
		const computedStyle = computeStyle('getComputedStyle', { require: [captureError] })
		const system = getSystemStyles(instanceId, { require: [captureError, parentPhantom] })
		logTestResult({ start, test: 'computed style', passed: true })
		return {
			computedStyle,
			system
		}
	}
	catch (error) {
		logTestResult({ test: 'computed style', passed: false })
		captureError(error)
		return
	}
}

export const cssHTML = ({ fp, modal, note, hashMini, hashSlice, count }, systemHash) => {
	if (!fp.css) {
		return `
		<div class="col-six undefined">
			<strong>Computed Style</strong>
			<div>keys (0): ${note.blocked}</div>
			<div>system styles: ${note.blocked}</div>
			<div>0% of samples</div>
			<div>0% of class</div>
			<div>engine: ${note.blocked}</div>
			<div class="gradient"></div>
		</div>`
	}
	const {
		css: data
	} = fp
	const {
		$hash,
		computedStyle,
		system
	} = data

	const decryptionData = {"Blink":[{"id":"013c0160adca29684f755e203285ce1aff241c07e420c6660ac66675429a75eb","systems":["Windows"]},{"id":"04f41c67ab3c46b65c7378d7d7843bc1ad3bcb28c9df511718a5b7d52df249ae","systems":["Windows"]},{"id":"05fab64d19db34c7cfaac471a4ea82a2ed34ce9e87e17fd80006f349947374c6","systems":["Windows"]},{"id":"11d7d24270bbfc474513923f710e9f06b802c79f217f0994f25a68fdbaee182b","systems":["Windows"]},{"id":"12abd9597150c09377ebe91955dfb7e2ad2b95e38a66ba9999d908f7171fc333","systems":["Windows"]},{"id":"154d3ceb4889872b74b8e88acfc44c2249563bb50adbf69b574a59304bfd11df","systems":["Windows"]},{"id":"162439465e1a944d38a32f83ca0f237af294d7a3b6348aec31fd5dd640e92830","systems":["Mac"]},{"id":"1743ccffdfeda34030a5d48201d3d37c5346779948a674d90d20164fd30b4e72","systems":["Windows"]},{"id":"1acfa2d58285503e194a0fe6a8294fdbe7a369e2bf50689dde2ee776b93b6347","systems":["Windows"]},{"id":"1b804e05f05337dffacd38446551d39a992683fa7529195b462b503f1de7b30c","systems":["Windows"]},{"id":"1e04904e57be4cfa91615be295c09e7211e056ffef413409009cea0105f93286","systems":["Windows"]},{"id":"1e123a6623b800ac952c0aac14ed5be812a232fa0807426171e9dde6b5c6551b","systems":["Windows"]},{"id":"2166380977aa0c3b75ccf948478c8c84881f627d8a426466a96304f16970033a","systems":["Windows"]},{"id":"248230a91305a10712f9db24bd223a516044244dcc4fa788a2d91b9c8ac93a1f","systems":["Windows"]},{"id":"273853d3b8193e0285cd4bb2e0f6d80005acdd74acb8eccd31a8c330e32547ac","systems":["Windows"]},{"id":"288d80fe6b85835cd6ab4c2938e3415f2514b6cb6aedb54d4c6c1e6f3f1b4a1e","systems":["Windows"]},{"id":"2bf550a2a8a49f9b9bbdf9ead7277b75dd43eefaf640a48f47d97bb64c4063b8","systems":["Windows"]},{"id":"32b90161a99135faac926500157825ab01348e1b0280ecc16900fa02038c665b","systems":["Mac"]},{"id":"35210f565f315034b9e4bade4fde708285e320d1680258b7b467319b6850cdb6","systems":["Windows"]},{"id":"355f97dc7e82e3a1b59f4a68a4495d9a18f23cfe2873dda4f1fc1dd110578473","systems":["Android"]},{"id":"372e054e1dfda2a3c50f206b649d3b99f91339db0fbd05b9bbb49e2975f61607","systems":["Windows"]},{"id":"3d8d6e216762a6d91269984af37051da7902e976347be0f0d158bb1cefdc045b","systems":["Windows"]},{"id":"3e3cb7b1a91331f6ee6e22fa38953e1e5c62908ec8f0433c3a2f217528890ad4","systems":["Windows"]},{"id":"3e453a17812b15f9ba73d4bdd5a823014d7dfb39f42844cc570a2019d41c84ed","systems":["Windows"]},{"id":"3f01de645b91fcf50dd49b1e1498a219f9b24bae42718f2836cd33725e131f85","systems":["Android"]},{"id":"3f8500f11525e3f600e2b14bda60fa818cc7b59e7e27c5bd4a8c38532603ecc1","systems":["Windows"]},{"id":"407a41ef0628bcd3b6b67bcbb0481e00d45c8df1156ab9731d26362955446292","systems":["Windows"]},{"id":"44a6a8d00f526729bf0ef8faef8aa472c1b113d9e54ee386bc8707ae08053b7a","systems":["Mac"]},{"id":"46b9c67ed7354d83267c1db83ccd4afbe48396c24d667efbd86096246302710c","systems":["Windows"]},{"id":"4ac49f9ed67420600f4ee8021f36886b7457f498a0ba024df950ccd7c52f69ce","systems":["Windows"]},{"id":"4b86e79267162ea7bf42e89eb16d7bf3764d215d6154902c5315a17635e55dd9","systems":["Windows"]},{"id":"4cc32754d0ff875bd9a8cea287282aad11cf506cb5f3ab7cf0a4163f14ceff96","systems":["Windows"]},{"id":"4ce0710f58dd630ff590629adca99037d8caacd89836dadfd56a57ecd42d0e2b","systems":["Windows"]},{"id":"586c459e7e58921e7fc8d5dc134226c7b12326c0a260a0a2e5048f30e1462631","systems":["Android"]},{"id":"5b8594738a09c7e3d4d0e8fae08dde68ced5625084d4fd11878efe306fa11222","systems":["Windows"]},{"id":"5d139c453718139140f031160fd31e1ab0c628654c60e30e43f20ba092473309","systems":["Windows"]},{"id":"5d670a4deffaf5dfa268b3936285ff937ab5389b17da3ef71203664420dc03da","systems":["Windows"]},{"id":"61e4b52ace331051e7319fb48e131bf3a160c906baea169b1781e327ae25af55","systems":["Linux"]},{"id":"64d947b53a3916d86c6546e3fe4570b64203bc48a984bd175adc19c55e0de234","systems":["Windows"]},{"id":"65c1185fbc1fb4c35d38016eec07512f5e72fdeabc832e9b3ffc54f4e307b4d3","systems":["Windows"]},{"id":"65fe5bced08bc5fff3aa5df9c1144f1f14d0d85f4b74a7f98f719a6584fc688e","systems":["Windows"]},{"id":"6711a04a40ced57636eefba840d1b609706d05e35f63b21eee057137f6b39716","systems":["Windows"]},{"id":"675c4c651a328f2fa66f36e56fad204581f44713e000f82a0c58850af3d79cc3","systems":["Windows"]},{"id":"69c9381f91ac7330773b9b2800748d0c22f406cab57e455d6a16d5e95999c7a8","systems":["Mac"]},{"id":"69e3a700c40887b8517a6aaf5ed10197d834e34b31c0b57cd28be9aa6ac0dd36","systems":["Windows"]},{"id":"6a5434a6c4d7a05ed2bc15b1f0c45b8d58afa60070050408c74282e03e5d189a","systems":["Chrome OS"]},{"id":"6a74f7a6bf5bf1165ad6eff578c547023c7936ea955369bba5b5287b89d80aea","systems":["Windows"]},{"id":"6bc3526e9d7b3e520d7023bc44fd0f98c3714e94ee989715f4134873b9c7f3c4","systems":["Windows"]},{"id":"730331615c2ed47bf27467e9c0d9bdb68a83c26cd74641b8700feb7e1775a05c","systems":["Windows"]},{"id":"748a6bcca5e740b98dac69a1ad1ad5be47464ab1b9f40a91e5281e0319510c26","systems":["Windows"]},{"id":"75b4691f0e13da37d1b96df4f74f573410a1cc4bf20885992d4a73144769a9d1","systems":["Windows"]},{"id":"763df65a345c1f1002d2e692e8f1697326efddb11216882d024573a77620d135","systems":["Windows"]},{"id":"792a40229d7be97a966290f62cb3ff1a6db8108ebd7b8b5551e29b32b7f37875","systems":["Windows"]},{"id":"79ce14712ef2de768af6d3aed6376dc6390e5790b6ee9cd69e7750de822e2555","systems":["Windows"]},{"id":"7d1d7fcb537329e8fc28d2ce49cddc2c8bec6a35737fb45ccf2452359afb526f","systems":["Windows"]},{"id":"7d7d92b7fa5b9d18273bf00084bc818102f9cf4cdd85d427faf80eac88695ac4","systems":["Windows"]},{"id":"7f2bc834891039f77f623e352a1ce180a95dcf460687023033b200376fba6385","systems":["Windows"]},{"id":"808c71a02197db26dc1fee518cafbaccd301a69d038deaae8d1d0123d3931a09","systems":["Windows"]},{"id":"80f40d30b0cf33da69f5261a169760b4115fa978e66ba7ac399db5b1415ede37","systems":["Windows"]},{"id":"85c71128195570a3fa2251710552b4e0c0b129c5e7b9f0730248aae3070151e2","systems":["Windows"]},{"id":"85cfd7ab33d9da45cd123a78accbb22a1941ac25e3fad14a8852be32e51278b5","systems":["Mac"]},{"id":"889758b96b723e3b17493ff8f6b92d0ddc8d9937bad447c9c19fb0e9a7836ac1","systems":["Linux"]},{"id":"9141c51cda1f52903322e3d83c97996798af8b497fb2c67c489a4e003e5cc6b0","systems":["Windows"]},{"id":"93e2a61504a0ef1b8943c3a639bcfafba8e0b29f83c7c8f9c48a27117e8f22e5","systems":["Windows"]},{"id":"94167144875dedb723275ba0befdeee8410185b37fa888e80cc290aec256b871","systems":["Linux"]},{"id":"96b5b122748ae095789f42e18d2eb56042b8af90d336af391dd3ac94162b8b99","systems":["Mac"]},{"id":"96bac787238d93810ae8634616f1401b186d98df0386cd7b239c291040409978","systems":["Windows"]},{"id":"977b8274804ffd265012a06f9dfe20a91e880fac71366600733c1bbedeed97eb","systems":["Mac"]},{"id":"9824ae5ab89f8388da0ad7826d099febe85ef38d01fd622fdb603b186b194b31","systems":["Windows"]},{"id":"9aad2389fb23f244ad7564f0440eecdbb7261929d8cc06d7168a53830ec70137","systems":["Windows"]},{"id":"9d961b553ce82699d1a79542e673069fc429e15631b2274f85cfcda307adc109","systems":["Windows"]},{"id":"a09d59618259292f23c31673f473c0fe43fa3a17b84a792bd5ccac9b63e37b17","systems":["Windows"]},{"id":"a122bca93de16ce6aa2d840b8f02c5ee89e7f64f166d52821a8adea0637ece8f","systems":["Windows"]},{"id":"a339743de10ba90e5c8ecaa2e5cecc8971b84f190f98851ec7505e9d943e1a59","systems":["Android","Chrome OS","Windows"]},{"id":"a45a696769813c1701a7439ee2f922377c6f8b5f4e656efbbd526490750ff3ab","systems":["Windows"]},{"id":"aa6ea4084d4c4d81b1dddaa1771f174571b2d22a0438c5777fe01e2c6b4e490c","systems":["Mac"]},{"id":"ac806fb7f882f5e01b6c560b1f155bee4be0b280f99488523f9d090096386975","systems":["Windows"]},{"id":"b434261f418fb6565725bde5521ff081683d34a63c98fbd4f2229df74d2beb1e","systems":["Windows"]},{"id":"b4800bd4140ad737df750c275dd4dd5380d77e955ef9a50a42641ae43734e513","systems":["Windows"]},{"id":"b53b9a74ab9e08aa42ffe7c1e7be9132e257545d98b84b871fac1136f4576465","systems":["Mac"]},{"id":"b6b3017109fde67cbfbf3825ce9b3d4cd65c41083beba6eae6d6908c8d8290d5","systems":["Windows"]},{"id":"ba5bc7e25f3dc3b5a925ac7d51ec27f2830819ef2571166ea279476d8894375d","systems":["Windows"]},{"id":"bbaf1265f141a369ccfdc24c8d9f97f54a13f8be50d7533423501955c90f5d76","systems":["Android"]},{"id":"bbe7bb28abe2325e562049acaacea957b7a110268c43df244ddcb5b6ee9d9c2c","systems":["Windows"]},{"id":"bd3accae17d807463db1d46ce22e43e46ec7dd59409a50cbf1cfe870e30d511f","systems":["Windows"]},{"id":"bfc41024a0214fdbdbf65f1914445e3b7becf93efd8f5115f6abcfc03aca208d","systems":["Windows"]},{"id":"c16a5ae83a7e7b5ff35829d5f1ca821f96b0729718ec2aac659f5f9ba5977ff5","systems":["Android"]},{"id":"c39e98e77291e026c1149e4c8e37f6f6dfad3eca307f27dcf0e6b78679098ad3","systems":["Windows"]},{"id":"c3e157e7b0fea9573d467a0b8cf92d5f7f010010884529bea0785635461d5809","systems":["Linux"]},{"id":"c8dad5770d2f8d9df7aef11ecda1ec428a02ef1f5f8c0006b1f6ce80fe0fb843","systems":["Mac"]},{"id":"cc5354bedb7908e1d7409338f7bf71a952d4618d31724fc542993d72868bf06d","systems":["Windows"]},{"id":"cdb4f586e7a3287560032c7c9d37f5060a3b702130ecf29cb827eb93083c4b78","systems":["Windows"]},{"id":"cf30c795a2f2ace81acf51b77ea26736d6c15115b14ca4fdd4c8ca9622ed0a2c","systems":["Windows"]},{"id":"d319e43d23184458d61c4fff1f2136b0ac1ea18535732b5e9e0f7e0f3a2c0601","systems":["Windows"]},{"id":"d460a00a6ec7720591c4311c00694ab587be0a6c4e474db6ac6c9c04dff20b1e","systems":["Windows"]},{"id":"d5506af3d9e903302032974af1c7c23420a92e433c84e534de85545ea40d7080","systems":["Windows"]},{"id":"d7225f5e25025634ada3e6f78e3060d6311bf2e471061aeea18af03538db7660","systems":["Windows"]},{"id":"d83422a0d71aa569c7a83d457a692a5dbaf1d4b60a1b0028da9af06da131e4e6","systems":["Windows"]},{"id":"d86146bf0f3f2b560df22e365350ba498f6e0d5bf94fb5a3cd42bf8b022de1bd","systems":["Android"]},{"id":"d878485870f3cb1fb0342ede9ecb725ed743e5649f7efb02ddd93851a8de8ec8","systems":["Windows"]},{"id":"db49ec7a772f1294f34a9cd6840de6c9d8307a1f04ad1dfee7c218408dd8918d","systems":["Mac"]},{"id":"db5672aabe72cf38de1995692989d65b466bfbc7845df8c30cd8a874dc1488fd","systems":["Mac"]},{"id":"e6c241f17e6b6551672fc21624d2b53079f1a162daee7873db4cf948f65c4957","systems":["Windows"]},{"id":"e6ecb4d28d1325d9feed93310579cfa6c949b41f4c1866964e2fc886c05019eb","systems":["Windows"]},{"id":"eac84f0fcb9223cebc29a6153a35fc467fdec97c3fcbf729a026df098ce63678","systems":["Windows"]},{"id":"eb177350b248c0b1e43ed5808beaf5b1388c38826d0de54a887e48cc19b762c0","systems":["Windows"]},{"id":"edbed37ed249a72d8929829f04640767f6d2fcd51cc435680eebb07debc53508","systems":["Windows"]},{"id":"eebcbef1ddfebb64e3b47a5ac1b8753f389f7a4731971f92d3496c00a2a1510b","systems":["Windows"]},{"id":"f4cc633c63e9319d045dfc029f9d7d784d8d5b0bcb8620a23d3585c75482c2ed","systems":["Windows"]},{"id":"f69b0dc8f17fd4efbb8a641388f4f4e4dab42b517f5356f5578140ff2b6e78f7","systems":["Windows"]},{"id":"f7e618de96d955e6b5d86cf61846a8ebd558926d7e2decf4eceb09239e3a894b","systems":["Windows"]},{"id":"f950eb315e22109982dcb7bcd26f83a33260c18f26461d86824bc186e2bae9e5","systems":["Windows"]},{"id":"fbb7cea45822e4f62db42a81db5a4b84882cfa15d1224dd906cd1b8315f3077d","systems":["Windows"]},{"id":"fbef88ea634e95d5cc773aadac1844444a3ccb40e38c2422ce2aec38717e615c","systems":["Windows"]}],"Gecko":[{"id":"01bb5ef28c6f2c5ef00cea6f143de3d139ea7bcdf21a0c603046fdba897997f3","systems":["Linux"]},{"id":"035f2ff4e42abd5c5e4c65cabfe5eacfb7596bc56bd7bf538978c9810b6b0f2b","systems":["Windows"]},{"id":"043b39165047d137bb61cc649e0fd47bc1b48f02507cfdd697f2f0f55f632f0b","systems":["Android"]},{"id":"047773f3d0ce9a992450c4e4fc07f6feb603f1cfb0c3e212fd62743bc30132eb","systems":["Mac"]},{"id":"04e248a39cda2fe07bfdacf409931a32cbc009e04f2076d3e222362195905674","systems":["Linux"]},{"id":"070cf8e32af542f68862c54ad93087e5c7a488f65a9d88a7b78fcdac6e31c321","systems":["Linux"]},{"id":"08ab46a0fa4799e4134f963614bf81e903d59afe82e77eece8e22af7175ab946","systems":["Mac"]},{"id":"08eae800aecc75045fcc0062a8bcc60433ca723fd045950e296d0c21c07085d3","systems":["Windows"]},{"id":"0a0886b73a51bc2e3ac0ca22e142eb8921dab513df19f4f848dea411587067a9","systems":["Linux"]},{"id":"0b9c7a43e5fbdd80ec698730252eaef6fc32a155c18a1f78b88315d478316cf7","systems":["Windows"]},{"id":"0bcbe7c0e7375e13af1d97c77eab842479b49060f2b42a3b4d561b266438b540","systems":["Linux"]},{"id":"0d916638110d07a9e266deaa838c7cd50a853bf55712992d1be06e18a728d52e","systems":["Windows"]},{"id":"0e6b6cb76fe5ef4e2b1a948b0cf1832768090d3f4fa352c4fcd50e34ea257e03","systems":["Windows"]},{"id":"142d47389cd14acb71d5e85e259fd4cd88d43418cbbc9d133f442390b7c916e6","systems":["Linux"]},{"id":"160f2cc145e14f8b346db2fa50dcdfb21737947f5b46a1984a4f92d7f4d285da","systems":["Linux"]},{"id":"1b2beaeb36e01d7f811a89a368a63c1d816d074bd709c5c8363a3e57c4ad9ed1","systems":["Android"]},{"id":"1f827aa69ed1f016d6f9d7dc08fe4847a9d325ad9ff8fdb739f5eed7ae61665e","systems":["Linux"]},{"id":"2000e11615aa358fa36b3cce333329f3809d43c1a502a05c0b4a2a9ff96b73c8","systems":["Mac"]},{"id":"209d7fdb4839c6c4bb1ff7a14a290913cf0e3b163cdc93c3e91eea6a7f194b9e","systems":["Mac"]},{"id":"23bd327a463aa467c01b3ad716625098537b59860b1098c88341d47cb06a95ab","systems":["Windows"]},{"id":"247031281434f088f325f1ce330b1d34a03bff8223010f61d46b12c97eff24c2","systems":["Windows"]},{"id":"27007c9a3d858ca77bedab60098f1b3416ab6fd4588f0898fd0ce1504dc66831","systems":["Windows"]},{"id":"27a750044491de4f97b0349c279847fbb57862bd4c8cdbb606e99787e40bf457","systems":["Windows"]},{"id":"29ee4de348ef4f013f7975dbe73273f6c588f423d7d4ad0c18a257bd36e10819","systems":["Windows"]},{"id":"2c14a479a570406c812695c881443d87b7cf19f82e3e5a95ca905cb3a8d88d1d","systems":["Windows"]},{"id":"30e1aae486b1a61ae3a66fddc97ff467749ec656886c5b7c49dd71dd2adc17a3","systems":["Windows"]},{"id":"311457ae92794280fbc64fe606ebc1cfa101cc6df014ca0aeef738881e001bcd","systems":["Android"]},{"id":"33c9b35cc5314e116fab69d209ef8c6587d72235f456fc9eb08ffac829de10fa","systems":["Mac"]},{"id":"35b1e320ae27f3afaf18216cb939fe7236e7d5ffac4fbc90111a4d1d1ca6d8ea","systems":["Windows"]},{"id":"3676ce7420b5f2563c0a9d9b5af606629c4f375bdb95d139840712a2b2541728","systems":["Mac"]},{"id":"38b46e11eb3c1c698f3382937783a99b72f55f37958237fdfbc80ccded3c2f30","systems":["Android"]},{"id":"39e4ff575009aa7cc7e399426f7e132d76ac581d66ef1c3b82c23d6e42903ffb","systems":["Mac"]},{"id":"3d2c34578a0fc827a0923110a2b53203f1b3dcfb78a1a7a62ed28154a5e002a8","systems":["Mac"]},{"id":"413da38b4e5d4fb854b02d9bf81fc8193263264ca5e7dc559bed9d543944e1c7","systems":["Mac"]},{"id":"426300eb3654987988da3d36e65fed0a6eca001457efbda1733e30da717aa2e4","systems":["Linux","Mac","Windows"]},{"id":"44f918b47e1bf5b0d5d7279594304098ac4272d71758711e033a6e21db24703e","systems":["Windows"]},{"id":"452831b196f11392b6f4204bc54d412a8f4a8ee14d4b04567153c19aba8c6e0c","systems":["Mac"]},{"id":"477f13dd268a54843f118c70bab0c4a8362263b139fd1b63c39832a8d6ea24c4","systems":["Android"]},{"id":"47da0a3bbc77d088bddcc7529e5a40bc936358db12a59036967e693ea7446b98","systems":["Windows"]},{"id":"49b42b844b10f49bab7a702fc7d809823cacade860fc899a36e6e8f4db1b41f1","systems":["Mac"]},{"id":"4a66f2d42762cc63743587b6926f84c1ce60d397451a5f3d2f7c0d89819a2bf0","systems":["Linux"]},{"id":"4e7a94afbd7e4014ad78b965ddbc7ce31f85c68ba9bdf5b13d40115deedc3048","systems":["Linux"]},{"id":"4f33d6efd5414f0877c302f5a4b2449cccbdffe7aad5c72ebf70cae142257271","systems":["Windows"]},{"id":"4f6907c97b4285e2019de635ed562949c3c0a40d2d744ca0179a952ff03bc936","systems":["Linux"]},{"id":"5334fa44629998a55ef8f88b73aefafaa28d956c648a17254bba5bfb71e9c27a","systems":["Linux"]},{"id":"53f28da13b752e75f870b794355d05d9ac1b71faf81fb1aebc01a6907bbe3592","systems":["Mac"]},{"id":"5434ec81b31725a3eb545a2a316d622fe78353823877fda0bc4f444297df1613","systems":["Linux"]},{"id":"561283c7962e5eb903bae18fe42d2e984527e77af7aeaa09bf67c4fa98d1d4ab","systems":["Windows"]},{"id":"56ad87bbb6e1c59cb76ba0a60816383f476fca1768e39be6b1f43e3db3014b37","systems":["Windows"]},{"id":"5e2e1d5f387ffa620904b847b1bde9b8ff2089e9a646721583eab3b23b77a344","systems":["Windows"]},{"id":"5ec65d4c1c947f6ff7309ea1956a1bc3a09ed85d4ed584664375253689be18bb","systems":["Linux"]},{"id":"5f5bf68646661a39e99288602305e78959b16673938cb8276561ef7de7c34548","systems":["Linux"]},{"id":"602a19bcc3696f4ad353846f2ab9c168926f198913a163a967fbdedabb0ee5fc","systems":["Mac"]},{"id":"620b6b2bf61cdc1f48515041b087caa66c67a493b725268706c5e83cb293bfdf","systems":["Windows"]},{"id":"621f6432312cbcaed644338708eb7b007b098e2cfb5e409cb1b9b2a2ff81a1fb","systems":["Linux"]},{"id":"6352bf925b329859fb89ec7828493b0f37f3656344fce981054963f0d4181e9c","systems":["Linux"]},{"id":"64e424c371a959cd1a694bed68c85a0e3649ba428af52e852da1516933de7404","systems":["Mac"]},{"id":"6781c4cf6efa7ba8cc0d8ea1baadb6f65fdc4b944387512714e74eeba6a9801a","systems":["Linux"]},{"id":"6935c7ba28f7f145c16e8c03d42bd9ecf3e3e790c4863ba4faa4bbdb8fea7728","systems":["Windows"]},{"id":"6a0eeed183e4eed5b50d59e23cf76a7cbccb0f7e278572e7308f8cd5c0e6bb84","systems":["Mac"]},{"id":"6a94edbc9acd00a5fd561f82fc07a39b3ae477631095ffb30691c1744973b74f","systems":["Windows"]},{"id":"720e1d4dcf4406608b36f33db50052a080aa9c1fc9005a07bd74203f39706ac9","systems":["Linux"]},{"id":"750d02f9d681f4c6ff47e93e0fea07945d22d4da926191eba2b549c8aa2736b3","systems":["Linux"]},{"id":"754716083870f316f533a98cf3c7be073d70635529cdf58bcb1851f9b55b517d","systems":["Windows"]},{"id":"7779ccc42ca43cd98480cd2715cc443940b3d092033c0c0762203817e51081c3","systems":["Mac"]},{"id":"77a47b89095a0b178d96d3a95d9e1614ca0a795f305f1792453266c1279a6c76","systems":["Linux"]},{"id":"7817c828ae19da2523166d487462b50d35dd9568f1c888c6a0c06406fc4e887d","systems":["Linux"]},{"id":"7903613ec8a8171a53a77f91afed1ca44cb2d5462fcae9ff2066fe74335b1d7e","systems":["Android"]},{"id":"7b2cbff5e2dfed1e612df8fedb6f7b423c1409317c795078aa5801fbc6357122","systems":["Windows"]},{"id":"7ba545c35eb399084f0a8f4ae2971018cc9c3dd30e7b0febbc55b17760de99fa","systems":["Linux"]},{"id":"7bfa0055ff81836bb5dcef022d7da33c18abd818f4825da9c2d3c9d896332911","systems":["Linux"]},{"id":"7fb7542b3cb2a5133c00cf8e803521f2dd452e8ab7ec1d15dd4ce33e9a99b076","systems":["Linux"]},{"id":"805457d2830699e7098b559f1a542074e4e939b529110f484004878f6cbf6757","systems":["Windows"]},{"id":"810a128a5e8a7d2e619a60e42b03473f57433f1774b181e2b270a69a1e79c816","systems":["Linux"]},{"id":"81ee4c30fffae2eef478b42c6a3f4b58019cd7518431b0ca32544f6be60e9ba8","systems":["Android"]},{"id":"839cd5e28e8f7c9895fd3307daf2995756b1d60379cb967ae5af4280a96c69f3","systems":["Windows"]},{"id":"8404d90c713e92ee7adda9c1103aa66e1b32ba881298da35bf629af0efc6d2b2","systems":["Linux"]},{"id":"8469500151e366bb816b455f56c5c783b8ae34dce6f58695ecf4e39c70bb753b","systems":["Linux"]},{"id":"898bf656be7423b47094d28221e14211b944d64888d76f531a5fe2636cc0e7fe","systems":["Windows"]},{"id":"8a904883c86807130a8f62d10304d446055f7d4d0f969341f684d5711a640e45","systems":["Linux"]},{"id":"8ccb2e934409777e6e0fad6c5119a79c5cadacee5cf1d78ec1d9bef2d0843eb4","systems":["Mac"]},{"id":"8dace8dfad2617a0c0c59956655e5bc76a34ad0585c2365c86a9be25529a7834","systems":["Linux"]},{"id":"8ead3abc53fe99b8b391ac951f6883060f2acccc3325aa56a84413921a3dfad3","systems":["Linux"]},{"id":"8f06235b76193c16c4b6df827426aa6b5363db970a3f40ef9e60c7192ae08386","systems":["Windows"]},{"id":"8f21a3fa392ea7825bc602972fcc2f0faf9f3462b7f75dcf622b0b63e6ddc270","systems":["Windows"]},{"id":"9019d638a729a42b32f3207507a27b24ebcd9b177589449c79fa0515c9bc8a4c","systems":["Mac"]},{"id":"92dae20c21b3998591ed77a11108019cfeaa536cb080a466df755a5cc600e0f1","systems":["Windows"]},{"id":"967577e55cff10c64940d87c029f81fc0a42e2d40636440fc8cc249af09c384c","systems":["Linux"]},{"id":"9769dd665cd36eb4423f9128ed84da8e88c83c83cfe48ee3541c1a672e28f720","systems":["Windows"]},{"id":"98b1b9c1defcc09b22a4d536a27336703db0be939dc6336c2fd7ae33affaff0a","systems":["Android"]},{"id":"99958c209c6468a0b904e75b65f295e4bef26bc5d2b1399fd5a871dc9ed792fb","systems":["Mac"]},{"id":"9ec3dbf6bc2957d04ef48ff710058b12e66afcf3752198929bf1a05f93926ef9","systems":["Linux"]},{"id":"a00242b393a93b80577ff3f17b10ed161ea3597dda51ffbab843eb35b3145efc","systems":["Android"]},{"id":"a0336f7579dd4ab45e92520f12c013866732d4b705b08e6320e9aca357ddf4e5","systems":["Windows"]},{"id":"a200db4ce5f2065d5f0ceb4353fea064d7a7839c9f24e650ba830d72692828bf","systems":["Linux"]},{"id":"a333527845579c00c538fc0132e394106ee475d38c52c0622f9171e9996f2456","systems":["Mac"]},{"id":"a3c40c1c214defead9527c6ebd708c8c2270248cff9d3df2d98e42447f01f308","systems":["Linux"]},{"id":"a6251a98782c6e81a9efc266ac6f385d610f82e5eb514ffa83699087b527a9cd","systems":["Windows"]},{"id":"aa53d8a84c157e9c523109433809889523597cfe67b68db56b321ec3c2ce84f3","systems":["Windows"]},{"id":"aa8024458d007671eaf80a58dc86203655e2472a4f3c0110fe7436e7c44a7d9e","systems":["Linux"]},{"id":"ab11e9d98faf5ab614d6c6b7b3d7728bf1523aae43317830502db887e0b69a63","systems":["Mac"]},{"id":"adb83c54da1309046d6309e98343f72309ebdc44c816518458b84bedb9fc8b52","systems":["Mac"]},{"id":"ae897a9bf25b426ed2bbf4921a54d6a33920631faf99a6681a7079701e1441d6","systems":["Windows"]},{"id":"b1949e0e4b6f52ef3130c493c73605e3ecc89417b50ea220fa2d639551de6db9","systems":["Windows"]},{"id":"b2bace6fa1073e37cfadaf58592a9297d01b9c9fc47cc442b2ff24b9471a7a58","systems":["Linux"]},{"id":"b330dc87a862c222d67a9f551c1ae3c2822478de03daf4a61bfe9ab711df592f","systems":["Windows"]},{"id":"b44b4785aa40c7aebc65d9c1731151cb9c6eed2904e8a0304aae490e07312f2b","systems":["Linux"]},{"id":"b4892ea141c9cdd55a13ae9fc67bb1691721e5345c74146b295cbcd3da5e1305","systems":["Windows"]},{"id":"b49510a6df75742991a2694fc934d77acbc9853c0790e095b45c7fd460bd53c5","systems":["Linux"]},{"id":"b5cb51f740cb5d45863856156531fd071b5655727337973d0eb196c0d0c19bba","systems":["Linux"]},{"id":"b775db35dc50ecc2f701d336b1ef1d89239e743dbef67a6571fd5da62c0fd9da","systems":["Windows"]},{"id":"b8fe170eb8668ecf8240d2ee293d21f63d8b9af6e65eef9e7a527b02d7427221","systems":["Windows"]},{"id":"b95260b424d8646e0591cc0f6e00c9bbb2f22a53c908d06fce17ecfe43885bb9","systems":["Windows"]},{"id":"bb2bc793323eded7c9fd1962bb8cc0fb09abb71d2fc1935bd2511288fb42da30","systems":["Linux"]},{"id":"bc28cafb565ec247da5326a26e561e9f26f54c279a8d0f962eb1bb2b5b8609ef","systems":["Windows"]},{"id":"bc4c7da9b5174ac79dc869763eab3483f8293d9916582add8e8b18618ccb208d","systems":["Linux"]},{"id":"bd7611204311d793fba5489b2f891fc94b80e135ea970502ca9147fe4eec3d77","systems":["Linux"]},{"id":"bda3d0d380025ae0e0408e7653aa66b1a4f33870bdd95bed3aef430294b698d3","systems":["Windows"]},{"id":"c091116d13b8152f73b468997d43b9d3eb08c6804fa16d64bdc89636d522b325","systems":["Linux"]},{"id":"c1abb540bbcde37141d9f468de2f4e256ad0e0a2b8f3b089dbdbe528e6c49c2d","systems":["Windows"]},{"id":"c1e0687fb56d614a3155b7438a39df51587e424ace4cd886d8fb61348c4cd8b3","systems":["Windows"]},{"id":"c3a0c8006444a4f4c5c3d4b3d4e0277db61fbd14d68e5f0a22d1800af64b0fe1","systems":["Windows"]},{"id":"c4845f9346367e9b0327fe8c33fb9bd6365c46eed54ccf8904ea4c00c1470330","systems":["Linux"]},{"id":"c4a243a629ae2a7ec14bb55705e8e7501df1b1e36acd3452171fe7896bd09b52","systems":["Windows"]},{"id":"c7cf96c50a28d154aecfd662233f877c9ba112c5eddbd4b37f9961da5b82b269","systems":["Linux"]},{"id":"cc8dc8185ba0726b1338370314874c7b8c3a9abc301827631eab3b70ed651c54","systems":["Mac"]},{"id":"cccf69174671a07a0b5b78101bdeb8d9a679b586fc315cc506ed084076222b1f","systems":["Windows"]},{"id":"cd1dc4273200aa130bf94621ccad603184e31bcb50d18e50fc911b44068dca5b","systems":["Linux"]},{"id":"cd8280be7f7d19a7df8bcaf102e3124a438b349213e0bd8970e3673b48842a4c","systems":["Windows"]},{"id":"d08c16438b85e7370c57af05eeeed4ba8be8d329013cf2d35ddaaca499162d41","systems":["Linux"]},{"id":"d205792d62952fa18968cbd2ab97abac1452cfa2ed349f25ebb5f21a50fd210a","systems":["Windows"]},{"id":"d295b3138a1e4eb860f85e2d1002952cf4c5d1e3cff51f1e70c9333750520b52","systems":["Mac"]},{"id":"d4e8527a39d9d7ae6ec5cb3c9f6d4e9adc6838a2bec068d397b5f1b222265388","systems":["Windows"]},{"id":"d5e7b9cd8f7777da262911fbde443282cf7f120ed7b5082e79283e912db4809a","systems":["Windows"]},{"id":"dd7917b2be144e2ccf60220ef6f05f74363e33fa0a1cf27081c31e31bfe75400","systems":["Linux"]},{"id":"df8a4b91a553d7d64eb543ee98955dfdcd70baab454f455d1ce90628f06fce72","systems":["Linux"]},{"id":"e1670b25b8bc72935c23a0190ece539b6ac9f81879d60cc166a7c66b96a71a90","systems":["Mac"]},{"id":"e1903db31d088652e75918c625a574df6b29a1ceae1ef6eb5b23a102ae875c60","systems":["Android"]},{"id":"e34dfc035f84e4bef979fa41784b408ff070e5ec1736dd7e8ff815546d6888e9","systems":["Windows"]},{"id":"e57ce08dc4c58fd919c56144e4a8ff9772333987fb5129fd3d86d4ac3e5502bd","systems":["Windows"]},{"id":"e77832ea52aa5c71b784dbe1f8ece0cd6a047ceeab07e70acee2cbdd2c468a04","systems":["Windows"]},{"id":"eafddbae1ea22a8788915549b0abc33f85708a9a55d511c74d54e12e78794d3c","systems":["Linux"]},{"id":"ede9438fe695ad73751a76d1a05891fe1a08aa0dac112951b8dcad7fa3b33e3c","systems":["Mac"]},{"id":"f56348dc70629f22cbcb24d42acbe943246aafe52551a62da9cf19466685add7","systems":["Windows"]},{"id":"f61bb9a4604e54207fcc61f4c4dcf9db53d18014402bda4ab079e926c4774097","systems":["Windows"]},{"id":"f7d23675743c97b56437b4355db0dd738c14a23c53431a6a1eff8a0b47e13df4","systems":["Windows"]},{"id":"f94bfe4610d2d52c0b5a04bd57c4e8e61f88e6d95b3cab49a0b9275ac9b78358","systems":["Linux"]},{"id":"fabfb1a6bb67cc16b89c24ca60ee61b372454e963f1710f206043983a0bd6abc","systems":["Mac"]},{"id":"fb1a5ba7f5fd9b49bd3fc729b919f860c0153b97e902fb46599cc977a297d4d4","systems":["Windows"]},{"id":"fbfa82c0aa262af0bd1c1314170eb8d29104cbce7cb02bf351adfa9e18addde2","systems":["Linux"]},{"id":"fcaa14a0f1598502d3a209a5aa3124172d198882763c23b484a3456e0f8934c1","systems":["Windows"]},{"id":"ff9ce7862d5ad9689d51c67be1030dc673e82d461ce6ff84f62c3fab0b40f3fe","systems":["Mac"]}],"WebKit":[{"id":"0d0c7825a90d93bb57c70ee130d0fb94b3d100412aaa64b56a471a3535bc138f","systems":["Mac"]},{"id":"0d3ee45f794382ab074092e558277073acb5db88186e9778cbfce0bb7d210f5c","systems":["Mac"]},{"id":"0d95913d8db0a4306a72bc3d69c14aaa86f3ec1f198d3deb80c067bd6b04a95d","systems":["iPhone"]},{"id":"1136b633d1762a811c8c1d1a8bb23e3e48d86a4384228daffd76e93d201c6d11","systems":["iPhone"]},{"id":"2f56f8f1523f8a529d3b846b96891c9e0738d13039fd701c1763db4521912b86","systems":["Mac"]},{"id":"3a48470d22f957fe06a5975d8be2d5a6a1a636a7d0b749be3e8b960e18cbd879","systems":["Mac"]},{"id":"4f5b9687660ac846bf98218a8cce03df0fe67ebfb32e0d72978f7a00518a8457","systems":["Mac"]},{"id":"6ad6015a58a4eb83e4aae524e7bb4f98ca7bfff5192b13001cd249b6cf976ca2","systems":["iPhone"]},{"id":"71eb20ceecfd7c860daf884f96048070bead4f65dc1f164c32b737cd28421635","systems":["Mac"]},{"id":"71fc7061e6d37c99f24975b37f1388322dcd4836f2e9eefe4f56b102312b9afc","systems":["Mac"]},{"id":"8184dd4e5f0f5b5e2b32c0cd4f3088a5779f528116f4b90acf55cdcdf4d60c04","systems":["Mac"]},{"id":"8662e70a9793559e5eb0673fd31c8f7d41b598974b3054f1551dc2ca4459b30f","systems":["Mac","iPad","iPhone"]},{"id":"8e9ce03e2483307f62a54e520f45041e82f1de76db26ff6b794144a5f707f08d","systems":["Mac"]},{"id":"975c1fc929dc012b1c0b2058d850009e6bbb5dec07d32cfde6f3518b67416e73","systems":["Mac"]},{"id":"bc45d7778aadd31442fc36f774c2f9b18b5abee888c61a24fe95f3030dc7f535","systems":["Mac"]},{"id":"c6378d7b5a9d5b4a89ad8954186a2c989eca98bb85870d091f5ff3433d84b0e4","systems":["Mac"]},{"id":"c68816e0fb7d641d7a5eb59849c5b30b4c4f522e88293a7373b57d1f0828bc93","systems":["iPhone"]},{"id":"cbc4fd9e29c2fccebaa98aec0ed678799a4a3f9d254daea6106f46af376d21f9","systems":["Mac","iPad","iPhone"]},{"id":"e368895bb23670721309e55867460fa2d19eec56dd9f16dae0281617bb744c3e","systems":["Mac"]}],"unknown":[{"id":"1dc4d8ba2ccdb44cc5860421d3b79d029a689d593407da943d0772052fa908b7","systems":["Linux"]},{"id":"b30d86f0083d70460d2e16e7660a74ab6c3ffc238d45ca80a99e5e10fc9c5edc","systems":["Linux"]}],"Goanna":[{"id":"51a8a735e2df2eb66a8ccce9c006dc675b901c2c356d54962c382b764bcfec6a","systems":["Windows"]},{"id":"555ed2f013455802a8868624e2d8849195f95b29d7f92b21648a44f416773559","systems":["Windows"]},{"id":"a1343183b6ce0a958467cfca2a6b40aa2e678b6d60d6fcb3253c1683c2c01ce8","systems":["Windows"]}]}

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
			gecko: '<span class="icon gecko"></span>',
			goanna: '<span class="icon goanna"></span>',
			cros: '<span class="icon cros"></span>',
			linux: '<span class="icon linux"></span>',
			apple: '<span class="icon apple"></span>',
			windows: '<span class="icon windows"></span>',
			android: '<span class="icon android"></span>'
		}
		const engineIcon = (
			!decryption ? '' :
				/Gecko/.test(decryption) ? icon.gecko :
					/WebKit/.test(decryption) ? icon.webkit :
						/Blink/.test(decryption) ? icon.blink :
							/Goanna/.test(decryption) ? icon.goanna :
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
			engineHTML: (
				!decryption ? undefined : 
					`${engineIcon}${systemIcon}${decryption}${systems.length != 1 ? '' : ` on ${systems[0]}`}`
			),
			uniqueMetric: !decryption ? '0' : formatPercent(1/metricTotal*100),
			uniqueEngine: !decryption ? '0' : formatPercent(1/poolTotal*100)
		}
	}

	const { engine, engineHTML, uniqueMetric, uniqueEngine } = decryptHash(systemHash, decryptionData)

	const colorsLen = system.colors.length
	const gradientColors = system.colors.map((color, index) => {
		const name = Object.values(color)[0]
		return (
			index == 0 ? `${name}, ${name} ${((index+1)/colorsLen*100).toFixed(2)}%` : 
			index == colorsLen-1 ? `${name} ${((index-1)/colorsLen*100).toFixed(2)}%, ${name} 100%` : 
			`${name} ${(index/colorsLen*100).toFixed(2)}%, ${name} ${((index+1)/colorsLen*100).toFixed(2)}%`
		)
	})
	const id = 'creep-css-style-declaration-version'
	return `
	<div class="col-six">
		<style>
			.system-styles-metric-rating {
				background: linear-gradient(90deg, var(${uniqueMetric < 10 ? '--unique' : '--grey-glass'}) ${uniqueMetric}%, #fff0 ${uniqueMetric}%, #fff0 100%);
			}
			.system-styles-class-rating {
				background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
			}
		</style>
		<strong>Computed Style</strong><span class="hash">${hashSlice($hash)}</span>
		<div>keys (${!computedStyle ? '0' : count(computedStyle.keys)}): ${
			!computedStyle ? note.blocked : 
			modal(
				'creep-computed-style',
				computedStyle.keys.join(', '),
				hashMini(computedStyle)
			)
		}</div>
		<div>system styles: ${
			system && system.colors ? modal(
				`${id}-system-styles`,
				[
					...system.colors.map(color => {
						const key = Object.keys(color)[0]
						const val = color[key]
						return `
							<div><span style="display:inline-block;border:1px solid #eee;border-radius:3px;width:12px;height:12px;background:${val}"></span> ${key}: ${val}</div>
						`
					}),
					...system.fonts.map(font => {
						const key = Object.keys(font)[0]
						const val = font[key]
						return `
							<div>${key}: <span style="padding:0 5px;border-radius:3px;font:${val}">${val}</span></div>
						`
					}),
				].join(''),
				hashMini(system)
			) : note.blocked
		}</div>
		<div class="system-styles-metric-rating help" title="% of system styles samples">${uniqueMetric}% of samples</div>
		<div class="system-styles-class-rating help" title="% of ${engine} class">${uniqueEngine}% of class</div>
		<div>engine: ${engineHTML || note.unknown}</div>
		<style>.gradient { background: repeating-linear-gradient(to right, ${gradientColors.join(', ')}); }</style>
		<div class="gradient"></div>
	</div>
	`
}