# Video Optimisation for Production

## Compress Videos with ffmpeg

Target 720p height (portrait), ~1MB per clip, fast-start for streaming:

```bash
for f in src/media/action-*.mp4; do
  ffmpeg -i "$f" -vf "scale=-2:720" -c:v libx264 -crf 28 -preset slow \
    -movflags +faststart -an "${f%.mp4}-opt.mp4"
done
```

- `-crf 28` balances quality vs size (lower = better quality, bigger file)
- `-movflags +faststart` moves metadata to the start so playback begins before full download
- `-an` strips audio (re-add if you need sound)

## Add Poster Frames

Generate a thumbnail per video so the browser doesn't need to decode video just to show the first frame:

```bash
for f in src/media/action-*.mp4; do
  ffmpeg -i "$f" -ss 0.5 -frames:v 1 -q:v 2 "${f%.mp4}-poster.webp"
done
```

Then add `poster="./src/media/action-1-poster.webp"` to each `<video>` tag.

## Serve WebM with MP4 Fallback

WebM/VP9 is ~30% smaller than H.264 on Chrome and Firefox:

```bash
for f in src/media/action-*.mp4; do
  ffmpeg -i "$f" -vf "scale=-2:720" -c:v libvpx-vp9 -crf 35 -b:v 0 \
    -an "${f%.mp4}.webm"
done
```

Then use `<source>` tags instead of `src` on the video element:

```html
<video muted playsinline loop preload="none" poster="./src/media/action-1-poster.webp">
  <source src="./src/media/action-1.webm" type="video/webm">
  <source src="./src/media/action-1.mp4" type="video/mp4">
</video>
```

## CDN and Caching

- Serve videos from a CDN (Cloudflare, CloudFront, Bunny, etc.)
- Set `Cache-Control: public, max-age=31536000, immutable` with hashed filenames
- Enable HTTP/2 or HTTP/3 for multiplexed delivery

## Consider HLS for Adaptive Streaming

For slower connections, HLS delivers multiple quality levels and the browser picks the best one:

```bash
ffmpeg -i action-1.mp4 -vf "scale=-2:720" -c:v libx264 -crf 28 \
  -hls_time 4 -hls_playlist_type vod -hls_segment_filename "action-1_%03d.ts" \
  action-1.m3u8
```

Use hls.js on the client for non-Safari browsers. Only worth it if videos are longer than ~15s.
