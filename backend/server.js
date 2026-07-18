import dotenv from 'dotenv';
dotenv.config();

const { default: connectDB } = await import('./config/db.js');
const { default: app } = await import('./app.js');

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
