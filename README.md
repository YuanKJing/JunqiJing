# Junqi Jing — Personal Research Website

Personal academic portfolio focused on Embodied AI, World Action Models, VLA
systems, and real-world robot learning.

The site is built with Hugo Blox and deployed to GitHub Pages.

## Main content

- Homepage content and ordering: `data/portfolio.yaml`
- Homepage layout: `layouts/partials/blox/research-portfolio.html`
- Visual system and responsive behavior: `assets/css/custom.css`
- Scroll reveals, navigation state, and viewport video playback:
  `assets/js/portfolio.js`
- Profile photo and author information: `content/authors/admin/`
- Robot demo media: `static/videos/`

Research directions live on About me, between Biography and News. The
Experiences navigation item opens `/experience/`; the former `/research/`
address redirects to the research directions on About me.

## Experience logos

Edit `journey.items` in `data/portfolio.yaml` to update experiences and their
right-aligned logos. Keep each asset's intrinsic dimensions in `width` and
`height`; use `wordmark` for wide logos, `seal` for emblems, and `leap` for the
LEAP mark. The layout preserves proportions and shares a right edge across
all rows, including entries with two logos. Assets are served locally from
`assets/media/institutions/`.

| Asset | Source |
| --- | --- |
| HIT, POSTECH | SVG files supplied by Junqi; POSTECH has an explicit viewBox for responsive scaling. |
| LEAP Lab | [Official logo](https://www.leaplab.ai/images/logo.png) |
| KNOWIN AI | [Official product page logo](https://knowinai.com/assets/images/figma/shared/logo.svg); intrinsic dimensions normalized and its monochrome fill set to dark ink for the light background. |
| Tsinghua University | [Purple university seal, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Tsinghua_University_Logo.svg), attributed there to Tsinghua University. |
| Nanjing University | [Official university identity page](https://www.nju.edu.cn/ndgk/ndbs/ndxb.htm) |
| Westlake University | [Official English website logo](https://en.westlake.edu.cn/images/header_icon_color.png) |

Nanjing University's visit is dated July–August 2025. Westlake's visit has no
date in the supplied biography, so it is labeled “Research visit” without
an inferred year.

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
player. Videos play muted when sufficiently visible, pause off-screen, and keep
native controls for sound and full-screen viewing. Reduced-motion and data-saver
preferences disable automatic playback.

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
