# Scientific Calculator 360

A responsive, free scientific calculator website built with Flask. Includes SEO-ready HTML pages, canonical URLs, XML sitemap, robots.txt, FAQ, math guides, privacy policy, and terms.

## Run on Windows

1. Install Python 3.11 or 3.12 from https://www.python.org/downloads/ and select **Add Python to PATH**.
2. Extract this ZIP.
3. Open Command Prompt in the extracted `ScientificCalculator360` folder.
4. Run:

```bat
py -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python app.py
```

5. Visit http://127.0.0.1:5000

## Deploy to Render

1. Create a GitHub repository and upload these project files.
2. In Render, choose **New + → Web Service** and connect the repository.
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`
5. Deploy. After deployment, set environment variable `SITE_URL` to your exact public HTTPS base URL, e.g. `https://your-service.onrender.com` (no trailing slash), then redeploy.
6. Check these URLs in your browser:
   - `https://YOUR-PUBLIC-URL/sitemap.xml`
   - `https://YOUR-PUBLIC-URL/robots.txt`
   - `https://YOUR-PUBLIC-URL/`

The Render free service may sleep after inactivity. Search engines can still crawl a publicly reachable service, but a sleeping service may respond slowly or temporarily affect crawling.

## Google Search Console (GSC)

1. Add and verify the public website in Google Search Console. A domain property normally requires DNS verification; a URL-prefix property can use an available verification method.
2. Make sure `SITE_URL` exactly matches the public HTTPS URL and that `/sitemap.xml` opens without a login, redirect loop, server error, or HTML error page.
3. In Search Console → **Sitemaps**, enter `sitemap.xml` and submit.
4. Use **URL Inspection** for the home page and important guide pages, then choose **Request indexing** where available.
5. Check the Sitemaps and Pages reports for errors over the following days.

**Important:** No code can guarantee immediate sitemap fetching, indexing, traffic, or AdSense approval. Google decides when to crawl and index a site. A sitemap helps discovery; it does not guarantee indexing. Keep the site public, fast, useful, and maintained. Do not repeatedly resubmit the same sitemap as a workaround.

## SEO details

- `/sitemap.xml` is generated dynamically and returns XML with absolute canonical URLs.
- `/robots.txt` allows crawling and points to the sitemap.
- Each page has a unique title, meta description, canonical URL, and structured data where appropriate.
- The calculator works in the browser; no calculation data is sent to the Flask server.
- Set `SITE_URL` to the final HTTPS URL after deployment to avoid incorrect canonical URLs.
