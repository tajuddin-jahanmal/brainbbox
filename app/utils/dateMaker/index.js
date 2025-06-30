
export function fromAndToDateMaker (from, to)
{
    const fromDate = new Date(from.getTime() - (from.getTimezoneOffset()*60*1000)).toISOString().split('T')[0];
    const toDate = new Date(to.getTime() - (to.getTimezoneOffset()*60*1000)).toISOString().split('T')[0];

    return {fromDate, toDate};
}



function dateMaker (date)
{
    const newDate = new Date(date);

    const year = newDate.getFullYear();
    const month = newDate.getMonth();
    const day = newDate.getDate();
    const fullDate = year + "-" + (month < 9 ? "0" + (month + 1) : (month + 1)) + "-" + (day < 9 ? "0" + day : day);

    return fullDate;
};

export default dateMaker;
