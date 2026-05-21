# Design

## Product Direction

The site is a personal growth archive rather than a pure portfolio or diary. It should support two reading modes:

- Fast external reading: interviewers or visitors can quickly understand identity, direction, projects, and growth quality.
- Slow personal reading: the owner can later add deeper reflection, stage records, and long-form notes.

## Visual Direction

The design should feel clean, calm, and readable. Personal style should appear through small details rather than loud decoration.

- Primary language: Chinese.
- Secondary labels: short English labels such as `Current Chapter`, `Growth Route`, `Records`, and `Skill Tree`.
- Light mode: near-white or light blue-gray background, dark neutral text, soft accent colors.
- Dark mode: deep blue-gray or ink background, soft text, restrained accent colors.
- Style cues: chapter labels, route/checkpoint timeline, archive cards, profile and skill tree sections.
- Avoid: heavy anime imagery, neon cyberpunk, oversized decorative gradients, or resume-first layout.

## Information Architecture

```text
Home
├─ Hero: who I am + I am growing
├─ Current Chapter
├─ Growth Route preview
├─ Featured Records
└─ Quiet Links

Growth Line
├─ Route Map
├─ Chapter sections
└─ Checkpoint details

Projects
├─ Project records
└─ Featured project cards

Articles
├─ Category filters
├─ Article cards
└─ Article detail pages

About
├─ Profile
├─ Skill Tree
├─ Interests
└─ Contact
```

## Content Model

The first version should use placeholder content, but the schema should reflect future real content.

### Article

- title
- description
- date
- category
- tags
- readingTime
- featured
- body

### Growth Node

- title
- chapter
- timeRange
- summary
- details
- keywords
- relatedProjects
- relatedArticles

### Project

- title
- description
- role
- techStack
- links
- featured
- reflection

### Profile / Now

- displayName
- shortIntro
- currentChapter
- currentFocus
- quietLinks

## Technical Direction

Astro is the preferred implementation path because it fits a static personal blog with Markdown/MDX content, article routing, strong deployment compatibility, and future CMS migration. The implementation should keep content separate from presentation:

- Markdown or MDX for articles.
- Structured data files for profile, growth nodes, and projects.
- Reusable page sections and cards.
- Theme preference persisted locally.

## Future CMS Path

The first version should not include an admin backend, but it should avoid structures that block one. Future CMS integration can map existing content models to a lightweight CMS:

- Decap CMS for Markdown-backed editing.
- Sanity, Strapi, or Payload if more structured editing is needed later.

## Risks and Mitigations

- Risk: the site becomes too much like a resume.
  - Mitigation: keep growth line and current chapter central; keep professional links low-key.
- Risk: the style becomes too game-like.
  - Mitigation: use RPG metaphors only as subtle labels and layout patterns.
- Risk: later real content does not fit placeholder structures.
  - Mitigation: use flexible fields and avoid overly specific stage names.
- Risk: CMS migration becomes difficult.
  - Mitigation: keep content models explicit and separate from UI components.
