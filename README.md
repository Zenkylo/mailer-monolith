# Mailer

Currently this project serves multiple functions. At some point they may be broken out into their own projects. For the time being it makes sense to have them all in one central codebase.

**Functionally, it includes:**

- static promo/landing page.
- customer-driven portal for email/subscription management
- admin-driven portal for customer management
- email sending

**Technologies used:**

- Adonis (Nodejs)
- Postgres
- Redis
- BullMQ
- Vue 3
- Inertia
- TailwindCSS
- DaisyUI
- Polar

**What does it do?**
Simply put, Mailer is a platform that allows customers to transfer data from self-hosted endpoints to their email inbox and does so on a user-scheduled basis.

**Who is it for?**
Mailer's primary audience is developers, or, for those who know how to set up their own http endpoints. However, I do see a path in the future where Mailer also serves customers who aren't as developer oriented.

**Why?**
Let's start with an example use case. Let's say I have my own blog. As part of my blog I track how many user visits occur each day. As a developer you'd be able to surface that information. You'd probably put it on a page where you could visit every day to see how many users visited the blog the prior day. This is the part that I'd prefer to avoid. Instead, Mailer could be used to transfer visitor information from that self-hosted page to your inbox. No longer do you need to manually visit the page every day. Instead, you can check your inbox every morning while you drink your coffee (like you already do) and see at a glance how many users visited your blog yesterday.

Simply put, Mailer take the following from **your self-hosted endpoint:**

```json
{
  // Exact structure wip
  "data": {
    "label": "Yesterday's Visitors",
    "value": 357
  }
}
```

and delivers it to your inbox like so:

[todo image]

and you can configure the delivery of this email. For example, every day at 9am, every Sunday at 10pm, the 3rd of each month at 8am, etc.

I've found myself needing a tool like to so I don't have to set up and deal with configuring email every time I want my own data in my inbox.

What's also nice about this approach is that if I want to edit/add/remove data that lands in your inbox its simply a matter of editing the self-hosted endpoint. No email formatting or dealing with other services. The only thing that needs updating is whatever mechanism you prefer to use to surface the data on your endpoint. Any stack, hosting provider, etc. is irrelevant. It's simply an http endpoint.
