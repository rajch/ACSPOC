"use strict";

const MsRest = require("ms-rest-azure")
const Axios = require("axios")

function azureAPI(clientID, clientSecret, tenantID, subscriptionID) {
    let status = 'uninitialized'
    let message = ''
    let azurecreds = null

    function getContainerServiceBaseURI(resourceGroup, containerServiceName) {
        return 'https://management.azure.com/subscriptions/' +
            subscriptionID +
            '/resourceGroups/' +
            resourceGroup +
            '/providers/Microsoft.ContainerService/containerServices/' +
            containerServiceName +
            '?api-version=2017-07-01'
    }

    function setStatus(newstatus, newmessage) {
        status = newstatus
        message = newmessage
    }

    function _getStatus() {
        return {
            status: status,
            message: message
        }
    }

    function _getContainerService(resourceGroup, containerServiceName) {
        return new Promise(function (resolve, reject) {
            if (!azurecreds) {
                reject(new Error('Not logged in.'))
            } else {
                azurecreds.getToken(function (err, result) {
                    if (err) {
                        console.error("Could not retrieve access token.")
                        reject(err)
                    } else {
                        let url = getContainerServiceBaseURI(resourceGroup, containerServiceName)


                        console.log("Asking for containerservice")

                        Axios.get(
                            url,
                            {
                                headers: { Authorization: "Bearer " + result.accessToken }
                            }
                        ).then(response => {
                            console.log("Successfully retrieved containerservice")

                            resolve({ headers: response.headers, data: response.data })
                        }).catch(reason => {
                            console.error("Could not retrieve containerservice")

                            reject(reason)
                        })
                    }
                })
            }
        })
    }

    function _putContainerService(resourceGroup, containerServiceName, requestBody) {
        return new Promise(function (resolve, reject) {
            if (!azurecreds) {
                reject(new Error('Not logged in.'))
            } else {
                azurecreds.getToken(function (err, result) {
                    if (err) {
                        console.error("Could not retrieve access token.")
                        reject(err)
                    } else {
                        let url = getContainerServiceBaseURI(resourceGroup, containerServiceName)


                        console.log("Asking for containerservice update")

                        Axios.put(
                            url,
                            requestBody,
                            {
                                headers: { Authorization: "Bearer " + result.accessToken }
                            }
                        ).then(response => {
                            console.log("Successfully retrieved containerservice update status")

                            resolve({ headers: response.headers, data: response.data })
                        }).catch(reason => {
                            console.error("Could not retrieve containerservice update status")

                            reject(reason)
                        })
                    }
                })
            }
        })
    }

    function _checkOperation(operationUrl) {
        return new Promise(function (resolve, reject) {
            if (!azurecreds) {
                reject(new Error('Not logged in.'))
            } else {
                azurecreds.getToken(function (err, result) {
                    if (err) {
                        console.error("Could not retrieve access token.")
                        reject(err)
                    } else {
                        console.log("Asking for operation update")

                        Axios.get(
                            operationUrl,
                            {
                                headers: { Authorization: "Bearer " + result.accessToken }
                            }
                        ).then(response => {
                            console.log("Successfully retrieved operation update status")
                            // console.dir(response, { depth: null, color: true })

                            resolve({ headers: response.headers, data: response.data })
                        }).catch(reason => {
                            console.error("Could not retrieve operation update status")

                            reject(reason)
                        })
                    }
                })
            }
        })
    }

    function _init() {
        return new Promise(function (resolve, reject) {
            MsRest.loginWithServicePrincipalSecret(clientID, clientSecret, tenantID, function (err, credentials, subscriptions) {
                if (err) {
                    setStatus('loginerror', err.message)
                    reject(err)
                } else {
                    azurecreds = credentials
                    setStatus('initialized', 'Login Succeeded.')
                    resolve()
                }
            })
        })
    }

    this.getStatus = _getStatus

    this.getContainerService = _getContainerService

    this.putContainerService = _putContainerService

    this.checkOperation = _checkOperation

    this.init = _init
}

module.exports = azureAPI