# Voice Command & Reply Features

Your Farm Helper AI now includes comprehensive voice functionality for hands-free operation.

## Features

### 1. **Voice Commands (Speech Recognition)**
- **How it works**: Tap the microphone button to start voice recording
- **Supported**: All modern browsers with Web Speech API (Chrome, Edge, Safari)
- **Auto-send**: Your speech is automatically converted to text and sent once you stop speaking
- **Interim feedback**: See what you're saying in real-time as you speak
- **Language support**: Select from multiple languages using the language dropdown

### 2. **Voice Reply (Text-to-Speech)**
- **How it works**: Click the "Read Aloud" button on any bot response
- **Stop**: Click the "Stop" button to stop playback mid-sentence

### 3. **Language Support**
- **Input languages**: Use the dropdown to select your speech recognition language
- **Supported languages include**:
  - English (US, UK, India, Australia)
  - Spanish, French, German, Italian, Portuguese
  - Hindi, Tamil, Telugu, Kannada, and more
  - Chinese (Simplified & Traditional)
  - Japanese, Korean, and others

## How to Use

### Voice Commands
1. Open a chat in Farm Helper AI
2. Click the **Mic icon** in the input field
3. Speak your question (e.g., "What's the best fertilizer for tomatoes?")
4. Stop speaking - your message will auto-send automatically
5. Wait for the bot's response

### Voice Replies
1. When the bot responds, you'll see a **"Read Aloud"** button on the message
2. Click it to hear the response spoken aloud
3. Click **"Stop"** to interrupt playback

## Technical Details

### Components
- **`useSpeechRecognition`**: Hook for voice input (Web Speech API)
- **`useSpeechSynthesis`**: Hook for voice output (Web Speech Synthesis API)
- **`ChatInput`**: Enhanced with voice recognition and language selector
- **`ChatMessage`**: Enhanced with voice playback controls

### Supported Browsers
- ✅ Chrome/Edge (best support)
- ✅ Safari (iOS 14.5+)
- ✅ Firefox (experimental)

### Limitations
- Microphone permission required
- Requires internet for Speech-to-Text in some browsers
- Some languages may not be available in all regions

## Tips

1. **Best results**: Speak clearly and at a normal pace
2. **Quiet environment**: Reduce background noise for better recognition
3. **Multiple languages**: You can switch languages mid-conversation

## Troubleshooting

**Microphone not working?**
- Check browser permissions for microphone access
- Ensure your device has a working microphone
- Try refreshing the page

**Voice recognition not activating?**
- Check if your browser supports Web Speech API
- Try a different browser (Chrome recommended)
- Clear browser cache and try again

**Voice reply not playing?**
- Ensure your device volume is on
- Check browser audio permissions
- Try a different message to test audio

---

Enjoy hands-free farming assistance! 🌾🎤
