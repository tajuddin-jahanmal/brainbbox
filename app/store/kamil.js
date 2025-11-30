import { initState } from './store';

const kamil = () =>
{
    const setCustomers = (customers = [], globalState) =>
    {
        const newCustomers = [...customers];
        const newGlobalState = {...globalState, customers: newCustomers};
        return newGlobalState;
    }
    const setOppositeCustomers = (oppositeCustomers = [], globalState) =>
    {
        const newOppositeCustomers = [...oppositeCustomers];
        const newGlobalState = {...globalState, oppositeCustomers: newOppositeCustomers};
        return newGlobalState;
    }
    const setCurrencies = (currencies = [], globalState) =>
    {
        const newCurrencies = [...currencies];
        const newGlobalState = {...globalState, currencies: newCurrencies};
        return newGlobalState;
    }
    const setTransactions = (transactions = [], globalState) =>
    {
        const newTransactions = [...transactions];
        const newGlobalState = {...globalState, transactions: newTransactions};
        return newGlobalState;
    }
    const setOppositeTransactions = (oppositeTransactions = [], globalState) =>
    {
        const newOppoTransactions = [...oppositeTransactions];
        const newGlobalState = {...globalState, oppositeTransactions: newOppoTransactions};
        return newGlobalState;
    }
    const setSelfCash = (selfCash = [], globalState) =>
    {
        const newSelfCash = [...selfCash];
        const newGlobalState = {...globalState, selfCash: newSelfCash};
        return newGlobalState;
    }
    const setContacts = (contacts = [], globalState) =>
    {
        const newContacts = [...contacts];
        const newGlobalState = {...globalState, contacts: newContacts};
        return newGlobalState;
    }
    const setSliders = (sliders = [], globalState) =>
    {
        const newsliders = [...sliders];
        const newGlobalState = {...globalState, sliders: newsliders};
        return newGlobalState;
    }
    const setCurrencyRate = (currencyRate = [], globalState) =>
    {
        const newCurrencyRate = [...currencyRate];
        const newGlobalState = {...globalState, currencyRate: newCurrencyRate};
        return newGlobalState;
    }
    const setOpeningBalances = (openingBalances = [], globalState) =>
    {
        const newOpeningBalances = [...openingBalances];
        const newGlobalState = {...globalState, openingBalances: newOpeningBalances};
        return newGlobalState;
    }
    const setWeeklyBalances = (weeklyBalances = [], globalState) =>
    {
        const newWeeklyBalances = [...weeklyBalances];
        const newGlobalState = {...globalState, weeklyBalances: newWeeklyBalances};
        return newGlobalState;
    }

    const clearStore = () =>
    {
        const newGlobalState = {
            customers: [],
            oppositeCustomers: [],
            currencies: [],
            currencyRate: [],
            transactions: [],
            oppositeTransactions: [],
            selfCash: [],
            contacts: [],
            sliders: [],
            openingBalances: [],
            weeklyBalances: []
        };
        return newGlobalState;
    }

    const initialState = (payload, globalState) =>
    {
        return {
            customers: [],
            oppositeCustomers: [],
            currencies: [],
            transactions: [],
            selfCash: [],
            currencyRate: [],
            contacts: [],
            sliders: [],
            openingBalances: [],
            weeklyBalances: [],
            oppositeTransactions: []
        }
    }
    return initState({
        initialState,
        setCustomers,
        setOppositeCustomers,
        setCurrencies,
        setTransactions,
        setOppositeTransactions,
        setSelfCash,
        setContacts,
        clearStore,
        setSliders,
        setCurrencyRate,
        setOpeningBalances,
        setWeeklyBalances,
    });
}

export default kamil;