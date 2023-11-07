const express = require('express');
var bodyParser = require('body-parser');
const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const articleRouter = require('./routes/articleRoutes');
const commentRouter = require('./routes/commentRoutes');
const AppError = require('./appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1. Middlewares

const cors = require('cors');
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOTring;
  next();
});

// 2. Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/articles', articleRouter);
app.use('/api/v1/comments', commentRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
