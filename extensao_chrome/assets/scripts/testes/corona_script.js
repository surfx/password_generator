// async function fetchDataUK() {
//     const res = await fetch("https://api.coronavirus.data.gov.uk/v1/data");
//     const record = await res.json();
//     document.getElementById("date").innerHTML = record.data[0].date;
//     document.getElementById("areaName").innerHTML = record.data[0].areaName;
//     document.getElementById("latestBy").innerHTML = record.data[0].latestBy;
//     document.getElementById("deathNew").innerHTML = record.data[0].deathNew;
// }
//fetchDataUK();

// async function fetchDataBR() {
//     const res = await fetch("https://covid19-brazil-api.now.sh/api/report/v1");
//     const record = await res.json();
//     document.getElementById("date").innerHTML = record.data[0].datetime;
//     document.getElementById("areaName").innerHTML = record.data[0].uf;
//     document.getElementById("latestBy").innerHTML = record.data[0].cases;
//     document.getElementById("deathNew").innerHTML = record.data[0].deaths;
// }
// fetchDataBR();