'use strict'

function POCConfig (filepath) {
  let config = _getEmptyConfig()

  const jf = require('jsonfile')

  function _getEmptyConfig () {
    return {
      clientID: '',
      clientSecret: '',
      tenantID: '',
      subscriptionID: '',
      resourceGroupName: '',
      clusterName: ''
    }
  }
  function _isready () {
    return config.clientID &&
      config.clientSecret &&
      config.tenantID &&
      config.subscriptionID &&
      config.resourceGroupName &&
      config.clusterName
  }

  function _dump () {
    return config
  }

  function _load (loaded) {
    if (!loaded) {
      loaded = jf.readFileSync(filepath)
    }
    config = loaded
  }

  function _save () {
    jf.writeFileSync(filepath, config)
  }

  function _set (newConfig) {
    config = _getEmptyConfig()

    for (const key in newConfig) {
      config[key] = newConfig[key]
    }

    _save()
  }

  function _init () {
    return new Promise(function POCConfigInitPromise (resolve, reject) {
      // try to read from file
      jf.readFile(filepath, function (err, loaded) {
        if (err) {
          // try to get from environment variables
        } else {
          _load(loaded)
        }

        if (!_isready()) {
          reject(new Error('Not configured.'))
        } else {
          resolve(config)
        }
      })
    })
  }

  this.isready = _isready
  this.dump = _dump
  this.getConfig = _dump
  this.getEmptyConfig = _getEmptyConfig
  this.load = _load
  this.save = _save
  this.set = _set
  this.init = _init

  return this
}

module.exports = POCConfig
