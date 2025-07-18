---
# Leave the homepage title empty to use the site title
title: ""
date: 2022-10-24
type: landing

design:
  spacing: "6rem"

sections:
  - block: resume-biography-3
    content:
      username: admin
      text: |
        I’m Junqi Jing (荆浚淇), a junior undergraduate in Software Engineering at Harbin Institute of Technology. My research lies at the intersection of Embodied AI, Physical Simulation, and Multimodal Diffusion Models. 

        I have worked at Westlake University (MiLab), and will be an incoming exchange student at POSTECH under Prof. Kwang In Kim. I am a co-author of a paper accepted to ICLR 2025 (MTID) and involved in multiple ongoing projects related to physics-grounded LLMs and robotic learning from videos.

        I am currently seeking a 2025 winter internship. If you have any ideas or potential collaborations, feel free to contact me at [jqjing@stu.hit.edu.cn](mailto:jqjing@stu.hit.edu.cn) or [xingkong8527@gmail.com](mailto:xingkong8527@gmail.com).

      button:
        text: Download CV
        url: uploads/resume.pdf
    design:
      css_class: dark
      background:
        color: black
        image:
          filename: 12.jpg
          filters:
            brightness: 1.0
          size: cover
          position: center
          parallax: false

  - block: markdown
    content:
      title: '📚 My Research'
      subtitle: ''
      text: |-
        I'm interested in embodied intelligence, physics-informed AI, and generative modeling. I build systems that enable robots and agents to learn and reason in complex environments.

        My work spans from visual-language-based policy learning to dynamic 3D scene understanding using GNNs. Currently, I’m exploring how we can combine large language models, physical simulations, and diffusion policies to achieve generalizable decision-making.

        Always happy to collaborate or discuss ideas!
    design:
      columns: '1'

  - block: collection
    id: papers
    content:
      title: Featured Publications
      filters:
        folders:
          - publication
        featured_only: true
    design:
      view: article-grid
      columns: 2

  - block: collection
    content:
      title: Recent Publications
      text: ""
      filters:
        folders:
          - publication
        exclude_featured: false
    design:
      view: citation

  - block: collection
    id: talks
    content:
      title: Recent & Upcoming Talks
      filters:
        folders:
          - event
    design:
      view: article-grid
      columns: 1

  - block: collection
    id: news
    content:
      title: Recent News
      subtitle: ''
      text: ''
      page_type: post
      count: 5
      filters:
        author: ""
        category: ""
        tag: ""
        exclude_featured: false
        exclude_future: false
        exclude_past: false
        publication_type: ""
      offset: 0
      order: desc
    design:
      view: date-title-summary
      spacing:
        padding: [0, 0, 0, 0]

  - block: cta-card
    demo: true
    content:
      title: 👉 Build your own academic website like this
      text: |-
        This site is generated by Hugo Blox Builder - the FREE, Hugo-based open source website builder trusted by 250,000+ academics like you.

        <a class="github-button" href="https://github.com/HugoBlox/hugo-blox-builder" data-color-scheme="no-preference: light; light: light; dark: dark;" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star HugoBlox/hugo-blox-builder on GitHub">Star</a>

        Easily build anything with blocks - no-code required!

        From landing pages, second brains, and courses to academic resumés, conferences, and tech blogs.
      button:
        text: Get Started
        url: https://hugoblox.com/templates/
    design:
      card:
        css_class: "bg-primary-700"
        css_style: ""
---
