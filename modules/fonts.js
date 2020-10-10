// inspired by Lalit Patel's fontdetect.js
// https://www.lalit.org/wordpress/wp-content/uploads/2008/05/fontdetect.js?ver=0.3
export const getFonts = (imports, fonts) => {

	const {
		require: {
			hashify,
			patch,
			html,
			note,
			count,
			modal,
			captureError,
			instanceId,
			lieProps
		}
	} = imports

	return new Promise(async resolve => {
		try {

			let lied = (
				lieProps['Element.offsetWidth'],
				lieProps['Element.offsetHeight'],
				lieProps['HTMLElement.offsetWidth'],
				lieProps['HTMLElement.offsetHeight']
			)

			const divRendered = document.createElement('div')
			const divStageRendered = document.createElement('div')
			divStageRendered.setAttribute('id', 'font-detector-stage')
			let iframeRendered, doc = document
			try {
				// create and get rendered iframe
				const id = `${instanceId}-fonts-iframe`
				const iframeRendered = document.createElement('iframe')
				iframeRendered.setAttribute('id', id)
				iframeRendered.setAttribute('style', 'visibility: hidden; height: 0')
				document.body.appendChild(iframeRendered)

				// create and get rendered div in iframe
				doc = iframeRendered.contentDocument
			}
			catch (error) {
				captureError(error, 'client blocked getClientRects iframe')
			}
			doc.body.appendChild(divRendered)
			divRendered.appendChild(divStageRendered)

			const toInt = val => ~~val // protect against decimal noise
			const baseFonts = ['monospace', 'sans-serif', 'serif']
			const text = 'mmmmmmmmmmlli'
			const baseOffsetWidth = {}
			const baseOffsetHeight = {}
			const style = ` > span {
				position: absolute!important;
				left: -9999px!important;
				font-size: 256px!important;
				font-style: normal!important;
				font-weight: normal!important;
				letter-spacing: normal!important;
				line-break: auto!important;
				line-height: normal!important;
				text-transform: none!important;
				text-align: left!important;
				text-decoration: none!important;
				text-shadow: none!important;
				white-space: normal!important;
				word-break: normal!important;
				word-spacing: normal!important;
			}`
			const baseFontSpan = font => {
				return `<span class="basefont" data-font="${font}" style="font-family: ${font}!important">${text}</span>`
			}
			const systemFontSpan = (font, basefont) => {
				return `<span class="system-font" data-font="${font}" data-basefont="${basefont}" style="font-family: ${`'${font}', ${basefont}`}!important">${text}</span>`
			}
			
			const fontsElem = divRendered //document.getElementById('font-detector')
			const stageElem = divStageRendered //document.getElementById('font-detector-stage')
			const detectedFonts = {}
			patch(stageElem, html`
				<div id="font-detector-test">
					<style>#font-detector-test${style}</style>
					${baseFonts.map(font => baseFontSpan(font)).join('')}
					${
						fonts.map(font => {
							const template = `
							${systemFontSpan(font, baseFonts[0])}
							${systemFontSpan(font, baseFonts[1])}
							${systemFontSpan(font, baseFonts[2])}
							`
							return template
						}).join('')
					}
				</div>
				`,
				() => {
					const testElem = doc.getElementById('font-detector-test')
					const basefontElems = doc.querySelectorAll('#font-detector-test .basefont')
					const systemFontElems = doc.querySelectorAll('#font-detector-test .system-font')

					// Compute fingerprint
					;[...basefontElems].forEach(span => {
						const { dataset: { font }, offsetWidth, offsetHeight } = span
						baseOffsetWidth[font] = toInt(offsetWidth)
						baseOffsetHeight[font] = toInt(offsetHeight)
						return
					})
					;[...systemFontElems].forEach(span => {
						const { dataset: { font } }= span
						if (!detectedFonts[font]) {
							const { dataset: { basefont }, offsetWidth, offsetHeight } = span
							const widthMatchesBase = toInt(offsetWidth) == baseOffsetWidth[basefont]
							const heightMatchesBase = toInt(offsetHeight) == baseOffsetHeight[basefont]
							const detected = !widthMatchesBase || !heightMatchesBase
							if (detected) { detectedFonts[font] = true }
						}
						return
					})
					return fontsElem.removeChild(testElem)
				}
			)
			const fontList = Object.keys(detectedFonts)
			const $hash = await hashify(fontList)
			resolve({fonts: fontList, $hash })

			const id = 'creep-fonts'
			const el = document.getElementById(id)
			return patch(el, html`
			<div>
				<strong>HTMLElement (font-family)</strong>
				<div class="ellipsis">hash: ${$hash}</div>
				<div>results (${count(fontList)}): ${fontList && fontList.length ? modal(id, fontList.join('<br>')) : note.blocked}</div>
			</div>
			`)
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}

export const fontList = ["Andale Mono","Arial","Arial Black","Arial Hebrew","Arial MT","Arial Narrow","Arial Rounded MT Bold","Arial Unicode MS","Bitstream Vera Sans Mono","Book Antiqua","Bookman Old Style","Calibri","Cambria","Cambria Math","Century","Century Gothic","Century Schoolbook","Comic Sans","Comic Sans MS","Consolas","Courier","Courier New","Geneva","Georgia","Helvetica","Helvetica Neue","Impact","Lucida Bright","Lucida Calligraphy","Lucida Console","Lucida Fax","LUCIDA GRANDE","Lucida Handwriting","Lucida Sans","Lucida Sans Typewriter","Lucida Sans Unicode","Microsoft Sans Serif","Monaco","Monotype Corsiva","MS Gothic","MS Outlook","MS PGothic","MS Reference Sans Serif","MS Sans Serif","MS Serif","MYRIAD","MYRIAD PRO","Palatino","Palatino Linotype","Segoe Print","Segoe Script","Segoe UI","Segoe UI Light","Segoe UI Semibold","Segoe UI Symbol","Tahoma","Times","Times New Roman","Times New Roman PS","Trebuchet MS","Verdana","Wingdings","Wingdings 2","Wingdings 3"]

export const extendedFontList = ["Abadi MT Condensed Light","Academy Engraved LET","ADOBE CASLON PRO","Adobe Garamond","ADOBE GARAMOND PRO","Agency FB","Aharoni","Albertus Extra Bold","Albertus Medium","Algerian","Amazone BT","American Typewriter","American Typewriter Condensed","AmerType Md BT","Andalus","Angsana New","AngsanaUPC","Antique Olive","Aparajita","Apple Chancery","Apple Color Emoji","Apple SD Gothic Neo","Arabic Typesetting","ARCHER","ARNO PRO","Arrus BT","Aurora Cn BT","AvantGarde Bk BT","AvantGarde Md BT","AVENIR","Ayuthaya","Bandy","Bangla Sangam MN","Bank Gothic","BankGothic Md BT","Baskerville","Baskerville Old Face","Batang","BatangChe","Bauer Bodoni","Bauhaus 93","Bazooka","Bell MT","Bembo","Benguiat Bk BT","Berlin Sans FB","Berlin Sans FB Demi","Bernard MT Condensed","BernhardFashion BT","BernhardMod BT","Big Caslon","BinnerD","Blackadder ITC","BlairMdITC TT","Bodoni 72","Bodoni 72 Oldstyle","Bodoni 72 Smallcaps","Bodoni MT","Bodoni MT Black","Bodoni MT Condensed","Bodoni MT Poster Compressed","Bookshelf Symbol 7","Boulder","Bradley Hand","Bradley Hand ITC","Bremen Bd BT","Britannic Bold","Broadway","Browallia New","BrowalliaUPC","Brush Script MT","Californian FB","Calisto MT","Calligrapher","Candara","CaslonOpnface BT","Castellar","Centaur","Cezanne","CG Omega","CG Times","Chalkboard","Chalkboard SE","Chalkduster","Charlesworth","Charter Bd BT","Charter BT","Chaucer","ChelthmITC Bk BT","Chiller","Clarendon","Clarendon Condensed","CloisterBlack BT","Cochin","Colonna MT","Constantia","Cooper Black","Copperplate","Copperplate Gothic","Copperplate Gothic Bold","Copperplate Gothic Light","CopperplGoth Bd BT","Corbel","Cordia New","CordiaUPC","Cornerstone","Coronet","Cuckoo","Curlz MT","DaunPenh","Dauphin","David","DB LCD Temp","DELICIOUS","Denmark","DFKai-SB","Didot","DilleniaUPC","DIN","DokChampa","Dotum","DotumChe","Ebrima","Edwardian Script ITC","Elephant","English 111 Vivace BT","Engravers MT","EngraversGothic BT","Eras Bold ITC","Eras Demi ITC","Eras Light ITC","Eras Medium ITC","EucrosiaUPC","Euphemia","Euphemia UCAS","EUROSTILE","Exotc350 Bd BT","FangSong","Felix Titling","Fixedsys","FONTIN","Footlight MT Light","Forte","FrankRuehl","Fransiscan","Freefrm721 Blk BT","FreesiaUPC","Freestyle Script","French Script MT","FrnkGothITC Bk BT","Fruitger","FRUTIGER","Futura","Futura Bk BT","Futura Lt BT","Futura Md BT","Futura ZBlk BT","FuturaBlack BT","Gabriola","Galliard BT","Gautami","Geeza Pro","Geometr231 BT","Geometr231 Hv BT","Geometr231 Lt BT","GeoSlab 703 Lt BT","GeoSlab 703 XBd BT","Gigi","Gill Sans","Gill Sans MT","Gill Sans MT Condensed","Gill Sans MT Ext Condensed Bold","Gill Sans Ultra Bold","Gill Sans Ultra Bold Condensed","Gisha","Gloucester MT Extra Condensed","GOTHAM","GOTHAM BOLD","Goudy Old Style","Goudy Stout","GoudyHandtooled BT","GoudyOLSt BT","Gujarati Sangam MN","Gulim","GulimChe","Gungsuh","GungsuhChe","Gurmukhi MN","Haettenschweiler","Harlow Solid Italic","Harrington","Heather","Heiti SC","Heiti TC","HELV","Herald","High Tower Text","Hiragino Kaku Gothic ProN","Hiragino Mincho ProN","Hoefler Text","Humanst 521 Cn BT","Humanst521 BT","Humanst521 Lt BT","Imprint MT Shadow","Incised901 Bd BT","Incised901 BT","Incised901 Lt BT","INCONSOLATA","Informal Roman","Informal011 BT","INTERSTATE","IrisUPC","Iskoola Pota","JasmineUPC","Jazz LET","Jenson","Jester","Jokerman","Juice ITC","Kabel Bk BT","Kabel Ult BT","Kailasa","KaiTi","Kalinga","Kannada Sangam MN","Kartika","Kaufmann Bd BT","Kaufmann BT","Khmer UI","KodchiangUPC","Kokila","Korinna BT","Kristen ITC","Krungthep","Kunstler Script","Lao UI","Latha","Leelawadee","Letter Gothic","Levenim MT","LilyUPC","Lithograph","Lithograph Light","Long Island","Lydian BT","Magneto","Maiandra GD","Malayalam Sangam MN","Malgun Gothic","Mangal","Marigold","Marion","Marker Felt","Market","Marlett","Matisse ITC","Matura MT Script Capitals","Meiryo","Meiryo UI","Microsoft Himalaya","Microsoft JhengHei","Microsoft New Tai Lue","Microsoft PhagsPa","Microsoft Tai Le","Microsoft Uighur","Microsoft YaHei","Microsoft Yi Baiti","MingLiU","MingLiU_HKSCS","MingLiU_HKSCS-ExtB","MingLiU-ExtB","Minion","Minion Pro","Miriam","Miriam Fixed","Mistral","Modern","Modern No. 20","Mona Lisa Solid ITC TT","Mongolian Baiti","MONO","MoolBoran","Mrs Eaves","MS LineDraw","MS Mincho","MS PMincho","MS Reference Specialty","MS UI Gothic","MT Extra","MUSEO","MV Boli","Nadeem","Narkisim","NEVIS","News Gothic","News GothicMT","NewsGoth BT","Niagara Engraved","Niagara Solid","Noteworthy","NSimSun","Nyala","OCR A Extended","Old Century","Old English Text MT","Onyx","Onyx BT","OPTIMA","Oriya Sangam MN","OSAKA","OzHandicraft BT","Palace Script MT","Papyrus","Parchment","Party LET","Pegasus","Perpetua","Perpetua Titling MT","PetitaBold","Pickwick","Plantagenet Cherokee","Playbill","PMingLiU","PMingLiU-ExtB","Poor Richard","Poster","PosterBodoni BT","PRINCETOWN LET","Pristina","PTBarnum BT","Pythagoras","Raavi","Rage Italic","Ravie","Ribbon131 Bd BT","Rockwell","Rockwell Condensed","Rockwell Extra Bold","Rod","Roman","Sakkal Majalla","Santa Fe LET","Savoye LET","Sceptre","Script","Script MT Bold","SCRIPTINA","Serifa","Serifa BT","Serifa Th BT","ShelleyVolante BT","Sherwood","Shonar Bangla","Showcard Gothic","Shruti","Signboard","SILKSCREEN","SimHei","Simplified Arabic","Simplified Arabic Fixed","SimSun","SimSun-ExtB","Sinhala Sangam MN","Sketch Rockwell","Skia","Small Fonts","Snap ITC","Snell Roundhand","Socket","Souvenir Lt BT","Staccato222 BT","Steamer","Stencil","Storybook","Styllo","Subway","Swis721 BlkEx BT","Swiss911 XCm BT","Sylfaen","Synchro LET","System","Tamil Sangam MN","Technical","Teletype","Telugu Sangam MN","Tempus Sans ITC","Terminal","Thonburi","Traditional Arabic","Trajan","TRAJAN PRO","Tristan","Tubular","Tunga","Tw Cen MT","Tw Cen MT Condensed","Tw Cen MT Condensed Extra Bold","TypoUpright BT","Unicorn","Univers","Univers CE 55 Medium","Univers Condensed","Utsaah","Vagabond","Vani","Vijaya","Viner Hand ITC","VisualUI","Vivaldi","Vladimir Script","Vrinda","Westminster","WHITNEY","Wide Latin","ZapfEllipt BT","ZapfHumnst BT","ZapfHumnst Dm BT","Zapfino","Zurich BlkEx BT","Zurich Ex BT","ZWAdobeF"]

export const googleFonts = ["ABeeZee","Abel","Abhaya Libre","Abril Fatface","Aclonica","Acme","Actor","Adamina","Advent Pro","Aguafina Script","Akronim","Aladin","Aldrich","Alef","Alegreya","Alegreya SC","Alegreya Sans","Alegreya Sans SC","Aleo","Alex Brush","Alfa Slab One","Alice","Alike","Alike Angular","Allan","Allerta","Allerta Stencil","Allura","Almarai","Almendra","Almendra Display","Almendra SC","Amarante","Amaranth","Amatic SC","Amethysta","Amiko","Amiri","Amita","Anaheim","Andada","Andika","Angkor","Annie Use Your Telescope","Anonymous Pro","Antic","Antic Didone","Antic Slab","Anton","Arapey","Arbutus","Arbutus Slab","Architects Daughter","Archivo","Archivo Black","Archivo Narrow","Aref Ruqaa","Arima Madurai","Arimo","Arizonia","Armata","Arsenal","Artifika","Arvo","Arya","Asap","Asap Condensed","Asar","Asset","Assistant","Astloch","Asul","Athiti","Atma","Atomic Age","Aubrey","Audiowide","Autour One","Average","Average Sans","Averia Gruesa Libre","Averia Libre","Averia Sans Libre","Averia Serif Libre","B612","B612 Mono","Bad Script","Bahiana","Bahianita","Bai Jamjuree","Baloo","Baloo Bhai","Baloo Bhaijaan","Baloo Bhaina","Baloo Chettan","Baloo Da","Baloo Paaji","Baloo Tamma","Baloo Tammudu","Baloo Thambi","Balthazar","Bangers","Barlow","Barlow Condensed","Barlow Semi Condensed","Barriecito","Barrio","Basic","Battambang","Baumans","Bayon","Be Vietnam","Bebas Neue","Belgrano","Bellefair","Belleza","BenchNine","Bentham","Berkshire Swash","Beth Ellen","Bevan","Big Shoulders Display","Big Shoulders Text","Bigelow Rules","Bigshot One","Bilbo","Bilbo Swash Caps","BioRhyme","BioRhyme Expanded","Biryani","Bitter","Black And White Picture","Black Han Sans","Black Ops One","Blinker","Bokor","Bonbon","Boogaloo","Bowlby One","Bowlby One SC","Brawler","Bree Serif","Bubblegum Sans","Bubbler One","Buda","Buenard","Bungee","Bungee Hairline","Bungee Inline","Bungee Outline","Bungee Shade","Butcherman","Butterfly Kids","Cabin","Cabin Condensed","Cabin Sketch","Caesar Dressing","Cagliostro","Cairo","Calligraffitti","Cambay","Cambo","Candal","Cantarell","Cantata One","Cantora One","Capriola","Cardo","Carme","Carrois Gothic","Carrois Gothic SC","Carter One","Catamaran","Caudex","Caveat","Caveat Brush","Cedarville Cursive","Ceviche One","Chakra Petch","Changa","Changa One","Chango","Charm","Charmonman","Chathura","Chau Philomene One","Chela One","Chelsea Market","Chenla","Cherry Cream Soda","Cherry Swash","Chewy","Chicle","Chilanka","Chivo","Chonburi","Cinzel","Cinzel Decorative","Clicker Script","Coda","Coda Caption","Codystar","Coiny","Combo","Comfortaa","Coming Soon","Concert One","Condiment","Content","Contrail One","Convergence","Cookie","Copse","Corben","Cormorant","Cormorant Garamond","Cormorant Infant","Cormorant SC","Cormorant Unicase","Cormorant Upright","Courgette","Cousine","Coustard","Covered By Your Grace","Crafty Girls","Creepster","Crete Round","Crimson Pro","Crimson Text","Croissant One","Crushed","Cuprum","Cute Font","Cutive","Cutive Mono","DM Sans","DM Serif Display","DM Serif Text","Damion","Dancing Script","Dangrek","Darker Grotesque","David Libre","Dawning of a New Day","Days One","Dekko","Delius","Delius Swash Caps","Delius Unicase","Della Respira","Denk One","Devonshire","Dhurjati","Didact Gothic","Diplomata","Diplomata SC","Do Hyeon","Dokdo","Domine","Donegal One","Doppio One","Dorsa","Dosis","Dr Sugiyama","Duru Sans","Dynalight","EB Garamond","Eagle Lake","East Sea Dokdo","Eater","Economica","Eczar","El Messiri","Electrolize","Elsie","Elsie Swash Caps","Emblema One","Emilys Candy","Encode Sans","Encode Sans Condensed","Encode Sans Expanded","Encode Sans Semi Condensed","Encode Sans Semi Expanded","Engagement","Englebert","Enriqueta","Erica One","Esteban","Euphoria Script","Ewert","Exo","Exo 2","Expletus Sans","Fahkwang","Fanwood Text","Farro","Farsan","Fascinate","Fascinate Inline","Faster One","Fasthand","Fauna One","Faustina","Federant","Federo","Felipa","Fenix","Finger Paint","Fira Code","Fira Mono","Fira Sans","Fira Sans Condensed","Fira Sans Extra Condensed","Fjalla One","Fjord One","Flamenco","Flavors","Fondamento","Fontdiner Swanky","Forum","Francois One","Frank Ruhl Libre","Freckle Face","Fredericka the Great","Fredoka One","Freehand","Fresca","Frijole","Fruktur","Fugaz One","GFS Didot","GFS Neohellenic","Gabriela","Gaegu","Gafata","Galada","Galdeano","Galindo","Gamja Flower","Gayathri","Gentium Basic","Gentium Book Basic","Geo","Geostar","Geostar Fill","Germania One","Gidugu","Gilda Display","Give You Glory","Glass Antiqua","Glegoo","Gloria Hallelujah","Goblin One","Gochi Hand","Gorditas","Gothic A1","Goudy Bookletter 1911","Graduate","Grand Hotel","Gravitas One","Great Vibes","Grenze","Griffy","Gruppo","Gudea","Gugi","Gurajada","Habibi","Halant","Hammersmith One","Hanalei","Hanalei Fill","Handlee","Hanuman","Happy Monkey","Harmattan","Headland One","Heebo","Henny Penny","Hepta Slab","Herr Von Muellerhoff","Hi Melody","Hind","Hind Guntur","Hind Madurai","Hind Siliguri","Hind Vadodara","Holtwood One SC","Homemade Apple","Homenaje","IBM Plex Mono","IBM Plex Sans","IBM Plex Sans Condensed","IBM Plex Serif","IM Fell DW Pica","IM Fell DW Pica SC","IM Fell Double Pica","IM Fell Double Pica SC","IM Fell English","IM Fell English SC","IM Fell French Canon","IM Fell French Canon SC","IM Fell Great Primer","IM Fell Great Primer SC","Iceberg","Iceland","Imprima","Inconsolata","Inder","Indie Flower","Inika","Inknut Antiqua","Irish Grover","Istok Web","Italiana","Italianno","Itim","Jacques Francois","Jacques Francois Shadow","Jaldi","Jim Nightshade","Jockey One","Jolly Lodger","Jomhuria","Jomolhari","Josefin Sans","Josefin Slab","Joti One","Jua","Judson","Julee","Julius Sans One","Junge","Jura","Just Another Hand","Just Me Again Down Here","K2D","Kadwa","Kalam","Kameron","Kanit","Kantumruy","Karla","Karma","Katibeh","Kaushan Script","Kavivanar","Kavoon","Kdam Thmor","Keania One","Kelly Slab","Kenia","Khand","Khmer","Khula","Kirang Haerang","Kite One","Knewave","KoHo","Kodchasan","Kosugi","Kosugi Maru","Kotta One","Koulen","Kranky","Kreon","Kristi","Krona One","Krub","Kulim Park","Kumar One","Kumar One Outline","Kurale","La Belle Aurore","Lacquer","Laila","Lakki Reddy","Lalezar","Lancelot","Lateef","Lato","League Script","Leckerli One","Ledger","Lekton","Lemon","Lemonada","Lexend Deca","Lexend Exa","Lexend Giga","Lexend Mega","Lexend Peta","Lexend Tera","Lexend Zetta","Libre Barcode 128","Libre Barcode 128 Text","Libre Barcode 39","Libre Barcode 39 Extended","Libre Barcode 39 Extended Text","Libre Barcode 39 Text","Libre Baskerville","Libre Caslon Display","Libre Caslon Text","Libre Franklin","Life Savers","Lilita One","Lily Script One","Limelight","Linden Hill","Literata","Liu Jian Mao Cao","Livvic","Lobster","Lobster Two","Londrina Outline","Londrina Shadow","Londrina Sketch","Londrina Solid","Long Cang","Lora","Love Ya Like A Sister","Loved by the King","Lovers Quarrel","Luckiest Guy","Lusitana","Lustria","M PLUS 1p","M PLUS Rounded 1c","Ma Shan Zheng","Macondo","Macondo Swash Caps","Mada","Magra","Maiden Orange","Maitree","Major Mono Display","Mako","Mali","Mallanna","Mandali","Manjari","Mansalva","Manuale","Marcellus","Marcellus SC","Marck Script","Margarine","Markazi Text","Marko One","Marmelad","Martel","Martel Sans","Marvel","Mate","Mate SC","Material Icons","Maven Pro","McLaren","Meddon","MedievalSharp","Medula One","Meera Inimai","Megrim","Meie Script","Merienda","Merienda One","Merriweather","Merriweather Sans","Metal","Metal Mania","Metamorphous","Metrophobic","Michroma","Milonga","Miltonian","Miltonian Tattoo","Mina","Miniver","Miriam Libre","Mirza","Miss Fajardose","Mitr","Modak","Modern Antiqua","Mogra","Molengo","Molle","Monda","Monofett","Monoton","Monsieur La Doulaise","Montaga","Montez","Montserrat","Montserrat Alternates","Montserrat Subrayada","Moul","Moulpali","Mountains of Christmas","Mouse Memoirs","Mr Bedfort","Mr Dafoe","Mr De Haviland","Mrs Saint Delafield","Mrs Sheppards","Mukta","Mukta Mahee","Mukta Malar","Mukta Vaani","Muli","Mystery Quest","NTR","Nanum Brush Script","Nanum Gothic","Nanum Gothic Coding","Nanum Myeongjo","Nanum Pen Script","Neucha","Neuton","New Rocker","News Cycle","Niconne","Niramit","Nixie One","Nobile","Nokora","Norican","Nosifer","Notable","Nothing You Could Do","Noticia Text","Noto Sans","Noto Sans HK","Noto Sans JP","Noto Sans KR","Noto Sans SC","Noto Sans TC","Noto Serif","Noto Serif JP","Noto Serif KR","Noto Serif SC","Noto Serif TC","Nova Cut","Nova Flat","Nova Mono","Nova Oval","Nova Round","Nova Script","Nova Slim","Nova Square","Numans","Nunito","Nunito Sans","Odor Mean Chey","Offside","Old Standard TT","Oldenburg","Oleo Script","Oleo Script Swash Caps","Open Sans","Open Sans Condensed","Oranienbaum","Orbitron","Oregano","Orienta","Original Surfer","Oswald","Over the Rainbow","Overlock","Overlock SC","Overpass","Overpass Mono","Ovo","Oxygen","Oxygen Mono","PT Mono","PT Sans","PT Sans Caption","PT Sans Narrow","PT Serif","PT Serif Caption","Pacifico","Padauk","Palanquin","Palanquin Dark","Pangolin","Paprika","Parisienne","Passero One","Passion One","Pathway Gothic One","Patrick Hand","Patrick Hand SC","Pattaya","Patua One","Pavanam","Paytone One","Peddana","Peralta","Permanent Marker","Petit Formal Script","Petrona","Philosopher","Piedra","Pinyon Script","Pirata One","Plaster","Play","Playball","Playfair Display","Playfair Display SC","Podkova","Poiret One","Poller One","Poly","Pompiere","Pontano Sans","Poor Story","Poppins","Port Lligat Sans","Port Lligat Slab","Pragati Narrow","Prata","Preahvihear","Press Start 2P","Pridi","Princess Sofia","Prociono","Prompt","Prosto One","Proza Libre","Public Sans","Puritan","Purple Purse","Quando","Quantico","Quattrocento","Quattrocento Sans","Questrial","Quicksand","Quintessential","Qwigley","Racing Sans One","Radley","Rajdhani","Rakkas","Raleway","Raleway Dots","Ramabhadra","Ramaraja","Rambla","Rammetto One","Ranchers","Rancho","Ranga","Rasa","Rationale","Ravi Prakash","Red Hat Display","Red Hat Text","Redressed","Reem Kufi","Reenie Beanie","Revalia","Rhodium Libre","Ribeye","Ribeye Marrow","Righteous","Risque","Roboto","Roboto Condensed","Roboto Mono","Roboto Slab","Rochester","Rock Salt","Rokkitt","Romanesco","Ropa Sans","Rosario","Rosarivo","Rouge Script","Rozha One","Rubik","Rubik Mono One","Ruda","Rufina","Ruge Boogie","Ruluko","Rum Raisin","Ruslan Display","Russo One","Ruthie","Rye","Sacramento","Sahitya","Sail","Saira","Saira Condensed","Saira Extra Condensed","Saira Semi Condensed","Saira Stencil One","Salsa","Sanchez","Sancreek","Sansita","Sarabun","Sarala","Sarina","Sarpanch","Satisfy","Sawarabi Gothic","Sawarabi Mincho","Scada","Scheherazade","Schoolbell","Scope One","Seaweed Script","Secular One","Sedgwick Ave","Sedgwick Ave Display","Sevillana","Seymour One","Shadows Into Light","Shadows Into Light Two","Shanti","Share","Share Tech","Share Tech Mono","Shojumaru","Short Stack","Shrikhand","Siemreap","Sigmar One","Signika","Signika Negative","Simonetta","Single Day","Sintony","Sirin Stencil","Six Caps","Skranji","Slabo 13px","Slabo 27px","Slackey","Smokum","Smythe","Sniglet","Snippet","Snowburst One","Sofadi One","Sofia","Song Myung","Sonsie One","Sorts Mill Goudy","Source Code Pro","Source Sans Pro","Source Serif Pro","Space Mono","Special Elite","Spectral","Spectral SC","Spicy Rice","Spinnaker","Spirax","Squada One","Sree Krushnadevaraya","Sriracha","Srisakdi","Staatliches","Stalemate","Stalinist One","Stardos Stencil","Stint Ultra Condensed","Stint Ultra Expanded","Stoke","Strait","Stylish","Sue Ellen Francisco","Suez One","Sumana","Sunflower","Sunshiney","Supermercado One","Sura","Suranna","Suravaram","Suwannaphum","Swanky and Moo Moo","Syncopate","Tajawal","Tangerine","Taprom","Tauri","Taviraj","Teko","Telex","Tenali Ramakrishna","Tenor Sans","Text Me One","Thasadith","The Girl Next Door","Tienne","Tillana","Timmana","Tinos","Titan One","Titillium Web","Tomorrow","Trade Winds","Trirong","Trocchi","Trochut","Trykker","Tulpen One","Turret Road","Ubuntu","Ubuntu Condensed","Ubuntu Mono","Ultra","Uncial Antiqua","Underdog","Unica One","UnifrakturCook","UnifrakturMaguntia","Unkempt","Unlock","Unna","VT323","Vampiro One","Varela","Varela Round","Vast Shadow","Vesper Libre","Vibes","Vibur","Vidaloka","Viga","Voces","Volkhov","Vollkorn","Vollkorn SC","Voltaire","Waiting for the Sunrise","Wallpoet","Walter Turncoat","Warnes","Wellfleet","Wendy One","Wire One","Work Sans","Yanone Kaffeesatz","Yantramanav","Yatra One","Yellowtail","Yeon Sung","Yeseva One","Yesteryear","Yrsa","ZCOOL KuaiLe","ZCOOL QingKe HuangYou","ZCOOL XiaoWei","Zeyada","Zhi Mang Xing","Zilla Slab","Zilla Slab Highlight"]

export const notoFonts = ["Noto Naskh Arabic","Noto Sans Armenian","Noto Sans Bengali","Noto Sans Buginese","Noto Sans Canadian Aboriginal","Noto Sans Cherokee","Noto Sans Devanagari","Noto Sans Ethiopic","Noto Sans Georgian","Noto Sans Gujarati","Noto Sans Gurmukhi","Noto Sans Hebrew","Noto Sans JP Regular","Noto Sans KR Regular","Noto Sans Kannada","Noto Sans Khmer","Noto Sans Lao","Noto Sans Malayalam","Noto Sans Mongolian","Noto Sans Myanmar","Noto Sans Oriya","Noto Sans SC Regular","Noto Sans Sinhala","Noto Sans TC Regular","Noto Sans Tamil","Noto Sans Telugu","Noto Sans Thaana","Noto Sans Thai","Noto Sans Tibetan","Noto Sans Yi","Noto Serif Armenian","Noto Serif Khmer","Noto Serif Lao","Noto Serif Thai"]