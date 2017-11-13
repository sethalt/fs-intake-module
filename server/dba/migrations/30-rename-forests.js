'use strict';

let doTransaction = require('./modules/transaction');

const TABLE_NAME = 'forests';

module.exports = {
  up: function(queryInterface, Sequelize) {
    let operations = [
      {
        operation: 'renameTable',
        newTableName: 'christmas_trees_forests'
      }
    ];
    return doTransaction(TABLE_NAME, queryInterface, operations);
  },
  down: function(queryInterface, Sequelize) {
    let operations = [
      {
        operation: 'renameTable',
        newTableName: TABLE_NAME
      }
    ];
    return doTransaction('christmas_trees_forests', queryInterface, operations);
  }
};
