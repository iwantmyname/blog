var fs = require('fs')
var url = require('url')
var path = require('path')
var glob = require('glob')
var cheerio = require('cheerio')
var http = require('http')
var https = require('https')
var async = require('async')

var hrefs = {}

glob.sync(__dirname + '/_site/**/*.html').forEach(function (filename) {
	var contents = fs.readFileSync(filename)
	var $ = cheerio.load(contents)
	$('a, link').each(function () {
		var href = $(this).attr('href')
		hrefs[href] = hrefs[href] || []
		if (hrefs[href].indexOf(filename) === -1) {
			hrefs[href].push(filename)
		}
	})
	$('img, script').each(function () {
		var src = $(this).attr('src')
		hrefs[src] = hrefs[src] || []
		if (hrefs[src].indexOf(filename) === -1) {
			hrefs[src].push(filename)
		}
	})
})

var ignore = [
	'blog.iwantmyname.com',
	'iwantmyname.com',
	'iwantmyname.co.nz'
]

var statusCodes = {}
process.on('exit', function () {
	delete statusCodes[200]
	Object.keys(statusCodes).forEach(function (code) {
		statusCodes[code].forEach(function (href) {
			console.log(code, href, hrefs[href])
		})
	})
})

function request (href, done, originalHref, redirects) {
	var parsed = url.parse(href)


	if (parsed.host === 'blog.iwantmyname.com') {
		var target = parsed.path.replace(/[?#].*$/, '').replace(/^\//, __dirname + '/_site/')
		if (!path.extname(target)) {
			target = target.replace(/\/?$/, '/index.html')
		}

		hrefs[href].forEach(function (parent) {
			var filename = url.resolve(parent, target)
			if (!fs.existsSync(filename)) {
				console.log('parent:', parent)
				console.log('href:', href)
				console.log('target:', target)
				throw new Error('File not found: ' + filename)
			}
		})

	}
	return setImmediate(done)


	if (!parsed.host) return done()
	if (ignore.indexOf(parsed.host) !== -1) return done()

	var methods = {
		'http:': http.get,
		'https:': https.get
	}
	var method = methods[parsed.protocol]
	if (!method) return done()

	// console.log('requesting:', href)

	var req = method({
		host: parsed.host,
		path: parsed.path,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36'
		}
	}, function (res) {
		req.abort()
		console.log('  ', res.statusCode, href)

		var code = res.statusCode
		var location = res.headers.location
		if (!location) {
			statusCodes[code] = statusCodes[code] || []
			statusCodes[code].push(originalHref || href)
			return done(null, res)
		}

		if (redirects > 10) {
			return done(new Error('Too many redirects'))
		}

		// try again
		request(location, done, (originalHref || href), (redirects || 0) + 1)
	})

	req.on('error', function (err) {
		console.error(href, err.message)
		statusCodes['error'] = statusCodes['error'] || []
		statusCodes['error'].push(originalHref || href)
		done(err)
	})

	req.setSocketKeepAlive(true)
	req.setTimeout(1000 * 15, function () {
		req.abort()
		console.error(href, 'timeout')
		statusCodes['timeout'] = statusCodes['timeout'] || []
		statusCodes['timeout'].push(originalHref || href)
		done()
	})
}

var links = Object.keys(hrefs)
links.sort()

links.unshift('http://download.thinkbroadband.com/1GB.zip')

async.mapLimit(links, 10, request, function (err, results) {
	console.log('done', err, results.length)
})
