import {db} from './index'


const createCustomer = async (_id, firstName, lastName, countryCode, phone, email, summary, active, userId) => {
  try {
      await db.executeSql(
          'INSERT INTO customers (_id, firstName, lastName, countryCode, phone, email, summary, active, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [_id, firstName, lastName, countryCode, phone, email, summary, active, userId]
      );
      console.log('Customer created successfully');
  } catch (error) {
      console.error('Error creating customer:', error);
  }
};

const getCustomers = async () => {
  try {
      const [results] = await db.executeSql('SELECT * FROM customers');
      const customers = results.rows.raw();
      // console.log('Customers:', customers);
      return customers;
  } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
  }
};

const updateCustomer = async (id, firstName, lastName, countryCode, phone, email, summary, active, userId) => {
  try {
      await db.executeSql(
          'UPDATE customers SET firstName = ?, lastName = ?, countryCode = ?, phone = ?, email = ?, summary = ?, active = ?, userId = ? WHERE id = ?',
          [firstName, lastName, countryCode, phone, email, summary, active, userId, id]
      );
      console.log('Customer updated successfully');
  } catch (error) {
      console.error('Error updating customer:', error);
  }
};

const deleteCustomer = async (id) => {
  try {
      await db.executeSql('DELETE FROM customers WHERE id = ?', [id]);
      console.log('Customer deleted successfully');
  } catch (error) {
      console.error('Error deleting customer:', error);
  }
};


export default {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer
}