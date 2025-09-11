/**
 * Clipboard utility functions
 */

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Use the Clipboard API when available and in secure context
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      return successful;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Copies text to clipboard with user feedback
 */
export async function copyToClipboardWithFeedback(
  text: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  const success = await copyToClipboard(text);

  if (success) {
    onSuccess?.();
  } else {
    onError?.(new Error('Failed to copy to clipboard'));
  }
}

/**
 * Reads text from clipboard
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      return await navigator.clipboard.readText();
    } else {
      // Fallback - we can't read from clipboard in older browsers
      return null;
    }
  } catch (error) {
    console.error('Failed to read from clipboard:', error);
    return null;
  }
}

/**
 * Checks if clipboard API is supported
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard && window.isSecureContext);
}

/**
 * Creates a temporary input for mobile clipboard operations
 */
export function createTemporaryInput(text: string): HTMLInputElement {
  const input = document.createElement('input');
  input.value = text;
  input.style.position = 'absolute';
  input.style.left = '-9999px';
  input.style.top = '-9999px';
  document.body.appendChild(input);
  return input;
}

/**
 * Removes temporary input after clipboard operation
 */
export function removeTemporaryInput(input: HTMLInputElement): void {
  if (input && input.parentNode) {
    input.parentNode.removeChild(input);
  }
}
