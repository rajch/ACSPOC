"use strict";

function ACSCluster(resourceGroupName, clusterName, azureAPI, repository) {
    let api = azureAPI
    let pocCluster = null
    let pocStatus = {
        status: 'uninitialized',
        message: 'Uninitialized'
    }
    let pendingOperationUrl = null

    function setStatus(newStatus, newMessage) {
        pocStatus.status = newStatus
        pocStatus.message = newMessage
    }

    function _getClusterContext() {
        return {
            cluster: pocCluster,
            status: pocStatus,
            pendingOperationUrl: pendingOperationUrl
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
                    if(pendingOperationUrl) {
                        api.checkOperation(pendingOperationUrl).then(result=>{
                            if(result.status === 'Succeeded') {
                                pendingOperationUrl = null
                                setStatus("Ready", "Scale succeeded.")
                            }
                            resolve(_getClusterContext())
                        }).catch(reason =>{
                            reject(reason)
                        })
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
            api.getContainerService(resourceGroupName, clusterName).then(result => {
                let payload = result.data

                payload.properties.agentPoolProfiles[0].count = agentPoolSize

                api.putContainerService(resourceGroupName, clusterName, payload).then(result => {
                    pocCluster = result.data
                    /* Record operation number and pending status here */
                    pendingOperationUrl = result.headers["azure-asyncoperation"]
                    setStatus('Scaling', 'Scale operation in progress.')
                    resolve(_getClusterContext())
                }).catch(err => {
                    reject({ stage: 'Update Cluster', message: err.data.error.message, reason: err })
                })
            }).catch(err => {
                setStatus('Error', 'Failed to get cluster data')
                reject({stage: 'Get Cluster', message:'Failed to get cluster data', reason: err })
            })
        })
    }

    function _init() {
        return new Promise(function ClusterInitPromis(resolve, reject){
            api.init().then(function(){
                _getCluster().then(cluster =>{
                    resolve(cluster)
                }).catch(reason =>{
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