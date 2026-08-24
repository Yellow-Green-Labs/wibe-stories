---
title: Known Issues
description: Known issues and limitations in Wibe Stories including WebM audio, Firefox support, translation coverage, and browser compatibility.
---

# Known Issues

*Last updated: Jul 17, 2026*

These are bugs and behavior gaps we know about. We list them here because hiding a known issue is worse than naming it.

### WebM not playable on Apple devices

- Voice-attached cards use the WebM format, which Apple's QuickTime and iOS Photos app do not play natively. 
- On Android and Windows the file opens in the default media player. 
- The shared web preview plays the voice in any modern browser, including on Apple devices.

**Workaround:** Open the card via the share link on Apple devices, or download on a non-Apple device first.

### Voice lost on PNG; share link upload fails silently

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

### Firefox cannot use browser transcription

Firefox does not support the Web Speech API, which provides browser-native speech-to-text. However, voice recording and server-based transcription via Deepgram work normally in Firefox.

- The Web Speech API (`SpeechRecognition`) is unavailable in Firefox. This only affects the browser-based fallback transcription path.
- Voice recording (`MediaRecorder` + `getUserMedia`) works in Firefox.
- Transcription via the Deepgram server API works in Firefox — it is browser-independent.
- If the Deepgram server is unavailable, Firefox has no fallback transcription method. Chrome, Edge, and Safari can fall back to the Web Speech API in this scenario.

**Workaround:** Use Chrome, Edge, or Safari for voice recording with full browser-based fallback. In Firefox, type your message directly into the text input.

### Most UI translations incomplete

Eleven languages are supported for the card interface, but only English is fully translated. The other ten languages fall back to English for some buttons and messages. The card text itself renders correctly in all languages.

**Workaround:** Use the app in English for the most complete experience. We plan to complete translations in a future update.

---