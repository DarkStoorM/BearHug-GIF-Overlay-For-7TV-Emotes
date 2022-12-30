import { ImageProcessor } from "./ImageProcessor";
import { EComponentIDs } from "./types/Enums/EComponentIDs";
import { EOverlayState } from "./types/Enums/EOverlayState";

export class DropZone {
  private dropZone: HTMLDivElement;
  private isCurrentlyProcessing = false;
  private main: HTMLDivElement;

  public constructor() {
    const element = document.getElementById(EComponentIDs.DROP_ZONE);
    const main = document.getElementById(EComponentIDs.MAIN_CONTAINER);

    // This entire check/reassign could be replaced with an "as HTMLDivElement" cast, but just in case it's better
    // to check it anyway
    for (const el in [element, main]) {
      if (!el) {
        throw new Error(`${EComponentIDs.DROP_ZONE} was not found on the page.`);
      }
    }

    this.dropZone = element as HTMLDivElement;
    this.main = main as HTMLDivElement;

    this.registerListeners();
  }

  /**
   * Executes the processing logic on the dropped file or data, blocking the drop functionality until the processing is
   * done.
   */
  private onDragDrop(e: DragEvent): void {
    e.preventDefault();

    if (this.isCurrentlyProcessing) {
      return;
    }

    // We don't need this overlay state anymore, switch it to another one and start the data processor
    this.overlaySwap(EOverlayState.OVERLAY_READY_FOR_PROCESSING, EOverlayState.OVERLAY_WORKING);

    this.processorStart(e);
  }

  /**
   * When the user drags a file (or anything) into the drop zone, will change the overlay indicating, that he is able
   * to drop something into this area, which will then process the given data
   */
  private onDragEnter(): void {
    if (this.isCurrentlyProcessing) {
      return;
    }

    // Tell the user, that he has dragged something into the drop zone
    this.overlayShow(EOverlayState.OVERLAY_READY_FOR_PROCESSING);
  }

  /**
   * When the user drags a file (or anything) out of the window or cancels with Escape, reverts the overlay back,
   * indicating, that the drop zone is ready again
   */
  private onDragLeave(): void {
    if (this.isCurrentlyProcessing) {
      return;
    }

    this.overlayHide(EOverlayState.OVERLAY_READY_FOR_PROCESSING);
  }

  /**
   * Removes the given overlay state (deletes the provided CSS class)
   *
   * @param   {EOverlayState}  stateClass  CSS class to remove from the drop zone
   */
  private overlayHide(stateClass: EOverlayState): void {
    this.dropZone.classList.remove(`drop-zone--${stateClass}`);
  }

  /**
   * Adds a new state of the given type (applies a new CSS class)
   *
   * @param   {EOverlayState}  stateClass  CSS class to apply
   */
  private overlayShow(stateClass: EOverlayState): void {
    this.dropZone.classList.add(`drop-zone--${stateClass}`);
  }

  /**
   * Replaces the component states - changes the requested CSS class with a new one
   *
   * @param   {EOverlayState}  currentState  CSS class to replace
   * @param   {EOverlayState}  newState      CSS class to swap the current one with
   */
  private overlaySwap(currentState: EOverlayState, newState: EOverlayState): void {
    this.dropZone.classList.replace(`drop-zone--${currentState}`, `drop-zone--${newState}`);
  }

  /**
   * Reenables the dropping functionality after the image processor is done
   */
  private processorFinish(): void {
    this.isCurrentlyProcessing = false;

    this.overlayHide(EOverlayState.OVERLAY_WORKING);
  }

  /**
   * Disables the dropping functionality in case the user tries dropping something while the processor is still
   * running
   */
  private processorStart(e: DragEvent): void {
    this.isCurrentlyProcessing = true;

    const data = e.dataTransfer;

    if (!data) {
      // TODO: check if this is really needed
      throw new Error(`Err`);
    }

    try {
      // Only pick the first file in case the user drops multiples
      // at least for now
      const resultImage = new ImageProcessor(e.dataTransfer.files[0]).bearHug();
    } catch (error: unknown) {
      // TODO: throw this as a UI error later
      console.error(error);
      throw new Error();
    }

    this.processorFinish();
  }

  private registerListeners(): void {
    // Prevent opening the dragged file as a link in some cases
    this.main.addEventListener("dragover", (e) => e.preventDefault());

    // When user drags something over (or cancels/leaves), react with modifying the overlay
    this.main.addEventListener("dragenter", this.onDragEnter.bind(this));
    this.main.addEventListener("dragleave", this.onDragLeave.bind(this));

    // Handle the file drop
    this.main.addEventListener("drop", this.onDragDrop.bind(this));
  }
}