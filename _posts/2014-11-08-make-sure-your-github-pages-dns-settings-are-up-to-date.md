---
layout: post
date: 2014-11-08 05:19:46 +1200
author: Chris
title: "This is important—make sure your GitHub Pages DNS settings are up-to-date"

---

<!-- excerpt -->

![GitHub]({{ site.images_url }}/2014-11-08-github.png)

At the beginning of 2014, GitHub Pages announced some major [content delivery improvements](https://github.com/blog/1715-faster-more-awesome-github-pages)—and the DNS changes were made in our one-click installs nearly right away. But for customers who added GitHub Pages (using the old GitHub Pages DNS settings) before the announcement, this is an important message. 

<!-- /excerpt -->

From GitHub:

>Starting the week of November 10th, pushing to a misconfigured site will result in a build error and you will receive an email stating that your site's DNS is misconfigured. Your site will remain available to the public, but changes to your site will not be published until the DNS misconfiguration is resolved.
>
>For the week of November 17th, there will be a week-long brownout for improperly configured GitHub Pages sites. If your site is pointed to a legacy IP address, you will receive a warning message that week, in place of your site's content. Normal operation will resume at the conclusion of the brownout.
>
>Starting December 1st, custom domains pointed to the deprecated IP addresses will no longer be served via GitHub Pages. No repository or Git data will be affected by the change.

Please note that if you're using the old settings, you should receive an email from GitHub letting you know you need to make the change (or you can check [here](https://github.com/blog/1917-github-pages-legacy-ip-deprecation) to see now). If you're in this camp, please refer to the [GitHub Pages custom domain setup](https://help.github.com/articles/setting-up-a-custom-domain-with-github-pages/) to guide you through setting up your DNS settings correctly.

And, as always, if you have any questions about the GitHub Pages improvements or the new DNS settings, [definitely let us know](https://iwantmyname.com/support).  We're always here to help.

