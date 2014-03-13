#The iwantmyname guide to writing

iwantmyname blog posts tend to fall into four categories:

+ Long-form editorial
+ Short interviews
+ Interesting news
+ Link posts

Creativity is important though, so if you want to try something new, just make it happen. We really only have one rule—be clear. 

If you're introducing a concept that might be foreign, give it a little introduction or link it to a good source. And don't use pop culture as a crutch—we have an international audience, and many culture tidbits are isolated to specific regions.

Also, we don't write for SEO. Content on the iwantmyname blog is written with only our customers in mind. No keyword tricks or hidden repetitions here.

###Article titles

This may buck tradition, but article titles should be in sentence case, just without the period at the end. Periods are for full-stops, and we'd really like people to read the articles. 

If your title goes longer than one sentence, add a stop to sentence one, then leave sentence two open.

+ Ex: Looking for a domain? Here's a good one

###Headlines and subheads

Major article headings should be in H2, and should be in title case. You know the drill—capitalize important words, and leave the articles and prepositions lowercase.

+ Lowercase examples: a, and, the, for, to, as, by, of

Normal subheads should be in sentence case H3. Try not to use H4—we'd rather our articles not be that complicated.

###Images

You can really put images wherever you want, but if you're just going to use one, please put it on the top of your post. All images should be no larger than 650px wide and must be JPG, PNG or GIF.

And please don't add tiny right-or-left justified images. Let them breathe!

###Word style

We write in "American."

+ Favorite, not favorite
+ Color, not color

###Punctuation

**Commas:** Oxford University doesn't use the Oxford Comma, so we don't either. If the individual sentence articles are long, lay them out in bullets. And to avoid [confusion](http://weknowawesome.com/2011/09/30/the-oxford-comma-strippers-jfk-and-stalin/), put plural items last. 

+ Ex: We invited Stalin, JFK and the strippers.

**Capitalization:** Do capitalize TLDs, but do not capitalize the traditional web.

+ No caps: internet, email, website
+ Caps: .COM, .CO, .IO

**Company names:** Don't fudge naming conventions. iwantmyname is always lowercase. Other brands do other things.

**Hyphens:** We like the em dash with no space on either side.

+ Ex: There are some words here—here are some other words.

**Citations:** Put citations in quotes and link them in the leading sentence.

+ Ex: As iwantmyname writer Chris Hall [once wrote](https://iwantmyname.com/blog/2014/02/thoughts-on-editorially-closing.html), "Click the Mou icon, write document, save to Dropbox, publish it."

**Directions:** If you're guiding someone somewhere, use bold.

+ Ex: Click the **Reset Password** link

###Formatting long quotes

Do it like this:

[From Chris Hall - iwantmyname:](https://iwantmyname.com/blog/2013/09/chris-hall-is-a-writer.html)

>Chris Hall joins us to blog, grow our social presence, write web copy, think of big ideas and answer the occasional support question (the easy ones).

>He's also a big fan of coffee, fancy drinks, kitchen appliances, big buttons on the internet, retina displays and cold weather. You know, all the important stuff.

##Markdown

Instead of using a wonky WYSIWYG editor, we use Markdown.

###Intro to Markdown

Markdown was created by John Gruber as a method for creating clean HTML without all the ugly line breaks and tags. It's as easy to write as it is to read, and it makes writing for the web a breeze.[Here's a good place to start for help with the syntax.](http://daringfireball.net/projects/markdown/)

###Post header

`---
layout: post
date: 2014-03-04 13:39:14 +1200
author: FirstName
title: This is where your post title goes
---`

###Excerpts

If you look at the blog, the teaser intro is a bit that's marked out with tags:

+ `<!-- excerpt -->`
+ `<!-- /excerpt -->`

We usually mark the first few paragraphs as the excerpt, but feel free to use whatever bit of the content you want.

###Images

To add an image into a post, you first need to save the image into the Dropbox image folder with this format (if you don't have access to our Dropbox folder, please submit the photo with the article): 

+ `2014-03-04-pic-title.png`

The, use this format for your posts:

+ `![alt]({{ site.images_url }}/2014-03-04-pic-title.png)`

###Videos

+ YouTube: `{% include youtube.html id="oHU8WciU_6Q" %}`
+ Vimeo: `{% include vimeo.html id="87817306" %}`


