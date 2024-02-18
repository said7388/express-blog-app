import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import authRouter from './routers/auth.route';
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 4000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// App Home Route
app.get('/', async (req: Request, res: Response) => {
  return res.send("Welcome to our Blog!");
});

// Other App routes
app.use('/api/auth', authRouter);


// catch 404 and forward to error handler
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    message: "No such route exists!"
  })
});

// error handler
app.use((err: Error, req: Request, res: Response) => {
  return res.status(500).json({
    message: "Something went wrong"
  })
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});