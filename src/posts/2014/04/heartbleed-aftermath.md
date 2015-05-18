layout: post
date: 2014-04-14T12:47:04
author: Lenz
title: The Heartbleed aftermath
----

<!-- excerpt -->

As you likely know, we are now coming to understand the full implications of the OpenSSL vulnerability (aka the "[Heartbleed bug](http://heartbleed.com/)") that was disclosed last week. [Here is an excellent graphical explanation of the vulnerability.](http://xkcd.com/1354/) New angles of attack against vulnerable infrastructure come up every day. 

(Have you patched your home router and updated your passwords after [checking sites for vulnerability](http://heartbleed.com/)?)

At iwantmyname, we patched all servers the day the vulnerability was disclosed. However, we also did more. Read on for more in-depth information on how we handle our security, and recommendations for our customers on managing their accounts and passwords.

<!-- /excerpt -->

The iwantmyname infrastructure is split up into several layers, and the front-facing application server actually has very little data in memory. Most of our processing happens in backend servers that are not directly exposed and have had no vulnerable services running.

To make sure none of our front-facing certificates are used in unintended ways we took the time to get new EV certificates for iwantmyname and revoked the old certs.

Learnings from this incident include the age-old mantra of "change your passwords frequently" and consider [two-factor authentication](http://en.wikipedia.org/wiki/Two-step_verification) (2fa) where appropriate. We support 2fa at iwantmyname, together with other risk mitigation technologies to make sure your account will not get compromised.

However, it comes down to your personal password "hygiene" to make sure your passwords are unique, frequently updated and securely stored.

Consider using a password manager that is both secure by design and proactive about security risks. We like [KeepassX](https://www.keepassx.org/) and [1password](https://agilebits.com/1password). Both are secure password storage mechanisms. If you want to roll your own password storage, make sure you use PGP/GPG to secure your passwords, and that your private keys are secured properly and long enough.

One last initiative we are currently working on is a complete disaster escalation plan. Similar to the zombie apocalypse plans some cities and organizations have prepared, this helps us to have a well-organized and communicated plan in place so everyone knows exactly what to do. This time around we were able to lock everything down very quickly, but who knows what the next bug will look like. Software is written by humans after all.
