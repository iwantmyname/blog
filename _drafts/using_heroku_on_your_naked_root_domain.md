----
layout: post
author: Kevin
title: Using Heroku on your naked domain / root domain
----

<!--
https://iwmn.desk.com/agent/case/37054
-->

Many of our customers develop their domains on the [Heroku](https://iwantmyname.com/services/developer/heroku-cloud-hosting-custom-domain) platform or use a service powered by Heroku. You might be one of them. And whether you know it or not, our [one-click catalog](https://iwantmyname.com/dashboard/apps/featured) can get your domain configured with your Heroku app in no time at all.

You will soon notice, however, that we're unable to offer Heroku configurations for your naked/root domain, but instead require that you use a subdomain (usually "www"). I'd like to explain why and provide you with a few alternatives.

### Limitations of Heroku domains

So you've decided you want to use a custom domain with your Heroku app. Great! It's as easy as adding a CNAME record in your domain's DNS manager that points your domain to your app. (If your reaction to that last sentence was "wait, what?", then don't worry! Our app marketplace takes care of all this configuration for you with just one click. Use the "Apps & Services" link from your "Setup" dashboard menu.)

But there's a catch. CNAME records will prevent any other record types on a hostname from resolving. This means that if you had a CNAME record on your root domain (e.g. iwantmyname.com), you wouldn't be able to use email (e.g. support@iwantmyname.com) or other services with that domain. Not ideal!

### Alternatives

### How to get set up on CloudFlare
