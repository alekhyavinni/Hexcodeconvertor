// @alekhyaerikipati
const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_KEY);

// Print the API key to verify it's loaded correctly
console.log("API Key being used:", process.env.REACT_APP_GEMINI_KEY);

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.post('/api/color', async (req, res) => {
  const { hexCode } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Convert the hex code ${hexCode} to an English color name and determine the mood .Give output exactly in this format colorname is associated with the mood : 
                    - Red: #FF0000 to #FF7F7F = Anger
                    - Orange: #FFA500 to #FFBF80 = Joy
                    - Yellow: #FFFF00 to #FFFF80 = Anxiety
                    - Green: #00FF00 to #80FF80 = Disgust
                    - Cyan: #00FFFF to #80FFFF = Shame
                    - Blue: #0000FF to #8080FF = Sadness
                    - Purple: #800080 to #BF80BF = Fear
                    - Pink: #FFC0CB to #FFB6C1 = Envy
                    - Anything else = Miscellaneous`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("API Response Text:", text);

    const colorName = extractColorName(text);
    

    res.json({ colorName,hexCode });
  } catch (error) {
    console.error('Error generating content:', error.message);
    res.status(500).json({ error: 'Failed to generate content', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

  
  // All other GET requests not handled before will return our React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });

// Function to extract color name and mood from the model's response
function extractColorName(text) {
    const colorNameMatch = text.match(/(\w+) is associated with the mood: (\w+)/i);
    if (colorNameMatch) {
      const colorName = colorNameMatch[1].toUpperCase();
      const mood = colorNameMatch[2].toUpperCase();
      return `${colorName} is associated with the mood: ${mood}`;
    }
    
}