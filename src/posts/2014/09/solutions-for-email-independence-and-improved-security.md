layout: post
date: 2014-09-23 06:55:15 +1200
author: Chris
title: 3 solutions for email independence and improved security

----

<!-- excerpt -->

![Post Office]({{ site.images_url }}/2014-09-23-post-office.jpg)

Email is one of those things most of us take for granted—this is your email address, and you can put it in any email app you want via IMAP or POP3. But each email address isn't the same, and many platforms leave security/privacy minded individuals looking for better alternatives.

<!-- /excerpt -->

So here's what you're up against. Gmail, the most common email platform we come across, is a great example of what "free" email entails. From a decidedly non-tech article on [CNN](http://edition.cnn.com/2014/03/31/tech/web/gmail-privacy-problems/):

>Google reported $16.86 billion in revenues for the last quarter of 2013 alone. One way it makes money from Gmail is by automatically scanning and indexing messages and using the data it mines to show relevant ads to its users.
>
>"The basic premise of Gmail is, we'll give you a robust e-mail service and in exchange we want to display ads alongside our e-mail and we're scanning your e-mail to decide what ads are most relevant," said Eric Goldman, a professor at the Santa Clara University School of Law.

Far scarier than Google using your data for money though is the thought of being targeted by mass surveillance—especially if it's your own government reading your messages as part of some national-security initiative. Some of the very things that scared the original readers of George Orwell's 1984 so much are becoming true, and while most of us aren't living in fear under a totalitarian state, where does the privacy line stop in our modern society? Could privately disagreeing with a public program over email put you on some kind of watch list? Could a harmless interaction with a coworker make you a surveillance target? Maybe not, but you'd be a fool to be too sure.

At this point, the best way to secure our collective email data is to decentralize it—to get it off the big grid. Here's why, from [Wired](http://www.wired.com/2013/08/mailpile/):

>Einarsson, an ex-Googler, points out that one of the biggest problems with e-mail is that large providers like Gmail make tempting targets for both malicious hackers and overzealous governments. A government service or a hacker with “direct access” to Google could tap thousands, perhaps millions, of e-mail boxes. But if no single e-mail provider had such a large user base, government and attackers would have a much harder time.

>“It’s more expensive to subpoena hundreds or thousands of [e-mail providers] all over the world than it is to subpoena one big target like Gmail,” Einarsson says.

Now that we've established the problem, let's find some solutions.

##Mailpile

If your problem is that all your data is stored in a massive cloud, the simple solution is to take it off. With the [Mailpile](https://www.mailpile.is/) email client, your email is downloaded locally—directly from the internet to your computer (or wherever). And when they say locally, they mean it.

Here's a great [FAQ](https://www.mailpile.is/faq/) question:

>Then how do I access it when my computer is turned off?
>You don't! :-) for this reason, you may prefer to leave Mailpile running on a computer that is always on. You can then access it over the network using your web browser.

It's email on your terms, and only you have access to it—which is how it should be. Mailpile is still in beta, but definitely keep track of its progress on their [blog](https://www.mailpile.is/blog/).

##Mail-in-a-Box

If you'd prefer to deploy your own email server (i.e. completely take control of your email), [Mail-in-a-Box](https://mailinabox.email/) is the solution for you. Just keep in mind that it's not a great solution for the average user.

Here's the big holdup—from the "[Pre-flight Checklist](https://mailinabox.email/guide.html)":

>Can I run it at home?
>No. Most residential Internet service providers block outbound mail to prevent abuse by spammers, and most residential networks are blocked on the receiving end because of that spam problem. Your home IP address is also probably dynamic, which is also a problem.

So if you're in the market to become your own ISP, you don't mind being the admin of your own system, and you have a "completely fresh Ubuntu 14.04 machine" in a non-residential location, Mail-in-a-Box is definitely something worth checking out.

##ProtonMail

Another way to get around potential government spying is to house your email servers in a country with strict privacy laws. So, in addition to end-to-end encryption, zero tracking, and self-destructing messages (think [Mission Impossible](http://www.youtube.com/watch?v=MA2KmJMKFrQ)), [ProtonMail](https://protonmail.ch/) "is incorporated in Switzerland and our servers are located in Switzerland. We are outside of US and EU jurisdiction and user data is protected by strict Swiss data protection laws." Also, the company was founded by "scientists who met at CERN"—and that has to count for something.

Unfortunately, the ProtonMail Beta is currently on hold due to demand, but more [invites](https://protonmail.ch/invite) will be going out once additional servers are put in place.


