layout: post
date: 2010-10-26 16:38:46 +1200
author: Timo
title: SSL, Cookies and Caching

categories:
  - Security

tags:
  - domains
  - security
  - ssl

----

Here we go again, the SSL topic is up on [Hacker News](http://news.ycombinator.com/item?id=1827928) and we couldn't agree more! [Firesheep](http://codebutler.com/firesheep) is a wonderful tool to play with and once again we are in the middle of the security versus performance discussion. Session hijacking is a serious threat, but whether or not it is a threat to you really depends heavily on the environment you operate in.

The chief issue with SSL is that today's Javascript heavy pages load slowly because caching does not work under SSL. This brings down the performance significantly and may be a reason for those who don't care about security to go elsewhere (and there are many who are willing to trade speed for security). A hybrid approach, involving loading the page itself in HTTPS and the Javascript and CSS files in HTTP, does not work either because it breaks the HTTPS browser security and confuses visitors more than it helps.

Looking at this dilemma we decided that because we are in the fortunate situation that our customers are generally more of a tech savvy crowd - we can let them choose. If you are in the safe environment of your office, where you trust the ones who listen to your traffic, you may choose to trade security for speed and switch off the SSL protection for URLs that are considered safe. But if you are in a conference where normally some script kiddies listen to your traffic, it is a good idea to switch on the new session protection so that all traffic is SSL encrypted from the moment you log into our site.

So how does the standard SSL protection work on iWantMyName? We decided that some pages hold sensitive information and that we will only ever display them on HTTPS secured pages. However, others are not as sensitive and we display them on plain HTTP to gain some speed. All pages that handle passwords of any kind (including authorization codes for domain transfers) or billing information are secure, whereas others like your dashboard that only hold general information are served via HTTP.

While this gives security for the individual pages it does not secure against session hijacking. To enable SSL for the entire time your session is authorized on our page we added a new switch. In your Dashboard under "Account -> Settings" is a switch for security settings. Enabling this switch will set your entire session to SSL irrespective of whether you are browsing our public website or looking at your credit card data. While this might slow down things a bit, it protects effectively against session hijacking and makes sure your domains are as safe as possible.

By providing you with this option we think that we can give you the flexibility to decide what level of security you need and then take the appropriate action.
