date: 2014-01-03 12:05:22 +1200
author: Chris
title: How do I connect my domain to a hosting account?
----

Platforms like [Squarespace](https://iwantmyname.com/features/applications/custom-domain-apps/websites/squarespace-build-your-website-with-own-url) and [Virb](https://iwantmyname.com/services/website-builder/virb-custom-domain) are great for getting clean, well-designed sites on the web, but at the end of the day your website is being hosted on servers you have little-to-no access to. For most, this is no big deal, but for site owners who want a bit more control, there's nothing more satisfying (and useful) than getting some [hosting space](https://iwantmyname.com/features/domains/web-hosting) and setting up something that's all your own.

And once you get your space, the most important next step is to setup your domain name. Here's how:

To connect your iwantmyname domain to a hosting account, all you need to do on our end is change your ***nameservers*** to your desired host. For this example we'll use ***Site5 Hosting***, but you'll quickly see how easy it is to change your nameservers to any host.

1. Before you do anything on our end, it is necessary to add your domain in your hosting account first. This will ensure the process will go smoothly once the nameserver changes are made at iwantmyname. If you're unsure of how to do this, instructions can typically be found on your hosts' support page.

2. Login to your account at iwantmyname and select ***Manage DNS*** under ***Setup*** in the main navigation.

![Screen Shot 2014-01-03 at 11.38.23.png](/media/2014-01-03-Screen_Shot_2014-01-03_at_11.38.23.png)

3. On the next screen, select ***Update nameservers*** next to your desired domain.

4. By default, your nameservers will be set to iwantmyname. With these settings, you can perform one-click installs for any of the apps in our marketplace, but with self-hosting, you'll be moving your DNS management to your new host. To do this, click the dropdown menu labelled ***Popular settings*** and select your host. For this example, we're going to select Site5 Hosting.

![Screen Shot 2014-01-03 at 10.32.39.png](/media/2014-01-03-Screen_Shot_2014-01-03_at_10.32.39.png)

If your host is not on the list, select ***I have my own nameservers...*** from the list and input the records provided by your host. Also, when changing from the iwantmyname nameservers, make sure any excess iwantmyname information is deleted from Nameserver 3 and Nameserver 4. Mixing custom host nameservers with iwantmyname nameservers can have odd results.

5. Now that your nameservers are changed, click the ***Update nameservers*** button to complete the process.

​Once this process has been completed, it often takes a few hours for the nameserver changes to go through. If you are unsure of your nameserver changes, or if they have not gone through within 48 hours, [please send us a message](https://iwantmyname.com/support). We're always here to help.

Also, please note that once your nameservers have been changed, all further DNS management will move to your hosting provider. You will not be able to make any changes to A, CNAME or MX records in your iwantmyname dashboard any longer.
