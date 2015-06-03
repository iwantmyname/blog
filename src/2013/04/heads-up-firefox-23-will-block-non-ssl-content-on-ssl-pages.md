date: 2013-04-14 11:46:54 +1200
author: Owen
title: Heads Up: Firefox 23 will block non-SSL content on SSL pages
----

![logo-firefox.png](/media/2013-04-14-logo-firefox.png)

Web developers, it's time to check your content! Mozilla [has announced](https://developer.mozilla.org/en-US/docs/Site_Compatibility_for_Firefox_23#Non-SSL_contents_on_SSL_pages_are_blocked_by_default) that Firefox 23, which is due for release into beta on May 17, 2013 is going to feature a change that blocks all content that is non-SSL on an SSL secured page.
Many websites still load elements in an insecure fashion even when their website is SSL secured, so this change is hopefully going to put a swift end to that. There is some disagreement over what developers should be using to solve the problem over on [Hacker News](https://news.ycombinator.com/item?id=5514344), some argue for using [protocol-relative URL's](http://paulirish.com/2010/the-protocol-relative-url/) in linking and others argue that linking should explicitly indicate the protocol.
Regardless of how you fix it, Firefox 23 will exit beta and hit the stable channel on August 6, 2013. It's probably time to start planning for this now, not after it happens.
