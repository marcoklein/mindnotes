[![Build Status](https://travis-ci.org/marcoklein/mindnotes.svg?branch=master)](https://travis-ci.org/marcoklein/mindnotes)
[![Known Vulnerabilities](https://snyk.io//test/github/marcoklein/mindnotes/badge.svg?targetFile=package.json)](https://snyk.io//test/github/marcoklein/mindnotes?targetFile=package.json)

# mind-map-notes
Text driven mind map creation.

## Project Structure

```
src/
    core/           <-- Shared code among editor and renderer
        events/     <-- Editor and renderer communicate via events
        parser/     <-- Parse text into events
    editor/         <-- Text editor to modify the mindmap
    renderer/       <-- Rendering the mindmap
```
