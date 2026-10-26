# Elevique Flow

Voice dictation for your Mac. Hold **fn**, speak, and let go: clean, punctuated text appears in whatever app you're typing in, about 0.6 s later.

It's free and uses your own free [Groq](https://console.groq.com/keys) API key. There's no account and no subscription. Your history, notes and recordings stay on your Mac.

**[Download Elevique Flow for Mac](https://github.com/manishkumarveo-jpg/Elevique-Flow-releases/releases/latest/download/EleviqueFlow.dmg)** · macOS 13 or later · Apple Silicon and Intel

## Install

1. Open `EleviqueFlow.dmg` and drag **Elevique Flow** into **Applications**.
2. Open Elevique Flow from Applications. macOS will say it can't verify the developer. That's expected: this free build isn't notarized by Apple. Click **Done**.
3. Open **System Settings → Privacy & Security**, scroll down, click **Open Anyway** next to Elevique Flow, and confirm. You only do this once.
4. Follow the app's **Get started** checklist:
   - **Add your Groq key.** Create one free at [console.groq.com/keys](https://console.groq.com/keys) and paste it into Settings → AI. It's stored in your Mac's Keychain.
   - **Allow the microphone.**
   - **Allow Accessibility.** This lets the app paste text and listen for the fn key.
   - **Free up the fn key.** In System Settings → Keyboard, set "Press 🌐 key to" to **Do Nothing**.

## Use it
- **Dictate:** hold **fn** in any text field, speak, and let go.
- **Hands-free:** press **fn + Space**. Finish with **fn**; cancel with **Esc**.
- **Command mode:** hold **fn + Control** and say what to do with the selected text, e.g. "make this friendlier".
- **Translate to English:** hold **fn + Shift**.
- **Transforms:** press **⌃⌥1…9** to rewrite the selected text with a saved instruction.
- **Meeting notes:** click the notes button on the bar, or accept the offer when a call app starts using your mic.

Using Wispr Flow too? Quit it first, because both apps listen for fn.

## Privacy
Audio and text go only to Groq, using your own key, to be transcribed and cleaned up. History, notes, recordings and your dictionary stay on your Mac. Recordings are kept for at most 7 days, and you can turn them off. The app's log never contains what you dictated.

## Updating
Download the new DMG and replace the app in Applications. Your settings and permissions carry over.
