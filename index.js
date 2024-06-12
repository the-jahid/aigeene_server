import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import AWS from "aws-sdk";
import { textToSpeechjs } from "./lib/textTospeech.js";
import dotenv from 'dotenv';
import { removeLinksFromText } from "./lib/removeLinikFromText.js";
dotenv.config({path: './.env.local'});

const app = express();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

app.use(bodyParser.json());
app.use(cors());

async function query(data) {
    const response = await fetch(
        "https://aigeenee.chromovision.com/api/v1/prediction/88407ef1-b7b0-4431-b5c5-24df8652e5a1",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}


app.post('/api/text-to-audio-file', async (req, res) => {

        const question = req.body.question;
        const language = req.body.language;

        try {
            const response = await query({question:req.body.question});
            const text = removeLinksFromText(response.text);
            const audioResponse = await textToSpeechjs(language, text);

            
            res.status(200).json({ audioResponse, response });
           
        } catch (error) {
            
            res.status(500).json({ error: 'An error occurred' });
        }
})

app.post('/api/text-to-text', async (req, res) => {
    const question = req.body.question;
   

    try {
        const response = await query({question:req.body.question} );

        console.log('response', response);

        res.status(200).json(response)
        
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
})

const PORT = process.env.PORT || 4001; // Fallback to 4001 if process.env.PORT is not defined
app.listen(PORT, () => {
  console.log(`Server is ready at http://localhost:${PORT}`);
});




