"use strict";
const OperationManager = require('./operationManager.js')

function ACSCluster(resourceGroupName, clusterName, azureAPI, repository) {
    let api = azureAPI
    let pocCluster = null
    let pocStatus = {
        status: 'uninitialized',
        message: 'Uninitialized'
    }

    let opmanager = new OperationManager(repository)

    function setStatus(newStatus, newMessage) {
        pocStatus.status = newStatus
        pocStatus.message = newMessage
    }

    function _getClusterContext() {
        return {
            cluster: pocCluster,
            status: pocStatus
        }
    }

    function _getStatus() {
        return pocStatus
    }

    function _getCluster() {
        return new Promise(function getClusterPromise(resolve, reject) {
            api.getContainerService(resourceGroupName, clusterName).then(result => {
                pocCluster = result.data
                // Check cluster status properly, and resolve the pending scaling operation here.
                if (pocStatus.status !== 'Scaling') {
                    setStatus('Ready', 'Cluster data received.')
                    resolve(_getClusterContext())
                } else {
                    /* Check status of pending operation */
                    let pendingOperation = repository.getPendingOperation()

                    if (pendingOperation) {
                        console.log("Checking pending operation status")

                        api.checkOperation(pendingOperation.pendingOperationUrl).then(result => {
                            console.log("Received pending operation status")
                            console.dir(result, {depth:null, color:true })

                            if (result.data.status === 'Succeeded') {
                                pendingOperationUrl = null
                                setStatus("Ready", "Scale succeeded.")

                                // Delete pending operation
                                // Write successful operation to history
                                opmanager.succeed(pendingOperation, JSON.stringify(result.data))

                            } else if (result.data.status === 'InProgress') {
                                // TODO: Write ping history here
                            } else {
                                // Assume failure
                                setStatus("Failed", "Scale failed.")
                                opmanager.fail(pendingOperation, JSON.stringify(result.data))
                            }
                            resolve(_getClusterContext())
                        }).catch(reason => {
                            setStatus("Failed", "Scale failed.")
                            opmanager.fail(pendingOperation, JSON.stringify(reason))

                            reject(reason)
                        })
                    } else {
                        resolve(_getClusterContext())
                    }
                }

            }).catch(err => {
                pocCluster = null
                setStatus('Error', err.message)
                reject(err)
            })
        })
    }

    function _scaleCluster(agentPoolSize) {
        return new Promise(function scaleClusterPromise(resolve, reject) {
            // Create operation
            let operation = opmanager.create()
            operation.description = 'Scale agents to ' + agentPoolSize

            api.getContainerService(resourceGroupName, clusterName).then(result => {
                let payload = result.data
                
                operation.description += ' from ' + payload.properties.agentPoolProfiles[0].count

                payload.properties.agentPoolProfiles[0].count = agentPoolSize

                api.putContainerService(resourceGroupName, clusterName, payload).then(result => {
                    pocCluster = result.data
                    let pendingOperationUrl = result.headers["azure-asyncoperation"]

                    setStatus('Scaling', 'Scale operation in progress.')

                    // Write pending operation
                    operation.pendingOperationUrl = pendingOperationUrl
                    opmanager.initiate(operation)

                    

                    resolve(_getClusterContext())
                }).catch(err => {
                    setStatus('Error', 'Failed to initiate cluster update')

                    // Fail operation and write to history
                    opmanager.fail(operation, JSON.stringify(err))

                    reject({ stage: 'Update Cluster', message: 'Payload:' + JSON.stringify(err), reason: err })
                })
            }).catch(err => {
                setStatus('Error', 'Failed to get cluster data')

                // Fail operation and write to history
                opmanager.fail(operation, 'Failed to get cluster data.')

                reject({ stage: 'Get Cluster', message: 'Failed to get cluster data', reason: err })
            })
        })
    }

    function _init() {
        return new Promise(function ClusterInitPromis(resolve, reject) {
            api.init().then(function () {
                _getCluster().then(cluster => {
                    resolve(cluster)
                }).catch(reason => {
                    reject(reason)
                })
            }).catch(reason => {
                reject(reason)
            })
        })
    }

    this.getStatus = _getStatus
    this.getCluster = _getCluster
    this.scaleCluster = _scaleCluster
    this.init = _init

}

module.exports = ACSCluster