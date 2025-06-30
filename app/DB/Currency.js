import {db} from './index'


const createCurrency = async (_id, code, name) => {
  try {
      await db.executeSql(
          'INSERT INTO currencies (_id, code, name) VALUES (?, ?, ?)',
          [_id, code, name]
      );
      console.log('Currency created successfully');
  } catch (error) {
      console.error('Error creating currency:', error);
  }
};

const getCurrencies = async () => {
  try {
      const [results] = await db.executeSql('SELECT * FROM currencies');
      const currencies = results.rows.raw();
      console.log('Currencies:', currencies);
      return currencies;
  } catch (error) {
      console.error('Error fetching currencies:', error);
      return [];
  }
};

const updateCurrency = async (id, code, name) => {
  try {
      await db.executeSql(
          'UPDATE currencies SET code = ?, name = ? WHERE id = ?',
          [code, name, id]
      );
      console.log('Currency updated successfully');
  } catch (error) {
      console.error('Error updating currency:', error);
  }
};

const deleteCurrency = async (id) => {
  try {
      await db.executeSql('DELETE FROM currencies WHERE id = ?', [id]);
      console.log('Currency deleted successfully');
  } catch (error) {
      console.error('Error deleting currency:', error);
  }
};



export default {
  createCurrency,
  getCurrencies,
  updateCurrency,
  deleteCurrency
}