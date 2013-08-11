;(function (root, factory) {

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = factory({}, require('../lib/salsa20.js'), true)
	} else {
		if (typeof root.Cryptocat === 'undefined') {
			root.Cryptocat = function () {}
		}
		factory(root.Cryptocat, root.Salsa20, false)
	}

}(this, function (Cryptocat, Salsa20, node) {

var state

Cryptocat.generateSeed = function() {
	// The following incredibly ugly Firefox hack is completely the fault of 
	// Firefox developers sucking and it taking them four years+ to implement
	// window.crypto.getRandomValues().
	function firefoxRandomBytes() {
		var element = document.createElement('cryptocatFirefoxElement')
		document.documentElement.appendChild(element)
		var evt = document.createEvent('HTMLEvents')
		evt.initEvent('cryptocatGenerateRandomBytes', true, false)
		element.dispatchEvent(evt)
		var output = element.getAttribute('randomValues').split(',')
		element = null
		return output
	}
	var buffer, crypto
	// Node.js ... for tests
	if (typeof window === 'undefined' && typeof require !== 'undefined') {
		crypto = require('crypto')
		try {
			buffer = crypto.randomBytes(40)
		} catch (e) { throw e }
	}
	// Firefox
	else if (navigator.userAgent.match('Firefox') &&
		(!window.crypto || !window.crypto.getRandomValues)
	) {
		buffer = firefoxRandomBytes()
	}
	// Browsers that don't require shitty workarounds
	else {
		buffer = new Uint8Array(40)
		window.crypto.getRandomValues(buffer)
	}
	return buffer
}

Cryptocat.setSeed = function(s) {
	if (!s) { return false }
	state = new Salsa20(
		[
			s[ 0],s[ 1],s[ 2],s[ 3],s[ 4],s[ 5],s[ 6],s[ 7],
			s[ 8],s[ 9],s[10],s[11],s[12],s[13],s[14],s[15],
			s[16],s[17],s[18],s[19],s[20],s[21],s[22],s[23],
			s[24],s[25],s[26],s[27],s[28],s[29],s[30],s[31]
		],
		[
			s[32],s[33],s[34],s[35],s[36],s[37],s[38],s[39]
		]
	)
}

Cryptocat.getBytes = function(i) {
	if (i.constructor !== Number || i < 1) {
		throw new Error('Expecting a number greater than 0.')
	}
	var bytes = state.getBytes(i)
	return (i === 1) ? bytes[0] : bytes
}

Cryptocat.randomBitInt = function(k) {
	if (k > 31) {
		throw new Error('That\'s more than JS can handle.')
	}
	var i = 0, r = 0
	var b = Math.floor(k / 8)
	var mask = (1 << (k % 8)) - 1
	if (mask) {
		r = Cryptocat.getBytes(1) & mask
	}
	for (; i < b; i++) {
		r = (256 * r) + Cryptocat.getBytes(1)
	}
	return r
}

Cryptocat.encodedBytes = function(bytes, encoding) {
	var sa = String.fromCharCode.apply(null, Cryptocat.getBytes(bytes))
	return CryptoJS.enc.Latin1.parse(sa).toString(encoding)
}

if (node) {
	// Seed RNG in tests.
	Cryptocat.setSeed(Cryptocat.generateSeed())
}

return Cryptocat

}))//:3