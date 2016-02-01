date: 2016-02-01 09:00:00 -0700
author: Ley
title: We've got your back with DNSSEC
excerpt: false
----

At iwantmyname, we consider making it easy for you to control and own your online identity as one of our core principles. Hell, it's in the branding. But what happens after that? Are we sure every time someone tries to connect to your identity, they're actually connecting with you?

We can do that now with DNSSEC and DS records.

The easiest way to set this up is if your Nameserver provider supports DNSSEC (like Cloudflare, pictured below). Just enable it there, then grab your DS record to use with your domain.

![Cloudflare interface](https://iwantmyname.com/blog/media/2016-02-01-dnssec.png)

Then, on our site, copy the relevant bits of the DS record to the DS record page in your domain admin (you can find that at https://iwantmyname.com/dashboard/domains/dnssec/<**domain name in question**>)

![iwantmyname interface](https://iwantmyname.com/blog/media/2016-02-01-iwantmyname-dnssec.png)

Once you're done, *the internet* will start double checking that the server people are connecting to is actually yours. Thus making sure that you and your name are synonymous.

***

If you're interested, an in-depth explanation of what DNSSEC is (and why you might want it) can be found on the [CloudFlare blog](https://blog.cloudflare.com/dnssec-an-introduction/)
