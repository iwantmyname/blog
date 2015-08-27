date: 2011-02-21 14:35:58 +1200
author: Timo
title: How to search for domains using your browser's address bar, AlfredApp, and DuckDuckGo
----

<!-- excerpt -->

For those of you who want to quickly search for domain names from the address bar of your favorite browser, app launcher or search engine, we have some tips how to set things up.

<!-- /excerpt -->

1. [Safari (using Glims)](#section-1)
2. [Firefox](#section-2)
3. [Chrome](#section-3)
4. [DuckDuckGo](#section-4)
5. [AlfredApp](#section-5)

***

<h2 id="section-1">Safari (using Glims)</h2>

[Glims](http://www.machangout.com/) is not only useful for custom keyword search but also adds lots of other helpful features to Safari. You need to install this plugin first to do the following.

![search-domain-glims.png](/media/2011-02-21-search-domain-glims.png)

Once you've installed Glims go to you Safari preferences, add iwantmyname to the search engine list using the URL `https://iwantmyname.com/search?domain=#query#` and choose the keyword for your custom query. All you have to do now is enter `iwmn domainname` (or any other keyword of your choice) in your browser's address bar and you will get our domain search result in an instant.

<h2 id="section-2">Firefox</h2>

Add a bookmark in Firefox and replace the domain in our search URL, e.g. `https://iwantmyname.com/search/?domain=yourdomainname` needs to be replaced with `https://iwantmyname.com/search/?domain=%s`.

![firefox-custom-search-add.png](/media/2011-02-21-firefox-custom-search-add.png)

By adding a tag of your choice, you can now type `tagname domainname` in your address bar which will give you the results for your domain search.

Alternatively, you can use the [iwantmyname Open Search plugin](http://mycroft.mozdev.org/search-engines.html?category=29) from [Jannis Gundermann](http://www.jannisgundermann.com) to add our domain search to Firefox.

<h2 id="section-3">Chrome</h2>

A right-click in your address bar lets you edit the search engines Chrome uses. Simply add our search URL `https://iwantmyname.com/search/?domain=%s` and add the keyword you would like to use for your custom search.

![google-chrome-domain-search-iwantmyname.png](/media/2011-02-21-google-chrome-domain-search-iwantmyname.png)

<h2 id="section-4">DuckDuckGo</h2>

Thanks to [Louis Galipeau](https://twitter.com/muloka), you can also search for domains at iwantmyname directly from the [DuckDuckGo](http://duckduckgo.com) search box. Just enter `!iwant domainname` and you will be forwarded to the search result page.

![duckduckgo-domain-search.png](/media/2011-02-21-duckduckgo-domain-search.png)

<h2 id="section-5">AlfredApp</h2>

The [Swiss knife of all app launchers](http://alfredapp.com) makes it really easy to add custom searches. Go to *Preferences &gt; Features &gt; Custom Searches* and add the following domain search URL: `https://iwantmyname.com/search?domain={query}`

Now define a keyword and you can immediately search from the AlfredApp window.

![alfred-app-domain-search.png](/media/2011-02-21-alfred-app-domain-search.png)
