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

## Add another robot demo

1. Put a web-ready MP4 in `static/videos/`, for example:
   `static/videos/grasping-demo.mp4`.
2. Open `data/portfolio.yaml`.
3. In `robot_demos.items`, update a reserved slot:

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
