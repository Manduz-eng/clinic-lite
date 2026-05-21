import express from 'express';
import serverless from 'serverless-http';

const app = express();

// This line allows your app to understand JSON data
app.use(express.json());

// This is a test to make sure our new "api" room works
app.get('/api/test', (req, res) => {
  res.json({ message: 'Success! The API room is now open.' });
});

// This is the bridge that connects Express to Vercel
export const handler = serverless(app);
