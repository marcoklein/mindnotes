[![Build Status](https://travis-ci.org/marcoklein/mindnotes.svg?branch=master)](https://travis-ci.org/marcoklein/mindnotes)
[![Known Vulnerabilities](https://snyk.io//test/github/marcoklein/mindnotes/badge.svg?targetFile=package.json)](https://snyk.io//test/github/marcoklein/mindnotes?targetFile=package.json)

# mind-map-notes
Text driven mind map creation.

# Getting Started

## Development

Install dependencies
```
npm install
```

Run the application
```
npm run serve
```

## Project Structure

```
src/
    core/           <-- Shared code among editor and renderer
        events/     <-- Editor and renderer communicate via events
        parser/     <-- Parse text into events
    editor/         <-- Text editor to modify the mindmap
    renderer/       <-- Rendering the mindmap
```

# Development

## GitHub Pages

GitHub Pages is used to deploy the website. The used plugin `gh-pages` builds a fresh copy to the `gh-pages` branch by running the command `npm run deploy`.

This setup will always deploy the website for the currently active branch.

# Ideas

## Breaking long text
* Show dots (...) instead of whole text => Hover over text to show
* Auto-break text
* Make an option to hide or display (and auto-wrap) long text