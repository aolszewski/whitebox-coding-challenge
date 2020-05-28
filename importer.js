import fs from 'fs';
import mysql from 'mysql2';
import { promisify } from 'util';

async function migrate() {
  const drop = fs.readFileSync('./data/drop.sql', 'utf-8');
  const create = fs.readFileSync('./data/create.sql', 'utf-8');
  const data = fs.readFileSync('./data/data.sql', 'utf-8');

  const connection = mysql.createConnection({
    host: 'exporter-mysql',
    user: 'code',
    password: 'password',
    database: 'code_challenge'
  })

  const query = promisify(connection.query).bind(connection);

  /*
    These were separated out in to separate statements since I was getting errors when I would
    try and execute all of the statements in a single `query`

    Given more time, I would try to figure out how to execute all of the drop/create/delete statements
    in a single request to the database
   */
  const dropResponse = await query(drop);
  console.log('Drop Response: ', dropResponse);

  const createResponse = await query(create);
  console.log('Create Response: ', createResponse);

  const importResponse = await query(data);
  console.log('Import Response: ', importResponse);

  console.log('import complete');

  connection.close();
}

migrate();
