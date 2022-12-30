import GIF = require("gif.js");
import { dropZone } from "./app";
import { spritesheetData } from "./helpers";
import { Numbers } from "./utils/Numbers";
import { workerString } from "./worker";

export class ImageProcessor {
  /**
   * Defines an array of <x; y> offset values to modify the dropped image, which will later cause
   * that image to move along with the bear
   */
  private droppedImageOffsets = [
    [0, 0],
    [-24, 6],
    [-38, 14],
    [-70, 20],
    [-999, 999],
  ];
  private fileReader = new FileReader();
  private overlayImage = document.createElement("img");
  /**
   * Rather than extracting frames from an internal GIF with redundant libraries, just store the
   * spritesheet and read directly from this source
   */
  private overlaySpritesheet = spritesheetData;
  /**
   * Defines a set of supported types.
   *
   * Despite GIFs being supported, only the first frame will be used anyway to not rely on
   * yet another library set
   */
  private supportedTypes = new Set<string>(["image/png", "image/jpeg", "image/webp", "image/gif"]);

  public constructor(private droppedFile: File) {
    if (!this.isImage()) {
      throw new Error(`Selected file type is not supported`);
    }

    // Register the reader event immediately
    this.fileReader.addEventListener("load", this.processImage.bind(this));

    // Use the internal spritesheet, which will be used to draw the frames individually, picked by
    // variable coordinates later
    this.overlayImage.src = this.overlaySpritesheet;

    this.fileReader.readAsDataURL(this.droppedFile);
  }

  /**
   * Checks if the dropped file is an actual image we can work with.
   */
  private isImage(): boolean {
    const type = this.droppedFile.type;

    return this.supportedTypes.has(type);
  }

  /**
   * Executes the image manipulation logic and emits the image Finish event
   */
  private processImage(): void {
    // Create a temporary canvas to extract the frame from the dropped image
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");

    // The image data is now available in the `result` property of the `reader` object
    const imageData = this.fileReader.result as string;

    if (!context) {
      throw new Error(`Could not resolve Canvas Context after loading the image`);
    }

    // Avoid dependencies by straight up loading the worker from a string, a workaround for web apps
    const blob = new Blob([workerString], {
      type: "application/javascript",
    });

    const gif = new GIF({
      workers: 1,
      workerScript: URL.createObjectURL(blob),
      quality: 0,
      /* Force 128x128 for 7tv emote sizes */
      width: 128,
      height: 128,
      /* This color will be removed later from the Canvas-Fill */
      transparent: `0x000033`,
    });

    gif.on("finished", function (blob) {
      // Create a temporary FileReader to parse the blob as a dataURL to the image residing in the DOM
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>): void => {
        dropZone.processorFinish(`${e.target?.result}`);
      };

      reader.readAsDataURL(blob);
    });

    // make a new dummy image for canvas drawing purposes
    const image = new Image();

    image.src = imageData;

    image.onload = () => {
      for (let x = 0; x < 20; x++) {
        /**
         * So, there is a stupid issue with GIF.js library, where black pixels are converted into
         * transparency, so there had to be a workout implemented, where the canvas has to be
         * filled with some color and then that color has to be removed by the GIF.js transparency
         * lookup.
         *
         * Without this, pixel art emotes with black color basically have their colors removed, so
         * there had to be a small workaround introduced. Still, some grey pixels from smoothed
         * out images will produce artifacts, which will most likely come from WebP images.
         *
         * This value might still produce artifacts in form of a filled rectangle staying in the
         */
        context.fillStyle = "#000033";
        context.fillRect(0, 0, 128, 128);

        // Choose the offset for the dropped image (0,4 indices only). This is required to make
        // the image move along with the bear
        const offset =
          x >= 9
            ? this.droppedImageOffsets[Numbers.clamp(x - 8, 0, 4)]
            : this.droppedImageOffsets[0];

        // First, draw the dropped image
        context.drawImage(image, offset[0], offset[1], 128, 128);

        // Choose which frame to draw, but only the the current frame count is 7
        const overlayX = x >= 7 ? x - 7 : 0;

        // Now draw the overlay on top of it
        // -128 is added to draw a blank frame as there is no empty frame in the spritesheet
        context.drawImage(this.overlayImage, overlayX * 128 - 128, 0, 128, 128, 0, 0, 128, 128);

        // Add the drawn images in the current frame to the created GIF
        gif.addFrame(context, { delay: 10, copy: true });
      }

      gif.render();
    };
  }
}
