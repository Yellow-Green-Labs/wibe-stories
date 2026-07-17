---
title: "Acknowledged Logs"
icon: "file-doc"
mode: "custom"
---

# Known Issues

These are bugs and behavior gaps we know about. We list them here because hiding a known issue is worse than naming it.

### Voice-attached downloads may not play on Mac and iPhone

Voice-attached cards use the WebM format, which Apple's QuickTime and iOS Photos app do not play natively. On Android and Windows the file opens in the default media player. The shared web preview plays the voice in any modern browser, including on Apple devices.

**Workaround:** Open the card via the share link on Apple devices, or download on a non-Apple device first.

### Voice is lost on PNG download; share link voice upload can silently fail

Two related issues. PNG images cannot contain audio, so downloading as PNG loses the voice. When creating a share link, the image uploads first and success is reported immediately — the voice upload runs in the background and can fail silently (network drop, oversized file, server hiccup) without warning.

**Workaround:** For voice, download the WebM file or use the share link. Verify the voice plays in the preview before sending a share link. The image is always present.

### Firefox cannot record voice

Firefox does not support the Web Speech API that powers real-time transcription during recording. Chrome, Edge, Safari, and most mobile browsers support it. In Firefox, you can still type your message directly into the text box.

**Workaround:** Use Chrome, Edge, or Safari for voice recording. Or type your message in Firefox.

### Parts of the interface are still in English in ten of eleven languages

Eleven languages are supported for the card interface, but only English is fully translated. The other ten languages fall back to English for some buttons and messages. The card text itself renders correctly in all languages.

**Workaround:** Use the app in English for the most complete experience. We plan to complete translations in a future update.

---

<sup>Wibe Stories</sup><br /><sup>© 2026 YGLabs</sup>