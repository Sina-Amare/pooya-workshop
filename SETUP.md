# Deploying the Site (Free)

You only do this once. After that, everything (adding photos and works) happens inside the site's admin panel — no technical work needed.

## What you need

1. A [GitHub](https://github.com) account (free)
2. A [Vercel](https://vercel.com) account (free — sign in with the same GitHub account)

## Step 1 — Put the code on GitHub

If Git is installed, run inside the project folder:

```bash
git init
git add -A
git commit -m "site"
```

Then create a new repository on GitHub (for example `pooya-site`, set to Private) and push, following the commands GitHub shows you:

```bash
git remote add origin https://github.com/USERNAME/pooya-site.git
git push -u origin main
```

## Step 2 — Create the project on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Select the `pooya-site` repository and click **Import**
3. No settings need to change — just click **Deploy**
4. After a few minutes the site is live at an address like `pooya-site.vercel.app`

## Step 3 — Enable photo storage

1. In the Vercel dashboard, open the project → **Storage** tab
2. Choose **Create Database → Blob** (the default name is fine) → **Create**
3. In the connect dialog, make sure your project is selected → **Connect**

Done — the access token is added to the project automatically.

## Step 4 — Set the admin password

1. In the Vercel project → **Settings → Environment Variables**
2. Add a new variable:
   - **Name:** `ADMIN_PASSWORD`
   - **Value:** a strong password only you know
3. Click **Save**
4. (Optional but recommended) Also add `NEXT_PUBLIC_SITE_URL` with the full site address, e.g. `https://pooya-site.vercel.app`
5. Go to the **Deployments** tab and on the latest deployment click **⋯ → Redeploy** so the settings take effect

## Step 5 — Log in and manage content

1. Open `your-site-address/admin` and log in with your password
2. The site already comes pre-loaded with the owner's work photos, organized into categories
3. Use **کارهای من** (My Works) to edit or delete works and add new ones
4. Use **مشخصات و تماس** (Profile & Contact) to set your photo, real phone number, and texts

Every change you save appears on the site within a few seconds.

## Custom domain (optional)

If you own a domain such as `pooyachoob.ir`: in Vercel → **Settings → Domains**, add the domain and set the DNS records as instructed there.

## FAQ

**Are large photos a problem?** No — photos are compressed in the browser before upload and optimized again on the server.

**Forgot the password?** Change the `ADMIN_PASSWORD` value in Vercel and redeploy.

**What is the pre-loaded content?** Until your first save, the site shows the built-in content created from the owner's work photos. After your first save it becomes your editable copy — edit or delete anything from the panel.
