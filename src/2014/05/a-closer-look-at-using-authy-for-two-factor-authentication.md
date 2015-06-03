date: 2014-05-02 08:14:58 +1200
author: Chris
title: A closer look at using Authy for two-factor authentication
----

<!-- excerpt -->

Yesterday I [went over](https://iwantmyname.com/blog/2014/04/a-practical-look-at-using-iwantmynames-two-factor-authentication.html) using a setting up two-factor authentication, so now lets do a quick dive into Authy itself. Specifically about what it is, what platforms you can use it on and how the Authy setup works. 

{{ template "vimeo" "71272779" }}

<!-- /excerpt -->

###What is Authy?

[From Klint Finley - Wired:](http://www.wired.com/2013/07/authy/)

>Authy is one of several companies working to bring a security technique called “two-factor authentication” to the masses. With two-factor authentication, you provide more than just a username and password when you log into a service. You provide additional credentials, such as a hardware dongle, a fingerprint, or a unique PIN number that was just text-messaged to your phone. That way, even if someone knows your password, they can’t find their way into your stuff.

>But Authy’s service isn’t something you use all on your own. You need help from third-party software developers. The company offers tools that let developers add its two-factor authentication to specific applications. Then, if you use one of these third-party apps, Authy provides another tool that ties into the app and manages your credentials. This tool can also double as a client for Google Authenticator, a similar service from the web search giant.

###Downloading Authy

There are a number of ways you can set Authy up now, including:

+ [iOS](https://itunes.apple.com/us/app/authy/id494168017)
+ [Android](https://play.google.com/store/apps/details?id=com.authy.authy)
+ [Google Chrome for Mac, Linux or Windows](https://chrome.google.com/webstore/detail/gaedmjdfmmahhbjefcbgaolhhanlaolb)

Authy for Chrome is brand new (here's the [official announcement](http://blog.authy.com/authy-for-pc)), and lets you authenticate all your codes right from your computer. [From Frederic Lardinois - TechCrunch](http://techcrunch.com/2014/04/28/authy-brings-two-factor-authentication-to-the-desktop/):

>As the company’s founder and CEO Daniel Palacio told me last week, being able to get your second factor from your desktop and laptop makes for a far more seamless user experience. Instead of typing in a code, you can just copy and paste it from the desktop app. For those users who don’t have a smartphone, this also provides an easier alternative to the usual SMS messages services like Authy utilize to send their codes.

>...

>But doesn’t that defeat the purpose of a two-factor application? Authy — unsurprisingly — claims it doesn’t. “Two-factor authentication is still valid regardless of whether the second authentication factor ‘you have’ comes from your cellphone, your tablet, or right from a desktop app in your laptop,” the company writes in a blog post today. “What really matters, is that it is something only you can have.”

###What the setup looks like

I personally have Authy downloaded on iOS and Chrome, so I'll walk through what the setups looked like.

**iOS**

![setup iOS](/media/2014-05-02-authy-setup.png)

Once you download the app, you're shown a screen that lets you attach a phone number to your Authy app. Then, to verify that you are the owner of the phone number, you just follow the directions in the screen below.

![verification iOS](/media/2014-05-02-authy-ver.png)

Now, when you add your number into a platform like iwantmyname, verifications and such will go to the correct device.

**Chrome**

![alt](/media/2014-05-02-authy-chrome.png)

Once you install Authy for Chrome, you're shown a similar screen as the iOS install that lets you enter your phone number. Just add it in, type in the code from the following text and you're good to go. 

###Find more information

If you'd like to find more information about Authy, here are a few good places to start:

+ Find answers to common questions, or ask your own, on the [Authy FAQ](https://www.authy.com/faq)
+ Tweet Authy [@authy](https://twitter.com/Authy)
+ Authy has 11 informational videos on [Vimeo](http://vimeo.com/user13020702/videos)
+ If you're interested in integrating Authy to your platform, here's an introduction on [Tuts+](http://code.tutsplus.com/tutorials/two-factor-auth-using-authy--net-33402)
+ We're big fans of DigitalOcean, and they have a great [article](https://www.digitalocean.com/community/articles/how-to-install-authy-and-configure-two-factor-authentication-for-ssh) titled, "How To Install Authy And Configure Two-Factor Authentication For SSH"


