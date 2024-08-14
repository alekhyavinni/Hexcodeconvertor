// @alekhyaerikipati

import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
    const [hexCode, setHexCode] = useState('');
    const [colorName, setColorName] = useState('');
    const [mood, setMood] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [fetchTrigger, setFetchTrigger] = useState(false); // Trigger state

    useEffect(() => {
        if (fetchTrigger) {
            const fetchData = async () => {
                try {
                    const response = await fetch("/api/color", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ hexCode }),
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const data = await response.json();
                    setColorName(data.color);
                    setMood(data.mood);
                    setMessage(data.message);
                    setError('');
                } catch (err) {
                    setError('Failed to fetch the color name and mood');
                } finally {
                    setFetchTrigger(false); // Reset the trigger
                }
            };

            fetchData();
        }
    }, [fetchTrigger, hexCode]);

    // Set the trigger to true to start the fetch    
    const handleSubmit = (event) => {
        event.preventDefault();
        setFetchTrigger(true); 
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setHexCode(value);

        // Clear the result if the input is empty
        if (!value) {
            setColorName('');
            setMood('');
            setMessage('');
        }
    };

    //to clear all fields
    const handleClear = () => {
        setHexCode('');   
        setColorName('');  
        setMood('');       
        setMessage('');    
        setError('');      
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Hex Code Converter</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={hexCode}
                        onChange={handleInputChange}
                        placeholder="#FFFFFF"
                    />
                    <button type="submit" style={{ marginLeft: '10px' }}>Convert</button>
                    <button type="button" onClick={handleClear} style={{ marginLeft: '10px' }}>Clear</button>
                </form>
                {error && <p className="error">{error}</p>}
                {colorName && mood && (
                    <div style={{ backgroundColor: "white", padding: '20px', color: '#FFF' }}>
                        <h2 style={{ color: hexCode, fontSize: '22px', fontFamily: 'Georgia' }}>{colorName.toUpperCase()} is associated with the mood {mood.toUpperCase()}</h2>
                        <p style={{ color: hexCode, fontSize: '22px', fontFamily: 'Georgia' }}>API Backend Response : {message}</p>
                    </div>
                )}
            </header>
        </div>
    );
}

export default App;
