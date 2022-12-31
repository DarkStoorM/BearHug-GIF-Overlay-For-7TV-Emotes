// NOTICE: since there is only one fadable element, there is no need to make this generic for other elements
class FaderUtil {
  public declare timeout: NodeJS.Timeout;
  public declare interval: NodeJS.Timer;

  /**
   * Fades the given element out in [x] milliseconds
   *
   * @param   {HTMLElement}  element       Element to fade out
   * @param   {number}       duration      Time in milliseconds of the fade effect
   * @param   {number}       initialDelay  Time in milliseconds used to initially delay the fade out effect
   */
  public fadeOut(element: HTMLElement, duration: number, initialDelay: number): void {
    // Clear both to "restart" the fade
    window.clearTimeout(this.timeout);
    window.clearInterval(this.interval);

    this.timeout = setTimeout(() => {
      // initial opacity
      let op = 1;
      // update interval in milliseconds
      const interval = 16.666;
      // number of steps
      const steps = duration / interval;
      // amount by which to decrease the opacity in each step
      const increment = 1 / steps;

      this.interval = setInterval(() => {
        if (op <= 0.1) {
          clearInterval(this.interval);
          element.style.display = "none";
        }

        element.style.opacity = op.toString();
        // This might still work for old browsers
        element.style.filter = `alpha(opacity=${op * 100})`;

        op -= increment;
      }, interval);
    }, initialDelay);
  }
}

export const Fader = new FaderUtil();
