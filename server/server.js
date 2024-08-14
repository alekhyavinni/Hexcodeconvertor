// @alekhyaerikipati

const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_KEY );

// Define the mood key based on hex ranges
const moodKey = [
    { color: 'Red', range: ['#FF0000', '#FF7F7F'], mood: 'ANGER' },
    { color: 'Orange', range: ['#FFA500', '#FFBF80'], mood: 'JOY' },
    { color: 'Yellow', range: ['#FFFF00', '#FFFF80'], mood: 'ANXIETY' },
    { color: 'Green', range: ['#00FF00', '#80FF80'], mood: 'DISGUST' },
    { color: 'Cyan', range: ['#00FFFF', '#80FFFF'], mood: 'SHAME' },
    { color: 'Blue', range: ['#0000FF', '#8080FF'], mood: 'SADNESS' },
    { color: 'Purple', range: ['#800080', '#BF80BF'], mood: 'FEAR' },
    { color: 'Pink', range: ['#FFC0CB', '#FFB6C1'], mood: 'ENVY' },
];

const classifyMood = (hexCode) => {
    const rgb = hexToRgb(hexCode);
    if (!rgb) return { color: 'Unknown', mood: 'MISCELLANEOUS' };

    for (const key of moodKey) {
        if (withinRange(rgb, hexToRgb(key.range[0]), hexToRgb(key.range[1]))) {
            return { color: key.color, mood: key.mood };
        }
    }
    return { color: 'Unknown', mood: 'MISCELLANEOUS' };
};

const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

const withinRange = (rgb, rgbMin, rgbMax) => {
    return (
        rgb.r >= rgbMin.r &&
        rgb.r <= rgbMax.r &&
        rgb.g >= rgbMin.g &&
        rgb.g <= rgbMax.g &&
        rgb.b >= rgbMin.b &&
        rgb.b <= rgbMax.b
    );
};

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.post('/api/color', async (req, res) => {
    const { hexCode } = req.body;
    const moodInfo = classifyMood(hexCode);

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Convert the CSS color code ${hexCode} into a color name description and mood. Give output exactly in this format colorname is associated with the mood.`;
        const result = await model.generateContent(prompt);
        const message = result.response.text().trim();

        res.json({
            color: moodInfo.color,
            mood: moodInfo.mood,
            message,
        });
    } catch (error) {
        console.error('Error generating content:', error.message);
        res.status(500).json({ error: 'Failed to generate content', details: error.message });
    }
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
