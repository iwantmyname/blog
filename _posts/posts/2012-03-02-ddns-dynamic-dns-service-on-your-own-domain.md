---
layout: post
date: 2012-03-02 17:48:24
author: Lenz
title: Care For Dynamic DNS (DDNS) Updates?

categories:
  - DNS
  - Dynamic DNS

---

Over the past few days we had some requests for a simple API that allows DNS updates for your [domains](https://iwantmyname.com/domains) from the console or from within a script. We really wanted this for a long time too so I sat down and looked around for standards already in use. The de-facto standard for these sorts of updates seems to be DDNS -- used widely by DynDNS -- which is supported by many routers out of the box. We sat down and wrote a DDNS implementation for iWantMyName and you can use it right away. No configuration needed, no special stuff to set up, just start using it. The call looks like this:

    curl -u "[username]:[password]" \
      "https://iwantmyname.com/basicauth/ddns?hostname=[hostname1]&myip=[IP]"

There can be more than one hostname in the update call (separated by commas) and hostnames that don't exist yet will be created implicitly. Please keep in mind that DNS will be cached. In order to find out what records are currently set for your domain, just ask our nameservers directly:

    dig @ns1.iwantmyname.net [hostname]

This will return the current DNS settings for the hostname that our authoritative nameservers have. If you want to check the IP addresses various resolvers around the world know of, try the following [DNS check tool](http://www.whatsmydns.net/).

**[UPDATE]**

Thanks to feedback from our users we made our DDNS service even more useful. The "myip" parameter is now optional and gets automagically filled with the remote IP if not provided. This makes it even easier if you use this with a dynamic address as you can skip the step where you try to figure out your own address.
