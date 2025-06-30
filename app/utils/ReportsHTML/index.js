import Colors from "../../constant";

const PLAYSTORELINK = "https://play.google.com/store/apps/details?id=com.mosaaghajahanmal.brainbbox";
const APPSTORELINK = "https://play.google.com/store/apps/details?id=com.mosaaghajahanmal.brainbbox";
const WEBSITELINK = "https://brainbbox.com";

export const customerReportHTML = (ownerFullName, data, currencyCode, forCounting, customerFullName) =>
{
	const html = `<html>
			<head>
				<meta charset="UTF-8">
				<meta name=”viewport” content=”width=device-width, initial-scale=1.0″>
				<style>
					body
					{
						display: flex;
						flex-direction: row;
						justify-content: center;
					}
					h1
					{
						text-align: center
					}
					.header
					{
						background-color: ${Colors.primary};
						color: ${Colors.white};
						width: 105%;
						margin: -8px 0 0 -18px;
						display: flex;
						flex-direction: row;
						align-items: center;
						justify-content: space-between;
						padding: 10px 30px;
						font-size: 20px;
						font-weight: bold;
						box-sizing: border-box;
						overflow: hidden;
						position: relative;
					}
					.header > p
					{
						z-index: 9;
					}
					.circle
					{
						width: 150px;
						height: 150px;
						border: 10px solid rgba(208, 216, 219, 0.4);
						border-radius: 50%;
						background-color: transparent;
						position: absolute;
						top: -60px;
						left: -40;
					}
					.circle2
					{
						top: -100px;
						right: -80;
						left: unset;
					}
					.reportTxt
					{
						font-size: 22px;
						margin-bottom: 10px;
						text-align: center;
					}
					.date
					{
						font-size: 20px;
					}
					.text
					{
						font-size: 14px;
					}
					.cashs
					{
						display: flex;
						flex-direction: row;
						align-items: center;
						justify-content: space-around;
						margin-top: 20px;
					}
					.green
					{
						color: ${Colors.green}
					}
					.red
					{
						color: ${Colors.primary}
					}
					.cashInTd
					{
						background-color: rgba(12, 147, 12, 0.08);
					}
					.cashOutTd
					{
						background-color: rgba(240, 0, 41, 0.08);
					}
					.runningBalanceTd
					{
						background-color: rgba(77, 135, 178, 0.09);
						color: ${Colors.green}
					}
					.runningBalanceRedTd
					{
						background-color: rgba(77, 135, 178, 0.09);
						color: ${Colors.primary}
					}
					.links
					{
						display: flex;
						flex-direction: row;
						align-items: center;
						justify-content: space-evenly;
						margin-top: 10px;
					}
					.link
					{
						font-size: 14px;
						margin-top: 18px;
						color: ${Colors.primary};
						text-decoration: none;
					}
					table
					{
						border-collapse: collapse;
						width: 96vw;
						text-align: center;
						border: 1px solid #e5e5e5;
					}
					thead > tr
					{
						color: ${Colors.white};
						background-color: ${Colors.primary};
					}
					.firstTH
					{
					}
					.lastTH
					{
					}
					tr:nth-child(even) {
						background-color: #f9f9f9;
					}
					tr
					{
						margin: 5px 0; 
					}
					th, td {
						padding: 10px;
						margin: 10px 0;
						border: 1px solid #e5e5e5;
					}
					.cashContainer
					{
						padding: 5px 10px;
					}
					.lastRow
					{
						margin-top: 5px;
					}
					.fontBold
					{
						font-weight: bold;
					}
				</style>
			</head>
			<body>
				<div>
					<div class="header">
						<p>${ownerFullName}</p>
						<p>Brainbbox</p>
						<span class="circle"></span>
						<span class="circle circle2"></span>
					</div>
					<p class="reportTxt">${customerFullName}</p>
					<p class="reportTxt date">${new Date(new Date()).toLocaleString()}</p>
					<table>
						<thead>
							<tr>
								<th class="firstTH">No</th>
								<th>Cash Out</th>
								<th>Cash In</th>
								<th>Running Balance</th>
								<th>Currency</th>
								<th>Information</th>
								<th class="lastTH">Date</th>
							</tr>
						</thead>
						<tbody>
							${(data.map((value, index) => (
								`<tr>
									<td>${index + 1}</td>
									<td class="cashOutTd">${!value.type ? value.amount : ""}</td>
									<td class="cashInTd">${value.type ? value.amount : ""}</td>
									<td class="${value?.runningBalance < 0 ? 'runningBalanceRedTd' : 'runningBalanceTd'}">${value?.runningBalance}</td>
									<td>${currencyCode}</td>
									<td>${value.information}</td>
									<td>${dateMaker(value.dateTime)}</td>
								</tr>
								${index === data.length - 1 ? `
									<tr>
										<td class="fontBold">Total</td>
										<td class="cashOutTd fontBold">${forCounting.cashOut}</td>
										<td class="cashInTd fontBold">${forCounting.cashIn}</td>
										<td class="fontBold ${forCounting.cash < 0 ? 'red' : 'green'}" colspan="4">Total Cash: ${forCounting.cash} ${currencyCode}</td>
									</tr>` : ""}
								`
							))).join(" ")}
						</tbody>
					</table>
					
					<div class="links">
						<a class="link" target="_blank" href=${PLAYSTORELINK}>Play Store link</a>
						<a class="link" target="_blank" href=${APPSTORELINK}>App Store link</a>
						<a class="link" target="_blank" href=${WEBSITELINK}>Web link</a>
					</div>

				</div>
			</body>
		</html>`;

		return html;
}

const dateMaker = (date) =>
{
	const newDate = new Date(date.toString());
	return newDate.getFullYear() + "/" + Number.parseInt(newDate.getMonth()+1) + "/" + newDate.getDate()
}

export const dailyReportHTML = (ownerFullName, data, currencyCode, sumCashs, date) =>
{
	const html = `<html>
		<head>
			<meta charset="UTF-8">
			<meta name=”viewport” content=”width=device-width, initial-scale=1.0″>
				<style>
					body {
						display: flex;
						flex-direction: row;
						justify-content: center;
					}
					.header
					{
						background-color: ${Colors.primary};
						color: ${Colors.white};
						width: 105%;
						margin: -8px 0 0 -18px;
						display: flex;
						flex-direction: row;
						align-items: center;
						justify-content: space-between;
						padding: 10px 30px;
						font-size: 20px;
						font-weight: bold;
						box-sizing: border-box;
						overflow: hidden;
						position: relative;
					}
					.header > p
					{
						z-index: 9;
					}
					.circle
					{
						width: 150px;
						height: 150px;
						border: 10px solid rgba(208, 216, 219, 0.4);
						border-radius: 50%;
						background-color: transparent;
						position: absolute;
						top: -60px;
						left: -40;
					}
					.circle2
					{
						top: -100px;
						right: -80;
						left: unset;
					}
					h1
					{
						text-align: center
					}
					.reportTxt
					{
						font-size: 24px;
						margin-bottom: 10px;
						text-align: center;
					}
					.date
					{
						font-size: 20px;
						text-align: center;
					}
					.text
					{
						font-size: 14px;
					}
					.cashs
					{
						display: flex;
						flex-direction: row;
						align-items: center;
						justify-content: space-around;
						margin-top: 20px;
					}
					.green
					{
						color: ${Colors.green}
					}
					.red
					{
						color: ${Colors.primary}
					}
					.cashInTd
					{
						background-color: rgba(12, 147, 12, 0.08);
					}
					.cashOutTd
					{
						background-color: rgba(240, 0, 41, 0.08);
					}
					.links
					{
						display: flex;
						flex-direction: row;
						align-items: center;
						justify-content: space-evenly;
						margin-top: 10px;
					}
					.link
					{
						font-size: 14px;
						margin-top: 18px;
						color: ${Colors.primary};
						text-decoration: none;
					}
					table
					{
						border-collapse: collapse;
						width: 96vw;
						text-align: center;
						border: 1px solid #e5e5e5;
					}
					thead > tr
					{
						color: ${Colors.white};
						background-color: ${Colors.primary};
					}
					.firstTH
					{
					}
					.lastTH
					{
					}
					tr:nth-child(even) {
						background-color: #f9f9f9;
					}
					tr
					{
						margin: 5px 0; 
					}
					th, td {
						padding: 10px;
						margin: 10px 0;
						border: 1px solid #e5e5e5;
					}
					.fontBold
					{
						font-weight: bold;
					}
				</style>
			</head>
			<body>
				<div>
					<div class="header">
						<p>${ownerFullName}</p>
						<p>Brainbbox</p>
						<span class="circle"></span>
						<span class="circle circle2"></span>
					</div>
					<p class="date">Daily Report of: ${new Date(date).toLocaleDateString()}</p>
					<p class="text">Generate Date: ${new Date(new Date()).toLocaleString()}</p>
					<table>
						<thead>
							<tr>
								<th class="firstTH">No</th>
								<th>Customer</th>
								<th>Cash Out</th>
								<th>Cash In</th>
								<th class="lastTH">Currency</th>
							</tr>
						</thead>
						<tbody>
							${(data.map((value, index) => (
								`<tr>
									<td>${index + 1}</td>
									<td>${value?.customer?.customer?.firstName || value?.customer?.firstName} ${value?.customer?.customer?.lastName || value?.customer?.lastName || ""}</td>
									<td class="cashOutTd">${value.cash.cashOut}</td>
									<td class="cashInTd">${value.cash.cashIn}</td>
									<td>${currencyCode}</td>
								</tr>
								${index === data.length - 1 ? `
								<tr>
									<td class="fontBold" colspan="2">Total</td>
									<td class="cashOutTd fontBold">${sumCashs.cashOut}</td>
									<td class="cashInTd fontBold">${sumCashs.cashIn}</td>
									<td class="fontBold">${currencyCode}</td>
								</tr>` : ""}
							`
							))).join(" ")}
						</tbody>
					</table>

					<div class="links">
						<a class="link" target="_blank" href=${PLAYSTORELINK}>Play Store link</a>
						<a class="link" target="_blank" href=${APPSTORELINK}>App Store link</a>
						<a class="link" target="_blank" href=${WEBSITELINK}>Web link</a>
					</div>

				</div>
			</body>
	</html>`;    

	return html;
};

export const balanceSheetReportHTML = (ownerFullName, data, currencyCode, sum) =>
{
	const html = `<html>
		<head>
			<meta charset="UTF-8">
			<meta name=”viewport” content=”width=device-width, initial-scale=1.0″>
				<style>
					body {
						display: flex;
						flex-direction: row;
						justify-content: center;
					}
					.header
					{
						background-color: ${Colors.primary};
						color: ${Colors.white};
						width: 105%;
						margin: -8px 0 0 -18px;
						display: flex;
						flex-direction: row;
						align-items: center;
						justify-content: space-between;
						padding: 10px 30px;
						font-size: 20px;
						font-weight: bold;
						box-sizing: border-box;
						overflow: hidden;
						position: relative;
					}
					.header > p
					{
						z-index: 9;
					}
					.circle
					{
						width: 150px;
						height: 150px;
						border: 10px solid rgba(208, 216, 219, 0.4);
						border-radius: 50%;
						background-color: transparent;
						position: absolute;
						top: -60px;
						left: -40;
					}
					.circle2
					{
						top: -100px;
						right: -80;
						left: unset;
					}
					h1
					{
						text-align: center
					}
					.reportTxt
					{
						font-size: 24px;
						margin-bottom: 10px;
						text-align: center;
					}
					.balanceSheet
					{
						font-size: 20px;
						text-align: center;
					}
					.text
					{
						font-size: 14px;
					}
					.cashs
					{
						display: flex;
						flex-direction: row;
						align-items: center;
						justify-content: space-around;
						margin-top: 20px;
					}
					.cashInTd
					{
						background-color: rgba(12, 147, 12, 0.08);
					}
					.cashOutTd
					{
						background-color: rgba(240, 0, 41, 0.08);
					}
					.green
					{
						color: ${Colors.green}
					}
					.red
					{
						color: ${Colors.primary}
					}
					.links
					{
						display: flex;
						flex-direction: row;
						align-items: center;
						justify-content: space-evenly;
						margin-top: 10px;
					}
					.link
					{
						font-size: 14px;
						margin-top: 18px;
						color: ${Colors.primary};
						text-decoration: none;
					}
					table
					{
						border-collapse: collapse;
						width: 96vw;
						text-align: center;
						border: 1px solid #e5e5e5;
					}
					thead > tr
					{
						color: ${Colors.white};
						background-color: ${Colors.primary};
					}
					.firstTH
					{
					}
					.lastTH
					{
					}
					tr:nth-child(even) {
						background-color: #f9f9f9;
					}
					tr
					{
						margin: 5px 0; 
					}
					th, td {
						padding: 10px;
						margin: 10px 0;
						border: 1px solid #e5e5e5;
					}
					.fontBold
					{
						font-weight: bold;
					}
				</style>
			</head>
			<body>
				<div>
					<div class="header">
						<p>${ownerFullName}</p>
						<p>Brainbbox</p>
						<span class="circle"></span>
						<span class="circle circle2"></span>
					</div>
					<p class="balanceSheet">Balance Sheet Report</p>
					<p class="text">Generate Date: ${new Date(new Date()).toLocaleString()}</p>
					<table>
						<thead>
							<tr>
								<th class="firstTH">No</th>
								<th>Customer</th>
								<th>You'll Get</th>
								<th>You'll Give</th>
								<th class="lastTH">Currency</th>
							</tr>
						</thead>
						<tbody>
							${(data.map((value, index) => (
								`<tr>
									<td>${index + 1}</td>
									<td>${value?.customer?.customer?.firstName || value?.customer?.firstName} ${value?.customer?.customer?.lastName || value?.customer?.lastName || ""}</td>
									<td class="cashOutTd">${value.cash < 0 ? Math.abs(value.cash) : ""}</td>
									<td class="cashInTd">${value.cash >= 1 ? value.cash : ""}</td>
									<td>${currencyCode}</td>
								</tr>
								${index === data.length - 1 ? `
								<tr>
									<td class="fontBold" colspan="2">Total</td>
									<td class="cashOutTd fontBold">${Math.abs(sum.negativeCash)}</td>
									<td class="cashInTd fontBold">${sum.positiveCash}</td>
									<td class="fontBold">${currencyCode}</td>
							</tr>` : ""}
								`
							))).join(" ")}
						</tbody>
					</table>

					<div class="links">
						<a class="link" target="_blank" href=${PLAYSTORELINK}>Play Store link</a>
						<a class="link" target="_blank" href=${APPSTORELINK}>App Store link</a>
						<a class="link" target="_blank" href=${WEBSITELINK}>Web link</a>
					</div>

				</div>
			</body>
	</html>`;    

	return html;
};

export default () => {};