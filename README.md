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
