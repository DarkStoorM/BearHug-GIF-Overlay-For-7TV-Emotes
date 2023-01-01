export abstract class FileHandler {
  /**
   * Creates a new File by extracting the data from DataURI, returning a new File instance with a proper file type
   *
   * @param   {string} dataURI  DataURI string to extract the data from
   */
  public static createFileFromDataURI(dataURI: string): File {
    const blob = FileHandler.dataURItoBlob(dataURI);

    return new File([blob], "", { type: blob.type });
  }

  /**
   * Extracts the information from DataURI and creates a new Blob with the extracted type from that URI
   *
   * @param {string}  dataURI  DataURI string to extract the data from
   *
   * @link https://stackoverflow.com/a/12300351
   */
  private static dataURItoBlob(dataURI: string): Blob {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    const byteString = window.atob(dataURI.split(",")[1]);

    // separate out the mime component
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    const ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // Write the ArrayBuffer to a blob, and you're done
    return new Blob([ab], { type: mimeString });
  }
}
