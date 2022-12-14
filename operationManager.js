'use strict'

function operationManager (repository) {
  function _create () {
    return {
      created: Date.now(),
      initiated: null,
      finished: null,
      pendingOperationUrl: null,
      status: 'Created',
      description: '',
      lastmessage: ''
    }
  }

  function _initiate (operation) {
    operation.status = 'Initiated'
    operation.initiated = Date.now()

    repository.setPendingOperation(operation)
    repository.save()
  }

  function _succeed (operation, payload) {
    operation.finished = Date.now()
    operation.status = 'Succeded'
    operation.lastmessage = 'Payload:' + payload

    repository.deletePendingOperation()
    repository.addOperationToHistory(operation)
    repository.save()
  }

  function _fail (operation, payload) {
    operation.finished = Date.now()
    operation.status = 'Failed'
    operation.lastmessage = 'Payload:' + payload

    repository.deletePendingOperation()
    repository.addOperationToHistory(operation)
    repository.save()

    // TODO: Trigger email here
  }

  this.create = _create
  this.initiate = _initiate
  this.succeed = _succeed
  this.fail = _fail
}

module.exports = operationManager
