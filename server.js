"use strict";

const Express = require("express")
const AzureAPI = require("./azureAPI.js")

const clientID = "c1f2a01d-c354-46c4-9d80-5db751f43c1b"
const clientSecret = "YtQrAZ4DhXo6m8ijNAaN00BuNklZR9dp//UoJx9+poI="
const tenantID = "69e52111-6b68-4e8f-b1bc-7b81d1ccbc16"
const subscriptionID = "e35fda75-fea8-4409-a44f-c08a8e066d2b"

const api = new AzureAPI(clientID, clientSecret, tenantID, subscriptionID)

api.init().then(function () {

    const app = Express()

    app.get("/cs", function (req, res) {
        api.getContainerServices("POCGroup1", "POCACS1").then(result => {
            console.info("AALA!")
            console.dir(result, { depth: null, color: true })
            res.json(result)
            res.end()
        }).catch(err => {
            console.error("MELA!")
            console.dir(err, { depth: null, color: true })
            res.status(400)
            res.statusMessage = err.message
            res.end()
        })
    })


    console.log("Server starting")
    app.listen(8085)

}).catch(err => {
    console.error("ZALA!")
    console.dir(err, { depth: null, color: true })
})



