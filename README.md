# Rekos Uploader extension

A Chrome Manifest V3 extension that locally optimizes a video for a 2160p/120fps target and a configurable maximum size up to 150 MB.

## Features
- Drag-and-drop video selection.
- 3840x2160 target canvas with aspect-ratio-preserving padding.
- 120 FPS output target.
- H.264 + AAC MP4 output.
- Automatic bitrate calculation based on duration and maximum size.
- Automatic size-correction retry if the first encode is over the limit.
- Quality / Smart / Size-priority modes.
- Processing is performed locally in the browser using FFmpeg WebAssembly.
- One-click download of the optimized file.

## Important limitations
- A 30/60 FPS source cannot be turned into genuine 120 FPS motion detail merely by setting `-r 120`; this duplicates/interpolates frame timing. The extension preserves real 120 FPS only when the source/encoder pipeline can provide it.
- Upscaling to 2160p does not create additional source detail.
- A hard 150 MB result is targeted, but container overhead and codec behavior can vary. The extension performs a second lower-bitrate encode when the first result exceeds the limit.
- TikTok itself controls its own upload limits and may re-encode the video after upload. The extension cannot prevent TikTok from doing that.
- FFmpeg core files are loaded from jsDelivr the first time the extension is used, so an internet connection is required for the encoder engine. The actual video bytes are processed locally in the browser.

## Install
1. Extract this folder.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the `Rekos Uploader extension` folder.

## Use
1. Click the Rekos Uploader toolbar icon.
2. Select or drag a video into the window.
3. Keep the maximum at 150 MB or choose a smaller limit.
4. Click **Optimize video**.
5. Wait for processing to finish.
6. Click **Download optimized video** and upload that MP4 to TikTok.
