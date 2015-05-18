layout: interview
date: 2014-10-18 05:32:21 +1200
author: Chris
title: An interview with Dan Tocchini, Founder and CEO of The Grid
header_image: 2014-10-16-the-grid-team.jpg
----

<!-- excerpt -->

The internet has come a long way since the "dawn of the blogs" in the early 90's, but as Anil Dash [wrote recently](http://dashes.com/anil/2014/09/15-lessons-from-15-years-of-blogging.html), "The tools for blogging have been extraordinarily stagnant. And this stagnation is particularly egregious when we consider that almost every common behavior on the big social networks is a subset of what we originally thought blogging might be." 

Forecasting the future of blogging—and website creation in general—is a tall task, but there's one upcoming platform that seems to be dreaming bigger than the rest—[The Grid](https://thegrid.io/). So I had a chat with The Grid's founder and CEO, Dan Tocchini (who also happens to be an awesome iwantmyname customer), to find out what the new platform is all about. 

<!-- /excerpt -->

***

*Chris:* **So first, tell me what The Grid is? Who's it for?**

*Dan:* The Grid is the first AI platform for designing websites. So basically, you throw content in—images, videos, text—and the output is an elegant website that's as easy to update as a social network. But it's constantly evolving itself, trying to figure out the best possible layout—to go above and beyond the best drag-and-drop builders out there.

Who's it for? I believe in designing products for humans, not businesses. The initial market is definitely the creators, the artists, the entrepreneurs—people who have the most immediate need for websites. I think that as time goes, it's going to be for everyone. For humans. 

*Chris:* **So you mentioned that it's as easy as your social network. Do you see The Grid becoming a social replacement?**

*Dan:* Well I think social..."social"...media is a temporary replacement for websites, because websites are so hard to do anything with. So in that sense, when there's a good-enough website, it'll be inherently social. 

I think things like Pinterest and Facebook and Twitter have really bloomed because of the lack of good-enough website solutions—the lack of a good enough place to put your content, so we've all settled to build someone else's website. At the end of the day, your Facebook page is just part of someone else's website.

*Chris:* **There's one thing I think traditional websites lack, and that's the network effect you get from something like Facebook. You go on and you have a built in audience of X number of people. Now I see that The Grid has a kind of newsfeed built in—tell me how that works.**

*Dan:* So if you think about it, what makes things like Facebook, Pinterest, and Twitter social? Even Tumblr. Really, it's the newsfeed—the fact that I don't have to go and click on every single person's profile to see what's going on. And right now on websites, what are you going to do? Bookmark it? RSS died, and for good reason. It's hard for sites to know how many followers they have, and you don't really know if someone likes something.

So The Grid is hopefully going to solve the entire website problem. Not just the creation of sites, but the entire network around them. So you'll be able to follow websites that are created on The Grid as well as websites that aren't created on The Grid. You'll have a newsfeed of all the sites you follow.

*Chris:* **How will that look?**

*Dan:* We have some prototypes laid out. It looks a little like [The Grid website](https://thegrid.io/)—our site is the first website we've really let loose in the wild that's fully built with our AI system. The newsfeed will look a lot like that—it won't be as linear and monotone as the newsfeeds you're used to right now. There will be some variation in the scrolling experience, and we'll let things take up space to create rhythm as you scroll. It'll feel more like a website, just without the branded header at the top. 

*Chris:* **So speaking of design and how websites are built, is this the end of web design?**

*Dan:* <Laughter> Really, it begins with a good designer's brain. We're doing our best to build a deep API so people can create layout filters, but the goal is for designers to take the things they're doing and really design a section of the layout. Get it totally right, and then give it constraints, or high level rules, for when that section of the layout should be used. 

For example, on The Grid's website, we literally just threw in some Markdown files, Word docs, and images and it went. We didn't choose the sections, or the order. Other than the top section, all the colors were extracted from the content provided. 

Here's an example. There's one section of the page that has a girl with crazy hair, and on the left there's text on top of the image, and that text doesn't have a background. What you can do is design a section that says, here's text on top of an image, and the text doesn't need a background because this image has an area of low contrast that's suitable to put text on top. So we give those API's to designers so they can create rules like that, then the way the content is marshaled in is determined by them. So we're not replacing designers, we're replacing the task of manually putting content into rigid templates.

Replacing designers would just be crazy. Maybe in 100 years. Right now, that's crazy.

*Chris:* **So what happens if you see something in The Grid that you don't like—something that's in a place it's not supposed to be?**

*Dan:* What's interesting is, we're really getting away from websites looking one way. When you come back to it, it might look a little different—even if you didn't add any new content. And there might be subtle variations. One layout might have things on the left, then next time they could be on the right. So there isn't just one way your site looks. But we do have a way to say, "so that's crap," but that's really at a high level.  We don't give control over individual sections, because the moment you start doing that, your site becomes brittle—we wouldn't be able to A/B test or go beyond what you manually configure. That's not the world we want to be in. 

What we want is for you to treat The Grid as a designer. You send your content to the designer, they come up with some ideas, then send it back. If you don't like it, you can say "give me something else," but you shouldn't tell your designer to make the logo bigger. If you're dealing with a good designer, that's just not going to be ok. 

*Chris:* **Let's talk a little about A/B testing.  I read that it's automated. Does that mean the AI will be able to tweak your content?**

*Dan:* What happens is that the layout engine "solves" your design. It takes a piece of content and creates a suitable solution. With the types of algorithms we're using, there's ambiguity in the results—many just-as-suitable solutions to your content. Your content could be computed as 15 different layouts, all of which look equally good to us. So the system goes through and figures out which one is best by testing them each. 

*Chris:* **But it doesn't go through and change words of anything, right?**

*Dan:* No, but there's one thing we really want to do, and that's add the ability to create alternate titles for layout solution sets—so you could have multiple titles and see which one converts best. The real idea is to have A/B testing that scales, because everyone talks about A/B testing, but no one really does it.

*Chris:* **A/B testing always makes me think of e-commerce, which seems to be a pretty big focus. How is it going to work? From what I gather, you just drop items in and set a price, then magic happens.**

*Dan:* Yeah. So first of all, e-commerce is a very big deal. When we first started this thing, we knew that to really solve a website problem, we'd have to make e-commerce a priority. It's critical. 

So on The Grid, instead of having a rigid content hierarchy, where you have videos, images, products, galleries, shipping carts, this, and that—instead, you just post stuff. And if you put a price on it, it's a product, or you could link it to a product. If you add a bunch of images and a bunch of videos, it's a gallery. We're purposefully keeping what you can do with commerce very flexible and ambiguous.

*Chris:* **Can you expand on that a bit?**

*Dan:* We're very ambitious with what we're going after, and there are a lot of things around commerce and the social connections within commerce that I think are going to be some of the most critical things when we're at scale. It's one of those things we can't talk about too much right now, but we're definitely going to be pushing the envelope on not just the website creation, but the connections you make with websites. 

A little further out, we'll be looking at financial connections—having money seamlessly just go between people. Like, when you send a friend to someone's website to see a video, but you happen to buy something through that connection, maybe a wallet would go up. There are a lot of really cool things we want to do with that.

And then speaking really far down the line, to me, these are really just all 2D interface problems. Then things get crazy. < laughs >

*Chris:* **Last question. How big do you think this office is going to get (the room is small, but well designed, with three people plugging away at workstations)?**

*Dan:* You know, we're very non-local. Our team is about 20 people now, and most of the guys are in Europe. We're in, I think, eight time zones. I kind of like the non-traditional office thing. We get together every couple months in a different city around the world and rent the best Airbnb place we can find, and we just hack together for awhile without all the life distractions. It's really cool. 

This year we've been to Berlin a couple times, Florence, Toronto—they've come out to San Francisco a couple times.  I think it what would be killer to continue that, but we'll probably end up having a base here in San Francisco and a base in Berlin.

***

And that wraps it up (I'll spare you the pleasantries). [The Grid](https://thegrid.io/)'s v1 release is currently scheduled for late Spring 2015, but you can be a "Founding Member" right now, which locks you in at $8/mo (instead of $25/mo), seven custom sites, and a few other nifty perks. 

It's the future, y'all. Embrace it.

***

Before you go, don't forget to watch the promo video. 

{% include youtube.html id="OXA4-5x31V0" %}
