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

    this.getStatus = function () {
        return {
            status: status,
            message: message
        }
    }

    this.getContainerServices = function (resourceGroup, containerServiceName) {
        return new Promise(function (resolve, reject) {
            if (!azurecreds) {
                reject(new Error('Not logged in.'))
            } else {
                azurecreds.getToken(function (err, result) {
                    if (err) {
                        console.error("Token ki maa")
                        reject(err)
                    } else {
                        console.log("GetContainerServices")
                        console.log("Got token: " + result.accessToken)

                        let url = getContainerServiceBaseURI(resourceGroup, containerServiceName)


                        console.log("Asking for containerservice")

                        Axios.get(
                            url,
                            {
                                headers: { Authorization: "Bearer " + result.accessToken }
                            }
                        ).then(response => {
                            console.log("Successfully retrieved containerservice")

                            resolve(response.data)
                        }).catch(reason => {
                            console.error("Could not retrieve containerservice")

                            reject(reason)
                        })
                    }
                })
            }
        })
    }

    this.init = function () {
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
}

module.exports = azureAPI