---
layout: post
date: 2015-01-16 11:53:45 +1200
author: Timo
title: SEO penalties of moving our blog to a subdomain
header_image: 2015-01-16-moving.jpg
---

<!-- excerpt -->

Let me start this article by confessing that we’re not SEO gurus at iwantmyname. Everything we've done in the last few years in terms of SEO was done with a basic understanding of the topic and by providing a good product with relevant content and landing pages. This always served us well and we were happy with our rankings overall. With that out of the way, I’d like to tell you about our experience with switching our blog to a subdomain. 

<!-- /excerpt -->

At the very beginning of July last year, we moved our blog from a subdirectory URL (`iwantmyname.com/blog`) to a subdomain (`blog.iwantmyname.com`) for better maintainability and performance with GitHub Pages' <abbr title="content delivery network">CDN</abbr> and future-proofing in case we wanted to switch to a different platform down the road. We made this decision after doing lots of research and had long discussions about how it might impact our search engine rankings, but we ultimately agreed to make the change. After all, it was 2014 and Google should be clever enough that it wouldn’t make any difference because they know the blog (subdomain or not) is part of iwantmyname, right? As Matt Cutts said [in one of his webmaster videos](https://www.youtube.com/watch?v=_MswMYk05tk) “it’s a question which one is easier for you and whichever one makes you happier I would go and do it that way”.

While we expected an initial hit after making the subdomain switch and traffic slowly recovering, the turnaround didn’t happen after 6 months, as you can see in the following example:

![Blog traffic after switch to subdomain]({{ site.images_url }}/2015-01-16-blog-traffic-subdomain-switch.png)

From what we can tell, we did everything by the books with `301` redirects for all URLs - so what happened? Could it have been just coincidence that Google updated their algorithm and we got penalized for some reason?

One signal that Google introduced one month after us making the switch was to give SSL-secured sites a little ranking boost. Since [our blog is running on GitHub Pages](https://github.com/iwantmyname/blog), which [doesn’t currently support HTTPS](https://github.com/isaacs/github/issues/156), could that have prevented the traffic from recovering? Certainly it can’t be that much of a ranking signal—although they mentioned it would increase in importance over time?

So after waiting for six months, we reverted the change and switched our blog back to the previous `/blog` subdirectory. It’s still hosted on GitHub Pages and we’re using a simple Nginx proxy to show the content under `iwantmyname.com/blog`:

```
location = /blog {
  # GitHub Pages doesn't redirect this properly, so we'll handle it
  return 301 /blog/;
}

# ^~ to allow /blog/ to match before our other regex locations
location ^~ /blog/ {
  proxy_pass https://iwantmyname.github.io;
  proxy_intercept_errors on;
  # serve our custom 404 page from our blog repo instead of GitHub Pages' 404
  error_page  404  /blog/404.html;
  # allow GitHub to pass caching headers instead of using our own
  expires off;
}
```

An important side effect is that our blog pages are now secured under our primary SSL certificate again.

---

Based on this experience and the following [recommendation from Moz’s Rand Fishkin](http://moz.com/community/q/moz-s-official-stance-on-subdomain-vs-subfolder-does-it-need-updating#reply_217479), we decided it would be better for our long-term SEO strategy to put our blog back on our primary domain:

> I would still strongly urge folks to keep all content on a single subdomain. We recently were able to test this using a subdomain on Moz itself (when moving our beginner's guide to SEO from guides.moz.com to the current URL http://moz.com/beginners-guide-to-seo). The results were astounding - rankings rose dramatically across the board for every keyword we tracked to the pages.

We will certainly keep a close eye on traffic for the next few months and keep you updated. Hope this helps some of you when deciding on the age-old debate of whether you should have your blog on a subdomain or not!
