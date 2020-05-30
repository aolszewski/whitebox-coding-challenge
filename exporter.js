import { promisify } from 'util';

import mysql from 'mysql2';
import exceljs from 'exceljs';

import {
  SHEET_DOMESTIC_STANDARD_RATES,
  SHEET_DOMESTIC_EXPEDITED_RATES,
  SHEET_DOMESTIC_NEXT_DAY_RATES,
  SHEET_INTERNATIONAL_ECONOMIC_RATES,
  SHEET_INTERNATIONAL_EXPEDITED_RATES,
  CLIENT_ID,
  LOCALE_DOMESTIC,
  LOCALE_INTERNATIONAL,
  SHIPPING_STANDARD,
  SHIPPING_EXPEDITED,
  SHIPPING_NEXT_DAY,
  SHIPPING_INTERNATIONAL_ECONOMY,
  SHIPPING_INTERNATIONAL_EXPEDITED,
} from './constants';

/*
  Given more time, I would extract the creation of the database connection pool in to
  a separate file and extract the connection information so that it was in a configuration
  file or credential store
 */
const connection = mysql.createConnection({
  host: 'exporter-mysql',
  user: 'code',
  password: 'password',
  database: 'code_challenge'
});
const query = promisify(connection.query).bind(connection);

function createWorkbook() {
  const workbook = new exceljs.Workbook();
  workbook.creator = 'Rate Exporter';
  workbook.lastModifiedBy = 'Rate Exporter';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.lastPrinted = new Date();

  workbook.addWorksheet(SHEET_DOMESTIC_STANDARD_RATES);
  workbook.addWorksheet(SHEET_DOMESTIC_EXPEDITED_RATES);
  workbook.addWorksheet(SHEET_DOMESTIC_NEXT_DAY_RATES);
  workbook.addWorksheet(SHEET_INTERNATIONAL_ECONOMIC_RATES);
  workbook.addWorksheet(SHEET_INTERNATIONAL_EXPEDITED_RATES);

  return workbook;
}

async function populateWorksheet(workbook, worksheetName, locale, shippingSpeed) {
  const worksheet = workbook.getWorksheet(worksheetName);

  const zones = await query(`
    select distinct zone
    from rates
    where 1=1
    and client_id = ?
    and locale = ?
    and shipping_speed = ?
  `, [CLIENT_ID , locale, shippingSpeed]);

  const header = ['Start Weight', 'End Weight'];
  zones.forEach((zone) => {
    header.push(`Zone ${zone.zone}`);
  });

  worksheet.addRow(header);

  const selectZones = zones.map((zone) => `, MAX(case when rates.zone = '${zone.zone}' then rates.rate end) as 'Zone ${zone.zone}' `).join('');

  const queryResults = await query(`
    select start_weight, end_weight ${selectZones}
    from rates
    where 1=1
    and client_id = ?
    and locale = ?
    and shipping_speed = ?
    group by start_weight, end_weight
  `, [CLIENT_ID, locale, shippingSpeed]);

  queryResults.forEach((result) => {
    const excelRow = [result.start_weight, result.end_weight];

    zones.forEach((zone) => {
      excelRow.push(result[`Zone ${zone.zone}`]);
    });

    worksheet.addRow(excelRow);
  })

  return workbook;
}

const workbook = createWorkbook();

populateWorksheet(workbook, SHEET_DOMESTIC_STANDARD_RATES, LOCALE_DOMESTIC, SHIPPING_STANDARD)
  .then(() => populateWorksheet(workbook, SHEET_DOMESTIC_EXPEDITED_RATES, LOCALE_DOMESTIC, SHIPPING_EXPEDITED))
  .then(() => populateWorksheet(workbook, SHEET_DOMESTIC_NEXT_DAY_RATES, LOCALE_DOMESTIC, SHIPPING_NEXT_DAY))
  .then(() => populateWorksheet(workbook, SHEET_INTERNATIONAL_ECONOMIC_RATES, LOCALE_INTERNATIONAL, SHIPPING_INTERNATIONAL_ECONOMY))
  .then(() => populateWorksheet(workbook, SHEET_INTERNATIONAL_EXPEDITED_RATES, LOCALE_INTERNATIONAL, SHIPPING_INTERNATIONAL_EXPEDITED))
  .then(() => workbook.xlsx.writeFile('result.xlsx'))
  .then(() => connection.close());