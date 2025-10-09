export function speak(text) {
  try {
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text.replace(/[#*_`>-]/g, " "));
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  } catch (e) {
    console.error("TTS error", e);
  }
}
