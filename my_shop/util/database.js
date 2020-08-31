// Sequelize is basically a class or constructor function exported by the sequalixe package
const Sequelize = require('sequelize').Sequelize

// creating an instance of sequelize and it will return a connection pool that will manage sequelize
const sequelize = new Sequelize("online_shop", "root", "root", {dialect: 'mysql', host: "localhost"})


module.exports = sequelize