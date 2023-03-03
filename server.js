
require('dotenv').config()
require ('express-async-errors')
const express = require('express')
const app = express()
const path = require('path')
const {logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const multer = require ('multer')
const PORT = process.env.PORT || 8000

console.log(process.env.NODE_ENV)

connectDB()


app.use(logger)

app.use(cors(corsOptions))

// built-in middleware for json 
app.use(express.json());


//middleware for cookies
app.use(cookieParser())




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "../client/public/upload");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
  });
  
  const upload = multer({ storage });
  
  app.post("/upload", upload.single("file"), function (req, res) {
    const file = req.file;
    console.log(file)
    res.status(200).json(file.filename)
  });


app.use('/', express.static(path.join(__dirname, 'public')))


app.use('/', require('./routes/root'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/notes', require('./routes/noteRoutes'))



app.all('*', (req, res) => {
  res.status(404)
  if (req.accepts('html')) {
      res.sendFile(path.join(__dirname, 'views', '404.html'))
  } else if (req.accepts('json')) {
      res.json({ message: '404 Not Found' })
  } else {
      res.type('txt').send('404 Not Found')
  }
})


app.use(errorHandler)


mongoose.connection.once('open', () => {
console.log('Connected to MongoDB');
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });

  mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
  