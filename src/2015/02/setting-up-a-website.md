date: 2015-02-03 12:55:04 -0700
author: Melle
title: It takes two to make a thing go right - setting up a website with your domain
header_image: 2015-02-03-cables.jpg
----

<!-- excerpt -->

Actually getting your own website with your own domain name online can be a bit like exploring a foreign land. Navigating uncharted territory, trying to decipher unfamiliar language. Creating a web presence is not for the weak.

At iwantmyname, we've put a lot of work into trying to make that process as painless as possible. And now, with designer [Kevin](https://iwantmyname.com/blog/2015/01/say-hi-to-the-newest-iwantmynamer-kevin-layshock.html) on board, we're hoping to make even greater strides in user experience friendliness.

One thing some people still sometimes struggle with, though, is just how to get a website up and running. If only it all happened by magic as soon as your domain was registered!

<!-- /excerpt -->

1. [Understanding web hosting](#section-1)
2. [Setting up your site with a service platform](#section-2)
3. [Verifying your domain name](#section-3)
4. [Setting up your site with third-party hosting](#section-4)

<h2 id="section-1">Understanding web hosting</h2>

Typically, you can think of the process a bit like setting up a piece of electronics equipment. The cable needs to be plugged into the machine _and_ into an electrical outlet. Your domain name needs to be connected to a web platform in our system _and_ in the system of your hosting service platform. When setting up your website, you can do these steps in whatever order you choose. I'll explain in a bit more detail.

All websites need a host, somewhere to "live". Think of your domain name as the address of your house, and the hosting as the actual house the address refers to. 

At iwantmyname, we focus on domains and DNS management, so we don't offer hosting. However, we want it to be as easy as possible for you to set up hosting with whatever provider you choose. That can be done a couple of different ways, depending on your hosting choice.

<h2 id="section-2">Setting up your site with a service platform</h2>

![Apps](/media/2015-02-03-apps.png)

You can sign up with a service that provides a platform: this includes web hosting _and_ the software to create and display your website and its contents. Examples of this include Squarespace, Big Cartel, Zenfolio, or Tumblr. In those cases, you have an account with the service, and set up and make changes to your website in that account.

Many of those platforms make it incredibly easy to set up great-looking sites with little technical know-how. Click on preferred colours, drag and drop how you want things to look, and you're all set. 

Sometimes you pay just to have an account, sometimes the services are free. Or they can be free for a basic account, and then you pay to scale up the features and flexibility: a "pro" account.

Many of the services in [our one-click marketplace](https://iwantmyname.com/services) are that kind. They provide the hosting and platform for your blog, portfolio, online store, etc. Clicking that green **Install** button adds DNS records for your domain in your iwantmyname dashboard. Those DNS records connect your domain name to your account and site with the service platform. That's half the battle.

<h2 id="section-3">Verifying your domain name</h2>

Some services require you to verify your domain ownership in their system for security purposes. In those cases you'll likely have to add another DNS record that contains a unique code, which the service checks for. 

You get the code from the other service (Squarespace and Google Apps are good examples) and add a CNAME or or TXT record containing the code, then save the new settings. Where we can, we ask you for that code in our one-click setup, and add that extra record for you. The screenshot below shows the one-click setup for Squarespace. (You can see an example of instructions on how to get the verification code [here](http://help.squarespace.com/guides/domain-mapping-with-iwantmyname).)

![Squarespace verification](/media/2015-02-03-squarespace-verification.png)

Once the settings have some time to propagate around the Internet (a few hours is plenty of time, usually), you can verify ownership in your account with the platform service. Often you can do this by just entering your domain name in your account there and clicking a button. These services generally have excellent documentation to explain where and how to complete that. But if you have questions, [we're happy to help, too](https://iwantmyname.com/support).

This verification is often the biggest part of setting up your domain with the other service. When verification isn't needed, it's often as simple as logging in to your account on that platform, adding your domain name in your account, and saving the new settings.

Where possible, when you finish setting up the DNS records you need in our system, we try to send you to the other site to complete the setup there, too. Once setup is done on both ends and the new settings have time to propagate around the Internet — voila! — you have your new website! (If there's a snag, [we're here to help](https://iwantmyname.com/support).)

<h2 id="section-4">Setting up your site with third-party hosting</h2>

Web hosting can also be provided by a third-party hosting service, on which your website's files reside. Those services generally only provide hosting, and not the software to create your website or email accounts. 

[Our recommended hosting partners are Bluehost and Digital Ocean](https://iwantmyname.com/features/domains/web-hosting), which provide only the hosting. Then you can use whatever software and services you like. WordPress is also a popular option, though it provides both the hosting and the software.

When you use external web hosting, you connect your domain to the hosting account by adding their nameservers in your iwantmyname dashboard. Using external nameservers is kind of like having your mail forwarded after you move. 

![Nameservers](/media/2015-02-03-nameserver-options.png)

In your iwantmyname account dashboard, on the nameserver update page, there's a drop-down list of many popular hosting providers. Clicking on the one with which you have an account will automatically fill in their nameservers. Then you just have to save the new settings. 

Alternatively, you can get the nameservers from your hosting company (or set up your own, if you're techy) and add them. They often look something like this: 

* ns1.domainhosting.com
* ns2.domainhosting.com

When you use external web hosting, there is one important thing to remember, which is that you then have to set up any DNS records in your web hosting account, _not_ in your iwantmyname account. Our DNS management dashboard can only work when our nameservers are in place. If there's any trouble with the DNS records, we can't access or see them in your hosting account, so you'd need to ask your hosting provider for help.

When setting up your website with a domain name you have registered with us, you will only have to set things up in one of these two ways: either adding DNS records to a service platform, or updating nameservers for an external web hosting.

It is possible to set up more than one service platform in your iwantmyname account. For example, if you would like to set up a website and email accounts. Or have an online store and a blog. [Feel free to get in touch](https://iwantmyname.com/support) if you have questions about how to do any of these things.