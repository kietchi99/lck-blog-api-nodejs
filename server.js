const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/lck-blog');
}

const port = process.env.PORT || 9000;
app.listen(9000, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandleRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLE REJECTION');
  server.close(() => {
    process.exit(1);
  });
});
