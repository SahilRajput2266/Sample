export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message;

  // Check for Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    message = 'Resource not found';
    statusCode = 404;
  }
  if (err.code === 'LIMIT_FILE_SIZE') { message = 'Resume must be 10 MB or smaller'; statusCode = 413; }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') { message = 'Only one resume file is allowed'; statusCode = 400; }
  if (message === 'Only PDF, DOC, and DOCX files are allowed') { statusCode = 400; }
  if (err.name === 'ValidationError') { message = Object.values(err.errors).map((item) => item.message).join(', '); statusCode = 400; }
  if (err.code === 11000) { message = 'A record with these values already exists'; statusCode = 409; }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
