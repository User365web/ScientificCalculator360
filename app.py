import os
from datetime import date
from flask import Flask, render_template, request, Response, url_for

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "change-this-for-production")

SITE_NAME = "Scientific Calculator 360"
DEFAULT_DESCRIPTION = "Free online scientific calculator for trigonometry, logarithms, powers, roots, percentages, and everyday calculations."
PAGES = [
    {"endpoint": "home", "path": "/", "changefreq": "weekly", "priority": "1.0"},
    {"endpoint": "about", "path": "/about", "changefreq": "monthly", "priority": "0.5"},
    {"endpoint": "faq", "path": "/faq", "changefreq": "monthly", "priority": "0.6"},
    {"endpoint": "guides", "path": "/guides", "changefreq": "weekly", "priority": "0.7"},
    {"endpoint": "scientific_guide", "path": "/guides/scientific-calculator-guide", "changefreq": "monthly", "priority": "0.7"},
    {"endpoint": "trigonometry_guide", "path": "/guides/trigonometry-basics", "changefreq": "monthly", "priority": "0.6"},
    {"endpoint": "percentages_guide", "path": "/guides/percentages-and-ratios", "changefreq": "monthly", "priority": "0.6"},
    {"endpoint": "privacy", "path": "/privacy", "changefreq": "yearly", "priority": "0.3"},
    {"endpoint": "terms", "path": "/terms", "changefreq": "yearly", "priority": "0.3"},
]

def site_origin():
    configured = os.environ.get("SITE_URL", "").strip().rstrip("/")
    if configured:
        return configured
    # Use the current host for local previews; set SITE_URL to the final public HTTPS URL in production.
    return request.url_root.rstrip("/")

def absolute(path):
    return f"{site_origin()}{path}"

@app.context_processor
def inject_globals():
    return {"site_name": SITE_NAME, "site_origin": site_origin(), "current_year": date.today().year}

@app.route("/")
def home():
    return render_template("index.html", title="Free Online Scientific Calculator", description=DEFAULT_DESCRIPTION, canonical=absolute("/"))

@app.route("/about")
def about():
    return render_template("about.html", title="About", description="Learn about Scientific Calculator 360 and its free online calculator.", canonical=absolute("/about"))

@app.route("/faq")
def faq():
    return render_template("faq.html", title="Frequently Asked Questions", description="Answers about using the free online scientific calculator.", canonical=absolute("/faq"))

@app.route("/guides")
def guides():
    return render_template("guides.html", title="Math Guides", description="Clear, practical guides to scientific calculators, trigonometry, percentages, and ratios.", canonical=absolute("/guides"))

@app.route("/guides/scientific-calculator-guide")
def scientific_guide():
    return render_template("article.html", title="How to Use a Scientific Calculator", description="Learn the main scientific calculator functions, including powers, roots, trigonometry, and logarithms.", canonical=absolute("/guides/scientific-calculator-guide"), article="scientific")

@app.route("/guides/trigonometry-basics")
def trigonometry_guide():
    return render_template("article.html", title="Trigonometry Basics: Sine, Cosine and Tangent", description="A beginner-friendly guide to sine, cosine, tangent, angles, and degree versus radian mode.", canonical=absolute("/guides/trigonometry-basics"), article="trigonometry")

@app.route("/guides/percentages-and-ratios")
def percentages_guide():
    return render_template("article.html", title="Percentages and Ratios: A Practical Guide", description="Learn percentage change, proportions, ratios, and useful calculation examples.", canonical=absolute("/guides/percentages-and-ratios"), article="percentages")

@app.route("/privacy")
def privacy():
    return render_template("legal.html", title="Privacy Policy", description="Privacy information for Scientific Calculator 360.", canonical=absolute("/privacy"), page="privacy")

@app.route("/terms")
def terms():
    return render_template("legal.html", title="Terms of Use", description="Terms for using Scientific Calculator 360.", canonical=absolute("/terms"), page="terms")

@app.route("/robots.txt")
def robots():
    sitemap = absolute("/sitemap.xml")
    body = f"User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: {sitemap}\n"
    return Response(body, mimetype="text/plain")

@app.route("/sitemap.xml")
def sitemap():
    today = date.today().isoformat()
    entries = []
    for page in PAGES:
        entries.append(
            f"<url><loc>{absolute(page['path'])}</loc><lastmod>{today}</lastmod>"
            f"<changefreq>{page['changefreq']}</changefreq><priority>{page['priority']}</priority></url>"
        )
    xml = '<?xml version="1.0" encoding="UTF-8"?>' + \
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + \
          "".join(entries) + "</urlset>"
    return Response(xml, mimetype="application/xml")

@app.errorhandler(404)
def not_found(error):
    return render_template("404.html", title="Page Not Found", description="The requested page could not be found.", canonical=absolute(request.path)), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")), debug=False)
