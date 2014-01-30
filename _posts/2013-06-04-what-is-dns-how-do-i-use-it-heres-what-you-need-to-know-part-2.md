---
layout: post
date: 2013-06-04 16:08:48
author: Timo
title: "What Is DNS? Here's What You Need To Know: Part 2"
---

![DNS Records]({{ site.images_url }}/2013-06-04-logo-dns.png)This is the second part in our article series about DNS basics. Check out last week's article [explaining the Domain Name System in general and nameservers](https://iwantmyname.com/blog/2013/05/what-is-dns-how-do-i-use-it-heres-what-you-need-to-know.html). Today we will tell you more about the different DNS record types such as A, CNAME, MX and TXT records:

**A Record**

The A record is the record that maps your domain name to a specific IP address on the internet. As an example you would configure an address, like iwantmyname.com to point to an IP address, e.g. 50.56.80.249.

**CNAME Record**

If you want to have a subdomain at another address, say mail.iwantmyname.com exists on another web server, like Gmail, this is where CNAME would be useful. It allows you to direct traffic that reaches that subdomain to a separate address. There are some other uses for this too, Google allows you to use it to verify you own a domain and reset your Gmail administrator password, for example.

**MX Record**

This one's easy: MX records tell people who try to send you email at your domain where your email service is hosted. The catch with MX records is that you should always set more than one to make sure that if one URL or server at your email host is unavailable you can still receive email. These are set using priority numbers. 

If you to were use Google Apps for email for example, you would have a first MX record of ASPMX.L.GOOGLE.COM, with a value/priority of 1. Then, you would have a second record of ALT1.ASPMX.L.GOOGLE.COM with a priority of 10. This tells potential email senders' servers that they should use the first record of ASPMX.L.GOOGLE.COM if it's available, but if not, they can still send email to the same system at ALT1.ASPMX.L.GOOGLE.COM instead.

**TXT Record**

These kinds of records are used for all sorts of things. For verifying domain ownership, combating spam (with SPF) and a few other usages. 

These aren't used to get to your website at all. For another example that uses Google Apps again, you would verify your domain by potentially placing a TXT value on your DNS of google-site-verification=rXOxyZounnZasA8Z7oaD3c14JdjS9aKSWvsR1EbUSIQ and this proves to Google that you indeed own the domain, since you were able to add the record. 

Many services that you could use with your domain use TXT as a way to verify ownership, but SPF is another case where TXT records are used to help stop spammers from using pretending to be from your domain name. By setting a SPF record (using a DNS TXT entry), it helps other servers verify if mail from your domain is really from you or just being faked. You can read more about that here.

**Phew, still with us?**

This is a overview of just some of the types of DNS entry. There are plenty more out there, such as [AAAA](http://en.wikipedia.org/wiki/AAAA_record#IPv6_in_the_Domain_Name_System) and [SRV](http://en.wikipedia.org/wiki/SRV_record) records, but these are more advanced and you likely won't need to know about these to get started. If you have any questions, sound off in the comments or [send us an email](http://iwantmyname.com/support) and we'll try to help you out!
