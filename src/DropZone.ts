import { ImageProcessor } from "./ImageProcessor";
import { ErrorMessage } from "./helpers/error-messages";
import { EComponentIDs } from "./types/Enums/EComponentIDs";
import { EOverlayState } from "./types/Enums/EOverlayState";
import { Fader } from "./utils/Fader";

export class DropZone {
  private errorsContainer: HTMLDivElement;
  /**
   * Initial drop zone, which will trigger the page overlay. This part is required as the overlay
   * is initially disabled and dragging over the body will trigger the
   */
  private htmlBody: HTMLHtmlElement;
  /**
   * Page overlay where users drop the file
   */
  private htmlDropZone: HTMLDivElement;
  /**
   * Used to display the results from ImageProcessor
   */
  private htmlResultImage: HTMLImageElement;
  private isCurrentlyProcessing = false;

  public constructor() {
    // Fetch the required elements
    // No need to check them, because they exist in the DOM anyway ¯\_(ツ)_/¯
    this.errorsContainer = document.getElementById(EComponentIDs.ERRORS_CONTAINER) as HTMLDivElement;
    this.htmlDropZone = document.getElementById(EComponentIDs.DROP_ZONE) as HTMLDivElement;
    this.htmlResultImage = document.getElementById(EComponentIDs.RESULT_IMAGE) as HTMLImageElement;
    this.htmlBody = document.getElementsByTagName("html")[0] as HTMLHtmlElement;

    this.registerListeners();
  }

  /**
   * Reenables the dropping functionality after the image processor is done and 'prints' the result image
   * back to the user in the DOM
   *
   * @param   {string}  result  Result image that ultimately came back from the `ImageProcessor`
   */
  public processorFinish(result: string): void {
    this.processorReenableDrop();

    this.htmlResultImage.src = result;
  }

  /**
   * Enables the dropping functionality
   */
  private processorReenableDrop(): void {
    this.isCurrentlyProcessing = false;

    this.overlayHide(EOverlayState.OVERLAY_WORKING);
  }

  /**
   * Executes the processing logic on the dropped file or data, blocking the drop functionality
   * until the processing is done.
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
   * When the user drags a file (or anything) into the drop zone, will change the overlay
   * indicating, that he is able to drop something into this area, which will then process the
   * given data
   */
  private onDragEnter(): void {
    if (this.isCurrentlyProcessing) {
      return;
    }

    // Tell the user, that he has dragged something into the drop zone
    this.overlayShow(EOverlayState.OVERLAY_READY_FOR_PROCESSING);
  }

  /**
   * When the user drags a file (or anything) out of the window or cancels with Escape, reverts the
   * overlay back, indicating, that the drop zone is ready again
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
    this.htmlDropZone.classList.remove(`drop-zone--${stateClass}`);
  }

  /**
   * Adds a new state of the given type (applies a new CSS class)
   *
   * @param   {EOverlayState}  stateClass  CSS class to apply
   */
  private overlayShow(stateClass: EOverlayState): void {
    this.htmlDropZone.classList.add(`drop-zone--${stateClass}`);
  }

  /**
   * Replaces the component states - changes the requested CSS class with a new one
   *
   * @param   {EOverlayState}  currentState  CSS class to replace
   * @param   {EOverlayState}  newState      CSS class to swap the current one with
   */
  private overlaySwap(currentState: EOverlayState, newState: EOverlayState): void {
    this.htmlDropZone.classList.replace(`drop-zone--${currentState}`, `drop-zone--${newState}`);
  }

  /**
   * Disables the dropping functionality in case the user tries dropping something while the
   * processor is still running
   */
  private processorStart(e: DragEvent): void {
    this.isCurrentlyProcessing = true;

    const data = e.dataTransfer;

    if (!data) {
      // TODO: check if this is really needed
      throw new Error(`Err`);
    }

    try {
      // Only pick the first file in case the user drops multiples, at least for now
      new ImageProcessor(e.dataTransfer.files[0]);
    } catch (error: unknown) {
      // Immediately allow dropping another image as there was no processing left
      this.processorReenableDrop();

      if (!(error instanceof ErrorMessage)) {
        return this.triggerErrorMessage(new ErrorMessage("unknownError").message);
      }

      // "Throw" the error inside the error container in the DOM
      this.triggerErrorMessage(error.message);
      this.errorsContainer.innerHTML;
    }
  }

  /**
   * Displays the given error message and fades out the Errors container to not remain in the DOM
   * all the time
   *
   * @param   {string}  message  Error message to display in the container
   */
  private triggerErrorMessage(message: string): void {
    this.errorsContainer.style.display = "block";
    this.errorsContainer.style.opacity = "1";
    this.errorsContainer.innerText = message;

    Fader.fadeOut(this.errorsContainer, 1000, 3000);
  }

  private registerListeners(): void {
    // Prevent opening the dragged file as a link in some cases
    this.htmlBody.addEventListener("dragover", (e) => e.preventDefault());
    this.htmlDropZone.addEventListener("dragover", (e) => e.preventDefault());

    // When user drags something over (or cancels/leaves), react with modifying the overlay
    this.htmlBody.addEventListener("dragenter", this.onDragEnter.bind(this));
    this.htmlDropZone.addEventListener("dragenter", this.onDragEnter.bind(this));
    this.htmlDropZone.addEventListener("dragleave", this.onDragLeave.bind(this));

    // Handle the file drop
    this.htmlDropZone.addEventListener("drop", this.onDragDrop.bind(this));
  }
}
