layout: post
date: 2013-03-14 16:30:48 +1200
author: Timo
title: Migrating Your Site And Custom Domain From Posterous To Posthaven Made Easy
----

![Posthaven logo]({{ site.images_url }}/2013-03-14-logo-blog-posthaven.png)

It's no big surprise that blog hosting service (or whatever it was in the end) [Posterous](http://posterous.com) will stop operating on April 30 after having been acquired by Twitter last year. Luckily, former Posterous co-founders Garry Tan and Brett Gibson have just launched a new venture to give your previous Posterous site a new home. It's called [Posthaven](http://posthaven.com) and plans to bring back the core functionality of Posterous which was posting to your blog by email or an online text editor without all the fluff. They also plan to charge for the service (we applaud them for that!) instead of taking the free route and trying to figure out how to make money later. You see how that turned out for Posterous...

### How to import your Posterous sites into Posthaven

Until April 30th, you can download all of your Posterous sites including your photos, videos, and documents:

- Go to [http://posterous.com/#backup](http://posterous.com/#backup).
- Click to request a backup of your Space by clicking "Request Backup" next to your Space name.
- When your backup is ready, you'll receive an email.
- Return to [http://posterous.com/#backup](http://posterous.com/#backup) to download a .zip file.

Then log in at [Posthaven](http://posthaven.com) and import the file. Done!

### Changing the DNS from Posterous to Posthaven

Should you have a custom domain, the next step is to change the DNS records at your domain registrar. Log in to your domain management panel and look for the following A record:

- 184.106.20.102

If your Posterous site was set up on the naked domain and 'www' subdomain, you have to change both values and replace them with:

- 54.235.156.25 (A record for the naked domain)
- posthaven.com (CNAME for the 'www' subdomain)

You can also find a detailed description in [Posthaven's FAQ](http://archived.link/http://posthaven.com/help/customdomain).

For domains registered with iwantmyname, we offer all this as an easy 1-click service from the "Setup" tab in your personal dashboard. Simply select Posthaven from the app marketplace and you're all done.

Don't have a custom domain yet? [Buy a new domain for your Posthaven site now](https://iwantmyname.com/services/blog-hosting/posthaven-custom-domain).

[![Example: Garry Tan's Posthaven blog with custom domain]({{ site.images_url }}/2013-03-14-garry-tan-posthaven-screenshot.png)](http://blog.garrytan.com)

### 10% off domain transfers from Posterous to iwantmyname

We now offer 10% off each .com / .net / .org [domain transfer](https://iwantmyname.com/domains/domain-transfer) for your domains previously registered through Posterous (i.e. their registrar partner eNom) until April 30, 2013.

And if all of the above sounds really complicated to you, make sure to check out our managed transfer service. Simply mention the code "MOVETOPOSTHAVEN" in the comments section and we'll take care of [migrating your domain from Posterous to Posthaven](https://iwantmyname.com/transferservice).
