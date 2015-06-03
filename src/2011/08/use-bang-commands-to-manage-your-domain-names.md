date: 2011-08-23 22:56:29 +1200
author: Timo
title: Use !bang Commands To Manage Your Domain Names
----

One of the primary goals at iWantMyName is getting out of the way of our customers when it comes to purchasing and managing domain names. We're also big fans of [search engine DuckDuckGo](http://duckduckgo.com) which inspired us to add some special sauce to our domain search, called !bang commands.

Using these !bang commands, you can easily add DNS records or other services such as Amazon S3, Github Pages or Tumblr to your domains directly [from the search box on iWantMyName homepage](https://iwantmyname.com). The following !bang commands are currently supported:

- *!edit domain.com* &mdash; brings you to the domain status page where you can edit all settings
- *!dns domain.com* &mdash; forwards you to our DNS manager for adding new records
- *!nameserver domain.com* &mdash; allows you to update the nameservers for a domain
- *!transfer domain.com* &mdash; immediately starts a [domain transfer to iWantMyName](https://iwantmyname.com/domains/domain-transfer)
- *!hostdns domain.com* &mdash; creates a zone on our nameservers to [host any external domain](https://iwantmyname.com/dns)
- *!updatewhois domain.com* &mdash; change the whois data for a particular name
- *!gapps domain.com* &mdash; easily set up Google Apps for your domain
- *!s3 domain.com* &mdash; lets you add Amazon S3 to your domain or subdomain
- *!github domain.com* &mdash; adds Github Pages
- *!tumblr domain.com* &mdash; adds Tumblr

**Pro tip: DuckDuckGo !bang command chaining**

DuckDuckGo users can also use !bang command chaining, for example try entering "!iwant !nsupdate domain.com" in the DuckDuckGo search field and you will end up at the nameserver update page in your iWantMyName dashboard.

We will be constantly adding new commands to our domain search and would also love to hear your suggestions in the comments.
