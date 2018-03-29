"use strict";

function IMRepository() {
    let pendingOperation = null
    let operationHistory = []

    // debugging
    operationHistory = [{"created":1522310777668,"initiated":1522310782941,"finished":1522311068340,"pendingOperationUrl":"https://management.azure.com/subscriptions/e35fda75-fea8-4409-a44f-c08a8e066d2b/providers/Microsoft.ContainerService/locations/centralus/operations/b37d5f77-0528-4416-8782-01ef6c2f6a86?api-version=2017-01-31","status":"Succeded","description":"Scale agents to 5 from 4","lastmessage":"Payload:{\"startTime\":\"2018-03-29T08:06:19.9843135+00:00\",\"endTime\":\"2018-03-29T08:09:29.8039095+00:00\",\"status\":\"Succeeded\",\"name\":\"b37d5f77-0528-4416-8782-01ef6c2f6a86\"}"},{"created":1522311174857,"initiated":1522311178051,"finished":1522311402012,"pendingOperationUrl":"https://management.azure.com/subscriptions/e35fda75-fea8-4409-a44f-c08a8e066d2b/providers/Microsoft.ContainerService/locations/centralus/operations/0179466e-3e6b-4ab0-b933-12986f2f4368?api-version=2017-01-31","status":"Succeded","description":"Scale agents to 4 from 5","lastmessage":"Payload:{\"startTime\":\"2018-03-29T08:12:57.8451443+00:00\",\"endTime\":\"2018-03-29T08:15:59.1462052+00:00\",\"status\":\"Succeeded\",\"name\":\"0179466e-3e6b-4ab0-b933-12986f2f4368\"}"},{"created":1522313442363,"initiated":1522313445425,"finished":1522313709904,"pendingOperationUrl":"https://management.azure.com/subscriptions/e35fda75-fea8-4409-a44f-c08a8e066d2b/providers/Microsoft.ContainerService/locations/centralus/operations/69e0df43-2da3-4084-83fc-9a5aa504b15e?api-version=2017-01-31","status":"Succeded","description":"Scale agents to 3 from 4","lastmessage":"Payload:{\"startTime\":\"2018-03-29T08:50:45.2231511+00:00\",\"endTime\":\"2018-03-29T08:53:46.5395898+00:00\",\"status\":\"Succeeded\",\"name\":\"69e0df43-2da3-4084-83fc-9a5aa504b15e\"}"},{"created":1522313899080,"initiated":1522313902091,"finished":1522314092001,"pendingOperationUrl":"https://management.azure.com/subscriptions/e35fda75-fea8-4409-a44f-c08a8e066d2b/providers/Microsoft.ContainerService/locations/centralus/operations/55d8c5db-f98a-44d4-88e7-019f6e3f20df?api-version=2017-01-31","status":"Succeded","description":"Scale agents to 2 from 3","lastmessage":"Payload:{\"startTime\":\"2018-03-29T08:58:21.8761241+00:00\",\"endTime\":\"2018-03-29T09:01:23.1037189+00:00\",\"status\":\"Succeeded\",\"name\":\"55d8c5db-f98a-44d4-88e7-019f6e3f20df\"}"}]

    function _getPendingOperation() {
        return pendingOperation
    }

    function _setPendingOperation(operation) {
        pendingOperation = operation
    }

    function _deletePendingOperation() {
        pendingOperation = null
    }

    function _getOperationHistory() {
        return operationHistory
    }

    function _addOperationToHistory(operation) {
        operationHistory.push(operation)
    }

    function _dump() {
        return {
            pendingOperation: pendingOperation,
            history: operationHistory
        }
    }

    this.getPendingOperation = _getPendingOperation
    this.setPendingOperation = _setPendingOperation
    this.deletePendingOperation = _deletePendingOperation
    this.getOperationHistory = _getOperationHistory
    this.addOperationToHistory = _addOperationToHistory
    this.dump = _dump
}

module.exports = IMRepository