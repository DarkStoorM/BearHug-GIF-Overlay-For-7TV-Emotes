/**
 * Used to throw `known` error messages within the application
 */
export class ErrorMessage extends Error {
  public constructor(message: keyof typeof ErrorMessages) {
    super(ErrorMessages[message]);

    Object.setPrototypeOf(this, ErrorMessage.prototype);
  }
}

const ErrorMessages = {
  unsupportedType: "Only GIF, PNG, JPEG, and WEBP file types are supported.",
  unknownError:
    "An unexpected error has occurred. You most likely used the recently generated image, which sometimes will get rejected by the browser or something is just incompatible with your device :(.\n\nThis has also been reported to the console in case you want to report it, idk.",
};
