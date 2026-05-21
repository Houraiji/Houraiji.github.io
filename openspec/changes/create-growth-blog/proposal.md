# Create Growth Blog

## Summary

Build the first version of a personal growth blog for long-term self-recording and quiet professional presentation. The site should be Chinese-first, clean and restrained, with subtle Japanese-clean and lightweight RPG archive influences.

## Motivation

The blog is intended primarily for the owner to document a real personal growth line over time, while remaining polished enough to share with interviewers or other external readers. The first version should establish the site structure, visual direction, content model, and reading experience before real personal content is filled in.

## Scope

- Create a deployable personal blog site skeleton.
- Provide core pages:
  - Home
  - Growth line
  - Projects
  - Article list
  - Article detail
  - About
- Use placeholder content that can be replaced later.
- Support light and dark theme switching.
- Use Chinese as the primary interface language.
- Include subtle personal style elements inspired by clean anime aesthetics and RPG archive patterns.
- Structure content so it can later migrate to or be managed by a lightweight CMS.

## Non-Goals

- Do not fill in the owner's real personal history yet.
- Do not build a full admin backend in this change.
- Do not implement authentication, drafts, image asset management, or complex editorial workflow.
- Do not make the site visually loud, heavily game-themed, or primarily resume-like.

## Proposed Approach

Use a static-first site architecture, preferably Astro with Markdown or MDX content files and structured data for growth nodes and projects. This keeps the first version deployable and maintainable while preserving a clean path toward a future CMS such as Decap CMS or another headless CMS.

The design should prioritize readability, calm spacing, clear navigation, and low-friction browsing. RPG-inspired concepts such as chapters, checkpoints, records, and skill tree can appear as labels or structural metaphors, but the main interface should remain professional and restrained.

## Success Criteria

- A user can open the site and understand who the owner is and that the site is about ongoing growth.
- A reader can navigate to growth line, projects, articles, and about pages.
- Article list and article detail pages work with placeholder content.
- Light and dark themes can be switched by the user.
- Project and growth content are represented through reusable data structures.
- Contact and professional links are present but visually low-key.
- The structure supports later replacement with real content without redesigning the site.
