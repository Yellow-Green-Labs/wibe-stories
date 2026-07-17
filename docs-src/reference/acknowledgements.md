---
title: Known Issues
---

# Known Issues

These are bugs and behavior gaps we know about. We list them here because hiding a known issue is worse than naming it.

### Voice-attached downloads may not play on Mac and iPhone

- Voice-attached cards use the WebM format, which Apple's QuickTime and iOS Photos app do not play natively. 
- On Android and Windows the file opens in the default media player. 
- The shared web preview plays the voice in any modern browser, including on Apple devices.

**Workaround:** Open the card via the share link on Apple devices, or download on a non-Apple device first.

### Voice is lost on PNG download; share link voice upload can silently fail

**PNG downloads do not preserve audio**

- PNG is an image-only format and does not support embedded audio.
- Downloading content as a PNG saves only the image.
- Any associated voice recording is not included in the downloaded file.

**Audio upload may fail during share link creation**

- When a share link is created, the image is uploaded first.
- The system reports the share operation as successful immediately after the image upload is completed.
- The associated voice recording is uploaded separately in the background.
- If the audio upload fails because of a network interruption, an oversized file, or a temporary server issue, the failure is not reported to the user.
- As a result, the generated share link may contain the image but not the associated voice recording.

**Workaround:** For voice, download the WebM file or use the share link. Verify the voice plays in the preview before sending a share link. The image is always present.

### Firefox cannot record voice

**Firefox does not support real-time voice transcription**

- Firefox does not currently support the Web Speech API that enables real-time speech-to-text transcription during voice recording.
- As a result, live transcription is unavailable when using Firefox.

**Supported browsers**

- Real-time voice transcription is supported in Google Chrome, Microsoft Edge, Safari, and most modern mobile browsers that implement the Web Speech API.

**Alternative for Firefox users**

- If you are using Firefox, you can still enter your message manually by typing it into the text input field.
- All other text-based functionality remains available even though voice transcription is not supported.

**Workaround:** Use Chrome, Edge, or Safari for voice recording. Or type your message in Firefox.

### Parts of the interface are still in English in ten of eleven languages

Eleven languages are supported for the card interface, but only English is fully translated. The other ten languages fall back to English for some buttons and messages. The card text itself renders correctly in all languages.

**Workaround:** Use the app in English for the most complete experience. We plan to complete translations in a future update.

-- End of the file --

---
<sup>Wibe Stories</sup><br /><sup>© 2026 YGLabs</sup> 