'use strict'
const OperationManager = require('./operationManager.js')

function ACSCluster (resourceGroupName, clusterName, azureAPI, repository) {
  const api = azureAPI
  let pocCluster = null
  const pocStatus = {
    status: 'uninitialized',
    message: 'Uninitialized'
  }

  const opmanager = new OperationManager(repository)

  function setStatus (newStatus, newMessage) {
    pocStatus.status = newStatus
    pocStatus.message = newMessage
  }

  function _getClusterContext () {
    return {
      cluster: pocCluster,
      status: pocStatus,
      pendingOperation: pocStatus.status === 'Scaling' ? repository.getPendingOperation() : null
    }
  }

  function _getStatus () {
    return pocStatus
  }

  function _debugRawOperation (rawopurl) {
    return new Promise(function debugRawOperationPromise (resolve, reject) {
      api.checkOperation(rawopurl).then(result => {
        resolve(result)
      }).catch(reason => {
        reject(reason)
      })
    })
  }

  function _checkOperationStatus () {
    return new Promise(function checkStatusPromise (resolve, reject) {
      /* Check status of pending operation */
      const pendingOperation = repository.getPendingOperation()

      if (pendingOperation) {
        console.log('Checking pending operation status')

        api.checkOperation(pendingOperation.pendingOperationUrl).then(result => {
          console.log('Received pending operation status')
          // console.dir(result, { depth: null, color: true })

          if (result.data.status === 'Succeeded') {
            setStatus('Ready', 'Scale succeeded.')

            // Delete pending operation
            // Write successful operation to history
            opmanager.succeed(pendingOperation, JSON.stringify(result.data))
          } else if (result.data.status === 'InProgress') {
            // TODO: Write ping history here
          } else {
            // Assume failure
            setStatus('Failed', 'Scale failed.')
            opmanager.fail(pendingOperation, JSON.stringify(result.data))
          }
          resolve(_getClusterContext())
        }).catch(reason => {
          setStatus('Failed', 'Scale failed.')
          opmanager.fail(pendingOperation, JSON.stringify(reason))

          reject(reason)
        })
      } else {
        resolve(_getClusterContext())
      }
    })
  }

  function _getCluster () {
    return new Promise(function getClusterPromise (resolve, reject) {
      api.getContainerService(resourceGroupName, clusterName).then(result => {
        pocCluster = result.data

        if (pocStatus.status !== 'Scaling') {
          setStatus('Ready', 'Cluster data received.')
          resolve(_getClusterContext())
        } else {
          // Check cluster status properly, and resolve the pending scaling operation here.

          _checkOperationStatus().then(result => {
            resolve(result)
          }).catch(reason => {
            reject(reason)
          })
        }
      }).catch(err => {
        pocCluster = null
        setStatus('Error', err.message)
        reject(err)
      })
    })
  }

  function _scaleCluster (agentPoolSize) {
    return new Promise(function scaleClusterPromise (resolve, reject) {
      // Create operation
      const operation = opmanager.create()
      operation.description = 'Scale agents to ' + agentPoolSize

      api.getContainerService(resourceGroupName, clusterName).then(result => {
        const payload = result.data

        operation.description += ' from ' + payload.properties.agentPoolProfiles[0].count

        payload.properties.agentPoolProfiles[0].count = agentPoolSize

        api.putContainerService(resourceGroupName, clusterName, payload).then(result => {
          pocCluster = result.data
          const pendingOperationUrl = result.headers['azure-asyncoperation']

          setStatus('Scaling', 'Scale operation in progress.')

          // Write pending operation
          operation.pendingOperationUrl = pendingOperationUrl
          opmanager.initiate(operation)

          resolve(_getClusterContext())
        }).catch(err => {
          setStatus('Error', 'Failed to initiate cluster update')

          // Fail operation and write to history
          opmanager.fail(operation, JSON.stringify(err))

          reject(err)
        })
      }).catch(err => {
        setStatus('Error', 'Failed to get cluster data')

        // Fail operation and write to history
        opmanager.fail(operation, 'Failed to get cluster data.')

        reject(err)
      })
    })
  }

  function _getHistory () {
    return new Promise(function getHistoryPromise (resolve, reject) {
      _checkOperationStatus().then(result => {
        resolve(repository.dump())
      }).catch(reason => {
        reject(reason)
      })
    })
  }

  function _init () {
    return new Promise(function ClusterInitPromis (resolve, reject) {
      console.log('Initializing API')
      api.init().then(function () {
        console.log('API Initialized.')

        console.log('Initializing repository')

        repository.init().then(result => {
          _getCluster().then(cluster => {
            resolve(cluster)
          }).catch(reason => {
            reject(reason)
          })
        }).catch(reason => {
          console.error('Could not initialize repository.')

          reject(reason)
        })
      }).catch(reason => {
        console.error('Could not initialize repository.')

        reject(reason)
      })
    })
  }

  this.getStatus = _getStatus
  this.getCluster = _getCluster
  this.scaleCluster = _scaleCluster
  this.checkOperationStatus = _checkOperationStatus
  this.getHistory = _getHistory
  this.debugRawOperation = _debugRawOperation
  this.init = _init
}

module.exports = ACSCluster
