'use strict'

function IMRepository (filepath) {
  let pendingOperation = null
  let operationHistory = []

  const jf = require('jsonfile')
  const fs = require('fs')

  function _getPendingOperation () {
    return pendingOperation
  }

  function _setPendingOperation (operation) {
    pendingOperation = operation
  }

  function _deletePendingOperation () {
    pendingOperation = null
  }

  function _getOperationHistory () {
    return operationHistory
  }

  function _addOperationToHistory (operation) {
    operationHistory.push(operation)
  }

  function _dump () {
    return {
      pendingOperation,
      history: operationHistory
    }
  }

  function _save () {
    jf.writeFileSync(filepath, _dump())
  }

  function _load (loaded) {
    if (!loaded) {
      loaded = jf.readFileSync(filepath)
    }
    if (loaded) {
      pendingOperation = loaded.pendingOperation
      operationHistory = loaded.history
    }
  }

  function _init () {
    return new Promise(function IMRepositoryInitPromise (resolve, reject) {
      if (!fs.existsSync(filepath)) {
        _save()
      }
      jf.readFile(filepath, function (err, loaded) {
        if (err) {
          reject(err)
        } else {
          _load(loaded)
          resolve()
        }
      })
    })
  }

  this.getPendingOperation = _getPendingOperation
  this.setPendingOperation = _setPendingOperation
  this.deletePendingOperation = _deletePendingOperation
  this.getOperationHistory = _getOperationHistory
  this.addOperationToHistory = _addOperationToHistory
  this.dump = _dump
  this.save = _save
  this.load = _load
  this.init = _init
}

module.exports = IMRepository
