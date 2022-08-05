'use strict'

function POCApp () {
  const POCConfig = require('./POCConfig.js')
  const AzureAPI = require('./azureAPI.js')
  const IMRepository = require('./IMRepository.js')
  const ACSCluster = require('./ACSCluster.js')

  const path = require('path')

  const CONFFILENAME = 'pocconfig.json'
  const REPOFILENAME = 'operations.json'

  let config = null
  let cluster = null
  let api = null
  let repo = null

  function _getFilePath (filename) {
    return path.join(__dirname, 'db', filename)
  }

  function _clusterNotReady () {
    return ((!cluster) || cluster.getStatus().status === 'uninitialized')
  }

  function _homePageGetHandler (req, res, next) {
    if (_clusterNotReady()) {
      res.redirect('/configure')
      return
    }

    cluster.getCluster().then(result => {
      console.info('get succeeded!')
      res.render('index', result)
      res.end()
    }).catch(err => {
      console.error('get failed')
      next(err)

      /*
      console.dir(err, { depth: 1, color: true })
      res.status(400)
      res.statusMessage = err.message
      res.json({ "message": err.message, "headers": err.response.headers, "data": err.response.data })
      res.end()
      */
    })
  }

  function _homePagePostHandler (req, res, next) {
    if (_clusterNotReady()) {
      res.redirect('/configure')
      return
    }

    const newCount = req.body.newagentcount ? parseInt(req.body.newagentcount) : 0

    if (newCount) {
      console.log('Scale API request received')
      cluster.scaleCluster(newCount).then(result => {
        console.info('scale API call succeeded!')
        // console.dir(result, { depth: null, color: true })

        res.redirect('/')
        res.end()
      }).catch(err => {
        console.error('scale API call  failed!')
        next(err)
        /*
        console.dir(err.response.data, { depth: null, color: true })
        res.status(400)
        res.statusMessage = err.message
        res.json(err.response.data)
        */
      })
    } else {
      res.redirect('/')
    }
  }

  function _historyPageGetHandler (req, res, next) {
    if (_clusterNotReady()) {
      res.redirect('/configure')
      return
    }

    console.log('History request received')
    cluster.getHistory().then(result => {
      res.render('history', result)
    }).catch(err => {
      console.error('History request failed!')
      next(err)
      /*
      console.dir(err, { depth: null, color: true })
      res.status(400)
      res.json(err)
      */
    })
  }

  function _configurePageGetHandler (req, res, next) {
    let input = config.getConfig()
    if (!input) {
      input = config.getEmptyConfig()
    }

    if (req.query.err) {
      input.errormessage = req.query.err
    } else {
      input.errormessage = ''
    }

    res.render('configure', input)
    res.end()
  }

  function _configurePagePostHandler (req, res, next) {
    const newConfig = config.getEmptyConfig()

    newConfig.clientID = req.body.clientID
    newConfig.clientSecret = req.body.clientSecret
    newConfig.tenantID = req.body.tenantID
    newConfig.subscriptionID = req.body.subscriptionID
    newConfig.resourceGroupName = req.body.resourceGroupName
    newConfig.clusterName = req.body.clusterName

    config.set(newConfig)
    if (!config.isready()) {
      res.redirect('/configure?err=' + encodeURIComponent('Incomplete configuration.'))
    } else {
      _init().then(function () {
        res.redirect('/')
      }).catch(err => {
        const errmessage = err.response && err.response.data && err.response.data.error
          ? err.response.data.error.message
          : err.message

        res.redirect('/configure?err=' + encodeURIComponent(errmessage))
      })
    }
  }

  function _apiClusterInfoHandler (req, res, next) {
    if (_clusterNotReady()) {
      next(new Error('Cluster not configured.'))
      return
    }
    console.log('Cluster info get initiated.')
    cluster.getCluster().then(result => {
      console.info('Cluster info get succeeded!')
      // console.dir(result, { depth: null, color: true })
      res.json(result)
      res.end()
    }).catch(err => {
      console.error('Cluster info get failed')
      // console.dir(err, { depth: null, color: true })
      next(err)
    })
  }

  function _apiDumpRepohandler (req, res, next) {
    if (_clusterNotReady()) {
      next(new Error('Cluster not configured.'))
      return
    }
    res.json(repo.dump())
  }

  function _debugopGetHandler (req, res, next) {
    if (_clusterNotReady()) {
      res.redirect('/configure')
      return
    }
    res.render('debugop', { opresult: null })
  }

  function _debugopPostHandler (req, res, next) {
    const opurl = req.body.opurl

    if (opurl) {
      cluster.debugRawOperation(opurl).then(result => {
        res.render('debugop', { opresult: JSON.stringify(result, null, 2) })
      }).catch(reason => {
        res.render('debugop', { opresult: JSON.stringify(reason, null, 2) })
      })
    } else {
      res.redirect('/debugop')
    }
  }

  function _errorHandler (err, req, res, next) {
    if (res.headersSent) {
      return next(err)
    }
    res.status(500)
    res.render('error', { error: err })
  }

  function _init () {
    return new Promise(function POCAppInitPromise (resolve, reject) {
      config = new POCConfig(_getFilePath(CONFFILENAME))
      config.init().then(result => {
        if (config.isready()) {
          const conf = config.getConfig()

          api = new AzureAPI(conf.clientID, conf.clientSecret, conf.tenantID, conf.subscriptionID)
          repo = new IMRepository(_getFilePath(REPOFILENAME))
          cluster = new ACSCluster(conf.resourceGroupName, conf.clusterName, api, repo)

          cluster.init().then(function () {
            resolve()
          }).catch(err => {
            reject(err)
          })
        }
      }).catch(reason => {
        reject(reason)
      })
    })
  }

  this.homePageGetHandler = _homePageGetHandler
  this.homePagePostHandler = _homePagePostHandler
  this.historyPageGetHandler = _historyPageGetHandler
  this.configurePageGetHandler = _configurePageGetHandler
  this.configurePagePostHandler = _configurePagePostHandler
  this.apiClusterInfoHandler = _apiClusterInfoHandler
  this.apiDumpRepohandler = _apiDumpRepohandler
  this.debugopGetHandler = _debugopGetHandler
  this.debugopPostHandler = _debugopPostHandler
  this.errorHandler = _errorHandler
  this.init = _init

  return this
}

module.exports = POCApp
