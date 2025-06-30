
// const CurrencyArranger = [
//   {
//     parentCurrency: "$",
//     children: ["؋", "PKR", "﷼", "درهم"]
//   },
//   {
//     parentCurrency: "؋",
//     children: ["PKR"]
//   },
//   {
//     parentCurrency: "درهم",
//     children: ["؋", "PKR", "﷼"]
//   },
//   {
//     parentCurrency: "PKR",
//     children: ["﷼"]
//   },
//   {
//     parentCurrency: "﷼",
//     children: ["؋"]
//   }
// ];

const CurrencyArranger = [
  {
    parentCurrency: "$",
    children: ["؋", "PKR", "﷼", "درهم"]
  },
  {
    parentCurrency: "؋",
    children: ["PKR", "﷼", "درهم"]
  },
  {
    parentCurrency: "درهم",
    children: ["PKR", "﷼"]
  },
  {
    parentCurrency: "PKR",
    children: ["﷼"]
  },
  // {
  //   parentCurrency: "﷼",
  //   children: ["؋"]
  // }
];

export default CurrencyArranger;