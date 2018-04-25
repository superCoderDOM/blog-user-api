// Update with your config settings.

module.exports = {

  client: 'mysql',
  connection: process.env.MYSQL_DATABASE_URL || {
    database: 'iversoft-test_db',
    user:     'iversoftuser',
    password: 'iversoft'
  },

};
