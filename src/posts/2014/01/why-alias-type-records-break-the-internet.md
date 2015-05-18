layout: post
date: 2014-01-08 18:19:30 +1200
author: Lenz
title: Why ALIAS-type DNS Records Break The Internet


----

Today, [GitHub announced faster, more awesome GitHub Pages](https://github.com/blog/1715-faster-more-awesome-github-pages) recommending a new DNS setup for custom domains. In this article, I'll explain the implications if you consider setting up your naked domain with a so-called ALIAS record—more about this later.

As you may know DNS is, by definition, a heavily cached protocol. This means that if you change a DNS record, it will take some time until everyone who knows about the record actually sees the changes. Why did the DNS industry think this was a good idea? Because DNS is an old protocol and old servers used to have downtime and connectivity issues. If your nameserver is unreachable, the DNS caching built into the specification makes sure your domain still resolves if it has been cached in a resolver along your resolution path. That is a lot of stuff to digest, so here is how it looks:

![cache-name-res.png]({{ site.images_url }}/2014-01-08-cache-name-res.png)

First time a DNS record is looked up at the authoritative DNS, the record gets cached in your ISPs resolver cache.

![auth-name-res.png]({{ site.images_url }}/2014-01-08-auth-name-res.png)

Subsequent lookups for the same record will only hit the resolver cache even if the authoritative cache is offline.

This behaviour is important for the resilience of the DNS, and makes sure that even if things go wrong we can try to recover. The two important concepts introduced above are caching resolver versus authoritative nameserver. An authoritative nameserver always is the final authority on a DNS record and can deliver records in a predictable speed to make sure your DNS records are delivered in a fast and consistent way.

### Enter the ALIAS-type record

In order to point an apex or root domain to a different DNS record, as you would do to map it onto an existing service like [GitHub Pages](https://iwantmyname.com/services/developer/github-pages-custom-domain) or [Heroku](https://iwantmyname.com/services/developer/heroku-cloud-hosting-custom-domain), some providers offer something called an ALIAS record. These ALIAS-type records blur the lines between a caching resolver and an authoritative nameserver. An ALIAS record resolves on request the IP address of the destination record and serves it as if it would be the IP address for the apex domain requested. If the IP address for the destination changes, the IP address for the mapped domain changes automatically as well. This is really handy for service providers but makes every DNS provider concerned about service stability run in horror. Why?

DNS records get cached, as we have seen above. So if your DNS record is cached for IP address 1.2.3.4 and the service provider changes the record to 5.6.7.8, you will send traffic for your mapped apex domain to the wrong address until the record expires in all caching resolvers. This depends on how well your ISP sticks to the protocol and can take up to a day.

You also potentially break geoIP optimisations because suddenly you request the IP address from the nameserver of your DNS provider, not from your actual location. This may even get you in trouble with location restricted services (think Unblock-Us, just not in an intended way).

### There is no official industry standard yet

CNAME-like functionality on the zone apex has no formal specification and a very small backing in the industry that can only be called experimental at this stage. While we fully support experimental new approaches for many things, DNS and our customers connectivity for their domains is not one of them. We believe that DNS needs to be rock solid and reliable no matter what.

The right way of doing it is to accept that a root domain mapped onto another service either needs an IP address to point to or an HTTP redirect to a 'www' subdomain that can be pointed to your destination via CNAME. As long as there is no official DNS industry standard, embrace your 'www' subdomain and do not use aforementioned ALIAS-type records. It breaks the internet!
