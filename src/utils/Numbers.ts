/**
 * Provides basic utilities for manipulating numbers
 */
export class Numbers {
  /**
   * Clamps the input number between <min, max>
   *
   * @param   {number}  input  Input number to clamp
   * @param   {number}  min    Minimum number returned
   * @param   {number}  max    Maximum number returned
   */
  public static clamp(input: number, min: number, max: number): number {
    return Math.min(Math.max(min, input), max);
  }
}
