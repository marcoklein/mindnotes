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

## Logging

This package is using [`roarr`](https://www.npmjs.com/package/roarr) logger to log the program's state.

Export `ROARR_LOG=true` environment variable to enable log printing to stdout.

Use [`roarr-cli`](https://github.com/gajus/roarr-cli) program to pretty-print the logs.