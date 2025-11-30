import { db } from './index';


const createOpeningBalance = async (_id, amount, currencyId, customerId, dateTime) => {
  try {
    await db.executeSql(
      'INSERT INTO openingBalance (_id, amount, currencyId, customerId, dateTime) VALUES (?, ?, ?, ?, ?)',
      [_id, amount, currencyId, customerId, dateTime]
    );
    console.log('Opening Balance created successfully');
  } catch (error) {
    console.error('Error creating Opening Balance:', error);
  }
};

const getOpeningBalance = async () => {
  try {
    const [results] = await db.executeSql('SELECT * FROM openingBalance');
    const openingBalances = results.rows.raw();
    return openingBalances;
  } catch (error) {
    console.error('Error fetching Opening Balances:', error);
    return [];
  }
};

const getOpeningBalanceByCurrencyId = async (currencyId) => {
  try {
    const [results] = await db.executeSql(
      `SELECT * FROM openingBalance 
       WHERE currencyId = ? 
       ORDER BY datetime(dateTime) DESC `,
      [currencyId]
    );
    const openingBalances = results.rows.raw();
    return openingBalances;
  } catch (error) {
    console.error('Error fetching Opening Balances:', error);
    return [];
  }
};

const getLatestOpeningBalance = async (currencyId) => {
  try {
    const [results] = await db.executeSql(
      `SELECT * FROM openingBalance 
       WHERE currencyId = ? 
       ORDER BY datetime(dateTime) DESC 
       LIMIT 1`,
      [currencyId]
    );

    const rows = results.rows.raw();
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching latest Opening Balance:', error);
    return null;
  }
};

const getLatestOpeningBalanceBeforeDate = async (currencyId, date) => {
  try {
    const [results] = await db.executeSql(
      `SELECT * FROM openingBalance 
       WHERE currencyId = ? 
       AND datetime(dateTime) < datetime(?)
       ORDER BY datetime(dateTime) DESC 
       LIMIT 1`,
      [currencyId, date]
    );

    const rows = results.rows.raw();
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching previous Opening Balance:', error);
    return null;
  }
};

const updateOpeningBalance = async (id, _id, amount, currencyId, customerId, dateTime) => {
  try {
    await db.executeSql(
      'UPDATE openingBalance SET _id = ?, amount = ?, currencyId = ?, customerId = ?, dateTime = ? WHERE id = ?',
      [_id, amount, currencyId, customerId, dateTime, id]
    );
    console.log('Opening Balance updated successfully');
  } catch (error) {
    console.error('Error updating Opening Balance:', error);
  }
};

const deleteOpeningBalance = async (id) => {
  try {
    await db.executeSql('DELETE FROM openingBalance WHERE id = ?', [id]);
    console.log('opening Balance deleted successfully');
  } catch (error) {
    console.error('Error deleting Opening Balance:', error);
  }
};



export default {
  createOpeningBalance,
  getOpeningBalance,
  getOpeningBalanceByCurrencyId,
  getLatestOpeningBalance,
  getLatestOpeningBalanceBeforeDate,
  updateOpeningBalance,
  deleteOpeningBalance,
}