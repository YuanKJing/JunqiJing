# Junqi Jing — Personal Research Website

Personal academic portfolio focused on Embodied AI, World Action Models, VLA
systems, and real-world robot learning.

The site is built with Hugo Blox and deployed to GitHub Pages.

## Main content

- Homepage content and ordering: `data/portfolio.yaml`
- Homepage layout: `layouts/partials/blox/research-portfolio.html`
- Visual system and responsive behavior: `assets/css/portfolio.css`
  (type and colour tokens sit at the top in `:root`)
- Banner handwriting, page-to-page photo transitions, navigation state, and
  viewport video playback: `assets/js/portfolio.js`
- Light and dark themes: the colour tokens in `:root` and their `.dark`
  overrides at the end of `portfolio.css`. The site follows the visitor's
  system setting until they use the toggle (`appearance.mode` in
  `config/_default/params.yaml`).
- Paper cards: `teaser_video` in `data/portfolio.yaml` adds a hover clip;
  a `cite.bib` beside a paper's `index.md` adds the BibTeX panel.
- Hobbies photographs: `hobbies.photos` in `data/portfolio.yaml`, files in
  `assets/media/portfolio/`.
- Profile photo and author information: `content/authors/admin/`
- Robot demo media: `static/videos/`

Research directions live on About me, between Biography and News. The
Experiences navigation item opens `/experience/`; the former `/research/`
address redirects to the research directions on About me.

The head hook embeds the minified portfolio CSS in each page so cached HTML
always carries its matching layout. Font paths include the site's base path.
Keep the two historical bundles in `static/css/`: cached pages from before this
change still reference those URLs, and deleting them breaks their layout.

## Experience logos

Edit `journey.items` in `data/portfolio.yaml` to update experiences and their
right-aligned logos. Keep each asset's intrinsic dimensions in `width` and
`height`; use `wordmark` for wide logos, `seal` for emblems, and `leap` for the
LEAP mark. The layout preserves proportions and shares a right edge across
all rows, including entries with two logos. Assets are served locally from
`assets/media/institutions/`. Set `resource` to reuse an existing asset elsewhere
under `assets/`, such as the CoCoMatrix logo shared with the Publications page.

| Asset | Source |
| --- | --- |
| CoCoMatrix | Existing `assets/media/coco-matrix-logo.png`, shared with the CO01 publication. |
| HIT, POSTECH | SVG files supplied by Junqi; POSTECH has an explicit viewBox for responsive scaling. |
| CUHK | [Emblem of CU.png](https://commons.wikimedia.org/wiki/File:Emblem_of_CU.png) on Wikimedia Commons, marked public domain; resized to 256 px wide. |
| LEAP Lab | [Official logo](https://www.leaplab.ai/images/logo.png) |
| KNOWIN AI | [Official product page logo](https://knowinai.com/assets/images/figma/shared/logo.svg); intrinsic dimensions normalized and its monochrome fill set to dark ink for the light background. |
| Tsinghua University | [Purple university seal, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Tsinghua_University_Logo.svg), attributed there to Tsinghua University. |
| Nanjing University | [Official university identity page](https://www.nju.edu.cn/ndgk/ndbs/ndxb.htm) |
| Westlake University | [Official English website logo](https://en.westlake.edu.cn/images/header_icon_color.png) |

The Experiences page shows CoCoMatrix (Sep 2026–present), KNOWIN AI (Apr–Sep 2026),
Tsinghua University, POSTECH, and a single
HIT entry combining the degree and undergraduate research. Add advisor or leader
links through each item's `mentorship.label` and `mentorship.people` fields.

## Add another robot demo

1. Put a web-ready MP4 in `static/videos/`, for example:
   `static/videos/grasping-demo.mp4`.
2. Open `data/portfolio.yaml`.
3. Add an entry to `robot_demos.items`; set `featured: true` on the single lead demo:

```yaml
- number: "02"
  title: Object grasping
  description: A concise description of the task, method, and your role.
  poster: ""
  video: videos/grasping-demo.mp4
  status: Real robot video
  tags:
    - Real robot
    - Dexterous manipulation
```

The page automatically switches the slot from its placeholder to the real
player. Phones show the poster and native play controls. On desktop, a video can
start one muted preview when half visible. Leaving the viewport or hiding the
tab pauses playback. A paused video resumes through its native controls.
Reduced-motion and data-saver preferences disable automatic previews.

Direct HTTPS MP4 URLs are also supported in the `video` field. Keep homepage
videos short and compressed; use external object storage or a CDN for large
files.

## Add a publication

Add a page bundle under `content/publication/` with author metadata and a `featured.jpg` figure. Add its page path, venue, year, summary, and resource links to `publication.items` in `data/portfolio.yaml`, newest first. Set `status: Under review` for submissions; omit it for accepted papers. Cards share the same layout and display only available resource links.

## Prepare phone or MOV footage

This command bakes orientation into the pixels, removes rotation metadata,
creates a broadly compatible H.264/AAC file, and moves MP4 metadata to the front
for faster playback:

```bash
ffmpeg -i input.mov \
  -map_metadata -1 \
  -vf "format=yuv420p" \
  -c:v libx264 -preset slow -crf 22 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  -metadata:s:v:0 rotate=0 \
  output.mp4
```

Always check the resulting orientation before publishing.

## Local preview

Use Hugo Extended `0.136.5`:

```bash
hugo server
```

Create a production build:

```bash
hugo --gc --minify
```

Pushing to `main` runs the GitHub Pages workflow in
`.github/workflows/publish.yaml`.

### LFF-Bench publication assets

- Cover: Figure 1(b), rendered from the author-provided LFF-Bench manuscript; shows failure categories and a long-horizon task.
- CVPR mark: official conference navigation logo, https://cvpr.thecvf.com/static/core/img/cvpr-navbar-logo.svg.
- `conference_logo` overrides the default ICLR mark for a publication card.
- LFF-Bench intentionally has an empty author list and is labeled CVPR 2027 (under review). Its OpenReview link is retained; no PDF link is advertised before one is available on the submission page.
