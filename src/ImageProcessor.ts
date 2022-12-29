export class ImageProcessor {
  private supportedTypes = new Set<string>(["image/png", "image/jpeg", "image/webp"]);

  public constructor(private droppedFile: File) {
    if (!this.isImage()) {
      throw new Error(`Selected file type is not supported`);
    }
  }

  /**
   * Manipulates the dropped file by adjusting the position to match the overlaid BearHug and
   * returns the data URI as a result.
   */
  public bearHug(): string {
    // TODO
    return "";
  }

  /**
   * Checks if the dropped file is an actual image we can work with.
   */
  private isImage(): boolean {
    const type = this.droppedFile.type;

    return this.supportedTypes.has(type);
  }
}
