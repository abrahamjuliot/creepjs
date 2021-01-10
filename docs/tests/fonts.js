(async () => {

const hashMini = str => {
	if (typeof str == 'number') {
		return str
	}
	else if (!str || JSON.stringify(str) =='{}') {
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

const note = {
	unsupported: '<span class="blocked">unsupported</span>',
	blocked: '<span class="blocked">blocked</span>',
	lied: '<span class="lies">lied</span>'
}

const fontList = ["Andale Mono", "Arial", "Arial Black", "Arial Hebrew", "Arial MT", "Arial Narrow", "Arial Rounded MT Bold", "Arial Unicode MS", "Bitstream Vera Sans Mono", "Book Antiqua", "Bookman Old Style", "Calibri", "Cambria", "Cambria Math", "Century", "Century Gothic", "Century Schoolbook", "Comic Sans", "Comic Sans MS", "Consolas", "Courier", "Courier New", "Geneva", "Georgia", "Helvetica", "Helvetica Neue", "Impact", "Lucida Bright", "Lucida Calligraphy", "Lucida Console", "Lucida Fax", "LUCIDA GRANDE", "Lucida Handwriting", "Lucida Sans", "Lucida Sans Typewriter", "Lucida Sans Unicode", "Microsoft Sans Serif", "Monaco", "Monotype Corsiva", "MS Gothic", "MS Outlook", "MS PGothic", "MS Reference Sans Serif", "MS Sans Serif", "MS Serif", "MYRIAD", "MYRIAD PRO", "Palatino", "Palatino Linotype", "Segoe Print", "Segoe Script", "Segoe UI", "Segoe UI Light", "Segoe UI Semibold", "Segoe UI Symbol", "Tahoma", "Times", "Times New Roman", "Times New Roman PS", "Trebuchet MS", "Verdana", "Wingdings", "Wingdings 2", "Wingdings 3"]

const extendedFontList = ["Abadi MT Condensed Light", "Academy Engraved LET", "ADOBE CASLON PRO", "Adobe Garamond", "ADOBE GARAMOND PRO", "Agency FB", "Aharoni", "Albertus Extra Bold", "Albertus Medium", "Algerian", "Amazone BT", "American Typewriter", "American Typewriter Condensed", "AmerType Md BT", "Andalus", "Angsana New", "AngsanaUPC", "Antique Olive", "Aparajita", "Apple Chancery", "Apple Color Emoji", "Apple SD Gothic Neo", "Arabic Typesetting", "ARCHER", "ARNO PRO", "Arrus BT", "Aurora Cn BT", "AvantGarde Bk BT", "AvantGarde Md BT", "AVENIR", "Ayuthaya", "Bandy", "Bangla Sangam MN", "Bank Gothic", "BankGothic Md BT", "Baskerville", "Baskerville Old Face", "Batang", "BatangChe", "Bauer Bodoni", "Bauhaus 93", "Bazooka", "Bell MT", "Bembo", "Benguiat Bk BT", "Berlin Sans FB", "Berlin Sans FB Demi", "Bernard MT Condensed", "BernhardFashion BT", "BernhardMod BT", "Big Caslon", "BinnerD", "Blackadder ITC", "BlairMdITC TT", "Bodoni 72", "Bodoni 72 Oldstyle", "Bodoni 72 Smallcaps", "Bodoni MT", "Bodoni MT Black", "Bodoni MT Condensed", "Bodoni MT Poster Compressed", "Bookshelf Symbol 7", "Boulder", "Bradley Hand", "Bradley Hand ITC", "Bremen Bd BT", "Britannic Bold", "Broadway", "Browallia New", "BrowalliaUPC", "Brush Script MT", "Californian FB", "Calisto MT", "Calligrapher", "Candara", "CaslonOpnface BT", "Castellar", "Centaur", "Cezanne", "CG Omega", "CG Times", "Chalkboard", "Chalkboard SE", "Chalkduster", "Charlesworth", "Charter Bd BT", "Charter BT", "Chaucer", "ChelthmITC Bk BT", "Chiller", "Clarendon", "Clarendon Condensed", "CloisterBlack BT", "Cochin", "Colonna MT", "Constantia", "Cooper Black", "Copperplate", "Copperplate Gothic", "Copperplate Gothic Bold", "Copperplate Gothic Light", "CopperplGoth Bd BT", "Corbel", "Cordia New", "CordiaUPC", "Cornerstone", "Coronet", "Cuckoo", "Curlz MT", "DaunPenh", "Dauphin", "David", "DB LCD Temp", "DELICIOUS", "Denmark", "DFKai-SB", "Didot", "DilleniaUPC", "DIN", "DokChampa", "Dotum", "DotumChe", "Ebrima", "Edwardian Script ITC", "Elephant", "English 111 Vivace BT", "Engravers MT", "EngraversGothic BT", "Eras Bold ITC", "Eras Demi ITC", "Eras Light ITC", "Eras Medium ITC", "EucrosiaUPC", "Euphemia", "Euphemia UCAS", "EUROSTILE", "Exotc350 Bd BT", "FangSong", "Felix Titling", "Fixedsys", "FONTIN", "Footlight MT Light", "Forte", "FrankRuehl", "Fransiscan", "Freefrm721 Blk BT", "FreesiaUPC", "Freestyle Script", "French Script MT", "FrnkGothITC Bk BT", "Fruitger", "FRUTIGER", "Futura", "Futura Bk BT", "Futura Lt BT", "Futura Md BT", "Futura ZBlk BT", "FuturaBlack BT", "Gabriola", "Galliard BT", "Gautami", "Geeza Pro", "Geometr231 BT", "Geometr231 Hv BT", "Geometr231 Lt BT", "GeoSlab 703 Lt BT", "GeoSlab 703 XBd BT", "Gigi", "Gill Sans", "Gill Sans MT", "Gill Sans MT Condensed", "Gill Sans MT Ext Condensed Bold", "Gill Sans Ultra Bold", "Gill Sans Ultra Bold Condensed", "Gisha", "Gloucester MT Extra Condensed", "GOTHAM", "GOTHAM BOLD", "Goudy Old Style", "Goudy Stout", "GoudyHandtooled BT", "GoudyOLSt BT", "Gujarati Sangam MN", "Gulim", "GulimChe", "Gungsuh", "GungsuhChe", "Gurmukhi MN", "Haettenschweiler", "Harlow Solid Italic", "Harrington", "Heather", "Heiti SC", "Heiti TC", "HELV", "Herald", "High Tower Text", "Hiragino Kaku Gothic ProN", "Hiragino Mincho ProN", "Hoefler Text", "Humanst 521 Cn BT", "Humanst521 BT", "Humanst521 Lt BT", "Imprint MT Shadow", "Incised901 Bd BT", "Incised901 BT", "Incised901 Lt BT", "INCONSOLATA", "Informal Roman", "Informal011 BT", "INTERSTATE", "IrisUPC", "Iskoola Pota", "JasmineUPC", "Jazz LET", "Jenson", "Jester", "Jokerman", "Juice ITC", "Kabel Bk BT", "Kabel Ult BT", "Kailasa", "KaiTi", "Kalinga", "Kannada Sangam MN", "Kartika", "Kaufmann Bd BT", "Kaufmann BT", "Khmer UI", "KodchiangUPC", "Kokila", "Korinna BT", "Kristen ITC", "Krungthep", "Kunstler Script", "Lao UI", "Latha", "Leelawadee", "Letter Gothic", "Levenim MT", "LilyUPC", "Lithograph", "Lithograph Light", "Long Island", "Lydian BT", "Magneto", "Maiandra GD", "Malayalam Sangam MN", "Malgun Gothic", "Mangal", "Marigold", "Marion", "Marker Felt", "Market", "Marlett", "Matisse ITC", "Matura MT Script Capitals", "Meiryo", "Meiryo UI", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft New Tai Lue", "Microsoft PhagsPa", "Microsoft Tai Le", "Microsoft Uighur", "Microsoft YaHei", "Microsoft Yi Baiti", "MingLiU", "MingLiU_HKSCS", "MingLiU_HKSCS-ExtB", "MingLiU-ExtB", "Minion", "Minion Pro", "Miriam", "Miriam Fixed", "Mistral", "Modern", "Modern No. 20", "Mona Lisa Solid ITC TT", "Mongolian Baiti", "MONO", "MoolBoran", "Mrs Eaves", "MS LineDraw", "MS Mincho", "MS PMincho", "MS Reference Specialty", "MS UI Gothic", "MT Extra", "MUSEO", "MV Boli", "Nadeem", "Narkisim", "NEVIS", "News Gothic", "News GothicMT", "NewsGoth BT", "Niagara Engraved", "Niagara Solid", "Noteworthy", "NSimSun", "Nyala", "OCR A Extended", "Old Century", "Old English Text MT", "Onyx", "Onyx BT", "OPTIMA", "Oriya Sangam MN", "OSAKA", "OzHandicraft BT", "Palace Script MT", "Papyrus", "Parchment", "Party LET", "Pegasus", "Perpetua", "Perpetua Titling MT", "PetitaBold", "Pickwick", "Plantagenet Cherokee", "Playbill", "PMingLiU", "PMingLiU-ExtB", "Poor Richard", "Poster", "PosterBodoni BT", "PRINCETOWN LET", "Pristina", "PTBarnum BT", "Pythagoras", "Raavi", "Rage Italic", "Ravie", "Ribbon131 Bd BT", "Rockwell", "Rockwell Condensed", "Rockwell Extra Bold", "Rod", "Roman", "Sakkal Majalla", "Santa Fe LET", "Savoye LET", "Sceptre", "Script", "Script MT Bold", "SCRIPTINA", "Serifa", "Serifa BT", "Serifa Th BT", "ShelleyVolante BT", "Sherwood", "Shonar Bangla", "Showcard Gothic", "Shruti", "Signboard", "SILKSCREEN", "SimHei", "Simplified Arabic", "Simplified Arabic Fixed", "SimSun", "SimSun-ExtB", "Sinhala Sangam MN", "Sketch Rockwell", "Skia", "Small Fonts", "Snap ITC", "Snell Roundhand", "Socket", "Souvenir Lt BT", "Staccato222 BT", "Steamer", "Stencil", "Storybook", "Styllo", "Subway", "Swis721 BlkEx BT", "Swiss911 XCm BT", "Sylfaen", "Synchro LET", "System", "Tamil Sangam MN", "Technical", "Teletype", "Telugu Sangam MN", "Tempus Sans ITC", "Terminal", "Thonburi", "Traditional Arabic", "Trajan", "TRAJAN PRO", "Tristan", "Tubular", "Tunga", "Tw Cen MT", "Tw Cen MT Condensed", "Tw Cen MT Condensed Extra Bold", "TypoUpright BT", "Unicorn", "Univers", "Univers CE 55 Medium", "Univers Condensed", "Utsaah", "Vagabond", "Vani", "Vijaya", "Viner Hand ITC", "VisualUI", "Vivaldi", "Vladimir Script", "Vrinda", "Westminster", "WHITNEY", "Wide Latin", "ZapfEllipt BT", "ZapfHumnst BT", "ZapfHumnst Dm BT", "Zapfino", "Zurich BlkEx BT", "Zurich Ex BT", "ZWAdobeF"]

const googleFonts = ["ABeeZee", "Abel", "Abhaya Libre", "Abril Fatface", "Aclonica", "Acme", "Actor", "Adamina", "Advent Pro", "Aguafina Script", "Akronim", "Aladin", "Aldrich", "Alef", "Alegreya", "Alegreya SC", "Alegreya Sans", "Alegreya Sans SC", "Aleo", "Alex Brush", "Alfa Slab One", "Alice", "Alike", "Alike Angular", "Allan", "Allerta", "Allerta Stencil", "Allura", "Almarai", "Almendra", "Almendra Display", "Almendra SC", "Amarante", "Amaranth", "Amatic SC", "Amethysta", "Amiko", "Amiri", "Amita", "Anaheim", "Andada", "Andika", "Angkor", "Annie Use Your Telescope", "Anonymous Pro", "Antic", "Antic Didone", "Antic Slab", "Anton", "Arapey", "Arbutus", "Arbutus Slab", "Architects Daughter", "Archivo", "Archivo Black", "Archivo Narrow", "Aref Ruqaa", "Arima Madurai", "Arimo", "Arizonia", "Armata", "Arsenal", "Artifika", "Arvo", "Arya", "Asap", "Asap Condensed", "Asar", "Asset", "Assistant", "Astloch", "Asul", "Athiti", "Atma", "Atomic Age", "Aubrey", "Audiowide", "Autour One", "Average", "Average Sans", "Averia Gruesa Libre", "Averia Libre", "Averia Sans Libre", "Averia Serif Libre", "B612", "B612 Mono", "Bad Script", "Bahiana", "Bahianita", "Bai Jamjuree", "Baloo", "Baloo Bhai", "Baloo Bhaijaan", "Baloo Bhaina", "Baloo Chettan", "Baloo Da", "Baloo Paaji", "Baloo Tamma", "Baloo Tammudu", "Baloo Thambi", "Balthazar", "Bangers", "Barlow", "Barlow Condensed", "Barlow Semi Condensed", "Barriecito", "Barrio", "Basic", "Battambang", "Baumans", "Bayon", "Be Vietnam", "Bebas Neue", "Belgrano", "Bellefair", "Belleza", "BenchNine", "Bentham", "Berkshire Swash", "Beth Ellen", "Bevan", "Big Shoulders Display", "Big Shoulders Text", "Bigelow Rules", "Bigshot One", "Bilbo", "Bilbo Swash Caps", "BioRhyme", "BioRhyme Expanded", "Biryani", "Bitter", "Black And White Picture", "Black Han Sans", "Black Ops One", "Blinker", "Bokor", "Bonbon", "Boogaloo", "Bowlby One", "Bowlby One SC", "Brawler", "Bree Serif", "Bubblegum Sans", "Bubbler One", "Buda", "Buenard", "Bungee", "Bungee Hairline", "Bungee Inline", "Bungee Outline", "Bungee Shade", "Butcherman", "Butterfly Kids", "Cabin", "Cabin Condensed", "Cabin Sketch", "Caesar Dressing", "Cagliostro", "Cairo", "Calligraffitti", "Cambay", "Cambo", "Candal", "Cantarell", "Cantata One", "Cantora One", "Capriola", "Cardo", "Carme", "Carrois Gothic", "Carrois Gothic SC", "Carter One", "Catamaran", "Caudex", "Caveat", "Caveat Brush", "Cedarville Cursive", "Ceviche One", "Chakra Petch", "Changa", "Changa One", "Chango", "Charm", "Charmonman", "Chathura", "Chau Philomene One", "Chela One", "Chelsea Market", "Chenla", "Cherry Cream Soda", "Cherry Swash", "Chewy", "Chicle", "Chilanka", "Chivo", "Chonburi", "Cinzel", "Cinzel Decorative", "Clicker Script", "Coda", "Coda Caption", "Codystar", "Coiny", "Combo", "Comfortaa", "Coming Soon", "Concert One", "Condiment", "Content", "Contrail One", "Convergence", "Cookie", "Copse", "Corben", "Cormorant", "Cormorant Garamond", "Cormorant Infant", "Cormorant SC", "Cormorant Unicase", "Cormorant Upright", "Courgette", "Cousine", "Coustard", "Covered By Your Grace", "Crafty Girls", "Creepster", "Crete Round", "Crimson Pro", "Crimson Text", "Croissant One", "Crushed", "Cuprum", "Cute Font", "Cutive", "Cutive Mono", "DM Sans", "DM Serif Display", "DM Serif Text", "Damion", "Dancing Script", "Dangrek", "Darker Grotesque", "David Libre", "Dawning of a New Day", "Days One", "Dekko", "Delius", "Delius Swash Caps", "Delius Unicase", "Della Respira", "Denk One", "Devonshire", "Dhurjati", "Didact Gothic", "Diplomata", "Diplomata SC", "Do Hyeon", "Dokdo", "Domine", "Donegal One", "Doppio One", "Dorsa", "Dosis", "Dr Sugiyama", "Duru Sans", "Dynalight", "EB Garamond", "Eagle Lake", "East Sea Dokdo", "Eater", "Economica", "Eczar", "El Messiri", "Electrolize", "Elsie", "Elsie Swash Caps", "Emblema One", "Emilys Candy", "Encode Sans", "Encode Sans Condensed", "Encode Sans Expanded", "Encode Sans Semi Condensed", "Encode Sans Semi Expanded", "Engagement", "Englebert", "Enriqueta", "Erica One", "Esteban", "Euphoria Script", "Ewert", "Exo", "Exo 2", "Expletus Sans", "Fahkwang", "Fanwood Text", "Farro", "Farsan", "Fascinate", "Fascinate Inline", "Faster One", "Fasthand", "Fauna One", "Faustina", "Federant", "Federo", "Felipa", "Fenix", "Finger Paint", "Fira Code", "Fira Mono", "Fira Sans", "Fira Sans Condensed", "Fira Sans Extra Condensed", "Fjalla One", "Fjord One", "Flamenco", "Flavors", "Fondamento", "Fontdiner Swanky", "Forum", "Francois One", "Frank Ruhl Libre", "Freckle Face", "Fredericka the Great", "Fredoka One", "Freehand", "Fresca", "Frijole", "Fruktur", "Fugaz One", "GFS Didot", "GFS Neohellenic", "Gabriela", "Gaegu", "Gafata", "Galada", "Galdeano", "Galindo", "Gamja Flower", "Gayathri", "Gentium Basic", "Gentium Book Basic", "Geo", "Geostar", "Geostar Fill", "Germania One", "Gidugu", "Gilda Display", "Give You Glory", "Glass Antiqua", "Glegoo", "Gloria Hallelujah", "Goblin One", "Gochi Hand", "Gorditas", "Gothic A1", "Goudy Bookletter 1911", "Graduate", "Grand Hotel", "Gravitas One", "Great Vibes", "Grenze", "Griffy", "Gruppo", "Gudea", "Gugi", "Gurajada", "Habibi", "Halant", "Hammersmith One", "Hanalei", "Hanalei Fill", "Handlee", "Hanuman", "Happy Monkey", "Harmattan", "Headland One", "Heebo", "Henny Penny", "Hepta Slab", "Herr Von Muellerhoff", "Hi Melody", "Hind", "Hind Guntur", "Hind Madurai", "Hind Siliguri", "Hind Vadodara", "Holtwood One SC", "Homemade Apple", "Homenaje", "IBM Plex Mono", "IBM Plex Sans", "IBM Plex Sans Condensed", "IBM Plex Serif", "IM Fell DW Pica", "IM Fell DW Pica SC", "IM Fell Double Pica", "IM Fell Double Pica SC", "IM Fell English", "IM Fell English SC", "IM Fell French Canon", "IM Fell French Canon SC", "IM Fell Great Primer", "IM Fell Great Primer SC", "Iceberg", "Iceland", "Imprima", "Inconsolata", "Inder", "Indie Flower", "Inika", "Inknut Antiqua", "Irish Grover", "Istok Web", "Italiana", "Italianno", "Itim", "Jacques Francois", "Jacques Francois Shadow", "Jaldi", "Jim Nightshade", "Jockey One", "Jolly Lodger", "Jomhuria", "Jomolhari", "Josefin Sans", "Josefin Slab", "Joti One", "Jua", "Judson", "Julee", "Julius Sans One", "Junge", "Jura", "Just Another Hand", "Just Me Again Down Here", "K2D", "Kadwa", "Kalam", "Kameron", "Kanit", "Kantumruy", "Karla", "Karma", "Katibeh", "Kaushan Script", "Kavivanar", "Kavoon", "Kdam Thmor", "Keania One", "Kelly Slab", "Kenia", "Khand", "Khmer", "Khula", "Kirang Haerang", "Kite One", "Knewave", "KoHo", "Kodchasan", "Kosugi", "Kosugi Maru", "Kotta One", "Koulen", "Kranky", "Kreon", "Kristi", "Krona One", "Krub", "Kulim Park", "Kumar One", "Kumar One Outline", "Kurale", "La Belle Aurore", "Lacquer", "Laila", "Lakki Reddy", "Lalezar", "Lancelot", "Lateef", "Lato", "League Script", "Leckerli One", "Ledger", "Lekton", "Lemon", "Lemonada", "Lexend Deca", "Lexend Exa", "Lexend Giga", "Lexend Mega", "Lexend Peta", "Lexend Tera", "Lexend Zetta", "Libre Barcode 128", "Libre Barcode 128 Text", "Libre Barcode 39", "Libre Barcode 39 Extended", "Libre Barcode 39 Extended Text", "Libre Barcode 39 Text", "Libre Baskerville", "Libre Caslon Display", "Libre Caslon Text", "Libre Franklin", "Life Savers", "Lilita One", "Lily Script One", "Limelight", "Linden Hill", "Literata", "Liu Jian Mao Cao", "Livvic", "Lobster", "Lobster Two", "Londrina Outline", "Londrina Shadow", "Londrina Sketch", "Londrina Solid", "Long Cang", "Lora", "Love Ya Like A Sister", "Loved by the King", "Lovers Quarrel", "Luckiest Guy", "Lusitana", "Lustria", "M PLUS 1p", "M PLUS Rounded 1c", "Ma Shan Zheng", "Macondo", "Macondo Swash Caps", "Mada", "Magra", "Maiden Orange", "Maitree", "Major Mono Display", "Mako", "Mali", "Mallanna", "Mandali", "Manjari", "Mansalva", "Manuale", "Marcellus", "Marcellus SC", "Marck Script", "Margarine", "Markazi Text", "Marko One", "Marmelad", "Martel", "Martel Sans", "Marvel", "Mate", "Mate SC", "Material Icons", "Maven Pro", "McLaren", "Meddon", "MedievalSharp", "Medula One", "Meera Inimai", "Megrim", "Meie Script", "Merienda", "Merienda One", "Merriweather", "Merriweather Sans", "Metal", "Metal Mania", "Metamorphous", "Metrophobic", "Michroma", "Milonga", "Miltonian", "Miltonian Tattoo", "Mina", "Miniver", "Miriam Libre", "Mirza", "Miss Fajardose", "Mitr", "Modak", "Modern Antiqua", "Mogra", "Molengo", "Molle", "Monda", "Monofett", "Monoton", "Monsieur La Doulaise", "Montaga", "Montez", "Montserrat", "Montserrat Alternates", "Montserrat Subrayada", "Moul", "Moulpali", "Mountains of Christmas", "Mouse Memoirs", "Mr Bedfort", "Mr Dafoe", "Mr De Haviland", "Mrs Saint Delafield", "Mrs Sheppards", "Mukta", "Mukta Mahee", "Mukta Malar", "Mukta Vaani", "Muli", "Mystery Quest", "NTR", "Nanum Brush Script", "Nanum Gothic", "Nanum Gothic Coding", "Nanum Myeongjo", "Nanum Pen Script", "Neucha", "Neuton", "New Rocker", "News Cycle", "Niconne", "Niramit", "Nixie One", "Nobile", "Nokora", "Norican", "Nosifer", "Notable", "Nothing You Could Do", "Noticia Text", "Noto Sans", "Noto Sans HK", "Noto Sans JP", "Noto Sans KR", "Noto Sans SC", "Noto Sans TC", "Noto Serif", "Noto Serif JP", "Noto Serif KR", "Noto Serif SC", "Noto Serif TC", "Nova Cut", "Nova Flat", "Nova Mono", "Nova Oval", "Nova Round", "Nova Script", "Nova Slim", "Nova Square", "Numans", "Nunito", "Nunito Sans", "Odor Mean Chey", "Offside", "Old Standard TT", "Oldenburg", "Oleo Script", "Oleo Script Swash Caps", "Open Sans", "Open Sans Condensed", "Oranienbaum", "Orbitron", "Oregano", "Orienta", "Original Surfer", "Oswald", "Over the Rainbow", "Overlock", "Overlock SC", "Overpass", "Overpass Mono", "Ovo", "Oxygen", "Oxygen Mono", "PT Mono", "PT Sans", "PT Sans Caption", "PT Sans Narrow", "PT Serif", "PT Serif Caption", "Pacifico", "Padauk", "Palanquin", "Palanquin Dark", "Pangolin", "Paprika", "Parisienne", "Passero One", "Passion One", "Pathway Gothic One", "Patrick Hand", "Patrick Hand SC", "Pattaya", "Patua One", "Pavanam", "Paytone One", "Peddana", "Peralta", "Permanent Marker", "Petit Formal Script", "Petrona", "Philosopher", "Piedra", "Pinyon Script", "Pirata One", "Plaster", "Play", "Playball", "Playfair Display", "Playfair Display SC", "Podkova", "Poiret One", "Poller One", "Poly", "Pompiere", "Pontano Sans", "Poor Story", "Poppins", "Port Lligat Sans", "Port Lligat Slab", "Pragati Narrow", "Prata", "Preahvihear", "Press Start 2P", "Pridi", "Princess Sofia", "Prociono", "Prompt", "Prosto One", "Proza Libre", "Public Sans", "Puritan", "Purple Purse", "Quando", "Quantico", "Quattrocento", "Quattrocento Sans", "Questrial", "Quicksand", "Quintessential", "Qwigley", "Racing Sans One", "Radley", "Rajdhani", "Rakkas", "Raleway", "Raleway Dots", "Ramabhadra", "Ramaraja", "Rambla", "Rammetto One", "Ranchers", "Rancho", "Ranga", "Rasa", "Rationale", "Ravi Prakash", "Red Hat Display", "Red Hat Text", "Redressed", "Reem Kufi", "Reenie Beanie", "Revalia", "Rhodium Libre", "Ribeye", "Ribeye Marrow", "Righteous", "Risque", "Roboto", "Roboto Condensed", "Roboto Mono", "Roboto Slab", "Rochester", "Rock Salt", "Rokkitt", "Romanesco", "Ropa Sans", "Rosario", "Rosarivo", "Rouge Script", "Rozha One", "Rubik", "Rubik Mono One", "Ruda", "Rufina", "Ruge Boogie", "Ruluko", "Rum Raisin", "Ruslan Display", "Russo One", "Ruthie", "Rye", "Sacramento", "Sahitya", "Sail", "Saira", "Saira Condensed", "Saira Extra Condensed", "Saira Semi Condensed", "Saira Stencil One", "Salsa", "Sanchez", "Sancreek", "Sansita", "Sarabun", "Sarala", "Sarina", "Sarpanch", "Satisfy", "Sawarabi Gothic", "Sawarabi Mincho", "Scada", "Scheherazade", "Schoolbell", "Scope One", "Seaweed Script", "Secular One", "Sedgwick Ave", "Sedgwick Ave Display", "Sevillana", "Seymour One", "Shadows Into Light", "Shadows Into Light Two", "Shanti", "Share", "Share Tech", "Share Tech Mono", "Shojumaru", "Short Stack", "Shrikhand", "Siemreap", "Sigmar One", "Signika", "Signika Negative", "Simonetta", "Single Day", "Sintony", "Sirin Stencil", "Six Caps", "Skranji", "Slabo 13px", "Slabo 27px", "Slackey", "Smokum", "Smythe", "Sniglet", "Snippet", "Snowburst One", "Sofadi One", "Sofia", "Song Myung", "Sonsie One", "Sorts Mill Goudy", "Source Code Pro", "Source Sans Pro", "Source Serif Pro", "Space Mono", "Special Elite", "Spectral", "Spectral SC", "Spicy Rice", "Spinnaker", "Spirax", "Squada One", "Sree Krushnadevaraya", "Sriracha", "Srisakdi", "Staatliches", "Stalemate", "Stalinist One", "Stardos Stencil", "Stint Ultra Condensed", "Stint Ultra Expanded", "Stoke", "Strait", "Stylish", "Sue Ellen Francisco", "Suez One", "Sumana", "Sunflower", "Sunshiney", "Supermercado One", "Sura", "Suranna", "Suravaram", "Suwannaphum", "Swanky and Moo Moo", "Syncopate", "Tajawal", "Tangerine", "Taprom", "Tauri", "Taviraj", "Teko", "Telex", "Tenali Ramakrishna", "Tenor Sans", "Text Me One", "Thasadith", "The Girl Next Door", "Tienne", "Tillana", "Timmana", "Tinos", "Titan One", "Titillium Web", "Tomorrow", "Trade Winds", "Trirong", "Trocchi", "Trochut", "Trykker", "Tulpen One", "Turret Road", "Ubuntu", "Ubuntu Condensed", "Ubuntu Mono", "Ultra", "Uncial Antiqua", "Underdog", "Unica One", "UnifrakturCook", "UnifrakturMaguntia", "Unkempt", "Unlock", "Unna", "VT323", "Vampiro One", "Varela", "Varela Round", "Vast Shadow", "Vesper Libre", "Vibes", "Vibur", "Vidaloka", "Viga", "Voces", "Volkhov", "Vollkorn", "Vollkorn SC", "Voltaire", "Waiting for the Sunrise", "Wallpoet", "Walter Turncoat", "Warnes", "Wellfleet", "Wendy One", "Wire One", "Work Sans", "Yanone Kaffeesatz", "Yantramanav", "Yatra One", "Yellowtail", "Yeon Sung", "Yeseva One", "Yesteryear", "Yrsa", "ZCOOL KuaiLe", "ZCOOL QingKe HuangYou", "ZCOOL XiaoWei", "Zeyada", "Zhi Mang Xing", "Zilla Slab", "Zilla Slab Highlight"]

const notoFonts = ["Noto Naskh Arabic", "Noto Sans Armenian", "Noto Sans Bengali", "Noto Sans Buginese", "Noto Sans Canadian Aboriginal", "Noto Sans Cherokee", "Noto Sans Devanagari", "Noto Sans Ethiopic", "Noto Sans Georgian", "Noto Sans Gujarati", "Noto Sans Gurmukhi", "Noto Sans Hebrew", "Noto Sans JP Regular", "Noto Sans KR Regular", "Noto Sans Kannada", "Noto Sans Khmer", "Noto Sans Lao", "Noto Sans Malayalam", "Noto Sans Mongolian", "Noto Sans Myanmar", "Noto Sans Oriya", "Noto Sans SC Regular", "Noto Sans Sinhala", "Noto Sans TC Regular", "Noto Sans Tamil", "Noto Sans Telugu", "Noto Sans Thaana", "Noto Sans Thai", "Noto Sans Tibetan", "Noto Sans Yi", "Noto Serif Armenian", "Noto Serif Khmer", "Noto Serif Lao", "Noto Serif Thai"]

// inspired by Lalit Patel's fontdetect.js
// https://www.lalit.org/wordpress/wp-content/uploads/2008/05/fontdetect.js?ver=0.3

const baseFonts = ['monospace', 'sans-serif', 'serif']
const list = [...fontList, ...extendedFontList]
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

const getTextMetricsFonts = ({context, baseFonts, families}) => {
	return new Promise(resolve => {
		try {
			if (!context) {
				throw new Error(`Context blocked or not supported`) 
			}
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
			return resolve({
				fonts,
				perf: performance.now() - start
			})
		} catch (error) {
			console.error(error)
			return resolve({
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
			})
		}
	})
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

const getSVGFonts = ({baseFonts, families}) => {
	return new Promise(resolve => {
		try {
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
			return resolve({
				fonts,
				perf: performance.now() - start
			})
		} catch (error) {
			console.error(error)
			return resolve({
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
			})
		}
	})
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

const getRectFonts = ({baseFonts, families}) => {
    return new Promise(resolve => {
        try {
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
            const detectedViaBounding= new Set()
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
			const hasMismatch = !!Object.keys(fonts).filter(type => ''+fonts[type] != ''+fonts.client).length
            return resolve({
				fonts,
				lied: !hasBlocking && hasMismatch,
				perf: performance.now() - start
			})
        } catch (error) {
            console.error(error)
            return resolve({
				fonts: {
					client: [],
					bounding: [],
					clientRange: [],
					boundingRange: []
				},
				perf: 0
			})
        }
    })
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

const getPixelFonts = ({baseFonts, families}) => {
    return new Promise(resolve => {
        try {
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
			const hasMismatch = !!Object.keys(fonts).filter(type => ''+fonts[type] != ''+fonts.pixel).length
            return resolve({
				fonts,
				lied: !hasBlocking && hasMismatch,
				perf: performance.now() - start
			})
        } catch (error) {
            console.error(error)
            return resolve({
				fonts: {
					pixel: [],
					transform: [],
					perspective: [],
					size: []
				},
				perf: 0
			})
        }
    })
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

const getLengthFonts = ({baseFonts, families}) => {
    return new Promise(resolve => {
        try {
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
			const hasMismatch = !!Object.keys(fonts).filter(type => ''+fonts[type] != ''+fonts.scroll).length
            return resolve({
				fonts,
				lied: !hasBlocking && hasMismatch,
				perf: performance.now() - start
			})
        } catch (error) {
            console.error(error)
            return resolve({
				fonts: {
					scroll: [],
					offset: [],
					client: []
				},
				perf: 0
			})
        }
    })
}

const getFontFaceSetFonts = list => {
    return new Promise(async resolve => {
        try {
            const start = performance.now()
            // real world usage should use iframe document instead of window document
			const gibberish = '&WY2tR*^ftCiMX9LD5m%iZSWCVSg'
			if (document.fonts.check(`12px '${gibberish}'`)) {
				throw new Error('FontFaceSet.check blocked or not supported')
			}
            await document.fonts.ready
            //console.log([...document.fonts.values()].map(fontFace => fontFace.family)) // show fonts loaded on the page
            document.fonts.clear() // clear loaded or added fonts
            const fonts = list.filter(font => document.fonts.check(`12px '${font}'`))
            return resolve({
                fonts,
                perf: performance.now() - start
            })
        } catch (error) {
            console.error(error)
            return resolve({
				fonts: [],
				perf: 0
			})
        }
    })
}

const context = document.createElement('canvas').getContext('2d')
const contextOffscreen = ('OffscreenCanvas' in window) ? new OffscreenCanvas(500, 200).getContext('2d') : undefined
const [
	textMetricsFonts,
	textMetricsFontsOffscreen,
	svgFonts,
	rectFonts,
	pixelFonts,
	lengthFonts,
	fontFaceSetFonts
] = await Promise.all([
	getTextMetricsFonts({context, baseFonts, families}),
	getTextMetricsFonts({context: contextOffscreen, baseFonts, families}),
	getSVGFonts({baseFonts, families}),
	getRectFonts({baseFonts, families}),
	getPixelFonts({baseFonts, families}),
	getLengthFonts({baseFonts, families}),
	getFontFaceSetFonts(list)
]).catch(error => console.error(error))

const fingerprint = await hashify({
	textMetricsFonts: {...textMetricsFonts, perf: undefined },
	svgFonts: {...svgFonts, perf: undefined },
	rectFonts: !rectFonts.lied ? {...rectFonts, perf: undefined } : undefined,
	pixelFonts: !pixelFonts.lied ? {...pixelFonts, perf: undefined } : undefined,
	lengthFonts: !lengthFonts.lied ? {...lengthFonts, perf: undefined } : undefined,
	fontFaceSetFonts: {...fontFaceSetFonts, perf: undefined },
})

console.log('TextMetrics:\n', textMetricsFonts)
console.log('TextMetricsOffscreen:\n', textMetricsFontsOffscreen)
console.log('SVGRect:\n', svgFonts)
console.log('DOMRect:\n', rectFonts)
console.log('Pixels:\n', pixelFonts)
console.log('Lengths:\n', lengthFonts)
console.log('FontFaceSet:\n', fontFaceSetFonts)

div.parentNode.removeChild(div) // remove font-fingerprint element
const listLen = list.length
const el = document.getElementById('fingerprint-data')
patch(el, html`
	<div id="fingerprint-data">
		<style>
			.total {
				border: 1px solid #aaa6;
    			padding: 0 2px;
			}
		</style>
		<div class="visitor-info">
			<strong>Fonts</strong><span class="hash">${hashMini(fingerprint)}</span>
		</div>
		<div class="flex-grid">
			<div class="col-six relative">
				<span class="aside-note">${textMetricsFonts.perf.toFixed(2)}ms</span>
				<strong>TextMetrics</strong>
				<div class="relative">combined: ${
						!!textMetricsFonts.fonts.combined.length ? 
						hashMini(textMetricsFonts.fonts.combined) :
						note.blocked
					}
					<span class="aside-note total">${''+textMetricsFonts.fonts.combined.length}/${listLen}</span>
				</div>
				<div class="relative">ascent: ${
						!!textMetricsFonts.fonts.ascent.length ? 
						hashMini(textMetricsFonts.fonts.ascent) :
						note.blocked
					}
					<span class="aside-note">${''+textMetricsFonts.fonts.ascent.length}/${listLen}</span>
				</div>
				<div class="relative">descent: ${
						!!textMetricsFonts.fonts.descent.length ? 
						hashMini(textMetricsFonts.fonts.descent) :
						note.blocked
					}
					<span class="aside-note">${''+textMetricsFonts.fonts.descent.length}/${listLen}</span>
				</div>
				<div class="relative">left: ${
						!!textMetricsFonts.fonts.left.length ? 
						hashMini(textMetricsFonts.fonts.left) :
						note.blocked
					}
					<span class="aside-note">${''+textMetricsFonts.fonts.left.length}/${listLen}</span>
				</div>
				<div class="relative">right: ${
						!!textMetricsFonts.fonts.right.length ? 
						hashMini(textMetricsFonts.fonts.right) :
						note.blocked
					}
					<span class="aside-note">${''+textMetricsFonts.fonts.right.length}/${listLen}</span>
				</div>
				<div class="relative">width: ${
						!!textMetricsFonts.fonts.width.length ? 
						hashMini(textMetricsFonts.fonts.width) :
						note.blocked
					}
					<span class="aside-note">${''+textMetricsFonts.fonts.width.length}/${listLen}</span>
				</div>
				<div class="relative">font ascent: ${
						!!textMetricsFonts.fonts.fontAscent.length ? 
						hashMini(textMetricsFonts.fonts.fontAscent) :
						note.unsupported
					}
					<span class="aside-note">${''+textMetricsFonts.fonts.fontAscent.length}/${listLen}</span>
				</div>
				<div class="relative">font descent: ${
						!!textMetricsFonts.fonts.fontDescent.length ? 
						hashMini(textMetricsFonts.fonts.fontDescent) :
						note.unsupported
					}
					<span class="aside-note">${''+textMetricsFonts.fonts.fontDescent.length}/${listLen}</span>
				</div>
			</div>
			<div class="col-six relative">
				<span class="aside-note">${textMetricsFontsOffscreen.perf.toFixed(2)}ms</span>
				<strong>TextMetrics Offscreen</strong>
				<div class="relative">combined: ${
						!!textMetricsFontsOffscreen.fonts.combined.length ? 
						hashMini(textMetricsFontsOffscreen.fonts.combined) :
						note.blocked
					}
					<span class="aside-note total">${''+textMetricsFontsOffscreen.fonts.combined.length}/${listLen}</span>
				</div>
				<div class="relative">ascent: ${
						!!textMetricsFontsOffscreen.fonts.ascent.length ? 
						hashMini(textMetricsFontsOffscreen.fonts.ascent) :
						note.blocked
					}
					<span class="aside-note">${''+textMetricsFontsOffscreen.fonts.ascent.length}/${listLen}</span>
				</div>
				<div class="relative">descent: ${
						!!textMetricsFontsOffscreen.fonts.descent.length ? 
						hashMini(textMetricsFontsOffscreen.fonts.descent) :
						note.blocked
					}
					<span class="aside-note">${''+textMetricsFontsOffscreen.fonts.descent.length}/${listLen}</span>
				</div>
				<div class="relative">left: ${
						!!textMetricsFontsOffscreen.fonts.left.length ? 
						hashMini(textMetricsFontsOffscreen.fonts.left) :
						note.blocked
					}
					<span class="aside-note">${''+textMetricsFontsOffscreen.fonts.left.length}/${listLen}</span>
				</div>
				<div class="relative">right: ${
						!!textMetricsFontsOffscreen.fonts.right.length ? 
						hashMini(textMetricsFontsOffscreen.fonts.right) :
						note.blocked
					}
					<span class="aside-note">${''+textMetricsFontsOffscreen.fonts.right.length}/${listLen}</span>
				</div>
				<div class="relative">width: ${
						!!textMetricsFontsOffscreen.fonts.width.length ? 
						hashMini(textMetricsFontsOffscreen.fonts.width) :
						note.blocked
					}
					<span class="aside-note">${''+textMetricsFontsOffscreen.fonts.width.length}/${listLen}</span>
				</div>
				<div class="relative">font ascent: ${
						!!textMetricsFontsOffscreen.fonts.fontAscent.length ? 
						hashMini(textMetricsFontsOffscreen.fonts.fontAscent) :
						note.unsupported
					}
					<span class="aside-note">${''+textMetricsFontsOffscreen.fonts.fontAscent.length}/${listLen}</span>
				</div>
				<div class="relative">font descent: ${
						!!textMetricsFontsOffscreen.fonts.fontDescent.length ? 
						hashMini(textMetricsFontsOffscreen.fonts.fontDescent) :
						note.unsupported
					}
					<span class="aside-note">${''+textMetricsFontsOffscreen.fonts.fontDescent.length}/${listLen}</span>
				</div>
			</div>
		</div>
		<div class="flex-grid">
			<div class="col-six relative">
				<span class="aside-note">${svgFonts.perf.toFixed(2)}ms</span>
				<strong>SVGRect</strong>
				<div class="relative">combined: ${
						!!svgFonts.fonts.combined.length ? 
						hashMini(svgFonts.fonts.combined) :
						note.blocked
					}
					<span class="aside-note total">${''+svgFonts.fonts.combined.length}/${listLen}</span>
				</div>
				<div class="relative">width: ${
						!!svgFonts.fonts.width.length ? 
						hashMini(svgFonts.fonts.width) :
						note.blocked
					}
					<span class="aside-note">${''+svgFonts.fonts.width.length}/${listLen}</span>
				</div>
				<div class="relative">height: ${
						!!svgFonts.fonts.height.length ? 
						hashMini(svgFonts.fonts.height) :
						note.blocked
					}
					<span class="aside-note">${''+svgFonts.fonts.height.length}/${listLen}</span>
				</div>
				<div class="relative">y: ${
						!!svgFonts.fonts.y.length ? 
						hashMini(svgFonts.fonts.y) :
						note.blocked
					}
					<span class="aside-note">${''+svgFonts.fonts.y.length}/${listLen}</span>
				</div>
				<div class="relative">char width: ${
						!!svgFonts.fonts.charWidth.length ? 
						hashMini(svgFonts.fonts.charWidth) :
						note.blocked
					}
					<span class="aside-note">${''+svgFonts.fonts.charWidth.length}/${listLen}</span>
				</div>
				<div class="relative">char height: ${
						!!svgFonts.fonts.charHeight.length ? 
						hashMini(svgFonts.fonts.charHeight) :
						note.blocked
					}
					<span class="aside-note">${''+svgFonts.fonts.charHeight.length}/${listLen}</span>
				</div>
				<div class="relative">char y: ${
						!!svgFonts.fonts.charY.length ? 
						hashMini(svgFonts.fonts.charY) :
						note.blocked
					}
					<span class="aside-note">${''+svgFonts.fonts.charY.length}/${listLen}</span>
				</div>


				<div class="relative">sub string: ${
						!!svgFonts.fonts.subString.length ? 
						hashMini(svgFonts.fonts.subString) :
						note.blocked
					}
					<span class="aside-note">${''+svgFonts.fonts.subString.length}/${listLen}</span>
				</div>
				<div class="relative">text length: ${
						!!svgFonts.fonts.textLen.length ? 
						hashMini(svgFonts.fonts.textLen) :
						note.blocked
					}
					<span class="aside-note">${''+svgFonts.fonts.textLen.length}/${listLen}</span>
				</div>
			</div>
			<div class="col-six relative${rectFonts.lied ? ' lies': ''}">
				<span class="aside-note">${rectFonts.perf.toFixed(2)}ms</span>
				<strong>DOMRect</strong>
				<div class="relative">client: ${
						!!rectFonts.fonts.client.length ? 
						hashMini(rectFonts.fonts.client) :
						note.blocked
					}
					<span class="aside-note">${''+rectFonts.fonts.client.length}/${listLen}</span>
				</div>
				<div class="relative">bounding: ${
						!!rectFonts.fonts.bounding.length ? 
						hashMini(rectFonts.fonts.bounding) :
						note.blocked
					}
					<span class="aside-note">${''+rectFonts.fonts.bounding.length}/${listLen}</span>
				</div>
				<div class="relative">client range: ${
						!!rectFonts.fonts.clientRange.length ? 
						hashMini(rectFonts.fonts.clientRange) :
						note.blocked
					}
					<span class="aside-note">${''+rectFonts.fonts.clientRange.length}/${listLen}</span>
				</div>
				<div class="relative">bounding range: ${
						!!rectFonts.fonts.boundingRange.length ? 
						hashMini(rectFonts.fonts.boundingRange) :
						note.blocked
					}
					<span class="aside-note">${''+rectFonts.fonts.boundingRange.length}/${listLen}</span>
				</div>
			</div>
		</div>
		<div class="flex-grid">
			<div class="col-six relative${pixelFonts.lied ? ' lies': ''}">
				<span class="aside-note">${pixelFonts.perf.toFixed(2)}ms</span>
				<strong>Pixels</strong>
				<div class="relative">pixel: ${
						!!pixelFonts.fonts.pixel.length ? 
						hashMini(pixelFonts.fonts.pixel) :
						note.blocked
					}
					<span class="aside-note">${''+pixelFonts.fonts.pixel.length}/${listLen}</span>
				</div>
				<div class="relative">size: ${
						!!pixelFonts.fonts.size.length ? 
						hashMini(pixelFonts.fonts.size) :
						note.blocked
					}
					<span class="aside-note">${''+pixelFonts.fonts.size.length}/${listLen}</span>
				</div>
				<div class="relative">perspective: ${
						!!pixelFonts.fonts.perspective.length ? 
						hashMini(pixelFonts.fonts.perspective) :
						note.blocked
					}
					<span class="aside-note">${''+pixelFonts.fonts.perspective.length}/${listLen}</span>
				</div>
				<div class="relative">transform: ${
						!!pixelFonts.fonts.transform.length ? 
						hashMini(pixelFonts.fonts.transform) :
						note.blocked
					}
					<span class="aside-note">${''+pixelFonts.fonts.transform.length}/${listLen}</span>
				</div>
			</div>
			<div class="col-six relative${lengthFonts.lied ? ' lies': ''}">
				<span class="aside-note">${lengthFonts.perf.toFixed(2)}ms</span>
				<strong>Lengths</strong>
				<div class="relative">offset: ${
						!!lengthFonts.fonts.offset.length ? 
						hashMini(lengthFonts.fonts.offset) :
						note.blocked
					}
					<span class="aside-note">${''+lengthFonts.fonts.offset.length}/${listLen}</span>
				</div>
				<div class="relative">client: ${
						!!lengthFonts.fonts.client.length ? 
						hashMini(lengthFonts.fonts.client) :
						note.blocked
					}
					<span class="aside-note">${''+lengthFonts.fonts.client.length}/${listLen}</span>
				</div>
				<div class="relative">scroll: ${
						!!lengthFonts.fonts.scroll.length ? 
						hashMini(lengthFonts.fonts.scroll) :
						note.blocked
					}
					<span class="aside-note">${''+lengthFonts.fonts.scroll.length}/${listLen}</span>
				</div>
			</div>
		</div>
		<div class="flex-grid">
			<div class="col-six relative${fontFaceSetFonts.lied ? ' lies': ''}">
				<span class="aside-note">${fontFaceSetFonts.perf.toFixed(2)}ms</span>
				<strong>FontFaceSet</strong>
				<div class="relative">check: ${
						!!fontFaceSetFonts.fonts.length ? 
						hashMini(fontFaceSetFonts.fonts) :
						note.blocked
					}
					<span class="aside-note">${''+fontFaceSetFonts.fonts.length}/${listLen}</span>
				</div>
			</div>
		</div>
	</div>
`)

})()
