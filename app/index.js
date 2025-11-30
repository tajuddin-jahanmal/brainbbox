import { registerRootComponent } from 'expo';
import 'react-native-gesture-handler';
import AppWrapper from './AppWrapper';
import {
  createCurrenciesTable,
  createCustomersTable,
  createOpeningBalanceTable,
  createOppositeCustomersTable,
  createOppoTransactionsTable,
  createQueueTable,
  createSelfCashTable,
  createTransactionsTable,
  createWeeklyBalancesTable,
  initializeDB
} from './DB';
import kamilStore from "./store/kamil";
import LanguageFunction from "./utils/LanguageFunction";

initializeDB()
.then(() => createCustomersTable())
.then(() => createOppositeCustomersTable())
.then(() => createTransactionsTable())
.then(() => createOppoTransactionsTable())
.then(() => createCurrenciesTable())
.then(() => createQueueTable())
.then(() => createSelfCashTable())
.then(() => createOpeningBalanceTable())
.then(() => createWeeklyBalancesTable())
.catch(error => console.error('Error initializing database:', error));

kamilStore();
LanguageFunction();


export default function App() {
  return (
    <AppWrapper />
  );
};
registerRootComponent(App);

// https://com.mosaaghajahanmal.mkhata/expo-development-client/?url=http%3A%2F%2F192.168.0.176%3A8081