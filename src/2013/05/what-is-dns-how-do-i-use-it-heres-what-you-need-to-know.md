date: 2013-05-27 19:30:00 +1200
author: Owen
title: What is DNS? Here's what you need to know
header_image: 2013-05-27-blog-dns.jpg
----

<!-- excerpt -->

When you're new to building your own website it can feel like there's a bunch of things you need to know but you don't really have an idea where to start looking. Luckily [we make setting up domains really easy](https://iwantmyname.com/services) for hosted services through our iwantmyname marketplace so you don't have to worry about technical details most of the time. If you are trying to delve a bit deeper into the technology involved there are so many acronyms and strange words that it can feel a bit overwhelming however. But don't worry, we're here to help clear the air a little and explain what each thing does.

<!-- /excerpt -->

1. [DNS](#section-1)
2. [Name Server](#section-2)
3. [A Record](#section-3)
4. [CNAME Record](#section-4)
5. [MX Record](#section-5)
6. [TXT Record](#section-6)

***

<h2 id="section-1">DNS</h2>

DNS technology touches your life in [many ways you probably don't know](http://www.huffingtonpost.com/paul-mockapetris/dns-what-celebrating-30-y_b_3211030.html) every day. It stands for **Domain Name System** which is the technology making it possible for you to type nice, human-friendly words into your address bar like *iwantmyname.com* instead of computer readable IP addresses such as 50.56.80.249.

The interesting thing about DNS is that in this case, _iwantmyname.com_ and e.g. _50.56.80.249_ are the same thing. Try it out for yourself and put 50.56.80.249 into your address bar. It might give you a warning, but should still take you to our front page. DNS is simply that -- it allows computers to translate human readable things, like a URL, into an IP address. If you're not clear on what an IP address is, think of it as a phone number in the phone book. It tells the potential caller where your phone is and how to call you. The phone book provides names so you know who you're calling. DNS does the same thing. It provides a friendly, memorable name, which the DNS associates with a website at the numbered address.

We're certainly glad this exists, otherwise it would be pretty hard for people to remember to visit us at 50.56.80.249, right?

<h2 id="section-2">Name Server</h2>

A name server is a web server with DNS software installed. It's where you manage all of your DNS records and set who your web/email host is. This is the part that allows you to determine who your visitors will be talking to when they ask for your website and where you'll be adding other records such as 'A' records and 'MX' records later on.

If your domain is registered with us, we automatically set the nameservers to ns1.iwantmyname.net, ns2.iwantmyname.net, ns3.iwantmyname.net and ns4.iwantmyname.net for example. This would mean you're able to manage the remainder of your DNS records using our dashboard and still [host your actual website elsewhere](https://iwantmyname.com/features/domains/web-hosting). The only catch with DNS is that when you make a change to the name servers it may take a few hours before you can see the changes. This is called DNS propagation and depends on the Internet Service Providers involved between your computer and the hosting company. So if you have made an update to your DNS records and you don't see any effect immediately, all you have to do is wait a few hours until the changes have fully propagated throughout the internet.

<h2 id="section-3">A Record</h2>

The A record is the record that maps your domain name to a specific IP address on the internet. As an example you would configure an address, like iwantmyname.com to point to an IP address, e.g. 50.56.80.249.

<h2 id="section-4">CNAME Record</h2>

If you want to have a subdomain at another address, say mail.iwantmyname.com exists on another web server, like Gmail, this is where CNAME would be useful. It allows you to direct traffic that reaches that subdomain to a separate address. There are some other uses for this too, Google allows you to use it to verify you own a domain and reset your Gmail administrator password, for example.

<h2 id="section-5">MX Record</h2>

This one's easy: MX records tell people who try to send you email at your domain where your email service is hosted. The catch with MX records is that you should always set more than one to make sure that if one URL or server at your email host is unavailable you can still receive email. These are set using priority numbers. 

If you to were use Google Apps for email for example, you would have a first MX record of ASPMX.L.GOOGLE.COM, with a value/priority of 1. Then, you would have a second record of ALT1.ASPMX.L.GOOGLE.COM with a priority of 10. This tells potential email senders' servers that they should use the first record of ASPMX.L.GOOGLE.COM if it's available, but if not, they can still send email to the same system at ALT1.ASPMX.L.GOOGLE.COM instead.

<h2 id="section-6">TXT Record</h2>

These kinds of records are used for all sorts of things. For verifying domain ownership, combating spam (with SPF) and a few other usages. 

These aren't used to get to your website at all. For another example that uses Google Apps again, you would verify your domain by potentially placing a TXT value on your DNS of google-site-verification=rXOxyZounnZasA8Z7oaD3c14JdjS9aKSWvsR1EbUSIQ and this proves to Google that you indeed own the domain, since you were able to add the record. 

Many services that you could use with your domain use TXT as a way to verify ownership, but SPF is another case where TXT records are used to help stop spammers from using pretending to be from your domain name. By setting a SPF record (using a DNS TXT entry), it helps other servers verify if mail from your domain is really from you or just being faked. You can read more about that here.

***

## Phew, still with us?

This is a overview of just some of the types of DNS entry. There are plenty more out there, such as [AAAA](http://en.wikipedia.org/wiki/AAAA_record#IPv6_in_the_Domain_Name_System) and [SRV](http://en.wikipedia.org/wiki/SRV_record) records, but these are more advanced and you likely won't need to know about these to get started. If you have any questions, sound off in the comments or [send us an email](https://iwantmyname.com/support) and we'll try to help you out!

