export class ImageProcessor {
  private supportedTypes = new Set<string>(["image/png", "image/jpeg", "image/webp"]);
  private fileReader = new FileReader();

  public constructor(private droppedFile: File) {
    if (!this.isImage()) {
      throw new Error(`Selected file type is not supported`);
    }

    // Register the reader event immediately
    this.fileReader.addEventListener("load", this.processImage.bind(this));
  }

  /**
   * Manipulates the dropped file by adjusting the position to match the overlaid BearHug and
   * returns the data URI as a result.
   */
  public bearHug(): string {
    this.fileReader.readAsDataURL(this.droppedFile);

    return "";
  }

  private processImage(): void {
    // The image data is now available in the `result` property of the `reader` object
    const imageData = this.fileReader.result as string;
  }

  /**
   * Checks if the dropped file is an actual image we can work with.
   */
  private isImage(): boolean {
    const type = this.droppedFile.type;

    return this.supportedTypes.has(type);
  }
}
