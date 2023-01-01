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
    "Selected file is invalid. Drop a local file or drag it from another tab (doesn't always work on cross-browser drop or with WebPs). If you believe this is an error, open a new Issue in the repo.",
};
