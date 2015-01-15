---
layout: post
date: 2013-05-27 19:30:00 +1200
author: Owen
title: "What Is DNS? Here's What You Need To Know: Part 1"

tags:
  - DNS
  - domains
  - internet

---

![blog-dns.jpg]({{ site.images_url }}/2013-05-27-blog-dns.jpg)

When you're new to building your own website it can feel like there's a bunch of things you need to know but you don't really have an idea where to start looking. Luckily [we make setting up domains really easy](https://iwantmyname.com/services) for hosted services through our iwantmyname marketplace so you don't have to worry about technical details most of the time. If you are trying to delve a bit deeper into the technology involved there are so many acronyms and strange words that it can feel a bit overwhelming however. But don't worry, we're here to help clear the air a little and explain what each thing does.

**DNS**

DNS technology touches your life in [many ways you probably don't know](http://www.huffingtonpost.com/paul-mockapetris/dns-what-celebrating-30-y_b_3211030.html) every day. It stands for **Domain Name System** which is the technology making it possible for you to type nice, human-friendly words into your address bar like *iwantmyname.com* instead of computer readable IP addresses such as 50.56.80.249.

The interesting thing about DNS is that in this case, _iwantmyname.com_ and e.g. _50.56.80.249_ are the same thing. Try it out for yourself and put 50.56.80.249 into your address bar. It might give you a warning, but should still take you to our front page. DNS is simply that -- it allows computers to translate human readable things, like a URL, into an IP address. If you're not clear on what an IP address is, think of it as a phone number in the phone book. It tells the potential caller where your phone is and how to call you. The phone book provides names so you know who you're calling. DNS does the same thing. It provides a friendly, memorable name, which the DNS associates with a website at the numbered address.

We're certainly glad this exists, otherwise it would be pretty hard for people to remember to visit us at 50.56.80.249, right?

**Name Server**

A name server is a web server with DNS software installed. It's where you manage all of your DNS records and set who your web/email host is. This is the part that allows you to determine who your visitors will be talking to when they ask for your website and where you'll be adding other records such as 'A' records and 'MX' records later on.

If your domain is registered with us, we automatically set the nameservers to ns1.iwantmyname.net, ns2.iwantmyname.net, ns3.iwantmyname.net and ns4.iwantmyname.net for example. This would mean you're able to manage the remainder of your DNS records using our dashboard and still [host your actual website elsewhere](https://iwantmyname.com/features/domains/web-hosting). The only catch with DNS is that when you make a change to the name servers it may take a few hours before you can see the changes. This is called DNS propagation and depends on the Internet Service Providers involved between your computer and the hosting company. So if you have made an update to your DNS records and you don't see any effect immediately, all you have to do is wait a few hours until the changes have fully propagated throughout the internet.

So much for the basics about DNS and nameservers. In our next article we will explain to you more about the different DNS record types such as A, CNAME, MX and TXT.
