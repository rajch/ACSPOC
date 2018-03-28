"use strict";

function IMRepository() {
    let pendingOperation = null
    let operationHistory = []

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