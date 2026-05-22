import express, { type Application, type Request, type Response } from 'express';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());



app.get('/', (req: Request, res: Response) => {
    res.send("Hello World");
});



export default app;
