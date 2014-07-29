---
layout: post
date: 2010-07-22 08:09:04
author: Timo
title: "Tech Behind The Scenes: CouchDB Case Study"

categories:
  - CouchDB
  - Tech

tags:
  - Case Study
  - CouchDB
  - NoSQL

---

![Apache CouchDB logo]({{ site.images_url }}/2010-07-22-Couchdb-logo.png)

Thanks to our friends at [Couch.io](http://archived.link/http://couch.io) for publishing their case study about [CouchDB at iWantMyName](http://archived.link/http://www.couch.io/case-study-iwantmyname). We started using the [NoSQL database](http://couchdb.apache.org/) mainly for serving content but meanwhile switched nearly all site functionality from PostgreSQL to CouchDB.

For example, recently our shopping cart got replaced with a simple map/reduce based CouchDB solution that only needs some small glue and interface code. Before, it used to be a quite complex piece of code and database magic so for us the transition from traditional software design to a document based approach was mainly getting rid of heaps of code and logic.
If you're a techie, you should read the [iWantMyName case study on Couch.io](http://archived.link/http://www.couch.io/case-study-iwantmyname).
