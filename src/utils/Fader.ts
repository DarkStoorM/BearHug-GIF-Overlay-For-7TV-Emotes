export abstract class Fader {
  /**
   * Fades the given element out in [x] milliseconds
   *
   * @param   {HTMLElement}  element       Element to fade out
   * @param   {number}       duration      Time in milliseconds of the fade effect
   * @param   {number}       initialDelay  Time in milliseconds used to initially delay the fade out effect
   */
  public static fadeOut(element: HTMLElement, duration: number, initialDelay: number): void {
    setTimeout(() => {
      // initial opacity
      let op = 1;
      // update interval in milliseconds
      const interval = 16.666;
      // number of steps
      const steps = duration / interval;
      // amount by which to decrease the opacity in each step
      const increment = 1 / steps;

      const timer = setInterval(() => {
        if (op <= 0.1) {
          clearInterval(timer);
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
