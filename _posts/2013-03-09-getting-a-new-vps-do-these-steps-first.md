---
layout: post
date: 2013-03-09 19:50:22
author: Owen
title: Getting a new VPS? Do these steps first.

tags:
  - etckeeper
  - github
  - linux
  - security
  - vps

---

This week, we found a [great post by Bryan Kennedy](http://plusbryan.com/my-first-5-minutes-on-a-server-or-essential-security-for-linux-servers) on the things he spends the first five minutes doing on any new Linux server. We won't copy the content, but in essence it's a series of applications and tasks to run that allow you to be a safer system administrator.
We can't recommend following these steps enough &mdash; many first time VPS owners sign up for their [host](http://iwantmyname.com/features/domains/web-hosting) and do the bare minimum, leaving themselves wide open to compromise. The [Hacker News](http://news.ycombinator.com/item?id=5316093) thread about the post also contains some interesting discussion about other steps that can be taken to secure a server and provide basic notifications. Particularly interesting was [the note about _etckeeper_](http://news.ycombinator.com/item?id=5316539) &mdash; an application that commits changes to /etc/ to git, so that it's virtually impossible to destroy your own server.
If you're a bit more experienced, there are [ways to automate the](http://practicalops.com/my-first-5-minutes-on-a-server.html)tasks that are mentioned by Bryan so that it's easier to install and configure the server from the start.
