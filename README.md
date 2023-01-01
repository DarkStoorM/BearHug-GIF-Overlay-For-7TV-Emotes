# BearHug image overlay

A quick client-side app that takes a dropped image and adds a BearHug-gif overlay.

- [BearHug image overlay](#bearhug-image-overlay)
  - [Running](#running)
  - [Supported types](#supported-types)
    - [Notice on GIFs](#notice-on-gifs)
  - [Guidelines](#guidelines)
  - [How does it work](#how-does-it-work)
  - [Known issues](#known-issues)

---

## Running

The fastest way, grab the [latest release](https://github.com/DarkStoorM/BearHug-GIF-Overlay-For-7TV-Emotes/releases)

or play with the source

```bash
npm i

// and

npm start
```

---

## Supported types

The app can create a GIF from the following input image types:

- GIF
- JPG/JPEG
- PNG
- WebP

### Notice on GIFs

This app uses only the first frame of an animated GIF to create new animations in order to avoid relying on external image manipulation libraries meant for Node.JS environments, which reduces the need for Webpack imports and other unnecessary complexities.

---

## Guidelines

By default, all images are being drawn on a `128x128` pixels square canvas. It is ideal to use images with this exact size to avoid image compression.

This size has been chosen to match 7TV's highest image resolution. Let it handle the resizing.

---

## How does it work

After dropping an image, a new GIF is created by drawing the input as static in the animation for 8 frames(1), then re-drawing that image with fine-tuned offset to make it move along with the Bear overlay, as seen in the following example:

![img](https://user-images.githubusercontent.com/7021295/210149949-c311c659-bc11-4ad8-a7a0-a7395d3b4382.gif)

> (1) - the `gif.js` library provides a frame-specific `delay` property, which does not really work. The first frame had to be duplicated to imitate that frame-specific delay. This unfortunately results in larger file size (still below 200KB, 7TV accepts up to 2MB). As this app uses a library, which was the easiest to set up without having to mess around with Webpack and million other image manipulation libraries. `gif.js` was the most webapp-friendly, but that comes with the cost of some underlying issues ¯\\\_(ツ)\_/¯

---

## Known issues

- `gif.js` library, sadly, is very poor in terms of transparency, and when the input image is very dark or in grey-scale, it may result in artifacts in form of transparent pixels inside the image (creating holes in some images).

When the input image is using transparency, the `GIF` instance requires providing a `hex` color code, which is later used to convert that color into transparency. Most of the time, a black color is used and this is bad, because most of the Pixel Art images have black outline and it is being removed in the process.

A small workaround has been implemented, that fills the image with a different color and then removes it, to reduce the possibility of color collision by setting transparent pixels to `#000033` color, keeping the outlines or any black pixels.

Unfortunately, again, this will create a very dark-blue border around the pixels which is not a big deal with the small emote size in the Twitch chat.

- Unfortunately, on some **rare** occasion, there will be a one-frame solid background, which can't be helped, although, it sometimes gets fixed when retried with the same image

- If the input image uses transparency, **it has to be cleared from any imperfections**, no almost-transparent-pixels or the resulting image will have visible artifacts:

![img](https://user-images.githubusercontent.com/7021295/210152126-b36096df-5230-4d88-8058-78059d537c4f.png)

---

Stuff:

![1](https://user-images.githubusercontent.com/7021295/210184713-4025f262-e789-4e30-9e7c-6007000311cf.gif) ![2](https://user-images.githubusercontent.com/7021295/210184714-9f61414d-04d3-4bb2-b461-89b719bb6884.gif) ![3](https://user-images.githubusercontent.com/7021295/210184715-0b9bee60-9b08-47e5-9a7f-b54897dc0f14.gif) ![4](https://user-images.githubusercontent.com/7021295/210184716-5bc1b10a-1431-44f0-8d7d-3ca77deec2dc.gif) ![5](https://user-images.githubusercontent.com/7021295/210184717-f9642913-c261-41c1-a413-82ecb5cd4d0c.gif) ![6](https://user-images.githubusercontent.com/7021295/210184719-bf32830c-3884-4714-82cc-390f12b29798.gif)
