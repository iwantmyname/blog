date: the future
author: 'Ley
title: We've Got Your Back 
excerpt: false
header_image: a_thing_that_is_securitey.jpg
-----

At iwantmyname we consider making it easier for you to control and own your identity online as one of core principles. Hell it's in the branding. But what happens after that; are we sure everytime someone tries to connect to your identity that they actually connecting with you.

We can do that now with DNSSEC and DS records.

The easiest way to set this up is if your Nameserver provider support DNSSEC, Cloudflare pictured below. Then enable it and get your DS record.
![Cloudflare interface](media/2016-the-future-cloudflare-dnssec.png)

Then in on our site copy the relvant bits of the DS record and put it in the DS record part of your domain management. https://iwantmyname.com/dashboard/domains/dnssec/<domain name in question>


![iwantmyname interface](media/2016-the-future-iwantmyname-dnssec.png)

After that you're done. Various computers around the internet will double check that the computer someone is connecting to is actually you. Thus making sure that you and your name are synomous.


A longer explanation can be found on the [CloudFlare blog](https://blog.cloudflare.com/dnssec-an-introduction/)


