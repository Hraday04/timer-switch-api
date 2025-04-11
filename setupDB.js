const mysql = require('mysql2/promise');

async function setup() {
  const connection = await mysql.createConnection({ user: 'root', password: '#joker#4' });

  await connection.query(`CREATE DATABASE IF NOT EXISTS switch_timer_db`);
  await connection.changeUser({ database: 'switch_timer_db' });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS switches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      state BOOLEAN,
      timer INT
    )
  `);
    
    
  await connection.query(`
    INSERT INTO switches (name, state, timer)
    VALUES ('Demo switch',0,60)
  `);

  console.log('Database and table setup completed.');
  await connection.end();
}

setup().catch(console.error);
