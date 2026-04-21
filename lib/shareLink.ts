export async function shareLink(url: string, title: string, text: string): Promise<string> {
  if (typeof window === "undefined") {
    return "Share is only available in the browser.";
  }

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    await navigator.share({ title, text, url });
    return "Share sheet opened.";
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return "Link copied to clipboard.";
  }

  window.prompt("Copy this link", url);
  return "Copy the link from the dialog.";
}
