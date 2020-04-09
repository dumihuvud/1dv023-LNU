'use strict'

require('dotenv').config()
const createError = require('http-errors')
const express = require('express')
const favicon = require('serve-favicon')
const hbs = require('express-hbs')
const session = require('express-session')
const path = require('path')
const logger = require('morgan')
const helpersPackage = require('handlebars-helpers')
const strings = helpersPackage.string()

const mongoose = require('./configs/mongoose')
const helpersHBS = require('./helpers')

const app = express()

mongoose.connect().catch(err => {
  console.error(err)
  process.exit(1)
})

/**
 * View engine setup.
 */
app.engine('hbs', hbs.express4({
  defaultLayout: path.join(__dirname, 'views', 'layouts', 'default'),
  partialsDir: path.join(__dirname, 'views', 'partials')
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
// app.set('helpers', hbs.handlebars.helpers) // dont think i need this

/**
 * HBS helpers.
 */
hbs.registerHelper('ifPre', helpersHBS.ifPre)
hbs.registerHelper('startsWith', strings.startsWith)

console.log(strings.startsWith)

/**
 * Additional middleware.
 */
app.use(logger('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// Sessions should be here.

/**
 * Routes.
 */
app.use('/', require('./routes/homeRouter'))
app.use('*', (req, res, next) => next(createError(404)))

/**
 * Error handling.
 */
app.use((err, req, res, next) => {
  if (err.statusCode === 404) {
    return res
      .status(404)
      .sendFile(path.join(__dirname, 'views', 'errors', '404.html'))
  }

  // Not working unless you change NODE_ENV to production
  if (req.app.get('env') !== 'development') {
    return res
      .status(500)
      .sendFile(path.join(__dirname, 'views', 'errors', '500.html'))
  }

  res
    .status(err.status || 500)
    .render('errors/error', { error: err })
})

app.listen(4000, () => console.log('Server is running at http://localhost:4000'))
