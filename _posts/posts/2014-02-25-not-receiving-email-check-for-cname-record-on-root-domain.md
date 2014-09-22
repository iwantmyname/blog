---
layout: post
date: 2014-02-25 17:45:00 +1200
author: Kevin
title: Not receiving email at your domain? Check for a CNAME record on the root level.
---

We used to hear this all too frequently in our support channels. A customer adds a new DNS record for their website and suddenly can't receive email on their domain—the email service that had been working fine in the months prior.

The cause? That CNAME record that was just added to the naked/root domain.

<!-- more -->

[Josh Strange recently published an article](http://joshstrange.com/why-its-a-bad-idea-to-put-a-cname-record-on-your-root-domain/) relaying this exact situation where a seemingly convenient CNAME record on his root domain prevented his email service from working without him realizing it:

> Then just this last weekend I went to signup for an eBay Developers account so I could play with the API but the email confirmation never came through.

<!-- this is just to break up the block quotes -->

> Something clicked in my head and I started to vaguely remember reading something when first setting up my blog about how CNAME records don't belong on your root domain. When I had read that I had written it off as I did not fully understand what it was saying at the time. Now, armed with this revelation, I started searching for "CNAME and MX conflicts" and found countless people warning against it.

After a bit of digging, he found [the answer on ServerFault](http://serverfault.com/a/91718/14374):

> This is a common error. You cannot use a CNAME RR for your root domain (e.g. company.com) **and** define additional resource records for the same zone.
> 
> See [Why can't I create a CNAME record for the root record?](https://support.dnsmadeeasy.com/index.php?/Knowledgebase/Article/View/14/0/why-cant-i-create-a-cname-record-for-the-root-record) and [RFC1034](http://www.faqs.org/rfcs/rfc1034.html) section 3.6.2 for details.

At iwantmyname, we understand that DNS can be tricky and we don't expect you to know all the ins-and-outs. For your sanity, our DNS manager prevents you from adding a CNAME record to your root domain. And all of our [one-click DNS configurations](https://iwantmyname.com/services) ensure that this doesn't happen either.

We can, of course, still add this record for you, but only after you confirm that you understand the risks of breaking the RFC. For web apps that require a CNAME record (e.g. Heroku, Ghost), we redirect your naked domain to the "www" variant so that the CNAME can be used correctly and effectively.