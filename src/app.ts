import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import dotenv from 'dotenv';
import { caseRoute } from './routes/case';
import { fileRoute } from './routes/file';

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());
app.use(fileUpload());

app.use(caseRoute);

app.use(fileRoute)

app.get('/ping', (req, res) => {
    res.send('pong');
});



export { app };
