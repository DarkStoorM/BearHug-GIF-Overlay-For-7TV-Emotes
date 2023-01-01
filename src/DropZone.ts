import { ImageProcessor } from "./ImageProcessor";
import { ErrorMessage } from "./helpers/error-messages";
import { EComponentIDs } from "./types/Enums/EComponentIDs";
import { EOverlayState } from "./types/Enums/EOverlayState";
import { Fader } from "./utils/Fader";
import { FileHandler } from "./utils/FileHandler";

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
   * Executes the processing logic on the dropped file or data, blocking the drop functionality
   * until the processing is done.
   *
   * @param   {DragEvent}  e  Drag event
   */
  private onDragDrop(e: DragEvent): void {
    e.preventDefault();

    if (this.isCurrentlyProcessing) {
      return;
    }

    // We don't need this overlay state anymore, switch it to another one and start the data processor
    this.overlaySwap(EOverlayState.OVERLAY_READY_FOR_PROCESSING, EOverlayState.OVERLAY_WORKING);

    // At this point the processor is ready and is not being blocked by the currently running process, so, start
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
   *
   * @see EOverlayState
   */
  private overlayShow(stateClass: EOverlayState): void {
    this.htmlDropZone.classList.add(`drop-zone--${stateClass}`);
  }

  /**
   * Replaces the component states - changes the requested CSS class with a new one
   *
   * @param   {EOverlayState}  currentState  CSS class to replace
   * @param   {EOverlayState}  newState      CSS class to swap the current one with
   *
   * @see EOverlayState
   */
  private overlaySwap(currentState: EOverlayState, newState: EOverlayState): void {
    this.htmlDropZone.classList.replace(`drop-zone--${currentState}`, `drop-zone--${newState}`);
  }

  /**
   * Enables the dropping functionality
   */
  private processorReenableDrop(): void {
    this.isCurrentlyProcessing = false;

    this.overlayHide(EOverlayState.OVERLAY_WORKING);
  }

  /**
   * Disables the dropping functionality in case the user tries dropping something while the
   * processor is still running
   *
   * @param   {DragEvent}  e  Drag event
   */
  private processorStart(e: DragEvent): void {
    this.isCurrentlyProcessing = true;

    // This always seem to exist, so no need to later check for `if(!data) {}` 🤔
    const data = e.dataTransfer as DataTransfer;

    try {
      // Only pick the first file in case the user drops multiples
      let file = data.files[0];

      // So, there is a situation, where the user drops something from another browser tab, which is not really a file
      // upload, so it won't exist in the FileList. If that is the case, we have to create a new file from DataURI
      // and then use it
      if (!file) {
        file = FileHandler.createFileFromDataURI(data.getData("text/plain"));
      }

      // Execute the image processing - this will call the Drop Zone when finished
      new ImageProcessor(file);
    } catch (error: unknown) {
      // Immediately allow dropping another image as there was no processing left
      this.processorReenableDrop();

      // Only throw "known" errors here, others will be handled by the global handler, if any.
      // This will throw a user-friendly error message and log the proper object in the console
      if (!(error instanceof ErrorMessage)) {
        this.triggerErrorMessage(new ErrorMessage("unknownError").message);
        console.log(error);

        return;
      }

      // "Throw" the custom error inside the error container in the DOM
      this.triggerErrorMessage(error.message);
    }

    // There are some event that could not be handled by try...catch, some unknown stuff, so just throw them in global
    // They most likely come from the inside of event listeners
    window.onerror = (event) => {
      this.processorReenableDrop();
      this.triggerErrorMessage(new ErrorMessage("unknownError").message);
      console.error(event);

      return true;
    };
  }

  /**
   * Registers event listeners on the view elements (body / drop zone)
   */
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

    // Execute a FadeOut routine on the errors container element
    Fader.fadeOut(this.errorsContainer, 1000, 10000);
  }
}
