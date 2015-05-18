layout: post
date: 2014-10-24 06:35:06 +1200
author: Lenz
title: Subdomain rot and the security implications
header_image: 2014-10-23-sticker-logo.png
----

<!-- excerpt -->

If you're anything like us, you probably know all-to-well the excitement of trying out new hosted services, then linking them to a subdomain of your main domain. You might try out a platform like Desk and put it on help.domain.tld, then try another platform on support.domain.tld. And inevitably, you'll find the one you like best and move on from there. 

But so many of us make the mistake of forgetting all the unused subdomains we have. On the surface, nothing on your site is any different, but then you start noticing the credit card statements filled with services you're not actually using. Canceling them is easy, but then there's the domain side. Even after you cancel the billing, your unused subdomain (let's say help.domain.tld, which was on Desk) is still being linked to the platform, and when you go to the domain, you're met with the default platform error message. 

Nothing to worry about, right?

<!-- /excerpt -->

Wrong, wrong, wrong. Because your subdomain is still being linked to the platform on the domain side, any not-so-well-meaning person can register for a Desk account and link it to the subdomain that's already setup. Then, basically, they're you. Everything they do with that Desk account looks legit, and theres really no way for you to notice because it's all happening outside of your network.

***

This is a risk we've tried to keep under control with regular cleanups of our zone file, but we were reminded of it yesterday because of a post on the [detectify blog](http://blog.detectify.com/post/100600514143/hostile-subdomain-takeover-using-heroku-github-desk). Fortunately, they also link to a [quick tool](https://redoctober.detectify.com) that let's you know if you're in danger.

So if you do anything today, be sure to use [the tool](https://redoctober.detectify.com). We were sure to run it right away, and if you like to try new platforms even half as much as we do, you could save yourself a major headaches down the line.
