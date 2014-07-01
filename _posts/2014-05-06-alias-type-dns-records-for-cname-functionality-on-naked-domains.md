---
layout: post
date: 2014-05-06 10:04:30 +1200
author: Timo
title: Using ALIAS-type DNS records for CNAME functionality on naked domains, and an easier alternative

---

<!-- excerpt -->

If you've ever wanted to set up domains using cloud hosting services like Heroku or Windows Azure, you've probably come across a limitation with their platforms in regards to using naked domains (the version without the 'www' part, which is also called zone apex or root domain). There are two underlying problems here, due to the nature of how the Domain Name System works:

1. CNAME records must not be used on naked domains, meaning they will ask you to use a sub-domain, e.g. 'www' for your site or app.
2. They are unable to provide you with A records for setting up naked domains due to scalability issues. If there is an attack on their infrastructure, it would take down all sites using the same A record(s).

This scenario leaves you with two different options for setting up custom domains, both of which we will explore.

<!-- /excerpt -->

## Option 1: ALIAS-type DNS records

The answer for why you must not use CNAME records with naked domains is simple. It's not allowed [because the DNS specification says so](http://www.ietf.org/rfc/rfc1035.txt) (and some registries are very strict about this). While you can do it theoretically, there are certain side effects—the main one being that email services on your domain [will only work intermittently](http://blog.iwantmyname.com/2014/02/not-receiving-email-check-for-cname-record-on-root-domain.html), if at all.

That's where DNS hosting services offering CNAME functionality on the zone apex come into play. As of writing this article, here are the companies that provide such a solution:

- [CloudFlare](http://cloudflare.com) (free)
- [DNSMadeEasy](http://dnsmadeeasy.com)
- [DNSimple](http://dnsimple.com)
- [PointDNS](http://pointdns.com)
- [Amazon Route 53](http://aws.amazon.com/route53/) (only for hosting on AWS)

Using these services is as easy as updating your nameservers to theirs at your domain registrar. However, please note that there are no official standards around ALIAS-type DNS records yet, and there may be issues with general service availability, content delivery networks and DNSSEC. Some domain extensions like .IS don't even allow it. Also, if you do decide to use this method for domain mapping, [be aware of the implications](http://blog.iwantmyname.com/2014/01/why-alias-type-records-break-the-internet.html).

## Option 2: URL forwarding as alternative

The easiest way is to simply forward the naked domain 'yoursitename.com' to the 'www' sub-domain. Most domain registrars and DNS hosting services offer URL forwarding. If you set up Heroku or other hosted apps with [our one-click services setup](https://iwantmyname.com/services), we take care of this automatically.

Should your registrar charge extra for URL forwarding (some do) there are services like [RootRedirect.com](http://rootredirect.com) or [wwwizer](http://wwwizer.com) that allow you to achieve the same setup. The latter also offers a paid plan which gives you a dedicated IP address, and even includes an SSL certificate.

If you use forwarding, the main disadvantage is a cosmetic one—using the 'www' sub-domain as your primary address. But that's a small price to pay for a standards-compliant domain and DNS setup, in my opinion.


