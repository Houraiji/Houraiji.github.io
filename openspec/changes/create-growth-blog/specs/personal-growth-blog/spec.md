# Personal Growth Blog Spec

## ADDED Requirements

### Requirement: Core Site Pages

The site SHALL provide core pages for home, growth line, projects, articles, article detail, and about.

#### Scenario: Visitor navigates the blog

- **GIVEN** a visitor opens the site
- **WHEN** they use the main navigation
- **THEN** they can access home, growth line, projects, articles, and about pages
- **AND** article cards can open article detail pages

### Requirement: Chinese-First Interface

The site SHALL use Chinese as the primary language for navigation, page titles, and main content placeholders.

#### Scenario: Visitor reads the interface

- **GIVEN** a visitor views any primary page
- **WHEN** they read the navigation and page headings
- **THEN** the primary interface text is Chinese
- **AND** English labels are used only as secondary stylistic accents

### Requirement: Personal Growth Positioning

The home page SHALL communicate both who the owner is and that the owner is in an ongoing growth process.

#### Scenario: Visitor opens the home page

- **GIVEN** a visitor lands on the home page
- **WHEN** the first viewport is displayed
- **THEN** it presents identity-oriented copy
- **AND** it presents a current chapter or growth-oriented summary

### Requirement: Growth Line Structure

The site SHALL provide a growth line page organized by chapters and checkpoints.

#### Scenario: Visitor views the growth line

- **GIVEN** growth nodes exist as structured content
- **WHEN** a visitor opens the growth line page
- **THEN** the page presents nodes as chapters or checkpoints
- **AND** each node includes summary information suitable for later replacement with real content

### Requirement: Project Records

The site SHALL present projects as records connected to personal growth rather than as a loud resume wall.

#### Scenario: Visitor views projects

- **GIVEN** project records exist as structured content
- **WHEN** a visitor opens the projects page
- **THEN** each project shows title, description, role or contribution, and technology information
- **AND** project presentation remains visually consistent with the blog's restrained style

### Requirement: Article System

The site SHALL include an article list and individual article detail pages using placeholder content in the first version.

#### Scenario: Visitor opens an article

- **GIVEN** placeholder article content exists
- **WHEN** a visitor selects an article from the article list
- **THEN** the site displays a detail page for that article
- **AND** the detail page shows title, metadata, and body content

### Requirement: Theme Switching

The site SHALL support user-controlled light and dark themes.

#### Scenario: Visitor changes theme

- **GIVEN** a visitor is viewing the site
- **WHEN** they activate the theme toggle
- **THEN** the site changes between light and dark themes
- **AND** the selected preference persists for future visits in the same browser

### Requirement: Future CMS Compatibility

The content model SHALL be structured so articles, growth nodes, projects, and profile/current status can later be managed by a CMS.

#### Scenario: Developer reviews content structure

- **GIVEN** the first version uses local placeholder content
- **WHEN** a developer inspects the content organization
- **THEN** articles, growth nodes, projects, and profile/current status are separate from presentation components
- **AND** their fields map cleanly to future CMS-managed entities
