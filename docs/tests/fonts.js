(async () => {

	const hashMini = str => {
		if (typeof str == 'number') {
			return str
		}
		else if (!str || JSON.stringify(str) == '{}') {
			return 'undefined'
		}
		const json = `${JSON.stringify(str)}`
		let i, len, hash = 0x811c9dc5
		for (i = 0, len = json.length; i < len; i++) {
			hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
		}
		return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
	}

	const hashify = async (x) => {
		const json = `${JSON.stringify(x)}`
		const jsonBuffer = new TextEncoder().encode(json)
		const hashBuffer = await crypto.subtle.digest('SHA-256', jsonBuffer)
		const hashArray = Array.from(new Uint8Array(hashBuffer))
		const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')
		return hashHex
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

	// modal component
	const modal = (name, result, linkname = 'details') => {
		if (!result.length) {
			return ''
		}
		return `
			<style>
			.modal-${name}:checked ~ .modal-container {
				visibility: visible;
				opacity: 1;
				animation: show 0.1s linear both;
			}
			.modal-${name}:checked ~ .modal-container .modal-content {
				animation: enter 0.2s ease both
			}
			.modal-${name}:not(:checked) ~ .modal-container {
				visibility: hidden;
			}
			</style>
			<input type="radio" id="toggle-open-${name}" class="modal-${name}" name="modal-${name}"/>
			<label class="modal-open-btn" for="toggle-open-${name}" onclick="">${linkname}</label>
			<label class="modal-container" for="toggle-close-${name}" onclick="">
				<label class="modal-content" for="toggle-open-${name}" onclick="">
					<input type="radio" id="toggle-close-${name}" name="modal-${name}"/>
					<label class="modal-close-btn" for="toggle-close-${name}" onclick="">×</label>
					<div>${result}</div>
				</label>
			</label>
		`
	}

	const note = {
		unsupported: '<span class="blocked">unsupported</span>',
		blocked: '<span class="blocked">blocked</span>',
		lied: '<span class="lies">lied</span>'
	}

	const fontList = ["Andale Mono", "Arial", "Arial Black", "Arial Hebrew", "Arial MT", "Arial Narrow", "Arial Rounded MT Bold", "Arial Unicode MS", "Bitstream Vera Sans Mono", "Book Antiqua", "Bookman Old Style", "Calibri", "Cambria", "Cambria Math", "Century", "Century Gothic", "Century Schoolbook", "Comic Sans", "Comic Sans MS", "Consolas", "Courier", "Courier New", "Geneva", "Georgia", "Helvetica", "Helvetica Neue", "Impact", "Lucida Bright", "Lucida Calligraphy", "Lucida Console", "Lucida Fax", "LUCIDA GRANDE", "Lucida Handwriting", "Lucida Sans", "Lucida Sans Typewriter", "Lucida Sans Unicode", "Microsoft Sans Serif", "Monaco", "Monotype Corsiva", "MS Gothic", "MS Outlook", "MS PGothic", "MS Reference Sans Serif", "MS Sans Serif", "MS Serif", "MYRIAD", "MYRIAD PRO", "Palatino", "Palatino Linotype", "Segoe Print", "Segoe Script", "Segoe UI", "Segoe UI Light", "Segoe UI Semibold", "Segoe UI Symbol", "Tahoma", "Times", "Times New Roman", "Times New Roman PS", "Trebuchet MS", "Verdana", "Wingdings", "Wingdings 2", "Wingdings 3"]

	const extendedFontList = ["Abadi MT Condensed Light", "Academy Engraved LET", "ADOBE CASLON PRO", "Adobe Garamond", "ADOBE GARAMOND PRO", "Agency FB", "Aharoni", "Albertus Extra Bold", "Albertus Medium", "Algerian", "Amazone BT", "American Typewriter", "American Typewriter Condensed", "AmerType Md BT", "Andalus", "Angsana New", "AngsanaUPC", "Antique Olive", "Aparajita", "Apple Chancery", "Apple Color Emoji", "Apple SD Gothic Neo", "Arabic Typesetting", "ARCHER", "ARNO PRO", "Arrus BT", "Aurora Cn BT", "AvantGarde Bk BT", "AvantGarde Md BT", "AVENIR", "Ayuthaya", "Bandy", "Bangla Sangam MN", "Bank Gothic", "BankGothic Md BT", "Baskerville", "Baskerville Old Face", "Batang", "BatangChe", "Bauer Bodoni", "Bauhaus 93", "Bazooka", "Bell MT", "Bembo", "Benguiat Bk BT", "Berlin Sans FB", "Berlin Sans FB Demi", "Bernard MT Condensed", "BernhardFashion BT", "BernhardMod BT", "Big Caslon", "BinnerD", "Blackadder ITC", "BlairMdITC TT", "Bodoni 72", "Bodoni 72 Oldstyle", "Bodoni 72 Smallcaps", "Bodoni MT", "Bodoni MT Black", "Bodoni MT Condensed", "Bodoni MT Poster Compressed", "Bookshelf Symbol 7", "Boulder", "Bradley Hand", "Bradley Hand ITC", "Bremen Bd BT", "Britannic Bold", "Broadway", "Browallia New", "BrowalliaUPC", "Brush Script MT", "Californian FB", "Calisto MT", "Calligrapher", "Candara", "CaslonOpnface BT", "Castellar", "Centaur", "Cezanne", "CG Omega", "CG Times", "Chalkboard", "Chalkboard SE", "Chalkduster", "Charlesworth", "Charter Bd BT", "Charter BT", "Chaucer", "ChelthmITC Bk BT", "Chiller", "Clarendon", "Clarendon Condensed", "CloisterBlack BT", "Cochin", "Colonna MT", "Constantia", "Cooper Black", "Copperplate", "Copperplate Gothic", "Copperplate Gothic Bold", "Copperplate Gothic Light", "CopperplGoth Bd BT", "Corbel", "Cordia New", "CordiaUPC", "Cornerstone", "Coronet", "Cuckoo", "Curlz MT", "DaunPenh", "Dauphin", "David", "DB LCD Temp", "DELICIOUS", "Denmark", "DFKai-SB", "Didot", "DilleniaUPC", "DIN", "DokChampa", "Dotum", "DotumChe", "Ebrima", "Edwardian Script ITC", "Elephant", "English 111 Vivace BT", "Engravers MT", "EngraversGothic BT", "Eras Bold ITC", "Eras Demi ITC", "Eras Light ITC", "Eras Medium ITC", "EucrosiaUPC", "Euphemia", "Euphemia UCAS", "EUROSTILE", "Exotc350 Bd BT", "FangSong", "Felix Titling", "Fixedsys", "FONTIN", "Footlight MT Light", "Forte", "FrankRuehl", "Fransiscan", "Freefrm721 Blk BT", "FreesiaUPC", "Freestyle Script", "French Script MT", "FrnkGothITC Bk BT", "Fruitger", "FRUTIGER", "Futura", "Futura Bk BT", "Futura Lt BT", "Futura Md BT", "Futura ZBlk BT", "FuturaBlack BT", "Gabriola", "Galliard BT", "Gautami", "Geeza Pro", "Geometr231 BT", "Geometr231 Hv BT", "Geometr231 Lt BT", "GeoSlab 703 Lt BT", "GeoSlab 703 XBd BT", "Gigi", "Gill Sans", "Gill Sans MT", "Gill Sans MT Condensed", "Gill Sans MT Ext Condensed Bold", "Gill Sans Ultra Bold", "Gill Sans Ultra Bold Condensed", "Gisha", "Gloucester MT Extra Condensed", "GOTHAM", "GOTHAM BOLD", "Goudy Old Style", "Goudy Stout", "GoudyHandtooled BT", "GoudyOLSt BT", "Gujarati Sangam MN", "Gulim", "GulimChe", "Gungsuh", "GungsuhChe", "Gurmukhi MN", "Haettenschweiler", "Harlow Solid Italic", "Harrington", "Heather", "Heiti SC", "Heiti TC", "HELV", "Herald", "High Tower Text", "Hiragino Kaku Gothic ProN", "Hiragino Mincho ProN", "Hoefler Text", "Humanst 521 Cn BT", "Humanst521 BT", "Humanst521 Lt BT", "Imprint MT Shadow", "Incised901 Bd BT", "Incised901 BT", "Incised901 Lt BT", "INCONSOLATA", "Informal Roman", "Informal011 BT", "INTERSTATE", "IrisUPC", "Iskoola Pota", "JasmineUPC", "Jazz LET", "Jenson", "Jester", "Jokerman", "Juice ITC", "Kabel Bk BT", "Kabel Ult BT", "Kailasa", "KaiTi", "Kalinga", "Kannada Sangam MN", "Kartika", "Kaufmann Bd BT", "Kaufmann BT", "Khmer UI", "KodchiangUPC", "Kokila", "Korinna BT", "Kristen ITC", "Krungthep", "Kunstler Script", "Lao UI", "Latha", "Leelawadee", "Letter Gothic", "Levenim MT", "LilyUPC", "Lithograph", "Lithograph Light", "Long Island", "Lydian BT", "Magneto", "Maiandra GD", "Malayalam Sangam MN", "Malgun Gothic", "Mangal", "Marigold", "Marion", "Marker Felt", "Market", "Marlett", "Matisse ITC", "Matura MT Script Capitals", "Meiryo", "Meiryo UI", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft New Tai Lue", "Microsoft PhagsPa", "Microsoft Tai Le", "Microsoft Uighur", "Microsoft YaHei", "Microsoft Yi Baiti", "MingLiU", "MingLiU_HKSCS", "MingLiU_HKSCS-ExtB", "MingLiU-ExtB", "Minion", "Minion Pro", "Miriam", "Miriam Fixed", "Mistral", "Modern", "Modern No. 20", "Mona Lisa Solid ITC TT", "Mongolian Baiti", "MONO", "MoolBoran", "Mrs Eaves", "MS LineDraw", "MS Mincho", "MS PMincho", "MS Reference Specialty", "MS UI Gothic", "MT Extra", "MUSEO", "MV Boli", "Nadeem", "Narkisim", "NEVIS", "News Gothic", "News GothicMT", "NewsGoth BT", "Niagara Engraved", "Niagara Solid", "Noteworthy", "NSimSun", "Nyala", "OCR A Extended", "Old Century", "Old English Text MT", "Onyx", "Onyx BT", "OPTIMA", "Oriya Sangam MN", "OSAKA", "OzHandicraft BT", "Palace Script MT", "Papyrus", "Parchment", "Party LET", "Pegasus", "Perpetua", "Perpetua Titling MT", "PetitaBold", "Pickwick", "Plantagenet Cherokee", "Playbill", "PMingLiU", "PMingLiU-ExtB", "Poor Richard", "Poster", "PosterBodoni BT", "PRINCETOWN LET", "Pristina", "PTBarnum BT", "Pythagoras", "Raavi", "Rage Italic", "Ravie", "Ribbon131 Bd BT", "Rockwell", "Rockwell Condensed", "Rockwell Extra Bold", "Rod", "Roman", "Sakkal Majalla", "Santa Fe LET", "Savoye LET", "Sceptre", "Script", "Script MT Bold", "SCRIPTINA", "Serifa", "Serifa BT", "Serifa Th BT", "ShelleyVolante BT", "Sherwood", "Shonar Bangla", "Showcard Gothic", "Shruti", "Signboard", "SILKSCREEN", "SimHei", "Simplified Arabic", "Simplified Arabic Fixed", "SimSun", "SimSun-ExtB", "Sinhala Sangam MN", "Sketch Rockwell", "Skia", "Small Fonts", "Snap ITC", "Snell Roundhand", "Socket", "Souvenir Lt BT", "Staccato222 BT", "Steamer", "Stencil", "Storybook", "Styllo", "Subway", "Swis721 BlkEx BT", "Swiss911 XCm BT", "Sylfaen", "Synchro LET", "System", "Tamil Sangam MN", "Technical", "Teletype", "Telugu Sangam MN", "Tempus Sans ITC", "Terminal", "Thonburi", "Traditional Arabic", "Trajan", "TRAJAN PRO", "Tristan", "Tubular", "Tunga", "Tw Cen MT", "Tw Cen MT Condensed", "Tw Cen MT Condensed Extra Bold", "TypoUpright BT", "Unicorn", "Univers", "Univers CE 55 Medium", "Univers Condensed", "Utsaah", "Vagabond", "Vani", "Vijaya", "Viner Hand ITC", "VisualUI", "Vivaldi", "Vladimir Script", "Vrinda", "Westminster", "WHITNEY", "Wide Latin", "ZapfEllipt BT", "ZapfHumnst BT", "ZapfHumnst Dm BT", "Zapfino", "Zurich BlkEx BT", "Zurich Ex BT", "ZWAdobeF"]

	const googleFonts = ["ABeeZee", "Abel", "Abhaya Libre", "Abril Fatface", "Aclonica", "Acme", "Actor", "Adamina", "Advent Pro", "Aguafina Script", "Akronim", "Aladin", "Aldrich", "Alef", "Alegreya", "Alegreya SC", "Alegreya Sans", "Alegreya Sans SC", "Aleo", "Alex Brush", "Alfa Slab One", "Alice", "Alike", "Alike Angular", "Allan", "Allerta", "Allerta Stencil", "Allura", "Almarai", "Almendra", "Almendra Display", "Almendra SC", "Amarante", "Amaranth", "Amatic SC", "Amethysta", "Amiko", "Amiri", "Amita", "Anaheim", "Andada", "Andika", "Angkor", "Annie Use Your Telescope", "Anonymous Pro", "Antic", "Antic Didone", "Antic Slab", "Anton", "Arapey", "Arbutus", "Arbutus Slab", "Architects Daughter", "Archivo", "Archivo Black", "Archivo Narrow", "Aref Ruqaa", "Arima Madurai", "Arimo", "Arizonia", "Armata", "Arsenal", "Artifika", "Arvo", "Arya", "Asap", "Asap Condensed", "Asar", "Asset", "Assistant", "Astloch", "Asul", "Athiti", "Atma", "Atomic Age", "Aubrey", "Audiowide", "Autour One", "Average", "Average Sans", "Averia Gruesa Libre", "Averia Libre", "Averia Sans Libre", "Averia Serif Libre", "B612", "B612 Mono", "Bad Script", "Bahiana", "Bahianita", "Bai Jamjuree", "Baloo", "Baloo Bhai", "Baloo Bhaijaan", "Baloo Bhaina", "Baloo Chettan", "Baloo Da", "Baloo Paaji", "Baloo Tamma", "Baloo Tammudu", "Baloo Thambi", "Balthazar", "Bangers", "Barlow", "Barlow Condensed", "Barlow Semi Condensed", "Barriecito", "Barrio", "Basic", "Battambang", "Baumans", "Bayon", "Be Vietnam", "Bebas Neue", "Belgrano", "Bellefair", "Belleza", "BenchNine", "Bentham", "Berkshire Swash", "Beth Ellen", "Bevan", "Big Shoulders Display", "Big Shoulders Text", "Bigelow Rules", "Bigshot One", "Bilbo", "Bilbo Swash Caps", "BioRhyme", "BioRhyme Expanded", "Biryani", "Bitter", "Black And White Picture", "Black Han Sans", "Black Ops One", "Blinker", "Bokor", "Bonbon", "Boogaloo", "Bowlby One", "Bowlby One SC", "Brawler", "Bree Serif", "Bubblegum Sans", "Bubbler One", "Buda", "Buenard", "Bungee", "Bungee Hairline", "Bungee Inline", "Bungee Outline", "Bungee Shade", "Butcherman", "Butterfly Kids", "Cabin", "Cabin Condensed", "Cabin Sketch", "Caesar Dressing", "Cagliostro", "Cairo", "Calligraffitti", "Cambay", "Cambo", "Candal", "Cantarell", "Cantata One", "Cantora One", "Capriola", "Cardo", "Carme", "Carrois Gothic", "Carrois Gothic SC", "Carter One", "Catamaran", "Caudex", "Caveat", "Caveat Brush", "Cedarville Cursive", "Ceviche One", "Chakra Petch", "Changa", "Changa One", "Chango", "Charm", "Charmonman", "Chathura", "Chau Philomene One", "Chela One", "Chelsea Market", "Chenla", "Cherry Cream Soda", "Cherry Swash", "Chewy", "Chicle", "Chilanka", "Chivo", "Chonburi", "Cinzel", "Cinzel Decorative", "Clicker Script", "Coda", "Coda Caption", "Codystar", "Coiny", "Combo", "Comfortaa", "Coming Soon", "Concert One", "Condiment", "Content", "Contrail One", "Convergence", "Cookie", "Copse", "Corben", "Cormorant", "Cormorant Garamond", "Cormorant Infant", "Cormorant SC", "Cormorant Unicase", "Cormorant Upright", "Courgette", "Cousine", "Coustard", "Covered By Your Grace", "Crafty Girls", "Creepster", "Crete Round", "Crimson Pro", "Crimson Text", "Croissant One", "Crushed", "Cuprum", "Cute Font", "Cutive", "Cutive Mono", "DM Sans", "DM Serif Display", "DM Serif Text", "Damion", "Dancing Script", "Dangrek", "Darker Grotesque", "David Libre", "Dawning of a New Day", "Days One", "Dekko", "Delius", "Delius Swash Caps", "Delius Unicase", "Della Respira", "Denk One", "Devonshire", "Dhurjati", "Didact Gothic", "Diplomata", "Diplomata SC", "Do Hyeon", "Dokdo", "Domine", "Donegal One", "Doppio One", "Dorsa", "Dosis", "Dr Sugiyama", "Duru Sans", "Dynalight", "EB Garamond", "Eagle Lake", "East Sea Dokdo", "Eater", "Economica", "Eczar", "El Messiri", "Electrolize", "Elsie", "Elsie Swash Caps", "Emblema One", "Emilys Candy", "Encode Sans", "Encode Sans Condensed", "Encode Sans Expanded", "Encode Sans Semi Condensed", "Encode Sans Semi Expanded", "Engagement", "Englebert", "Enriqueta", "Erica One", "Esteban", "Euphoria Script", "Ewert", "Exo", "Exo 2", "Expletus Sans", "Fahkwang", "Fanwood Text", "Farro", "Farsan", "Fascinate", "Fascinate Inline", "Faster One", "Fasthand", "Fauna One", "Faustina", "Federant", "Federo", "Felipa", "Fenix", "Finger Paint", "Fira Code", "Fira Mono", "Fira Sans", "Fira Sans Condensed", "Fira Sans Extra Condensed", "Fjalla One", "Fjord One", "Flamenco", "Flavors", "Fondamento", "Fontdiner Swanky", "Forum", "Francois One", "Frank Ruhl Libre", "Freckle Face", "Fredericka the Great", "Fredoka One", "Freehand", "Fresca", "Frijole", "Fruktur", "Fugaz One", "GFS Didot", "GFS Neohellenic", "Gabriela", "Gaegu", "Gafata", "Galada", "Galdeano", "Galindo", "Gamja Flower", "Gayathri", "Gentium Basic", "Gentium Book Basic", "Geo", "Geostar", "Geostar Fill", "Germania One", "Gidugu", "Gilda Display", "Give You Glory", "Glass Antiqua", "Glegoo", "Gloria Hallelujah", "Goblin One", "Gochi Hand", "Gorditas", "Gothic A1", "Goudy Bookletter 1911", "Graduate", "Grand Hotel", "Gravitas One", "Great Vibes", "Grenze", "Griffy", "Gruppo", "Gudea", "Gugi", "Gurajada", "Habibi", "Halant", "Hammersmith One", "Hanalei", "Hanalei Fill", "Handlee", "Hanuman", "Happy Monkey", "Harmattan", "Headland One", "Heebo", "Henny Penny", "Hepta Slab", "Herr Von Muellerhoff", "Hi Melody", "Hind", "Hind Guntur", "Hind Madurai", "Hind Siliguri", "Hind Vadodara", "Holtwood One SC", "Homemade Apple", "Homenaje", "IBM Plex Mono", "IBM Plex Sans", "IBM Plex Sans Condensed", "IBM Plex Serif", "IM Fell DW Pica", "IM Fell DW Pica SC", "IM Fell Double Pica", "IM Fell Double Pica SC", "IM Fell English", "IM Fell English SC", "IM Fell French Canon", "IM Fell French Canon SC", "IM Fell Great Primer", "IM Fell Great Primer SC", "Iceberg", "Iceland", "Imprima", "Inconsolata", "Inder", "Indie Flower", "Inika", "Inknut Antiqua", "Irish Grover", "Istok Web", "Italiana", "Italianno", "Itim", "Jacques Francois", "Jacques Francois Shadow", "Jaldi", "Jim Nightshade", "Jockey One", "Jolly Lodger", "Jomhuria", "Jomolhari", "Josefin Sans", "Josefin Slab", "Joti One", "Jua", "Judson", "Julee", "Julius Sans One", "Junge", "Jura", "Just Another Hand", "Just Me Again Down Here", "K2D", "Kadwa", "Kalam", "Kameron", "Kanit", "Kantumruy", "Karla", "Karma", "Katibeh", "Kaushan Script", "Kavivanar", "Kavoon", "Kdam Thmor", "Keania One", "Kelly Slab", "Kenia", "Khand", "Khmer", "Khula", "Kirang Haerang", "Kite One", "Knewave", "KoHo", "Kodchasan", "Kosugi", "Kosugi Maru", "Kotta One", "Koulen", "Kranky", "Kreon", "Kristi", "Krona One", "Krub", "Kulim Park", "Kumar One", "Kumar One Outline", "Kurale", "La Belle Aurore", "Lacquer", "Laila", "Lakki Reddy", "Lalezar", "Lancelot", "Lateef", "Lato", "League Script", "Leckerli One", "Ledger", "Lekton", "Lemon", "Lemonada", "Lexend Deca", "Lexend Exa", "Lexend Giga", "Lexend Mega", "Lexend Peta", "Lexend Tera", "Lexend Zetta", "Libre Barcode 128", "Libre Barcode 128 Text", "Libre Barcode 39", "Libre Barcode 39 Extended", "Libre Barcode 39 Extended Text", "Libre Barcode 39 Text", "Libre Baskerville", "Libre Caslon Display", "Libre Caslon Text", "Libre Franklin", "Life Savers", "Lilita One", "Lily Script One", "Limelight", "Linden Hill", "Literata", "Liu Jian Mao Cao", "Livvic", "Lobster", "Lobster Two", "Londrina Outline", "Londrina Shadow", "Londrina Sketch", "Londrina Solid", "Long Cang", "Lora", "Love Ya Like A Sister", "Loved by the King", "Lovers Quarrel", "Luckiest Guy", "Lusitana", "Lustria", "M PLUS 1p", "M PLUS Rounded 1c", "Ma Shan Zheng", "Macondo", "Macondo Swash Caps", "Mada", "Magra", "Maiden Orange", "Maitree", "Major Mono Display", "Mako", "Mali", "Mallanna", "Mandali", "Manjari", "Mansalva", "Manuale", "Marcellus", "Marcellus SC", "Marck Script", "Margarine", "Markazi Text", "Marko One", "Marmelad", "Martel", "Martel Sans", "Marvel", "Mate", "Mate SC", "Material Icons", "Maven Pro", "McLaren", "Meddon", "MedievalSharp", "Medula One", "Meera Inimai", "Megrim", "Meie Script", "Merienda", "Merienda One", "Merriweather", "Merriweather Sans", "Metal", "Metal Mania", "Metamorphous", "Metrophobic", "Michroma", "Milonga", "Miltonian", "Miltonian Tattoo", "Mina", "Miniver", "Miriam Libre", "Mirza", "Miss Fajardose", "Mitr", "Modak", "Modern Antiqua", "Mogra", "Molengo", "Molle", "Monda", "Monofett", "Monoton", "Monsieur La Doulaise", "Montaga", "Montez", "Montserrat", "Montserrat Alternates", "Montserrat Subrayada", "Moul", "Moulpali", "Mountains of Christmas", "Mouse Memoirs", "Mr Bedfort", "Mr Dafoe", "Mr De Haviland", "Mrs Saint Delafield", "Mrs Sheppards", "Mukta", "Mukta Mahee", "Mukta Malar", "Mukta Vaani", "Muli", "Mystery Quest", "NTR", "Nanum Brush Script", "Nanum Gothic", "Nanum Gothic Coding", "Nanum Myeongjo", "Nanum Pen Script", "Neucha", "Neuton", "New Rocker", "News Cycle", "Niconne", "Niramit", "Nixie One", "Nobile", "Nokora", "Norican", "Nosifer", "Notable", "Nothing You Could Do", "Noticia Text", "Noto Sans", "Noto Sans HK", "Noto Sans JP", "Noto Sans KR", "Noto Sans SC", "Noto Sans TC", "Noto Serif", "Noto Serif JP", "Noto Serif KR", "Noto Serif SC", "Noto Serif TC", "Nova Cut", "Nova Flat", "Nova Mono", "Nova Oval", "Nova Round", "Nova Script", "Nova Slim", "Nova Square", "Numans", "Nunito", "Nunito Sans", "Odor Mean Chey", "Offside", "Old Standard TT", "Oldenburg", "Oleo Script", "Oleo Script Swash Caps", "Open Sans", "Open Sans Condensed", "Oranienbaum", "Orbitron", "Oregano", "Orienta", "Original Surfer", "Oswald", "Over the Rainbow", "Overlock", "Overlock SC", "Overpass", "Overpass Mono", "Ovo", "Oxygen", "Oxygen Mono", "PT Mono", "PT Sans", "PT Sans Caption", "PT Sans Narrow", "PT Serif", "PT Serif Caption", "Pacifico", "Padauk", "Palanquin", "Palanquin Dark", "Pangolin", "Paprika", "Parisienne", "Passero One", "Passion One", "Pathway Gothic One", "Patrick Hand", "Patrick Hand SC", "Pattaya", "Patua One", "Pavanam", "Paytone One", "Peddana", "Peralta", "Permanent Marker", "Petit Formal Script", "Petrona", "Philosopher", "Piedra", "Pinyon Script", "Pirata One", "Plaster", "Play", "Playball", "Playfair Display", "Playfair Display SC", "Podkova", "Poiret One", "Poller One", "Poly", "Pompiere", "Pontano Sans", "Poor Story", "Poppins", "Port Lligat Sans", "Port Lligat Slab", "Pragati Narrow", "Prata", "Preahvihear", "Press Start 2P", "Pridi", "Princess Sofia", "Prociono", "Prompt", "Prosto One", "Proza Libre", "Public Sans", "Puritan", "Purple Purse", "Quando", "Quantico", "Quattrocento", "Quattrocento Sans", "Questrial", "Quicksand", "Quintessential", "Qwigley", "Racing Sans One", "Radley", "Rajdhani", "Rakkas", "Raleway", "Raleway Dots", "Ramabhadra", "Ramaraja", "Rambla", "Rammetto One", "Ranchers", "Rancho", "Ranga", "Rasa", "Rationale", "Ravi Prakash", "Red Hat Display", "Red Hat Text", "Redressed", "Reem Kufi", "Reenie Beanie", "Revalia", "Rhodium Libre", "Ribeye", "Ribeye Marrow", "Righteous", "Risque", "Roboto", "Roboto Condensed", "Roboto Mono", "Roboto Slab", "Rochester", "Rock Salt", "Rokkitt", "Romanesco", "Ropa Sans", "Rosario", "Rosarivo", "Rouge Script", "Rozha One", "Rubik", "Rubik Mono One", "Ruda", "Rufina", "Ruge Boogie", "Ruluko", "Rum Raisin", "Ruslan Display", "Russo One", "Ruthie", "Rye", "Sacramento", "Sahitya", "Sail", "Saira", "Saira Condensed", "Saira Extra Condensed", "Saira Semi Condensed", "Saira Stencil One", "Salsa", "Sanchez", "Sancreek", "Sansita", "Sarabun", "Sarala", "Sarina", "Sarpanch", "Satisfy", "Sawarabi Gothic", "Sawarabi Mincho", "Scada", "Scheherazade", "Schoolbell", "Scope One", "Seaweed Script", "Secular One", "Sedgwick Ave", "Sedgwick Ave Display", "Sevillana", "Seymour One", "Shadows Into Light", "Shadows Into Light Two", "Shanti", "Share", "Share Tech", "Share Tech Mono", "Shojumaru", "Short Stack", "Shrikhand", "Siemreap", "Sigmar One", "Signika", "Signika Negative", "Simonetta", "Single Day", "Sintony", "Sirin Stencil", "Six Caps", "Skranji", "Slabo 13px", "Slabo 27px", "Slackey", "Smokum", "Smythe", "Sniglet", "Snippet", "Snowburst One", "Sofadi One", "Sofia", "Song Myung", "Sonsie One", "Sorts Mill Goudy", "Source Code Pro", "Source Sans Pro", "Source Serif Pro", "Space Mono", "Special Elite", "Spectral", "Spectral SC", "Spicy Rice", "Spinnaker", "Spirax", "Squada One", "Sree Krushnadevaraya", "Sriracha", "Srisakdi", "Staatliches", "Stalemate", "Stalinist One", "Stardos Stencil", "Stint Ultra Condensed", "Stint Ultra Expanded", "Stoke", "Strait", "Stylish", "Sue Ellen Francisco", "Suez One", "Sumana", "Sunflower", "Sunshiney", "Supermercado One", "Sura", "Suranna", "Suravaram", "Suwannaphum", "Swanky and Moo Moo", "Syncopate", "Tajawal", "Tangerine", "Taprom", "Tauri", "Taviraj", "Teko", "Telex", "Tenali Ramakrishna", "Tenor Sans", "Text Me One", "Thasadith", "The Girl Next Door", "Tienne", "Tillana", "Timmana", "Tinos", "Titan One", "Titillium Web", "Tomorrow", "Trade Winds", "Trirong", "Trocchi", "Trochut", "Trykker", "Tulpen One", "Turret Road", "Ubuntu", "Ubuntu Condensed", "Ubuntu Mono", "Ultra", "Uncial Antiqua", "Underdog", "Unica One", "UnifrakturCook", "UnifrakturMaguntia", "Unkempt", "Unlock", "Unna", "VT323", "Vampiro One", "Varela", "Varela Round", "Vast Shadow", "Vesper Libre", "Vibes", "Vibur", "Vidaloka", "Viga", "Voces", "Volkhov", "Vollkorn", "Vollkorn SC", "Voltaire", "Waiting for the Sunrise", "Wallpoet", "Walter Turncoat", "Warnes", "Wellfleet", "Wendy One", "Wire One", "Work Sans", "Yanone Kaffeesatz", "Yantramanav", "Yatra One", "Yellowtail", "Yeon Sung", "Yeseva One", "Yesteryear", "Yrsa", "ZCOOL KuaiLe", "ZCOOL QingKe HuangYou", "ZCOOL XiaoWei", "Zeyada", "Zhi Mang Xing", "Zilla Slab", "Zilla Slab Highlight"]

	const notoFonts = ["Noto Naskh Arabic", "Noto Sans Armenian", "Noto Sans Bengali", "Noto Sans Buginese", "Noto Sans Canadian Aboriginal", "Noto Sans Cherokee", "Noto Sans Devanagari", "Noto Sans Ethiopic", "Noto Sans Georgian", "Noto Sans Gujarati", "Noto Sans Gurmukhi", "Noto Sans Hebrew", "Noto Sans JP Regular", "Noto Sans KR Regular", "Noto Sans Kannada", "Noto Sans Khmer", "Noto Sans Lao", "Noto Sans Malayalam", "Noto Sans Mongolian", "Noto Sans Myanmar", "Noto Sans Oriya", "Noto Sans SC Regular", "Noto Sans Sinhala", "Noto Sans TC Regular", "Noto Sans Tamil", "Noto Sans Telugu", "Noto Sans Thaana", "Noto Sans Thai", "Noto Sans Tibetan", "Noto Sans Yi", "Noto Serif Armenian", "Noto Serif Khmer", "Noto Serif Lao", "Noto Serif Thai"]

	// https://arkenfox.github.io/TZP/tzp.html
	const platformFonts = ['Aqua Kana', 'Aqua Kana Bold', 'Helvetica LT MM', 'Helvetica Neue Desk UI', 'Helvetica Neue Desk UI Bold', 'Helvetica Neue Desk UI Bold Italic', 'Helvetica Neue Desk UI Italic', 'Helvetica Neue DeskInterface', 'Times LT MM', 'AR PL UKai CN', 'AR PL UKai HK', 'AR PL UKai TW', 'AR PL UKai TW MBE', 'AR PL UMing CN', 'AR PL UMing HK', 'AR PL UMing TW', 'AR PL UMing TW MBE', 'Abyssinica SIL', 'Aharoni Bold', 'Aharoni CLM', 'Al Bayan', 'Al Bayan Bold', 'Al Bayan Plain', 'Al Nile', 'Al Nile Bold', 'Al Tarikh', 'Al Tarikh Regular', 'AlArabiya', 'AlBattar', 'AlHor', 'AlManzomah', 'AlYarmook', 'Aldhabi', 'AlternateGothic2 BT', 'American Typewriter', 'American Typewriter Bold', 'American Typewriter Condensed', 'American Typewriter Condensed Bold', 'American Typewriter Condensed Light', 'American Typewriter Light', 'American Typewriter Semibold', 'Amiri', 'Amiri Quran', 'Amiri Quran Colored', 'Andale Mono', 'Andalus', 'Angsana New', 'Angsana New Bold', 'Angsana New Bold Italic', 'Angsana New Italic', 'AngsanaUPC', 'AngsanaUPC Bold', 'AngsanaUPC Bold Italic', 'AngsanaUPC Italic', 'Ani', 'AnjaliOldLipi', 'Aparajita', 'Aparajita Bold', 'Aparajita Bold Italic', 'Aparajita Italic', 'Apple Braille', 'Apple Braille Outline 6 Dot', 'Apple Braille Outline 8 Dot', 'Apple Braille Pinpoint 6 Dot', 'Apple Braille Pinpoint 8 Dot', 'Apple Chancery', 'Apple Color Emoji', 'Apple LiGothic Medium', 'Apple LiSung Light', 'Apple SD Gothic Neo', 'Apple SD Gothic Neo Bold', 'Apple SD Gothic Neo Heavy', 'Apple SD Gothic Neo Light', 'Apple SD Gothic Neo Medium', 'Apple SD Gothic Neo Regular', 'Apple SD Gothic Neo SemiBold', 'Apple SD Gothic Neo Thin', 'Apple SD Gothic Neo UltraLight', 'Apple SD GothicNeo ExtraBold', 'Apple Symbols', 'AppleGothic', 'AppleGothic Regular', 'AppleMyungjo', 'AppleMyungjo Regular', 'Arab', 'Arabic Typesetting', 'Arial', 'Arial Black', 'Arial Bold', 'Arial Bold Italic', 'Arial Hebrew', 'Arial Hebrew Bold', 'Arial Hebrew Light', 'Arial Hebrew Scholar', 'Arial Hebrew Scholar Bold', 'Arial Hebrew Scholar Light', 'Arial Italic', 'Arial Narrow', 'Arial Narrow Bold', 'Arial Narrow Bold Italic', 'Arial Narrow Italic', 'Arial Nova', 'Arial Nova Bold', 'Arial Nova Bold Italic', 'Arial Nova Cond', 'Arial Nova Cond Bold', 'Arial Nova Cond Bold Italic', 'Arial Nova Cond Italic', 'Arial Nova Cond Light', 'Arial Nova Cond Light Italic', 'Arial Nova Italic', 'Arial Nova Light', 'Arial Nova Light Italic', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Arimo', 'Athelas Bold', 'Athelas Bold Italic', 'Athelas Italic', 'Athelas Regular', 'Avenir', 'Avenir Black', 'Avenir Black Oblique', 'Avenir Book', 'Avenir Book Oblique', 'Avenir Heavy', 'Avenir Heavy Oblique', 'Avenir Light', 'Avenir Light Oblique', 'Avenir Medium', 'Avenir Medium Oblique', 'Avenir Next', 'Avenir Next Bold', 'Avenir Next Bold Italic', 'Avenir Next Condensed Bold', 'Avenir Next Condensed Bold Italic', 'Avenir Next Condensed Demi Bold', 'Avenir Next Condensed Demi Bold Italic', 'Avenir Next Condensed Heavy', 'Avenir Next Condensed Heavy Italic', 'Avenir Next Condensed Italic', 'Avenir Next Condensed Medium', 'Avenir Next Condensed Medium Italic', 'Avenir Next Condensed Regular', 'Avenir Next Condensed Ultra Light', 'Avenir Next Condensed Ultra Light Italic', 'Avenir Next Demi Bold', 'Avenir Next Demi Bold Italic', 'Avenir Next Heavy', 'Avenir Next Heavy Italic', 'Avenir Next Italic', 'Avenir Next Medium', 'Avenir Next Medium Italic', 'Avenir Next Regular', 'Avenir Next Ultra Light', 'Avenir Next Ultra Light Italic', 'Avenir Oblique', 'Avenir Roman', 'Ayuthaya', 'BIZ UDGothic', 'BIZ UDGothic Bold', 'BIZ UDMincho', 'BIZ UDMincho Medium', 'BIZ UDPGothic', 'BIZ UDPGothic Bold', 'BIZ UDPMincho', 'BIZ UDPMincho Medium', 'Baghdad', 'Baghdad Regular', 'Bahnschrift', 'Bahnschrift Light', 'Bahnschrift SemiBold', 'Bahnschrift SemiLight', 'Bangla MN', 'Bangla MN Bold', 'Bangla Sangam MN', 'Bangla Sangam MN Bold', 'Baoli SC Regular', 'Baoli TC Regular', 'Baskerville', 'Baskerville Bold', 'Baskerville Bold Italic', 'Baskerville Italic', 'Baskerville SemiBold', 'Baskerville SemiBold Italic', 'Batang', 'BatangChe', 'Beirut', 'Beirut Regular', 'BiauKai', 'Big Caslon Medium', 'Bitstream Charter', 'Bodoni 72', 'Bodoni 72 Bold', 'Bodoni 72 Book', 'Bodoni 72 Book Italic', 'Bodoni 72 Oldstyle', 'Bodoni 72 Oldstyle Bold', 'Bodoni 72 Oldstyle Book', 'Bodoni 72 Oldstyle Book Italic', 'Bodoni 72 Smallcaps', 'Bodoni 72 Smallcaps Book', 'Bodoni Ornaments', 'Bradley Hand', 'Bradley Hand Bold', 'Browallia New', 'Browallia New Bold', 'Browallia New Bold Italic', 'Browallia New Italic', 'BrowalliaUPC', 'BrowalliaUPC Bold', 'BrowalliaUPC Bold Italic', 'BrowalliaUPC Italic', 'Brush Script MT', 'Brush Script MT Italic', 'C059', 'Caladea', 'Caladings CLM', 'Calibri', 'Calibri Bold', 'Calibri Bold Italic', 'Calibri Italic', 'Calibri Light', 'Calibri Light Italic', 'Cambria', 'Cambria Bold', 'Cambria Bold Italic', 'Cambria Italic', 'Cambria Math', 'Candara', 'Candara Bold', 'Candara Bold Italic', 'Candara Italic', 'Candara Light', 'Candara Light Italic', 'Cantarell', 'Cantarell Extra Bold', 'Cantarell Light', 'Cantarell Thin', 'Carlito', 'Century Schoolbook L', 'Chalkboard', 'Chalkboard Bold', 'Chalkboard SE', 'Chalkboard SE Bold', 'Chalkboard SE Light', 'Chalkboard SE Regular', 'Chalkduster', 'Chandas', 'Charcoal CY', 'Charter', 'Charter Black', 'Charter Black Italic', 'Charter Bold', 'Charter Bold Italic', 'Charter Italic', 'Charter Roman', 'Chilanka', 'Cochin', 'Cochin Bold', 'Cochin Bold Italic', 'Cochin Italic', 'Comfortaa', 'Comfortaa Light', 'Comic Sans MS', 'Comic Sans MS Bold', 'Comic Sans MS Bold Italic', 'Comic Sans MS Italic', 'Consolas', 'Consolas Bold', 'Consolas Bold Italic', 'Consolas Italic', 'Constantia', 'Constantia Bold', 'Constantia Bold Italic', 'Constantia Italic', 'Copperplate', 'Copperplate Bold', 'Copperplate Light', 'Corbel', 'Corbel Bold', 'Corbel Bold Italic', 'Corbel Italic', 'Corbel Light', 'Corbel Light Italic', 'Cordia New', 'Cordia New Bold', 'Cordia New Bold Italic', 'Cordia New Italic', 'CordiaUPC', 'CordiaUPC Bold', 'CordiaUPC Bold Italic', 'CordiaUPC Italic', 'Corsiva Hebrew', 'Corsiva Hebrew Bold', 'Cortoba', 'Courier', 'Courier 10 Pitch', 'Courier Bold', 'Courier Bold Oblique', 'Courier New', 'Courier New Bold', 'Courier New Bold Italic', 'Courier New Italic', 'Courier Oblique', 'Cousine', 'D050000L', 'DFKai-SB', 'DIN Alternate', 'DIN Alternate Bold', 'DIN Condensed', 'DIN Condensed Bold', 'Damascus', 'Damascus Bold', 'Damascus Light', 'Damascus Medium', 'Damascus Regular', 'Damascus Semi Bold', 'DaunPenh', 'David', 'David Bold', 'David CLM', 'DecoType Naskh', 'DecoType Naskh Regular', 'DejaVu Math TeX Gyre', 'DejaVu Sans', 'DejaVu Sans Condensed', 'DejaVu Sans Light', 'DejaVu Sans Mono', 'DejaVu Serif', 'DejaVu Serif Condensed', 'DengXian', 'DengXian Bold', 'DengXian Light', 'Devanagari MT', 'Devanagari MT Bold', 'Devanagari Sangam MN', 'Devanagari Sangam MN Bold', 'Didot', 'Didot Bold', 'Didot Italic', 'DilleniaUPC', 'DilleniaUPC Bold', 'DilleniaUPC Bold Italic', 'DilleniaUPC Italic', 'Dimnah', 'Dingbats', 'Diwan Kufi', 'Diwan Kufi Regular', 'Diwan Mishafi', 'Diwan Thuluth', 'Diwan Thuluth Regular', 'DokChampa', 'Dotum', 'DotumChe', 'Droid Arabic Kufi', 'Droid Sans', 'Droid Sans Armenian', 'Droid Sans Devanagari', 'Droid Sans Ethiopic', 'Droid Sans Fallback', 'Droid Sans Georgian', 'Droid Sans Hebrew', 'Droid Sans Japanese', 'Droid Sans Mono', 'Droid Sans Tamil', 'Droid Sans Thai', 'Droid Serif', 'Drugulin CLM', 'Dyuthi', 'Ebrima', 'Ebrima Bold', 'Electron', 'Ellinia CLM', 'EmojiOne Mozilla', 'Estrangelo Edessa', 'EucrosiaUPC', 'EucrosiaUPC Bold', 'EucrosiaUPC Bold Italic', 'EucrosiaUPC Italic', 'Euphemia', 'Euphemia UCAS', 'Euphemia UCAS Bold', 'Euphemia UCAS Italic', 'Ezra SIL', 'Ezra SIL SR', 'FangSong', 'Farah', 'Farah Regular', 'Farisi', 'Farisi Regular', 'Frank Ruehl CLM', 'FrankRuehl', 'Franklin Gothic Medium', 'Franklin Gothic Medium Italic', 'FreeMono', 'FreeSans', 'FreeSerif', 'FreesiaUPC', 'FreesiaUPC Bold', 'FreesiaUPC Bold Italic', 'FreesiaUPC Italic', 'Furat', 'Futura', 'Futura Bold', 'Futura Condensed ExtraBold', 'Futura Condensed Medium', 'Futura Medium', 'Futura Medium Italic', 'GB18030 Bitmap', 'Gabriola', 'Gadugi', 'Gadugi Bold', 'Gargi', 'Garuda', 'Gautami', 'Gautami Bold', 'Gayathri', 'Gayathri Thin', 'Geeza Pro', 'Geeza Pro Bold', 'Geeza Pro Regular', 'Geneva', 'Geneva CY', 'Georgia', 'Georgia Bold', 'Georgia Bold Italic', 'Georgia Italic', 'Georgia Pro', 'Georgia Pro Black', 'Georgia Pro Black Italic', 'Georgia Pro Bold', 'Georgia Pro Bold Italic', 'Georgia Pro Cond', 'Georgia Pro Cond Black', 'Georgia Pro Cond Black Italic', 'Georgia Pro Cond Bold', 'Georgia Pro Cond Bold Italic', 'Georgia Pro Cond Italic', 'Georgia Pro Cond Light', 'Georgia Pro Cond Light Italic', 'Georgia Pro Cond Semibold', 'Georgia Pro Cond Semibold Italic', 'Georgia Pro Italic', 'Georgia Pro Light', 'Georgia Pro Light Italic', 'Georgia Pro Semibold', 'Georgia Pro Semibold Italic', 'Gill Sans', 'Gill Sans Bold', 'Gill Sans Bold Italic', 'Gill Sans Italic', 'Gill Sans Light', 'Gill Sans Light Italic', 'Gill Sans Nova', 'Gill Sans Nova Bold', 'Gill Sans Nova Bold Italic', 'Gill Sans Nova Cond', 'Gill Sans Nova Cond Bold', 'Gill Sans Nova Cond Bold Italic', 'Gill Sans Nova Cond Italic', 'Gill Sans Nova Cond Lt', 'Gill Sans Nova Cond Lt Italic', 'Gill Sans Nova Cond Ultra Bold', 'Gill Sans Nova Cond XBd', 'Gill Sans Nova Cond XBd Italic', 'Gill Sans Nova Italic', 'Gill Sans Nova Light', 'Gill Sans Nova Light Italic', 'Gill Sans Nova Ultra Bold', 'Gill Sans SemiBold', 'Gill Sans SemiBold Italic', 'Gill Sans UltraBold', 'Gisha', 'Gisha Bold', 'Granada', 'Graph', 'Gubbi', 'Gujarati MT', 'Gujarati MT Bold', 'Gujarati Sangam MN', 'Gujarati Sangam MN Bold', 'Gulim', 'GulimChe', 'GungSeo Regular', 'Gungsuh', 'GungsuhChe', 'Gurmukhi MN', 'Gurmukhi MN Bold', 'Gurmukhi MT', 'Gurmukhi Sangam MN', 'Gurmukhi Sangam MN Bold', 'Hadasim CLM', 'Hani', 'Hannotate SC Bold', 'Hannotate SC Regular', 'Hannotate TC Bold', 'Hannotate TC Regular', 'HanziPen SC Bold', 'HanziPen SC Regular', 'HanziPen TC Bold', 'HanziPen TC Regular', 'Haramain', 'HeadLineA Regular', 'Hei Regular', 'Heiti SC', 'Heiti SC Light', 'Heiti SC Medium', 'Heiti TC', 'Heiti TC Light', 'Heiti TC Medium', 'Helvetica', 'Helvetica Bold', 'Helvetica Bold Oblique', 'Helvetica CY Bold', 'Helvetica CY BoldOblique', 'Helvetica CY Oblique', 'Helvetica CY Plain', 'Helvetica Light', 'Helvetica Light Oblique', 'Helvetica Neue', 'Helvetica Neue Bold', 'Helvetica Neue Bold Italic', 'Helvetica Neue Condensed Black', 'Helvetica Neue Condensed Bold', 'Helvetica Neue Italic', 'Helvetica Neue Light', 'Helvetica Neue Light Italic', 'Helvetica Neue Medium', 'Helvetica Neue Medium Italic', 'Helvetica Neue Thin', 'Helvetica Neue Thin Italic', 'Helvetica Neue UltraLight', 'Helvetica Neue UltraLight Italic', 'Helvetica Oblique', 'Herculanum', 'Hiragino Kaku Gothic Pro W3', 'Hiragino Kaku Gothic Pro W6', 'Hiragino Kaku Gothic ProN', 'Hiragino Kaku Gothic ProN W3', 'Hiragino Kaku Gothic ProN W6', 'Hiragino Kaku Gothic Std W8', 'Hiragino Kaku Gothic StdN W8', 'Hiragino Maru Gothic Pro W4', 'Hiragino Maru Gothic ProN', 'Hiragino Maru Gothic ProN W4', 'Hiragino Mincho Pro W3', 'Hiragino Mincho Pro W6', 'Hiragino Mincho ProN', 'Hiragino Mincho ProN W3', 'Hiragino Mincho ProN W6', 'Hiragino Sans', 'Hiragino Sans CNS W3', 'Hiragino Sans CNS W6', 'Hiragino Sans GB', 'Hiragino Sans GB W3', 'Hiragino Sans GB W6', 'Hiragino Sans W0', 'Hiragino Sans W1', 'Hiragino Sans W2', 'Hiragino Sans W3', 'Hiragino Sans W4', 'Hiragino Sans W5', 'Hiragino Sans W6', 'Hiragino Sans W7', 'Hiragino Sans W8', 'Hiragino Sans W9', 'Hoefler Text', 'Hoefler Text Black', 'Hoefler Text Black Italic', 'Hoefler Text Italic', 'Hoefler Text Ornaments', 'HoloLens MDL2 Assets', 'Homa', 'Hor', 'ITF Devanagari', 'ITF Devanagari Bold', 'ITF Devanagari Book', 'ITF Devanagari Demi', 'ITF Devanagari Light', 'ITF Devanagari Marathi', 'ITF Devanagari Marathi Bold', 'ITF Devanagari Marathi Book', 'ITF Devanagari Marathi Demi', 'ITF Devanagari Marathi Light', 'ITF Devanagari Marathi Medium', 'ITF Devanagari Medium', 'Impact', 'InaiMathi', 'InaiMathi Bold', 'Ink Free', 'Iowan Old Style Black', 'Iowan Old Style Black Italic', 'Iowan Old Style Bold', 'Iowan Old Style Bold Italic', 'Iowan Old Style Italic', 'Iowan Old Style Roman', 'Iowan Old Style Titling', 'IrisUPC', 'IrisUPC Bold', 'IrisUPC Bold Italic', 'IrisUPC Italic', 'Iskoola Pota', 'Iskoola Pota Bold', 'Jamrul', 'Japan', 'JasmineUPC', 'JasmineUPC Bold', 'JasmineUPC Bold Italic', 'JasmineUPC Italic', 'Javanese Text', 'Jet', 'Jomolhari', 'KacstArt', 'KacstBook', 'KacstDecorative', 'KacstDigital', 'KacstFarsi', 'KacstLetter', 'KacstNaskh', 'KacstOffice', 'KacstOne', 'KacstPen', 'KacstPoster', 'KacstQurn', 'KacstScreen', 'KacstTitle', 'KacstTitleL', 'Kai Regular', 'KaiTi', 'Kailasa', 'Kailasa Bold', 'Kailasa Regular', 'Kaiti SC Black', 'Kaiti SC Bold', 'Kaiti SC Regular', 'Kaiti TC Black', 'Kaiti TC Bold', 'Kaiti TC Regular', 'Kalapi', 'Kalimati', 'Kalinga', 'Kalinga Bold', 'Kannada MN', 'Kannada MN Bold', 'Kannada Sangam MN', 'Kannada Sangam MN Bold', 'Kartika', 'Kartika Bold', 'Karumbi', 'Kayrawan', 'Kefa', 'Kefa Bold', 'Kefa Regular', 'Keraleeyam', 'Keter YG', 'Keyboard', 'Khalid', 'Khmer MN', 'Khmer MN Bold', 'Khmer OS', 'Khmer OS Battambang', 'Khmer OS Bokor', 'Khmer OS Content', 'Khmer OS Fasthand', 'Khmer OS Freehand', 'Khmer OS Metal Chrieng', 'Khmer OS Muol', 'Khmer OS Muol Light', 'Khmer OS Muol Pali', 'Khmer OS Siemreap', 'Khmer OS System', 'Khmer Sangam MN', 'Khmer UI', 'Khmer UI Bold', 'Kinnari', 'Klee Demibold', 'Klee Medium', 'KodchiangUPC', 'KodchiangUPC Bold', 'KodchiangUPC Bold Italic', 'KodchiangUPC Italic', 'Kohinoor Bangla', 'Kohinoor Bangla Bold', 'Kohinoor Bangla Light', 'Kohinoor Bangla Medium', 'Kohinoor Bangla Semibold', 'Kohinoor Devanagari', 'Kohinoor Devanagari Bold', 'Kohinoor Devanagari Light', 'Kohinoor Devanagari Medium', 'Kohinoor Devanagari Regular', 'Kohinoor Devanagari Semibold', 'Kohinoor Telugu', 'Kohinoor Telugu Bold', 'Kohinoor Telugu Light', 'Kohinoor Telugu Medium', 'Kohinoor Telugu Semibold', 'Kokila', 'Kokila Bold', 'Kokila Bold Italic', 'Kokila Italic', 'Kokonor', 'Kokonor Regular', 'Krungthep', 'KufiStandardGK', 'KufiStandardGK Regular', 'LKLUG', 'Laksaman', 'Lantinghei SC Demibold', 'Lantinghei SC Extralight', 'Lantinghei SC Heavy', 'Lantinghei TC Demibold', 'Lantinghei TC Extralight', 'Lantinghei TC Heavy', 'Lao MN', 'Lao MN Bold', 'Lao Sangam MN', 'Lao UI', 'Lao UI Bold', 'LastResort', 'Latha', 'Latha Bold', 'Leelawadee', 'Leelawadee Bold', 'Leelawadee UI', 'Leelawadee UI Bold', 'Leelawadee UI Semilight', 'Levenim MT', 'Levenim MT Bold', 'LiHei Pro', 'LiSong Pro', 'Liberation Mono', 'Liberation Sans', 'Liberation Sans Narrow', 'Liberation Serif', 'Libian SC Regular', 'Libian TC Regular', 'Likhan', 'LilyUPC', 'LilyUPC Bold', 'LilyUPC Bold Italic', 'LilyUPC Italic', 'LingWai SC Medium', 'LingWai TC Medium', 'Lohit Assamese', 'Lohit Bengali', 'Lohit Devanagari', 'Lohit Gujarati', 'Lohit Gurmukhi', 'Lohit Kannada', 'Lohit Malayalam', 'Lohit Odia', 'Lohit Tamil', 'Lohit Tamil Classical', 'Lohit Telugu', 'Loma', 'Lucida Console', 'Lucida Grande', 'Lucida Grande Bold', 'Lucida Sans Unicode', 'Luminari', 'MS Gothic', 'MS Mincho', 'MS PGothic', 'MS PMincho', 'MS Sans Serif', 'MS Serif', 'MS UI Gothic', 'MV Boli', 'Malayalam MN', 'Malayalam MN Bold', 'Malayalam Sangam MN', 'Malayalam Sangam MN Bold', 'Malgun Gothic', 'Malgun Gothic Bold', 'Malgun Gothic Semilight', 'Mangal', 'Mangal Bold', 'Manjari', 'Manjari Thin', 'Marion Bold', 'Marion Italic', 'Marion Regular', 'Marker Felt', 'Marker Felt Thin', 'Marker Felt Wide', 'Marlett', 'Mashq', 'Mashq-Bold', 'Meera', 'Meiryo', 'Meiryo Bold', 'Meiryo Bold Italic', 'Meiryo Italic', 'Meiryo UI', 'Meiryo UI Bold', 'Meiryo UI Bold Italic', 'Meiryo UI Italic', 'Menlo', 'Menlo Bold', 'Menlo Bold Italic', 'Menlo Italic', 'Menlo Regular', 'Metal', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft JhengHei Bold', 'Microsoft JhengHei Light', 'Microsoft JhengHei Regular', 'Microsoft JhengHei UI', 'Microsoft JhengHei UI Bold', 'Microsoft JhengHei UI Light', 'Microsoft JhengHei UI Regular', 'Microsoft New Tai Lue', 'Microsoft New Tai Lue Bold', 'Microsoft PhagsPa', 'Microsoft PhagsPa Bold', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft Tai Le Bold', 'Microsoft Uighur', 'Microsoft Uighur Bold', 'Microsoft YaHei', 'Microsoft YaHei Bold', 'Microsoft YaHei Light', 'Microsoft YaHei UI', 'Microsoft YaHei UI Bold', 'Microsoft YaHei UI Light', 'Microsoft Yi Baiti', 'MingLiU', 'MingLiU-ExtB', 'MingLiU_HKSCS', 'MingLiU_HKSCS-ExtB', 'Mingzat', 'Miriam', 'Miriam CLM', 'Miriam Fixed', 'Miriam Mono CLM', 'Mishafi', 'Mishafi Gold', 'Mishafi Gold Regular', 'Mishafi Regular', 'Mitra Mono', 'Monaco', 'Mongolian Baiti', 'Montserrat', 'Montserrat Black', 'Montserrat ExtraBold', 'Montserrat ExtraLight', 'Montserrat Light', 'Montserrat Medium', 'Montserrat SemiBold', 'Montserrat Thin', 'MoolBoran', 'Mshtakan', 'Mshtakan Bold', 'Mshtakan BoldOblique', 'Mshtakan Oblique', 'Mukti Narrow', 'Mukti Narrow Bold', 'Muna', 'Muna Black', 'Muna Bold', 'Muna Regular', 'Myanmar MN', 'Myanmar MN Bold', 'Myanmar Sangam MN', 'Myanmar Sangam MN Bold', 'Myanmar Text', 'Myanmar Text Bold', 'Myriad Arabic', 'Myriad Arabic Black', 'Myriad Arabic Black Italic', 'Myriad Arabic Bold', 'Myriad Arabic Bold Italic', 'Myriad Arabic Italic', 'Myriad Arabic Light', 'Myriad Arabic Light Italic', 'Myriad Arabic Semibold', 'Myriad Arabic Semibold Italic', 'NSimSun', 'Nachlieli CLM', 'Nada', 'Nadeem', 'Nadeem Regular', 'Nagham', 'Nakula', 'Nanum Brush Script', 'Nanum Pen Script', 'NanumGothic', 'NanumGothic Bold', 'NanumGothic ExtraBold', 'NanumMyeongjo', 'NanumMyeongjo Bold', 'NanumMyeongjo ExtraBold', 'Narkisim', 'Navilu', 'Nazli', 'Neue Haas Grotesk Text Pro', 'Neue Haas Grotesk Text Pro Bold', 'Neue Haas Grotesk Text Pro Bold Italic', 'Neue Haas Grotesk Text Pro Italic', 'Neue Haas Grotesk Text Pro Medium', 'Neue Haas Grotesk Text Pro Medium Italic', 'New Peninim MT', 'New Peninim MT Bold', 'New Peninim MT Bold Inclined', 'New Peninim MT Inclined', 'Nice', 'Nimbus Mono L', 'Nimbus Mono PS', 'Nimbus Roman', 'Nimbus Roman No9 L', 'Nimbus Sans', 'Nimbus Sans L', 'Nimbus Sans Narrow', 'Nirmala UI', 'Nirmala UI Bold', 'Nirmala UI Semilight', 'Norasi', 'Noteworthy', 'Noteworthy Bold', 'Noteworthy Light', 'Noto Color Emoji', 'Noto Emoji', 'Noto Kufi Arabic', 'Noto Mono', 'Noto Naskh Arabic', 'Noto Nastaliq Urdu', 'Noto Sans', 'Noto Sans Adlam', 'Noto Sans Adlam Unjoined', 'Noto Sans Anatolian Hieroglyphs', 'Noto Sans Arabic', 'Noto Sans Armenian', 'Noto Sans Avestan', 'Noto Sans Balinese', 'Noto Sans Bamum', 'Noto Sans Batak', 'Noto Sans Bengali', 'Noto Sans Brahmi', 'Noto Sans Buginese', 'Noto Sans Buhid', 'Noto Sans CJK HK', 'Noto Sans CJK HK Black', 'Noto Sans CJK HK DemiLight', 'Noto Sans CJK HK Light', 'Noto Sans CJK HK Medium', 'Noto Sans CJK HK Thin', 'Noto Sans CJK JP', 'Noto Sans CJK JP Black', 'Noto Sans CJK JP DemiLight', 'Noto Sans CJK JP Light', 'Noto Sans CJK JP Medium', 'Noto Sans CJK JP Thin', 'Noto Sans CJK KR', 'Noto Sans CJK KR Black', 'Noto Sans CJK KR DemiLight', 'Noto Sans CJK KR Light', 'Noto Sans CJK KR Medium', 'Noto Sans CJK KR Thin', 'Noto Sans CJK SC', 'Noto Sans CJK SC Black', 'Noto Sans CJK SC DemiLight', 'Noto Sans CJK SC Light', 'Noto Sans CJK SC Medium', 'Noto Sans CJK SC Regular', 'Noto Sans CJK SC Thin', 'Noto Sans CJK TC', 'Noto Sans CJK TC Black', 'Noto Sans CJK TC DemiLight', 'Noto Sans CJK TC Light', 'Noto Sans CJK TC Medium', 'Noto Sans CJK TC Thin', 'Noto Sans Canadian Aboriginal', 'Noto Sans Carian', 'Noto Sans Chakma', 'Noto Sans Cham', 'Noto Sans Cherokee', 'Noto Sans Coptic', 'Noto Sans Cuneiform', 'Noto Sans Cypriot', 'Noto Sans Deseret', 'Noto Sans Devanagari', 'Noto Sans Display', 'Noto Sans Egyptian Hieroglyphs', 'Noto Sans Ethiopic', 'Noto Sans Georgian', 'Noto Sans Glagolitic', 'Noto Sans Gothic', 'Noto Sans Gujarati', 'Noto Sans Gurmukhi', 'Noto Sans Hanunoo', 'Noto Sans Hebrew', 'Noto Sans Imperial Aramaic', 'Noto Sans Inscriptional Pahlavi', 'Noto Sans Inscriptional Parthian', 'Noto Sans JP Regular', 'Noto Sans Javanese', 'Noto Sans KR Regular', 'Noto Sans Kaithi', 'Noto Sans Kannada', 'Noto Sans Kayah Li', 'Noto Sans Kharoshthi', 'Noto Sans Khmer', 'Noto Sans Lao', 'Noto Sans Lepcha', 'Noto Sans Limbu', 'Noto Sans Linear B', 'Noto Sans Lisu', 'Noto Sans Lycian', 'Noto Sans Lydian', 'Noto Sans Malayalam', 'Noto Sans Mandaic', 'Noto Sans Meetei Mayek', 'Noto Sans Mongolian', 'Noto Sans Mono', 'Noto Sans Mono CJK HK', 'Noto Sans Mono CJK JP', 'Noto Sans Mono CJK KR', 'Noto Sans Mono CJK SC', 'Noto Sans Mono CJK TC', 'Noto Sans Myanmar', 'Noto Sans NKo', 'Noto Sans New Tai Lue', 'Noto Sans Ogham', 'Noto Sans Ol Chiki', 'Noto Sans Old Italic', 'Noto Sans Old Persian', 'Noto Sans Old South Arabian', 'Noto Sans Old Turkic', 'Noto Sans Oriya', 'Noto Sans Osage', 'Noto Sans Osmanya', 'Noto Sans Phags Pa', 'Noto Sans Phoenician', 'Noto Sans Rejang', 'Noto Sans Runic', 'Noto Sans SC Regular', 'Noto Sans Samaritan', 'Noto Sans Saurashtra', 'Noto Sans Shavian', 'Noto Sans Sinhala', 'Noto Sans Sundanese', 'Noto Sans Syloti Nagri', 'Noto Sans Symbols', 'Noto Sans Symbols2', 'Noto Sans Syriac Eastern', 'Noto Sans Syriac Estrangela', 'Noto Sans Syriac Western', 'Noto Sans TC Regular', 'Noto Sans Tagalog', 'Noto Sans Tagbanwa', 'Noto Sans Tai Le', 'Noto Sans Tai Tham', 'Noto Sans Tai Viet', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Thaana', 'Noto Sans Thai', 'Noto Sans Tibetan', 'Noto Sans Tifinagh', 'Noto Sans Ugaritic', 'Noto Sans Vai', 'Noto Sans Yi', 'Noto Serif', 'Noto Serif Armenian', 'Noto Serif Bengali', 'Noto Serif CJK JP', 'Noto Serif CJK JP Black', 'Noto Serif CJK JP ExtraLight', 'Noto Serif CJK JP Light', 'Noto Serif CJK JP Medium', 'Noto Serif CJK JP SemiBold', 'Noto Serif CJK KR', 'Noto Serif CJK KR Black', 'Noto Serif CJK KR ExtraLight', 'Noto Serif CJK KR Light', 'Noto Serif CJK KR Medium', 'Noto Serif CJK KR SemiBold', 'Noto Serif CJK SC', 'Noto Serif CJK SC Black', 'Noto Serif CJK SC ExtraLight', 'Noto Serif CJK SC Light', 'Noto Serif CJK SC Medium', 'Noto Serif CJK SC SemiBold', 'Noto Serif CJK TC', 'Noto Serif CJK TC Black', 'Noto Serif CJK TC ExtraLight', 'Noto Serif CJK TC Light', 'Noto Serif CJK TC Medium', 'Noto Serif CJK TC SemiBold', 'Noto Serif Devanagari', 'Noto Serif Display', 'Noto Serif Ethiopic', 'Noto Serif Georgian', 'Noto Serif Gujarati', 'Noto Serif Hebrew', 'Noto Serif Kannada', 'Noto Serif Khmer', 'Noto Serif Lao', 'Noto Serif Malayalam', 'Noto Serif Myanmar', 'Noto Serif Sinhala', 'Noto Serif Tamil', 'Noto Serif Telugu', 'Noto Serif Thai', 'Nuosu SIL', 'Nyala', 'OpenSymbol', 'Optima', 'Optima Bold', 'Optima Bold Italic', 'Optima ExtraBlack', 'Optima Italic', 'Optima Regular', 'Oriya MN', 'Oriya MN Bold', 'Oriya Sangam MN', 'Oriya Sangam MN Bold', 'Osaka', 'Osaka-Mono', 'Ostorah', 'Ouhod', 'Ouhod-Bold', 'P052', 'PCMyungjo Regular', 'PMingLiU', 'PMingLiU-ExtB', 'PT Mono', 'PT Mono Bold', 'PT Sans', 'PT Sans Bold', 'PT Sans Bold Italic', 'PT Sans Caption', 'PT Sans Caption Bold', 'PT Sans Italic', 'PT Sans Narrow', 'PT Sans Narrow Bold', 'PT Serif', 'PT Serif Bold', 'PT Serif Bold Italic', 'PT Serif Caption', 'PT Serif Caption Italic', 'PT Serif Italic', 'Padauk', 'Padauk Book', 'Pagul', 'PakType Naskh Basic', 'Palatino', 'Palatino Bold', 'Palatino Bold Italic', 'Palatino Italic', 'Palatino Linotype', 'Palatino Linotype Bold', 'Palatino Linotype Bold Italic', 'Palatino Linotype Italic', 'Papyrus', 'Papyrus Condensed', 'Petra', 'Phetsarath OT', 'Phosphate', 'Phosphate Inline', 'Phosphate Solid', 'PilGi Regular', 'PingFang HK', 'PingFang HK Light', 'PingFang HK Medium', 'PingFang HK Regular', 'PingFang HK Semibold', 'PingFang HK Thin', 'PingFang HK Ultralight', 'PingFang SC', 'PingFang SC Light', 'PingFang SC Medium', 'PingFang SC Regular', 'PingFang SC Semibold', 'PingFang SC Thin', 'PingFang SC Ultralight', 'PingFang TC', 'PingFang TC Light', 'PingFang TC Medium', 'PingFang TC Regular', 'PingFang TC Semibold', 'PingFang TC Thin', 'PingFang TC Ultralight', 'Plantagenet Cherokee', 'Pothana2000', 'Purisa', 'Raanana', 'Raanana Bold', 'Raavi', 'Raavi Bold', 'Rachana', 'RaghuMalayalamSans', 'Rasa', 'Rasa Light', 'Rasa Medium', 'Rasa SemiBold', 'Rasheeq', 'Rasheeq-Bold', 'Rehan', 'Rekha', 'Roboto', 'Roboto Condensed', 'Rockwell', 'Rockwell Bold', 'Rockwell Bold Italic', 'Rockwell Italic', 'Rockwell Nova', 'Rockwell Nova Bold', 'Rockwell Nova Bold Italic', 'Rockwell Nova Cond', 'Rockwell Nova Cond Bold', 'Rockwell Nova Cond Bold Italic', 'Rockwell Nova Cond Italic', 'Rockwell Nova Cond Light', 'Rockwell Nova Cond Light Italic', 'Rockwell Nova Extra Bold', 'Rockwell Nova Extra Bold Italic', 'Rockwell Nova Italic', 'Rockwell Nova Light Italic', 'Rockwell Nova Rockwell', 'Rod', 'Roman', 'STFangsong', 'STHeiti', 'STIX', 'STIX Math', 'STIX Two Math', 'STIX Two Text', 'STIX Two Text Bold', 'STIX Two Text Bold Italic', 'STIX Two Text Italic', 'STIXGeneral', 'STIXGeneral-Bold', 'STIXGeneral-BoldItalic', 'STIXGeneral-Italic', 'STIXGeneral-Regular', 'STIXIntegralsD', 'STIXIntegralsD-Bold', 'STIXIntegralsD-Regular', 'STIXIntegralsSm', 'STIXIntegralsSm-Bold', 'STIXIntegralsSm-Regular', 'STIXIntegralsUp', 'STIXIntegralsUp-Bold', 'STIXIntegralsUp-Regular', 'STIXIntegralsUpD', 'STIXIntegralsUpD-Bold', 'STIXIntegralsUpD-Regular', 'STIXIntegralsUpSm', 'STIXIntegralsUpSm-Bold', 'STIXIntegralsUpSm-Regular', 'STIXNonUnicode', 'STIXNonUnicode-Bold', 'STIXNonUnicode-BoldItalic', 'STIXNonUnicode-Italic', 'STIXNonUnicode-Regular', 'STIXSizeFiveSym', 'STIXSizeFiveSym-Regular', 'STIXSizeFourSym', 'STIXSizeFourSym-Bold', 'STIXSizeFourSym-Regular', 'STIXSizeOneSym', 'STIXSizeOneSym-Bold', 'STIXSizeOneSym-Regular', 'STIXSizeThreeSym', 'STIXSizeThreeSym-Bold', 'STIXSizeThreeSym-Regular', 'STIXSizeTwoSym', 'STIXSizeTwoSym-Bold', 'STIXSizeTwoSym-Regular', 'STIXVariants', 'STIXVariants-Bold', 'STIXVariants-Regular', 'STKaiti', 'STSong', 'STXihei', 'Saab', 'Sahadeva', 'Sakkal Majalla', 'Sakkal Majalla Bold', 'Salem', 'Samanata', 'Samyak Devanagari', 'Samyak Gujarati', 'Samyak Malayalam', 'Samyak Tamil', 'Sana', 'Sana Regular', 'Sanskrit Text', 'Sarai', 'Sathu', 'Savoye LET', 'Savoye LET Plain CC.:1.0', 'Savoye LET Plain:1.0', 'Sawasdee', 'Scheherazade', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Print Bold', 'Segoe Pseudo', 'Segoe Script', 'Segoe Script Bold', 'Segoe UI', 'Segoe UI Black', 'Segoe UI Black Italic', 'Segoe UI Bold', 'Segoe UI Bold Italic', 'Segoe UI Emoji', 'Segoe UI Historic', 'Segoe UI Italic', 'Segoe UI Light', 'Segoe UI Light Italic', 'Segoe UI Semibold', 'Segoe UI Semibold Italic', 'Segoe UI Semilight', 'Segoe UI Semilight Italic', 'Segoe UI Symbol', 'Seravek', 'Seravek Bold', 'Seravek Bold Italic', 'Seravek ExtraLight', 'Seravek ExtraLight Italic', 'Seravek Italic', 'Seravek Light', 'Seravek Light Italic', 'Seravek Medium', 'Seravek Medium Italic', 'Shado', 'Sharjah', 'Shofar', 'Shonar Bangla', 'Shonar Bangla Bold', 'Shree Devanagari 714', 'Shree Devanagari 714 Bold', 'Shree Devanagari 714 Bold Italic', 'Shree Devanagari 714 Italic', 'Shruti', 'Shruti Bold', 'SignPainter', 'SignPainter-HouseScript', 'SignPainter-HouseScript Semibold', 'Silom', 'SimHei', 'SimSun', 'SimSun-ExtB', 'Simple CLM', 'Simplified Arabic', 'Simplified Arabic Bold', 'Simplified Arabic Fixed', 'Sindbad', 'Sinhala MN', 'Sinhala MN Bold', 'Sinhala Sangam MN', 'Sinhala Sangam MN Bold', 'Sitka Banner', 'Sitka Banner Bold', 'Sitka Banner Bold Italic', 'Sitka Banner Italic', 'Sitka Display', 'Sitka Display Bold', 'Sitka Display Bold Italic', 'Sitka Display Italic', 'Sitka Heading', 'Sitka Heading Bold', 'Sitka Heading Bold Italic', 'Sitka Heading Italic', 'Sitka Small', 'Sitka Small Bold', 'Sitka Small Bold Italic', 'Sitka Small Italic', 'Sitka Subheading', 'Sitka Subheading Bold', 'Sitka Subheading Bold Italic', 'Sitka Subheading Italic', 'Sitka Text', 'Sitka Text Bold', 'Sitka Text Bold Italic', 'Sitka Text Italic', 'Skia', 'Skia Black', 'Skia Black Condensed', 'Skia Black Extended', 'Skia Bold', 'Skia Condensed', 'Skia Extended', 'Skia Light', 'Skia Light Condensed', 'Skia Light Extended', 'Skia Regular', 'Small Fonts', 'Snell Roundhand', 'Snell Roundhand Black', 'Snell Roundhand Bold', 'Songti SC', 'Songti SC Black', 'Songti SC Bold', 'Songti SC Light', 'Songti SC Regular', 'Songti TC', 'Songti TC Bold', 'Songti TC Light', 'Songti TC Regular', 'Source Code Pro', 'Source Code Pro Black', 'Source Code Pro ExtraLight', 'Source Code Pro Light', 'Source Code Pro Medium', 'Source Code Pro Semibold', 'Stam Ashkenaz CLM', 'Stam Sefarad CLM', 'Standard Symbols L', 'Standard Symbols PS', 'Sukhumvit Set', 'Sukhumvit Set Bold', 'Sukhumvit Set Light', 'Sukhumvit Set Medium', 'Sukhumvit Set Semi Bold', 'Sukhumvit Set Text', 'Sukhumvit Set Thin', 'Superclarendon Black', 'Superclarendon Black Italic', 'Superclarendon Bold', 'Superclarendon Bold Italic', 'Superclarendon Italic', 'Superclarendon Light', 'Superclarendon Light Italic', 'Superclarendon Regular', 'Suruma', 'Sylfaen', 'Symbol', 'Symbola', 'System Font Bold', 'System Font Regular', 'Tahoma', 'Tahoma Bold', 'Tahoma Negreta', 'Tamil MN', 'Tamil MN Bold', 'Tamil Sangam MN', 'Tamil Sangam MN Bold', 'Tarablus', 'Telugu MN', 'Telugu MN Bold', 'Telugu Sangam MN', 'Telugu Sangam MN Bold', 'Tholoth', 'Thonburi', 'Thonburi Bold', 'Thonburi Light', 'Tibetan Machine Uni', 'Times', 'Times Bold', 'Times Bold Italic', 'Times Italic', 'Times New Roman', 'Times New Roman Bold', 'Times New Roman Bold Italic', 'Times New Roman Italic', 'Times Roman', 'Tinos', 'Titr', 'Tlwg Mono', 'Tlwg Typewriter', 'Tlwg Typist', 'Tlwg Typo', 'Toppan Bunkyu Gothic Demibold', 'Toppan Bunkyu Gothic Regular', 'Toppan Bunkyu Midashi Gothic Extrabold', 'Toppan Bunkyu Midashi Mincho Extrabold', 'Toppan Bunkyu Mincho Regular', 'Traditional Arabic', 'Traditional Arabic Bold', 'Trattatello', 'Trebuchet MS', 'Trebuchet MS Bold', 'Trebuchet MS Bold Italic', 'Trebuchet MS Italic', 'Tsukushi A Round Gothic Bold', 'Tsukushi A Round Gothic Regular', 'Tsukushi B Round Gothic Bold', 'Tsukushi B Round Gothic Regular', 'Tunga', 'Tunga Bold', 'Twemoji Mozilla', 'UD Digi Kyokasho', 'UD Digi Kyokasho N-B', 'UD Digi Kyokasho N-R', 'UD Digi Kyokasho NK-B', 'UD Digi Kyokasho NK-R', 'UD Digi Kyokasho NP-B', 'UD Digi Kyokasho NP-R', 'UKIJ 3D', 'UKIJ Basma', 'UKIJ Bom', 'UKIJ CJK', 'UKIJ Chechek', 'UKIJ Chiwer Kesme', 'UKIJ Diwani', 'UKIJ Diwani Kawak', 'UKIJ Diwani Tom', 'UKIJ Diwani Yantu', 'UKIJ Ekran', 'UKIJ Elipbe', 'UKIJ Elipbe_Chekitlik', 'UKIJ Esliye', 'UKIJ Esliye Chiwer', 'UKIJ Esliye Neqish', 'UKIJ Esliye Qara', 'UKIJ Esliye Tom', 'UKIJ Imaret', 'UKIJ Inchike', 'UKIJ Jelliy', 'UKIJ Junun', 'UKIJ Kawak', 'UKIJ Kawak 3D', 'UKIJ Kesme', 'UKIJ Kesme Tuz', 'UKIJ Kufi', 'UKIJ Kufi 3D', 'UKIJ Kufi Chiwer', 'UKIJ Kufi Gul', 'UKIJ Kufi Kawak', 'UKIJ Kufi Tar', 'UKIJ Kufi Uz', 'UKIJ Kufi Yay', 'UKIJ Kufi Yolluq', 'UKIJ Mejnun', 'UKIJ Mejnuntal', 'UKIJ Merdane', 'UKIJ Moy Qelem', 'UKIJ Nasq', 'UKIJ Nasq Zilwa', 'UKIJ Orqun Basma', 'UKIJ Orqun Yazma', 'UKIJ Orxun-Yensey', 'UKIJ Qara', 'UKIJ Qolyazma', 'UKIJ Qolyazma Tez', 'UKIJ Qolyazma Tuz', 'UKIJ Qolyazma Yantu', 'UKIJ Ruqi', 'UKIJ Saet', 'UKIJ Sulus', 'UKIJ Sulus Tom', 'UKIJ Teng', 'UKIJ Tiken', 'UKIJ Title', 'UKIJ Tor', 'UKIJ Tughra', 'UKIJ Tuz', 'UKIJ Tuz Basma', 'UKIJ Tuz Gezit', 'UKIJ Tuz Kitab', 'UKIJ Tuz Neqish', 'UKIJ Tuz Qara', 'UKIJ Tuz Tom', 'UKIJ Tuz Tor', 'UKIJ Zilwa', 'UKIJ_Mac Basma', 'UKIJ_Mac Ekran', 'URW Bookman', 'URW Bookman L', 'URW Chancery L', 'URW Gothic', 'URW Gothic L', 'URW Palladio L', 'Ubuntu', 'Ubuntu Condensed', 'Ubuntu Light', 'Ubuntu Mono', 'Ubuntu Thin', 'Umpush', 'Urdu Typesetting', 'Urdu Typesetting Bold', 'Uroob', 'Utsaah', 'Utsaah Bold', 'Utsaah Bold Italic', 'Utsaah Italic', 'Vani', 'Vani Bold', 'Vemana2000', 'Verdana', 'Verdana Bold', 'Verdana Bold Italic', 'Verdana Italic', 'Verdana Pro', 'Verdana Pro Black', 'Verdana Pro Black Italic', 'Verdana Pro Bold', 'Verdana Pro Bold Italic', 'Verdana Pro Cond', 'Verdana Pro Cond Black', 'Verdana Pro Cond Black Italic', 'Verdana Pro Cond Bold', 'Verdana Pro Cond Bold Italic', 'Verdana Pro Cond Italic', 'Verdana Pro Cond Light', 'Verdana Pro Cond Light Italic', 'Verdana Pro Cond SemiBold', 'Verdana Pro Cond SemiBold Italic', 'Verdana Pro Italic', 'Verdana Pro Light', 'Verdana Pro Light Italic', 'Verdana Pro SemiBold', 'Verdana Pro SemiBold Italic', 'Vijaya', 'Vijaya Bold', 'Vrinda', 'Vrinda Bold', 'Waree', 'Waseem', 'Waseem Light', 'Waseem Regular', 'Wawati SC Regular', 'Wawati TC Regular', 'Webdings', 'Weibei SC Bold', 'Weibei TC Bold', 'Wingdings', 'Wingdings 2', 'Wingdings 3', 'Xingkai SC Bold', 'Xingkai SC Light', 'Xingkai TC Bold', 'Xingkai TC Light', 'Yehuda CLM', 'Yrsa', 'Yrsa Light', 'Yrsa Medium', 'Yrsa SemiBold', 'Yu Gothic', 'Yu Gothic Bold', 'Yu Gothic Light', 'Yu Gothic Medium', 'Yu Gothic Regular', 'Yu Gothic UI', 'Yu Gothic UI Bold', 'Yu Gothic UI Light', 'Yu Gothic UI Regular', 'Yu Gothic UI Semibold', 'Yu Gothic UI Semilight', 'Yu Mincho', 'Yu Mincho Demibold', 'Yu Mincho Light', 'Yu Mincho Regular', 'YuGothic Bold', 'YuGothic Medium', 'YuKyokasho Bold', 'YuKyokasho Medium', 'YuKyokasho Yoko Bold', 'YuKyokasho Yoko Medium', 'YuMincho +36p Kana Demibold', 'YuMincho +36p Kana Extrabold', 'YuMincho +36p Kana Medium', 'YuMincho Demibold', 'YuMincho Extrabold', 'YuMincho Medium', 'Yuanti SC Bold', 'Yuanti SC Light', 'Yuanti SC Regular', 'Yuanti TC Bold', 'Yuanti TC Light', 'Yuanti TC Regular', 'Yuppy SC Regular', 'Yuppy TC Regular', 'Z003', 'Zapf Dingbats', 'Zapfino', 'aakar', 'mry_KacstQurn', 'ori1Uni', 'padmaa', 'padmaa-Bold.1.1', 'padmmaa', 'utkal', 'מרים', 'गार्गी', 'नालिमाटी', 'অনি Dvf', 'মিত্র', 'মুক্তি', 'মুক্তি পাতনা', '宋体', '微软雅黑', '新細明體', '細明體', '굴림', '굴림체', '바탕', 'ＭＳ ゴシック', 'ＭＳ 明朝', 'ＭＳ Ｐゴシック', 'ＭＳ Ｐ明朝']

	// inspired by Lalit Patel's fontdetect.js
	// https://www.lalit.org/wordpress/wp-content/uploads/2008/05/fontdetect.js?ver=0.3

	const baseFonts = ['monospace', 'sans-serif', 'serif']
	// ...googleFonts,...notoFonts, ...extendedFontList
	const getList = () => [...new Set([
		...fontList,
		//...googleFonts,
		//...platformFonts,
		...extendedFontList,
		//...notoFonts
	])]
	const getListAll = () => [...new Set([
		...fontList,
		...googleFonts,
		...platformFonts,
		...extendedFontList,
		...notoFonts
	])]
	const list = getList()
	const listAll = getListAll()
	const families = list.reduce((acc, font) => {
		baseFonts.forEach(baseFont => acc.push(`'${font}', ${baseFont}`))
		return acc
	}, [])

	const getId = () => `font-fingerprint`
	const getChars = () => `mmmmmmmmmmlli`
	const div = document.createElement('div')
	div.setAttribute('id', getId())
	document.body.appendChild(div)

	const getTextMetrics = (context, font) => {
		context.font = `256px ${font}`
		const metrics = context.measureText(getChars())
		return {
			ascent: Math.round(metrics.actualBoundingBoxAscent),
			descent: Math.round(metrics.actualBoundingBoxDescent),
			left: Math.round(metrics.actualBoundingBoxLeft),
			right: Math.round(metrics.actualBoundingBoxRight),
			width: Math.round(metrics.width),
			fontAscent: Math.round(metrics.fontBoundingBoxAscent),
			fontDescent: Math.round(metrics.fontBoundingBoxDescent)
		}
	}

	const getTextMetricsFonts = async ({ context, baseFonts, families }) => {
		const { constructor: { name } } = context || {}
		const offscreen = /offscreen/i.test(''+name)
		const listLen = getList().length
		try {
			if (!context) {
				throw new Error(`Context blocked or not supported`)
			}
			await new Promise(setTimeout).catch(e => {})
			const start = performance.now()
			const detectedCombined = new Set()
			const detectedViaAscent = new Set()
			const detectedViaDescent = new Set()
			const detectedViaLeft = new Set()
			const detectedViaRight = new Set()
			const detectedViaWidth = new Set()
			const detectedViaFontAscent = new Set()
			const detectedViaFontDescent = new Set()
			const base = baseFonts.reduce((acc, font) => {
				acc[font] = getTextMetrics(context, font)
				return acc
			}, {})
			families.forEach(family => {
				const basefont = /, (.+)/.exec(family)[1]
				const dimensions = getTextMetrics(context, family)
				const font = /\'(.+)\'/.exec(family)[1]
				const support = (
					dimensions.ascent != base[basefont].ascent ||
					dimensions.descent != base[basefont].descent ||
					dimensions.left != base[basefont].left ||
					dimensions.right != base[basefont].right ||
					dimensions.width != base[basefont].width
				)
				const extraSupport = (
					dimensions.fontAscent != base[basefont].fontAscent ||
					dimensions.fontDescent != base[basefont].fontDescent
				)
				if (((!isNaN(dimensions.ascent) && !isNaN(dimensions.fontAscent)) && (support || extraSupport)) ||
					(!isNaN(dimensions.ascent) && support)) {
					detectedCombined.add(font)
				}
				if (!isNaN(dimensions.ascent) &&
					dimensions.ascent != base[basefont].ascent) {
					detectedViaAscent.add(font)
				}
				if (!isNaN(dimensions.descent) &&
					dimensions.descent != base[basefont].descent) {
					detectedViaDescent.add(font)
				}
				if (!isNaN(dimensions.left) &&
					dimensions.left != base[basefont].left) {
					detectedViaLeft.add(font)
				}
				if (!isNaN(dimensions.right) &&
					dimensions.right != base[basefont].right) {
					detectedViaRight.add(font)
				}
				if (!isNaN(dimensions.width) &&
					(dimensions.width != base[basefont].width)) {
					detectedViaWidth.add(font)
				}
				if (!isNaN(dimensions.fontAscent) &&
					(dimensions.fontAscent != base[basefont].fontAscent)
				) {
					detectedViaFontAscent.add(font)
				}
				if (!isNaN(dimensions.fontDescent) &&
					(dimensions.fontDescent != base[basefont].fontDescent)
				) {
					detectedViaFontDescent.add(font)
				}
				return
			})

			const fonts = {
				combined: [...detectedCombined],
				ascent: [...detectedViaAscent],
				descent: [...detectedViaDescent],
				left: [...detectedViaLeft],
				right: [...detectedViaRight],
				width: [...detectedViaWidth],
				fontAscent: [...detectedViaFontAscent],
				fontDescent: [...detectedViaFontDescent]
			}

			const perf = performance.now() - start
			patch(document.getElementById(`text-metrics${offscreen ? '-offscreen' : ''}`), html`
				<div class="col-six relative">
					<span class="aside-note">${perf.toFixed(2)}ms</span>
					<strong>TextMetrics${offscreen ? 'Offscreen' : ''}</strong>
					<div class="relative">combined: ${
						!!fonts.combined.length ?
							hashMini(fonts.combined) :
							note.blocked
						}
						<span class="aside-note total">${'' + fonts.combined.length}/${listLen}</span>
					</div>
					<div class="relative">ascent: ${
						!!fonts.ascent.length ?
							hashMini(fonts.ascent) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.ascent.length}/${listLen}</span>
					</div>
					<div class="relative">descent: ${
						!!fonts.descent.length ?
							hashMini(fonts.descent) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.descent.length}/${listLen}</span>
					</div>
					<div class="relative">left: ${
						!!fonts.left.length ?
							hashMini(fonts.left) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.left.length}/${listLen}</span>
					</div>
					<div class="relative">right: ${
						!!fonts.right.length ?
							hashMini(fonts.right) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.right.length}/${listLen}</span>
					</div>
					<div class="relative">width: ${
						!!fonts.width.length ?
							hashMini(fonts.width) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.width.length}/${listLen}</span>
					</div>
					<div class="relative">font ascent: ${
						!!fonts.fontAscent.length ?
							hashMini(fonts.fontAscent) :
							note.unsupported
						}
						<span class="aside-note">${'' + fonts.fontAscent.length}/${listLen}</span>
					</div>
					<div class="relative">font descent: ${
						!!fonts.fontDescent.length ?
							hashMini(fonts.fontDescent) :
							note.unsupported
						}
						<span class="aside-note">${'' + fonts.fontDescent.length}/${listLen}</span>
					</div>
				</div>
			`)

			return {
				fonts,
				perf
			}
		} catch (error) {
			console.error(error)
			return {
				fonts: {
					combined: [],
					ascent: [],
					descent: [],
					left: [],
					right: [],
					width: [],
					fontAscent: [],
					fontDescent: []
				},
				perf: 0
			}
		}
	}

	const getSVGDimensions = svgText => {
		const { width, height, y } = svgText.getBBox()
		const { width: charWidth, height: charHeight, y: charY } = svgText.getExtentOfChar(getChars()[0])
		const subString = svgText.getSubStringLength(1, 2)
		const textLen = svgText.getComputedTextLength()
		const dimensions = {
			width: Math.round(width), // SVGRect
			height: Math.round(height), // SVGRect
			y: Math.round(y), // SVGRect
			charWidth: Math.round(charWidth), // DOMRect
			charHeight: Math.round(charHeight), // DOMRect
			charY: Math.round(charY), // DOMRect
			subString: Math.round(subString), // Float
			textLen: Math.round(textLen) // Float
		}
		return dimensions
	}

	const getSVGFonts = async ({ baseFonts, families }) => {
		try {
			await new Promise(setTimeout).catch(e => {})
			const start = performance.now()
			const chars = getChars()
			const id = getId()
			document.getElementById(id).innerHTML = `
			<style>
				#${id}-svg-detector {
					position: absolute !important;
					left: -9999px!important;
					font-size: 256px !important;
					font-style: normal !important;
					font-weight: normal !important;
					letter-spacing: normal !important;
					line-break: auto !important;
					line-height: normal !important;
					text-transform: none !important;
					text-align: left !important;
					text-decoration: none !important;
					text-shadow: none !important;
					white-space: normal !important;
					word-break: normal !important;
					word-spacing: normal !important;
					font-family: var(--font);
				}
			</style>
			<svg viewBox="0 0 200 200">
				<text id="${id}-svg-detector">${chars}</text>
			</svg>
		`
			const svgText = document.getElementById(`${id}-svg-detector`)
			const detectedCombined = new Set()
			const detectedViaWidth = new Set()
			const detectedViaHeight = new Set()
			const detectedViaY = new Set()
			const detectedViaCharWidth = new Set()
			const detectedViaCharHeight = new Set()
			const detectedViaCharY = new Set()
			const detectedViaSubString = new Set()
			const detectedViaTextLen = new Set()

			const base = baseFonts.reduce((acc, font) => {
				svgText.style.setProperty('--font', font)
				const dimensions = getSVGDimensions(svgText)
				acc[font] = dimensions
				return acc
			}, {})
			families.forEach(family => {
				svgText.style.setProperty('font-family', family)
				const basefont = /, (.+)/.exec(family)[1]
				const dimensions = getSVGDimensions(svgText)
				const font = /\'(.+)\'/.exec(family)[1]
				if (
					dimensions.width != base[basefont].width ||
					dimensions.height != base[basefont].height ||
					dimensions.y != base[basefont].y ||
					dimensions.charWidth != base[basefont].charWidth ||
					dimensions.charHeight != base[basefont].charHeight ||
					dimensions.charY != base[basefont].charY ||
					dimensions.subString != base[basefont].subString ||
					dimensions.textLen != base[basefont].textLen
				) {
					detectedCombined.add(font)
				}
				if (!isNaN(dimensions.width) && dimensions.width != base[basefont].width) {
					detectedViaWidth.add(font)
				}
				if (!isNaN(dimensions.height) && dimensions.height != base[basefont].height) {
					detectedViaHeight.add(font)
				}
				if (!isNaN(dimensions.y) && dimensions.y != base[basefont].y) {
					detectedViaY.add(font)
				}
				if (!isNaN(dimensions.charWidth) && dimensions.charWidth != base[basefont].charWidth) {
					detectedViaCharWidth.add(font)
				}
				if (!isNaN(dimensions.charHeight) && dimensions.charHeight != base[basefont].charHeight) {
					detectedViaCharHeight.add(font)
				}
				if (!isNaN(dimensions.charY) && dimensions.charY != base[basefont].charY) {
					detectedViaCharY.add(font)
				}
				if (!isNaN(dimensions.subString) && dimensions.subString != base[basefont].subString) {
					detectedViaSubString.add(font)
				}
				if (!isNaN(dimensions.textLen) && dimensions.textLen != base[basefont].textLen) {
					detectedViaTextLen.add(font)
				}
				return
			})
			const fonts = {
				combined: [...detectedCombined],
				width: [...detectedViaWidth],
				height: [...detectedViaHeight],
				y: [...detectedViaY],
				charWidth: [...detectedViaCharWidth],
				charHeight: [...detectedViaCharHeight],
				charY: [...detectedViaCharY],
				subString: [...detectedViaSubString],
				textLen: [...detectedViaTextLen]
			}
			const perf = performance.now() - start
			const listLen = getList().length
			patch(document.getElementById('svgrect'), html`
				<div class="col-six relative">
					<span class="aside-note">${perf.toFixed(2)}ms</span>
					<strong>SVGRect</strong>
					<div class="relative">combined: ${
						!!fonts.combined.length ?
							hashMini(fonts.combined) :
							note.blocked
						}
						<span class="aside-note total">${'' + fonts.combined.length}/${listLen}</span>
					</div>
					<div class="relative">width: ${
						!!fonts.width.length ?
							hashMini(fonts.width) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.width.length}/${listLen}</span>
					</div>
					<div class="relative">height: ${
						!!fonts.height.length ?
							hashMini(fonts.height) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.height.length}/${listLen}</span>
					</div>
					<div class="relative">y: ${
						!!fonts.y.length ?
							hashMini(fonts.y) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.y.length}/${listLen}</span>
					</div>
					<div class="relative">char width: ${
						!!fonts.charWidth.length ?
							hashMini(fonts.charWidth) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.charWidth.length}/${listLen}</span>
					</div>
					<div class="relative">char height: ${
						!!fonts.charHeight.length ?
							hashMini(fonts.charHeight) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.charHeight.length}/${listLen}</span>
					</div>
					<div class="relative">char y: ${
						!!fonts.charY.length ?
							hashMini(fonts.charY) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.charY.length}/${listLen}</span>
					</div>
					<div class="relative">sub string: ${
						!!fonts.subString.length ?
							hashMini(fonts.subString) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.subString.length}/${listLen}</span>
					</div>
					<div class="relative">text length: ${
						!!fonts.textLen.length ?
							hashMini(fonts.textLen) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.textLen.length}/${listLen}</span>
					</div>
				</div>
			`)

			return {
				fonts,
				perf
			}
		} catch (error) {
			console.error(error)
			return {
				fonts: {
					combined: [],
					width: [],
					height: [],
					y: [],
					charWidth: [],
					charHeight: [],
					charY: [],
					subString: [],
					textLen: []
				},
				perf: 0
			}
		}
	}

	const getRectDimensions = (span, range) => {
		const { width: clientWidth, height: clientHeight } = span.getClientRects()[0]
		const { width: boundingWidth, height: boundingHeight } = span.getBoundingClientRect()
		const { width: clientRangeWidth, height: clientRangeHeight } = range.getClientRects()[0]
		const { width: boundingRangeWidth, height: boundingRangeHeight } = range.getBoundingClientRect()
		const dimensions = {
			clientWidth: Math.round(clientWidth),
			clientHeight: Math.round(clientHeight),
			boundingWidth: Math.round(boundingWidth),
			boundingHeight: Math.round(boundingHeight),
			clientRangeWidth: Math.round(clientRangeWidth),
			clientRangeHeight: Math.round(clientRangeHeight),
			boundingRangeWidth: Math.round(boundingRangeWidth),
			boundingRangeHeight: Math.round(boundingRangeHeight)
		}
		return dimensions
	}

	const getRectFonts = async ({ baseFonts, families }) => {
		try {
			await new Promise(setTimeout).catch(e => {})
			const start = performance.now()
			const chars = getChars()
			const id = getId()
			document.getElementById(id).innerHTML = `
			<style>
				#${id}-detector {
					--font: '';
					position: absolute !important;
					left: -9999px!important;
					font-size: 256px !important;
					font-style: normal !important;
					font-weight: normal !important;
					letter-spacing: normal !important;
					line-break: auto !important;
					line-height: normal !important;
					text-transform: none !important;
					text-align: left !important;
					text-decoration: none !important;
					text-shadow: none !important;
					white-space: normal !important;
					word-break: normal !important;
					word-spacing: normal !important;
				}
				#${id}-detector::after {
					font-family: var(--font);
					content: '${chars}';
				}
			</style>
			<span id="${id}-detector"></span>
		`
			const span = document.getElementById(`${id}-detector`)
			const range = document.createRange()
			range.selectNode(span)
			const detectedClient = new Set()
			const detectedViaBounding = new Set()
			const detectedClientRange = new Set()
			const detectedViaBoundingRange = new Set()
			const base = baseFonts.reduce((acc, font) => {
				span.style.setProperty('--font', font)
				const dimensions = getRectDimensions(span, range)
				acc[font] = dimensions
				return acc
			}, {})
			families.forEach(family => {
				span.style.setProperty('--font', family)
				const basefont = /, (.+)/.exec(family)[1]
				const dimensions = getRectDimensions(span, range)
				const font = /\'(.+)\'/.exec(family)[1]
				if (dimensions.clientWidth != base[basefont].clientWidth ||
					dimensions.clientHeight != base[basefont].clientHeight) {
					detectedClient.add(font)
				}
				if (dimensions.boundingWidth != base[basefont].boundingWidth ||
					dimensions.boundingHeight != base[basefont].boundingHeight) {
					detectedViaBounding.add(font)
				}
				if (dimensions.clientRangeWidth != base[basefont].clientRangeWidth ||
					dimensions.clientRangeHeight != base[basefont].clientRangeHeight) {
					detectedClientRange.add(font)
				}
				if (dimensions.boundingRangeWidth != base[basefont].boundingRangeWidth ||
					dimensions.boundingRangeHeight != base[basefont].boundingRangeHeight) {
					detectedViaBoundingRange.add(font)
				}
				return
			})
			const fonts = {
				client: [...detectedClient],
				bounding: [...detectedViaBounding],
				clientRange: [...detectedClientRange],
				boundingRange: [...detectedViaBoundingRange]
			}
			const hasBlocking = !!Object.keys(fonts).filter(type => !fonts[type].length).length
			const hasMismatch = !!Object.keys(fonts).filter(type => '' + fonts[type] != '' + fonts.client).length

			const lied = !hasBlocking && hasMismatch
			const perf = performance.now() - start
			const listLen = getList().length

			patch(document.getElementById('domrect'), html`
				<div class="col-six relative${lied ? ' lies' : ''}">
					<span class="aside-note">${perf.toFixed(2)}ms</span>
					<strong>DOMRect</strong>
					<div class="relative">client: ${
						!!fonts.client.length ?
							hashMini(fonts.client) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.client.length}/${listLen}</span>
					</div>
					<div class="relative">bounding: ${
						!!fonts.bounding.length ?
							hashMini(fonts.bounding) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.bounding.length}/${listLen}</span>
					</div>
					<div class="relative">client range: ${
						!!fonts.clientRange.length ?
							hashMini(fonts.clientRange) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.clientRange.length}/${listLen}</span>
					</div>
					<div class="relative">bounding range: ${
						!!fonts.boundingRange.length ?
							hashMini(fonts.boundingRange) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.boundingRange.length}/${listLen}</span>
					</div>
				</div>
			`)

			return {
				fonts,
				lied,
				perf
			}
		} catch (error) {
			console.error(error)
			return {
				fonts: {
					client: [],
					bounding: [],
					clientRange: [],
					boundingRange: []
				},
				perf: 0
			}
		}
	}

	const pixelsToInt = pixels => Math.round(+pixels.replace('px', ''))
	const originPixelsToInt = pixels => Math.round(2 * pixels.replace('px', ''))
	const getPixelDimensions = style => {
		const transform = style.transformOrigin.split(' ')
		const perspective = style.perspectiveOrigin.split(' ')
		const dimensions = {
			width: pixelsToInt(style.width),
			height: pixelsToInt(style.height),
			transformWidth: originPixelsToInt(transform[0]),
			transformHeight: originPixelsToInt(transform[1]),
			perspectiveWidth: originPixelsToInt(perspective[0]),
			perspectiveHeight: originPixelsToInt(perspective[1]),
			sizeWidth: pixelsToInt(style.inlineSize),
			sizeHeight: pixelsToInt(style.blockSize)
		}
		return dimensions
	}

	const getPixelFonts = async ({ baseFonts, families }) => {
		try {
			await new Promise(setTimeout).catch(e => {})
			const start = performance.now()
			const chars = getChars()
			const id = getId()
			document.getElementById(id).innerHTML = `
			<style>
				#${id}-detector {
					--font: '';
					position: absolute !important;
					left: -9999px!important;
					font-size: 256px !important;
					font-style: normal !important;
					font-weight: normal !important;
					letter-spacing: normal !important;
					line-break: auto !important;
					line-height: normal !important;
					text-transform: none !important;
					text-align: left !important;
					text-decoration: none !important;
					text-shadow: none !important;
					white-space: normal !important;
					word-break: normal !important;
					word-spacing: normal !important;
					/* in order to test scrollWidth, clientWidth, etc. */
					padding: 0 !important;
					margin: 0 !important;
					/* in order to test inlineSize and blockSize */
					writing-mode: horizontal-tb !important;
					/* in order to test perspective-origin */
					/* in order to test origins */
					transform-origin: unset !important;
					perspective-origin: unset !important;
				}
				#${id}-detector::after {
					font-family: var(--font);
					content: '${chars}';
				}
			</style>
			<span id="${id}-detector"></span>
		`
			const span = document.getElementById(`${id}-detector`)
			const detectedViaPixel = new Set()
			const detectedViaTransform = new Set()
			const detectedViaPerspective = new Set()
			const detectedViaPixelSize = new Set()
			const style = getComputedStyle(span)
			const base = baseFonts.reduce((acc, font) => {
				span.style.setProperty('--font', font)
				const dimensions = getPixelDimensions(style)
				acc[font] = dimensions
				return acc
			}, {})
			families.forEach(family => {
				span.style.setProperty('--font', family)
				const basefont = /, (.+)/.exec(family)[1]
				const dimensions = getPixelDimensions(style)
				const font = /\'(.+)\'/.exec(family)[1]
				if (dimensions.width != base[basefont].width ||
					dimensions.height != base[basefont].height) {
					detectedViaPixel.add(font)
				}
				if (dimensions.transformWidth != base[basefont].transformWidth ||
					dimensions.transformHeight != base[basefont].transformHeight) {
					detectedViaTransform.add(font)
				}
				if (dimensions.perspectiveWidth != base[basefont].perspectiveWidth ||
					dimensions.perspectiveHeight != base[basefont].perspectiveHeight) {
					detectedViaPerspective.add(font)
				}
				if (dimensions.sizeWidth != base[basefont].sizeWidth ||
					dimensions.sizeHeight != base[basefont].sizeHeight) {
					detectedViaPixelSize.add(font)
				}
				return
			})
			const fonts = {
				pixel: [...detectedViaPixel],
				transform: [...detectedViaTransform],
				perspective: [...detectedViaPerspective],
				size: [...detectedViaPixelSize]
			}

			const hasBlocking = !!Object.keys(fonts).filter(type => !fonts[type].length).length
			const hasMismatch = !!Object.keys(fonts).filter(type => '' + fonts[type] != '' + fonts.pixel).length
			const lied = !hasBlocking && hasMismatch
			const perf = performance.now() - start
			const listLen = getList().length
			patch(document.getElementById('pixels'), html`
				<div class="col-six relative${lied ? ' lies' : ''}">
					<span class="aside-note">${perf.toFixed(2)}ms</span>
					<strong>Pixels</strong>
					<div class="relative">pixel: ${
						!!fonts.pixel.length ?
							hashMini(fonts.pixel) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.pixel.length}/${listLen}</span>
					</div>
					<div class="relative">size: ${
						!!fonts.size.length ?
							hashMini(fonts.size) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.size.length}/${listLen}</span>
					</div>
					<div class="relative">perspective: ${
						!!fonts.perspective.length ?
							hashMini(fonts.perspective) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.perspective.length}/${listLen}</span>
					</div>
					<div class="relative">transform: ${
						!!fonts.transform.length ?
							hashMini(fonts.transform) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.transform.length}/${listLen}</span>
					</div>
				</div>
			`)

			return {
				fonts,
				lied,
				perf
			}
		} catch (error) {
			console.error(error)
			return {
				fonts: {
					pixel: [],
					transform: [],
					perspective: [],
					size: []
				},
				perf: 0
			}
		}
	}

	const getLengthDimensions = span => {
		const dimensions = {
			scrollWidth: ~~span.scrollWidth,
			scrollHeight: ~~span.scrollHeight,
			offsetWidth: ~~span.offsetWidth,
			offsetHeight: ~~span.offsetHeight,
			clientWidth: ~~span.clientWidth,
			clientHeight: ~~span.clientHeight
		}
		return dimensions
	}

	const getLengthFonts = async ({ baseFonts, families }) => {
		try {
			await new Promise(setTimeout).catch(e => {})
			const start = performance.now()
			const chars = getChars()
			const id = getId()
			document.getElementById(id).innerHTML = `
			<style>
				#${id}-detector {
					--font: '';
					position: absolute !important;
					left: -9999px!important;
					font-size: 256px !important;
					font-style: normal !important;
					font-weight: normal !important;
					letter-spacing: normal !important;
					line-break: auto !important;
					line-height: normal !important;
					text-transform: none !important;
					text-align: left !important;
					text-decoration: none !important;
					text-shadow: none !important;
					white-space: normal !important;
					word-break: normal !important;
					word-spacing: normal !important;
					/* in order to test scrollWidth, clientWidth, etc. */
					padding: 0 !important;
					margin: 0 !important;
				}
				#${id}-detector::after {
					font-family: var(--font);
					content: '${chars}';
				}
			</style>
			<span id="${id}-detector"></span>
		`
			const span = document.getElementById(`${id}-detector`)
			const detectedViaScroll = new Set()
			const detectedViaOffset = new Set()
			const detectedViaClient = new Set()
			const base = baseFonts.reduce((acc, font) => {
				span.style.setProperty('--font', font)
				const dimensions = getLengthDimensions(span)
				acc[font] = dimensions
				return acc
			}, {})
			families.forEach(family => {
				span.style.setProperty('--font', family)
				const basefont = /, (.+)/.exec(family)[1]
				const dimensions = getLengthDimensions(span)
				const font = /\'(.+)\'/.exec(family)[1]
				if (dimensions.scrollWidth != base[basefont].scrollWidth ||
					dimensions.scrollHeight != base[basefont].scrollHeight) {
					detectedViaScroll.add(font)
				}
				if (dimensions.offsetWidth != base[basefont].offsetWidth ||
					dimensions.offsetHeight != base[basefont].offsetHeight) {
					detectedViaOffset.add(font)
				}
				if (dimensions.clientWidth != base[basefont].clientWidth ||
					dimensions.clientHeight != base[basefont].clientHeight) {
					detectedViaClient.add(font)
				}
				return
			})
			const fonts = {
				scroll: [...detectedViaScroll],
				offset: [...detectedViaOffset],
				client: [...detectedViaClient]
			}
			const hasBlocking = !!Object.keys(fonts).filter(type => !fonts[type].length).length
			const hasMismatch = !!Object.keys(fonts).filter(type => '' + fonts[type] != '' + fonts.scroll).length

			const lied = !hasBlocking && hasMismatch
			const perf = performance.now() - start
			const listLen = getList().length

			patch(document.getElementById('lengths'), html`
				<div class="col-six relative${lied ? ' lies' : ''}">
					<span class="aside-note">${perf.toFixed(2)}ms</span>
					<strong>Lengths</strong>
					<div class="relative">offset: ${
						!!fonts.offset.length ?
							hashMini(fonts.offset) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.offset.length}/${listLen}</span>
					</div>
					<div class="relative">client: ${
						!!fonts.client.length ?
							hashMini(fonts.client) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.client.length}/${listLen}</span>
					</div>
					<div class="relative">scroll: ${
						!!fonts.scroll.length ?
							hashMini(fonts.scroll) :
							note.blocked
						}
						<span class="aside-note">${'' + fonts.scroll.length}/${listLen}</span>
					</div>
				</div>
			`)

			return {
				fonts,
				lied,
				perf
			}
		} catch (error) {
			console.error(error)
			return {
				fonts: {
					scroll: [],
					offset: [],
					client: []
				},
				perf: 0
			}
		}
	}

	const getFontFaceSetFonts = async list => {
		const listLen = getListAll().length
		try {
			await new Promise(setTimeout).catch(e => {})
			const start = performance.now()
			// real world usage should use iframe document instead of window document
			const gibberish = '&WY2tR*^ftCiMX9LD5m%iZSWCVSg'
			const { fonts: { check } } = document || {}
			if (!check || document.fonts.check(`12px '${gibberish}'`)) {
				throw new Error('FontFaceSet.check blocked or not supported')
			}
			await document.fonts.ready
			//console.log([...document.fonts.values()].map(fontFace => fontFace.family)) // show fonts loaded on the page
			document.fonts.clear() // clear loaded or added fonts
			const fonts = list.filter(font => document.fonts.check(`12px '${font}'`))
			const perf = performance.now() - start
			patch(document.getElementById('fontfaceset'), html`
				<div class="col-six relative">
					<span class="aside-note">${perf.toFixed(2)}ms</span>
					<strong>FontFaceSet</strong>
					<div class="relative">check: ${
						!!fonts.length ? modal(
								'creep-fontfaceset', fonts.map(font => `<span style="font-family:'${font}'">${font}</span>`).join('<br>'),
								hashMini(fonts)
							) :
							note.unsupported
						}
						<span class="aside-note">${'' + fonts.length}/${listLen}</span>
					</div>
				</div>
			`)
			return {
				fonts,
				perf
			}
		} catch (error) {
			console.error(error)
			patch(document.getElementById('fontfaceset'), html`
				<div class="col-six relative">
					<span class="aside-note">0ms</span>
					<strong>FontFaceSet</strong>
					<div class="relative">check: ${note.unsupported}
						<span class="aside-note">0/${listLen}</span>
					</div>
				</div>
			`)
			return {
				fonts: [],
				perf: 0
			}
		}
	}
	
	const getFontFaceLoadFonts = async list => {
		try {
			await new Promise(setTimeout).catch(e => {})
			const start = performance.now()
			const fontFaceList = list.map(font => new FontFace(font, `local("${font}")`))
			const responseCollection = await Promise
				.allSettled(fontFaceList.map(font => font.load()))
			const fonts = responseCollection.reduce((acc, font) => {
				if (font.status == 'fulfilled') {
					return [...acc, font.value.family]
				}
				return acc
			}, [])
			const perf = performance.now() - start
			const listLen = getListAll().length
			patch(document.getElementById('fontface'), html`
				<div class="col-six relative">
					<span class="aside-note">${perf.toFixed(2)}ms</span>
					<strong>FontFace</strong>
					<div class="relative">load: ${
							!!fonts.length ? modal(
								'creep-fontface', fonts.map(font => `<span style="font-family:'${font}'">${font}</span>`).join('<br>'),
								hashMini(fonts)
							) :
							note.unsupported
						}
						<span class="aside-note">${'' + fonts.length}/${listLen}</span>
					</div>
				</div>
			`)

			return {
				fonts,
				perf
			}
		} catch (error) {
			console.error(error)
			return {
				fonts: [],
				perf: 0
			}
		}
	}


	const context = document.createElement('canvas').getContext('2d')
	const contextOffscreen = ('OffscreenCanvas' in window) ? new OffscreenCanvas(500, 200).getContext('2d') : undefined
	const start = performance.now()
	const [
		textMetricsFontsOffscreen,
		textMetricsFonts,
		svgFonts,
		rectFonts,
		pixelFonts,
		lengthFonts,
		fontFaceSetFonts,
		fontFaceLoadFonts
	] = await Promise.all([
		getTextMetricsFonts({ context: contextOffscreen, baseFonts, families }),
		getTextMetricsFonts({ context, baseFonts, families }),
		getSVGFonts({ baseFonts, families }),
		getRectFonts({ baseFonts, families }),
		getPixelFonts({ baseFonts, families }),
		getLengthFonts({ baseFonts, families }),
		getFontFaceSetFonts(listAll),
		getFontFaceLoadFonts(listAll)
	]).catch(error => console.error(error))
	const perf = performance.now() - start
	const { combined: textMetricsFontsList } = textMetricsFonts.fonts || []
	const {
		combined: textMetricsFontsOffscreenList
	} = textMetricsFontsOffscreen.fonts || []
	const { combined: svgFontsList } = svgFonts.fonts || []
	const { fonts: rectFontsData } = rectFonts || {}
	const rectFontsList = Object.keys(rectFontsData).reduce((acc, key) => {
		return [...acc, ...rectFontsData[key]]
	},[])
	const { fonts: pixelFontsData } = pixelFonts || {}
	const pixelFontsList = Object.keys(pixelFontsData).reduce((acc, key) => {
		return [...acc, ...pixelFontsData[key]]
	},[])
	const { fonts: lengthFontsData } = lengthFonts || {}
	const lengthFontsList = Object.keys(lengthFontsData).reduce((acc, key) => {
		return [...acc, ...lengthFontsData[key]]
	},[])

	const supportedFontList = [...new Set([
		...textMetricsFontsList,
		...textMetricsFontsOffscreenList,
		...svgFontsList,
		...rectFontsList,
		...pixelFontsList,
		...lengthFontsList,
		...(fontFaceSetFonts.fonts || []),
		...(fontFaceLoadFonts.fonts || [])
	])]

	//console.log("'"+supportedFontList.join("',\n'")+"'")
	//console.log("Loaded:\n'"+(fontFaceLoadFonts.fonts || []).join("',\n'")+"'")

	const fingerprint = await hashify({
		textMetricsFonts: { ...textMetricsFonts, perf: undefined },
		svgFonts: { ...svgFonts, perf: undefined },
		rectFonts: !rectFonts.lied ? { ...rectFonts, perf: undefined } : undefined,
		pixelFonts: !pixelFonts.lied ? { ...pixelFonts, perf: undefined } : undefined,
		lengthFonts: !lengthFonts.lied ? { ...lengthFonts, perf: undefined } : undefined,
		fontFaceSetFonts: { ...fontFaceSetFonts, perf: undefined },
		fontFaceLoadFonts: { ...fontFaceLoadFonts, perf: undefined },
	})

	console.log('TextMetrics:\n', textMetricsFonts)
	console.log('TextMetricsOffscreen:\n', textMetricsFontsOffscreen)
	console.log('SVGRect:\n', svgFonts)
	console.log('DOMRect:\n', rectFonts)
	console.log('Pixels:\n', pixelFonts)
	console.log('Lengths:\n', lengthFonts)
	console.log('FontFaceSet:\n', fontFaceSetFonts)
	console.log('FontFaceLoad:\n', fontFaceLoadFonts)

	div.parentNode.removeChild(div) // remove font-fingerprint element

	patch(document.getElementById('visitor-fingerprint'), html`
		<div class="visitor-info relative">
			<span class="aside-note">${perf.toFixed(2)}ms</span>
			<strong>Fonts</strong><span class="hash">${hashMini(fingerprint)}</span>
		</div>
	`)

	patch(document.getElementById('supported-list'), html`
		<div>
			${
				(supportedFontList.map(font => `<div class="relative"><span class="aside-note">${font}</span><span style="font-family:'${font}'">${font}</span></div>`)).join('')
			}
		</div>
	`)

})()