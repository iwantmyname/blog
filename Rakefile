require 'html/proofer'

task :test do
	HTML::Proofer.new("./_site", {
		# need more output so Travis CI continues to run
		verbose: true,
		href_ignore: [
			# ignore links to the main site to avoid thrashing the server
			# intentionally don't ignore http links so the 301 errors show up
			/^https:\/\/iwantmyname\.com($|\/)/,
			/^https:\/\/iwantmyname\.co\.nz($|\/)/
		],
		href_swap: {
			# make blog links relative
			# if any "missing href" errors appear, it's due to a lack of trailing slash
			/^https:\/\/iwantmyname\.com\/blog/ => ""
		}
	}).run
end
