---
title: 'LFF-Bench: Do Agent-as-Policy Robots Notice and Fix Their Own Failures?'
authors: []
profile: false
date: '2026-11-08'
publishDate: '2026-11-08'
publication_types:
  - paper-conference
publication: CVPR 2027 (under review)
publication_short: CVPR 2027 (under review)
abstract: >-
  LFF-Bench studies whether multimodal agents acting as robot policies can notice,
  diagnose, and recover from their own failures. Its 40 manipulation tasks include
  execution offsets, disturbed states, infeasible strategies, misjudged geometry,
  misjudged physics, and long-horizon combinations. A unified tool interface supports
  consistent evaluation, while the protocol distinguishes first-attempt success,
  within-attempt repair, and recovery across attempts. Comparisons with memory-free
  retries examine whether retaining interaction history helps agents learn from
  failure rather than simply try again.
summary: >-
  A benchmark of 40 robotic manipulation tasks for studying failure detection,
  diagnosis, and recovery in agent-as-policy robots.
tags:
  - Embodied AI
  - Robotic Manipulation
  - Failure Recovery
  - Agentic Robotics
  - Benchmarking
featured: true
url_source: https://openreview.net/forum?id=0PrR8J9RSM
image:
  caption: 'Figure 1(b) from LFF-Bench: five failure causes and a long-horizon task.'
  focal_point: center
  preview_only: false
---

Submitted to **CVPR 2027**. **Under review.**

LFF-Bench asks whether robots driven by general-purpose multimodal agents can
learn from failures that cannot be resolved by blindly repeating the same strategy.
The benchmark separates noticing a failure, identifying its cause, and adapting
subsequent actions, with tasks spanning five failure causes and long-horizon
manipulation.

View the [OpenReview submission](https://openreview.net/forum?id=0PrR8J9RSM).
