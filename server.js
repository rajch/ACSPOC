'use strict'

const Express = require('express')
const bodyParser = require('body-parser')

const POCApp = require('./POCApp.js')

console.log('Starting server.')

const app = Express()
const pocapp = new POCApp()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/css', Express.static('css'))
app.use('/images', Express.static('images'))

app.set('view engine', 'ejs')

app.get('/', pocapp.homePageGetHandler)
app.post('/', pocapp.homePagePostHandler)

app.get('/history', pocapp.historyPageGetHandler)

app.get('/configure', pocapp.configurePageGetHandler)
app.post('/configure', pocapp.configurePagePostHandler)

app.get('/cs', pocapp.apiClusterInfoHandler)
app.get('/dump', pocapp.apiDumpRepohandler)

app.get('/debugop', pocapp.debugopGetHandler)
app.post('/debugop', pocapp.debugopPostHandler)

app.use(pocapp.errorHandler)

console.log('Initializing application')
pocapp.init().then(result => {
  console.log('Application initialized.')
}).catch(err => {
  console.log('Application initialization failed.')
  console.dir(err)
})

console.log('Server started')
app.listen(8085)
