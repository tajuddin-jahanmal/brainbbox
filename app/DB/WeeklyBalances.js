import { getPreviousWeekRange, getWeekRange } from '../utils/dateMaker';
import { db } from './index';


const createWeeklyBalance = async (_id, weekStart, weekEnd, openingBalance, totalCashIn, totalCashOut, closingBalance, customerId, currencyId) => {
  try {
    await db.executeSql(
      'INSERT INTO weeklyBalances (_id, weekStart, weekEnd, openingBalance, totalCashIn, totalCashOut, closingBalance, customerId, currencyId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [_id, weekStart, weekEnd, openingBalance, totalCashIn, totalCashOut, closingBalance, customerId, currencyId]
    );
    console.log('Weekly Balance created successfully');
  } catch (error) {
    console.error('Error creating Weekly Balance:', error);
  }
};

const getWeeklyBalances = async (customerId = null, currencyId = null) => {
  try {
    let query = 'SELECT * FROM weeklyBalances';
    const params = [];

    if (customerId && currencyId) {
      query += ' WHERE customerId = ? AND currencyId = ? ORDER BY weekStart DESC';
      params.push(customerId, currencyId);
    } else if (customerId) {
      query += ' WHERE customerId = ? ORDER BY weekStart DESC';
      params.push(customerId);
    } else if (currencyId) {
      query += ' WHERE currencyId = ? ORDER BY weekStart DESC';
      params.push(currencyId);
    } else {
      query += ' ORDER BY weekStart DESC';
    }

    const [results] = await db.executeSql(query, params);
    return results.rows.raw(); // returns an array of rows
  } catch (error) {
    console.error('❌ Error fetching Weekly Balances:', error);
    return [];
  }
};

const getWeeklyBalancesByWeek = async (customerId, currencyId, weekStart, weekEnd) => {
  if (!customerId || !currencyId || !weekStart || !weekEnd) {
    console.error('❌ customerId, currencyId, weekStart, and weekEnd are all required');
    return [];
  }

  try {
    const query = `SELECT * FROM weeklyBalances WHERE customerId = ? AND currencyId = ? AND weekStart = ? AND weekEnd = ? ORDER BY weekStart DESC`;
    const params = [customerId, currencyId, weekStart, weekEnd];

    const [results] = await db.executeSql(query, params);
    return results.rows.raw(); // returns an array of rows
  } catch (error) {
    console.error('❌ Error fetching Weekly Balances:', error);
    return [];
  }
};

const getLatestExistingWeek = async (customerId, currencyId, currencyDate) =>
{
  const [firstWeekResult] = await db.executeSql('SELECT * FROM weeklyBalances ORDER BY weekStart ASC LIMIT 1');
  const firstWeek = firstWeekResult.rows.length ? firstWeekResult.rows.item(0) : null;

  if (!firstWeek) {
    console.log("No weekly balances yet — maybe use openingBalance as default");
    return null;
  }

  let { weekStart, weekEnd } = getWeekRange(currencyDate);

  // Convert to ISO strings
  weekStart = new Date(weekStart).toISOString();
  weekEnd = new Date(weekEnd).toISOString();

  while (true) {
    // Always ensure strings, never Date objects
    weekStart = new Date(weekStart).toISOString();
    weekEnd = new Date(weekEnd).toISOString();

    const [results] = await db.executeSql(
      'SELECT * FROM weeklyBalances WHERE customerId = ? AND currencyId = ? AND weekStart = ? AND weekEnd = ?',
      [customerId, currencyId, weekStart, weekEnd]
    );

    if (results.rows.length > 0) return results.rows.item(0);

    if (new Date(weekStart).getTime() <= new Date(firstWeek.weekStart).getTime()) {
      return firstWeek;
    }

    const { prevWeekStart, prevWeekEnd } = getPreviousWeekRange(new Date(weekStart));

    // Convert again
    weekStart = new Date(prevWeekStart).toISOString();
    weekEnd = new Date(prevWeekEnd).toISOString();
  }

};


const getNewestWeeklyBalance = async (customerId, currencyId) => {
  if (!customerId || !currencyId) {
    console.error('❌ customerId and currencyId are required');
    return null;
  }

  try {;
    const [results] = await db.executeSql(`SELECT * FROM weeklyBalances WHERE customerId = ? AND currencyId = ? ORDER BY weekEnd DESC LIMIT 1`,
      [customerId, currencyId]
    );

    const rows = results.rows.raw();
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('❌ Error fetching newest Weekly Balance:', error);
    return null;
  }
};



const updateWeeklyBalance = async (id, weekStart, weekEnd, openingBalance, totalCashIn, totalCashOut, closingBalance) => {
  try {
    await db.executeSql(
      `UPDATE weeklyBalances 
       SET weekStart = ?, weekEnd = ?, openingBalance = ?, totalCashIn = ?, totalCashOut = ?, closingBalance = ?
       WHERE id = ?`,
      [weekStart, weekEnd, openingBalance, totalCashIn, totalCashOut, closingBalance, id]
    );
    console.log(`✅ Weekly Balance (id: ${id}) updated successfully`);
  } catch (error) {
    console.error('❌ Error updating Weekly Balance:', error);
  }
};

const deleteWeeklyBalance = async (_id) => {
  try {
    await db.executeSql(
      `DELETE FROM weeklyBalances WHERE _id = ?`,
      [_id]
    );
    console.log(`🗑️ Weekly Balance (id: ${id}) deleted successfully`);
  } catch (error) {
    console.error('❌ Error deleting Weekly Balance:', error);
  }
};


export default {
  createWeeklyBalance,
  getWeeklyBalances,
  getWeeklyBalancesByWeek,
  getLatestExistingWeek,
  getNewestWeeklyBalance,
  updateWeeklyBalance,
  deleteWeeklyBalance,
};