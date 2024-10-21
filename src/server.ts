import express from 'express';
import { config } from 'dotenv';
import userRoutes from './routes/routes';

config(); // Load environment variables

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json()); // for parsing application/json

// Use the user routes
app.use('/api/users', userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});