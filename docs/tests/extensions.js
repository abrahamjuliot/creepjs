(async () => {

const hashMini =  x => {
	if (!x) return x
	const json = `${JSON.stringify(x)}`
	const hash = json.split('').reduce((hash, char, i) => {
		return Math.imul(31, hash) + json.charCodeAt(i) | 0
	}, 0x811c9dc5)
	return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
}

// template views
const patch = (oldEl, newEl) => oldEl.parentNode.replaceChild(newEl, oldEl)
const html = (str, ...expressionSet) => {
	const template = document.createElement('template')
	template.innerHTML = str.map((s, i) => `${s}${expressionSet[i] || ''}`).join('')
	return document.importNode(template.content, true)
}


// metamask
if ('web3' in window && web3.currentProvider.isMetaMask) {
	console.log('metamask web3 detected')
}

/* 
	source viewer:
	https://chrome.google.com/webstore/detail/chrome-extension-source-v/jifpbeccnghkjeaalbbjmodiffmgedin

	query ids from store collections:
	x = [...document.querySelectorAll('.webstore-test-wall-tile a')].map(el => {
		const { href } = el
		const id = /[^\/]+$/.exec(href)[0]
		const name = el.querySelector('div > div:nth-of-type(2) > div:nth-of-type(3) > h3').innerText
		return {
			id,
			name
		}
	}).reduce((acc, obj) => {
		if (!acc[obj.id]) {
			acc[obj.id] = { name: obj.name, file: '' }
			return acc
		}
		return acc
	},{})
	console.log(JSON.stringify(x, null, '\t'))

	query on single page:
	console.log(
		JSON.stringify({
			[/[^\/]+$/.exec(location.href)[0]]: { name: document.querySelector('body div div > h1').innerText, file: '' }
		}, null, '\t')
	)

	do:
	Bitwarden

	Adobe Acrobat
	Tampermonkey
	Pinterest Save Button
	Cisco Webex
	Skype
	Honey

*/

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/web_accessible_resources
// https://developer.chrome.com/docs/extensions/mv3/manifest/web_accessible_resources/
const getExtensions = () => ({

	// Office
	"kbfnbcaeplbcioakkpcpgfkobkghlhen": {
		"name": "Grammarly",
		"file": "src/css/Grammarly.styles.css"
	},
	"kgjfgplpablkjnlkjmjdecgdpfankdle": {
		"name": "Zoom Scheduler",
		"file": "images/icon.svg"
	},
	"liecbddmkiiihnedobmlmillhodjkdmb": {
		"name": "Loom",
		"file": "img/arrow.svg"
	},
	"efaidnbmnnnibpcajpcglclefindmkaj": {
		"name": "Adobe Acrobat",
		"file": "viewer.html"
	},
	"oeopbcgkkoapgobdbedcemjljbihmemj": {
		"name": "Checker Plus for Gmail",
		"file": "images/search.png"
	},
	
	// Shopping
	"eofcbnmajmjmplflapaojjnihcjkigck": {
		"name": "Avast SafePrice",
		"file": "common/ui/fonts/fonts.css"
	},
	"chhjbpecpncaggjpdakmflnfcopglcmi": {
		"name": "Rakuten",
		"file": "img/rakuten/icon-rakuten.svg"
	},
	"nenlahapcbofgnanklpelkaejcehkggg": {
		"name": "Capital One Shopping",
		"file": "assets/icons/shopping-icon16.png"
	},
	"bmnlcjabgnpnenekpadlanbbkooimhnj": {
		"name": "Honey",
		"file": "paypal/meta.js"
	},
	"hfapbcheiepjppjbnkphkmegjlipojba": {
		"name": "Klarna",
		"file": "_locales/en_US/messages.json"
	},

	// Google
	"aapbdbdomjkkjkaonfhkkikfgjllcleb": {
		"name": "Google Translate",
		"file": "popup_css_compiled.css"
	},
	"lpcaedmchfhocbbapmcbpinfpgnhiddi": {
		"name": "Google Keep",
		"file": "i18n/symbols_ar.js"
	},
	"gbkeegbaiigmenfmjfclcdgdpimamgkj": {
		"name": "Office Editing for Docs, Sheets & Slides",
		"file": "views/app.html"
	},
	"gmbmikajjgmnabiglmofipeabaddhgne": {
		"name": "Save to Google Drive",
		"file": "images/driveicon32.png"
	},
	"nckgahadagoaajjgafhacjanaoiihapd": {
		"name": "Google Hangouts",
		"file": "images_5/ic_drag.png"
	},
	"mclkkofklkfljcocdinagocijmpgbhab": {
		"name": "Google Input Tools",
		"file": "_locales/fa/messages.json"
	},
	"mgijmajocgfcbeboacabfgobmjgjcoja": {
		"name": "Google Dictionary",
		"file": "content.min.css"
	},

	// Privacy/Security
	"bkdgflcldnnnapblkhphbgpggdiikppg": {
		"name": "DuckDuckGo Privacy Essentials",
		"file": "public/css/autofill.css"
	},
	"gcbommkclmclpchllfjekcdonpmejbdp": {
		"name": "HTTPS Everywhere",
		"file": "pages/cancel/index.html"
	},
	"eiimnmioipafcokbfikbljfdeojpcgbh": {
		"name": "BlockSite",
		"file": "public/images/about-on.svg"
	},
	"oldceeleldhonbafppcapldpdifcinji": {
		"name": "LanguageTool",
		"file": "assets/images/16/special/icon_16_special_switch_active.svg"
	},
	"fgddmllnllkalaagkghckoinaemmogpe": {
		"name": "ExpressVPN",
		"file": "images/toolbar-icon-16.png"
	},

	"gomekmidlodglbbmalcneegieacbdmki": {
		"name": "Avast",
		"file": "locales/Locale-en.json"
	},

	// Education
	"ecnphlgnajanjnkcmbpancdjoidceilk": {
		"name": "Kami",
		"file": "delegate.html"
	},

	// Teaching
	"mmeijimgabbpbgpdklnllpncmdofkcpn": {
		"name": "Screencastify",
		"file": "cam-frame.html"
	},
	"nlipoenfbbikpbjkfpfillcgkoblgpmj": {
		"name": "Awesome Screenshot",
		"file": "images/clear.png"
	},
	
	// Dev
	"bhlhnicpbhignbdhedgjhgdocnmhomnp": {
		"name": "ColorZilla",
		"file": "css/content-style.css"
	},
	"fmkadmapgofadopljbjfkapdkoienihi": {
		"name": "React Developer Tools",
		"file": "main.html"
	},
	"nhdogjmejiglipccpnnnanhbledajbpd": {
		"name": "Vue.js devtools",
		"file": "devtools.html"
	},
	"gppongmhjkpfnbhagpmjfkannfbllamg": {
		"name": "Wappalyzer",
		"file": "js/dom.js"
	},
	"gbmdgpbipfallnflgajpaliibnhdgobh": {
		"name": "JSON Viewer",
		"file": "assets/viewer-alert.css"
	},

	// Password
	"nngceckbapebfimnlniiiahkandclblb": {
		"name": "Bitwarden",
		"file": "notification/bar.html"
	},
	"hdokiejnpimakedhajhdlcegeplioahd": {
		"name": "LastPass",
		"file": "images/infield/password-light.png"
	},

	// Other
	"gpdjojdkbbmdfjfahjcgigfpmkopogic": {
		"name": "Pinterest Save Button",
		"file": "html/create.html"
	},
	"pioclpoplcdbaefihamjohnefbikjilc": {
		"name": "Evernote Web Clipper",
		"file": "OptionsFrame.html"
	}
})

const getActiveChromeExtensions = async () => {
	const extensions = getExtensions()
	const urls = Object.keys(extensions).map(key => `chrome-extension://${key}/${extensions[key].file}`)
	const idMatcher = /\/\/([^\/]+)/
	const getName = res => extensions[idMatcher.exec(res.url)[1]].name
	const result = Promise.all(urls.map(url => fetch(url).then(getName).catch(e => {}))).then(res => res.filter(x => !!x))
	return result
}

const start = performance.now()
const activeExtensions = await getActiveChromeExtensions()
const perf = performance.now() - start

const extensions = getExtensions()
const getStoreAnchorTag = (name, extensions) => {
	const path = 'https://chrome.google.com/webstore/detail/'
	const id = Object.keys(extensions).find(key => extensions[key].name == name)
	return `<a href="${path}${id}" target="_blank">↗️</a>`
}
const extensionLibrary = Object.keys(extensions).reduce((acc, key) => [...acc, extensions[key].name], [])
patch(document.getElementById('fingerprint-data'), html`
	<div id="fingerprint-data">
		<style>
			.active {
				color: MediumAquaMarine 
			}
		</style>
		<div class="visitor-info relative">
			<span class="aside-note">${perf.toFixed(2)}ms</span>
			<strong>Chrome Extensions</strong><span class="hash">${hashMini(activeExtensions)}</span>
			<div>${''+activeExtensions.length} of ${extensionLibrary.length} detected</div>
		</div>
		<div>
		${
			extensionLibrary
				.sort()
				.map(name => `
					<div class="${!activeExtensions.includes(name) ? '' : 'active'}">
						${getStoreAnchorTag(name, extensions)} ${name}
					</div>
				`)
				.join('')
		}
		</div>
	</div>
`)

})()