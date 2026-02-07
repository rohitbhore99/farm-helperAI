# Farm Helper AI - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or bun package manager
- Supabase account with configured storage bucket
- Environment variables set up

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

## 🌾 Using the App

### 1. Authentication
- Sign up or log in with your email
- Your conversations are saved to your account

### 2. Quick Actions (6 Options)
Click any quick action to start:
- **Crop Advice**: Get crop recommendations for your area
- **Weather Tips**: Get irrigation and weather-based guidance
- **Pest ID**: Identify and treat crop diseases
- **Fertilizer**: Calculate NPK dosage for your farm
- **Market Prices**: Get current market prices and trends
- **Analyze Image**: Upload crop images for disease detection

### 3. Image Upload
1. Click the **paperclip icon** in the chat input
2. Select an image of your crop
3. Optionally type a question (e.g., "What disease is this?")
4. Click **send**
5. AI will analyze the image and provide recommendations

### 4. Location Services
- Toggle **Location Analysis** in the sidebar
- When enabled, AI provides location-aware advice
- Shows your GPS coordinates
- Helps with region-specific crop recommendations

### 5. Conversation Management
- **New Consultation**: Start a new chat
- **Search History**: Search previous conversations
- **Delete**: Remove conversations you don't need
- **View History**: Click on any conversation to view it

## 💡 Tips for Best Results

### For Crop Advice
- Mention your location (district/state)
- Specify the season (Kharif, Rabi, Zaid)
- Tell about your soil type
- Mention water availability

### For Disease Identification
- Upload clear, well-lit images
- Show affected areas clearly
- Mention when symptoms started
- Describe any other observations

### For Fertilizer Calculation
- Provide farm size in acres
- Mention crop type
- Specify soil type if known
- Ask for NPK ratios

### For Market Prices
- Mention specific crops
- Include your region
- Ask about seasonal trends
- Request profit margin information

## 🎯 Common Questions You Can Ask

### Crop Planning
- "What crops should I grow this season?"
- "When should I sow rice in my area?"
- "How much water does wheat need?"
- "What's the best crop rotation?"

### Pest & Disease
- "How do I treat leaf spots on tomatoes?"
- "What pests attack cotton?"
- "How to prevent powdery mildew?"
- "Upload image for disease analysis"

### Fertilizer & Soil
- "Calculate NPK for 2 acres of rice"
- "How to improve soil health?"
- "What's the best fertilizer for vegetables?"
- "How often should I fertilize?"

### Weather & Irrigation
- "When should I irrigate based on weather?"
- "How to prepare for heavy rain?"
- "What to do during drought?"
- "Best irrigation schedule for my crop?"

### Market & Economics
- "What are current vegetable prices?"
- "Which crop is most profitable?"
- "When should I sell my produce?"
- "What's the market trend for cotton?"

## 🔧 Features Overview

### ✅ Working Features
- User authentication and profiles
- Conversation history with timestamps
- Real-time message streaming
- Image upload and analysis
- Location-based recommendations
- Copy message functionality
- Search conversation history
- Delete conversations
- Responsive mobile design

### 🎨 UI Features
- Modern gradient design
- Smooth animations
- Better color scheme
- Improved typography
- Better spacing and layout
- Responsive design
- Dark mode ready

### 🌾 Farming Features
- Crop recommendations
- Pest and disease identification
- Fertilizer calculations
- Weather-based advice
- Market price information
- Image-based crop analysis
- Location-aware suggestions
- Soil health guidance
- Irrigation scheduling
- Crop rotation advice

## 📱 Mobile Usage

### Sidebar Navigation
- Tap **menu icon** (top-left) to open sidebar
- Tap **X** to close sidebar
- Tap conversation to view it
- Tap **+** to start new chat

### Touch Interactions
- Tap quick action buttons
- Tap paperclip to upload image
- Tap send button to send message
- Swipe to scroll conversations

## ⚙️ Settings

### Location Sharing
- Toggle in sidebar footer
- Shows GPS coordinates
- Helps with region-specific advice
- Can be disabled anytime

### Conversation Search
- Search by keywords
- Filter by date (Today/Previous)
- Delete unwanted conversations
- View full conversation history

## 🆘 Troubleshooting

### Image Upload Not Working
- Check file size (should be < 5MB)
- Ensure it's a valid image format (JPG, PNG)
- Check internet connection
- Try refreshing the page

### Location Not Detected
- Check browser location permissions
- Ensure GPS is enabled on device
- Try toggling location off and on
- Check internet connection

### Messages Not Sending
- Check internet connection
- Ensure you're logged in
- Try refreshing the page
- Check browser console for errors

### Slow Response
- Check internet speed
- Wait for AI to process
- Try shorter messages
- Reduce image file size

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the system prompt for capabilities
3. Ensure all prerequisites are met
4. Check browser console for errors

## 🔐 Privacy & Security

- Your conversations are saved securely
- Images are stored in Supabase storage
- Location data is only used for recommendations
- You can delete conversations anytime
- Sign out to end your session

## 📚 Learning Resources

### Farming Topics Covered
- Crop selection and planning
- Soil health and management
- Fertilizer and nutrient guidance
- Pest and disease identification
- Weather-based farming decisions
- Irrigation scheduling
- Market prices and economics
- Crop rotation strategies
- Water management techniques
- Organic farming alternatives

### Best Practices
- Ask one question at a time
- Provide specific details
- Upload clear images
- Enable location for better advice
- Save important conversations

## 🎓 Example Conversations

### Example 1: Crop Recommendation
**You**: "I have 2 acres in Maharashtra, Kharif season, black soil, borewell water"
**AI**: Recommends suitable crops with reasons

### Example 2: Disease Identification
**You**: [Upload image] "What's wrong with my tomato plant?"
**AI**: Analyzes image and provides treatment

### Example 3: Fertilizer Calculation
**You**: "Calculate NPK for 2 acres of rice"
**AI**: Provides specific dosage recommendations

### Example 4: Market Information
**You**: "What are current prices for vegetables?"
**AI**: Provides market trends and pricing

## 🚀 Next Steps

1. **Sign Up**: Create your account
2. **Enable Location**: For better recommendations
3. **Try Quick Actions**: Start with suggested questions
4. **Upload Images**: Test disease detection
5. **Save Conversations**: Keep important advice
6. **Explore Features**: Try different question types

---

**Happy Farming! 🌾**

For more information, check IMPROVEMENTS.md and CHANGES_SUMMARY.md
