const express = require('express');
const app = express();
const router = express.Router();
const request = require('request');
const sql = require('mssql');
const schedule = require('node-schedule');
const { ExploreTrendRequest, SearchProviders } = require('g-trends')
require('events').EventEmitter.prototype._maxListeners = 10000;
const explorer = new ExploreTrendRequest()
const port = process.env.PORT || 8181;
const getAPI = require('./api');
const config = {
    user: 'WebCSA',
    password: '1SA@webCrawler',
    server: 'wclr.database.windows.net',
    database: 'webcrawler',
    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}

let location = [];
let fQuery = [];

let jobSchedule = schedule.scheduleJob('5 0 * * *', function () {
    sql.close();
    sql.connect(config, err => {
        explorer.past30Days()
            .compare('Wat Phra That Doi Suthep')
            .compare('Wat Chedi Luang')
            .compare('Wat Phra Singh')
            .compare('Wat Umong')
            .compare('Wat Chiang Man')
            .download().then(csv => {
                let dataKeyword = csv["0"].length
                for (let i = 1; i < dataKeyword; i++) {
                    let dataLocation = csv["0"][i];
                    let finalDataLocation = dataLocation.split(':')["0"];

                    for (let x = 1; x < csv.length; x++) {
                        let locationName = finalDataLocation
                        let searchTime = csv[x]["0"];
                        let searchCount = csv[x][i];
                        let dateKey = ((csv[x]["0"]).split("-")["0"]) + '' + ((csv[x]["0"]).split("-")["1"]) + '' + ((csv[x]["0"]).split("-")["2"]);
                        let insertQuery = "INSERT INTO searchData (locationName, searchTime, searchCount, datekey) VALUES ('" + locationName + "','" + searchTime + "'," + searchCount + "," + dateKey + ")";
                        let countQuery = "SELECT * FROM searchData WHERE  locationName = '" + locationName + "' AND searchTime = '" + searchTime + "' ";
                        fQuery.push([
                            { insertQuery, countQuery }
                        ]);
                    }
                }
                let num = fQuery.length - 1;
                delay_loop(fQuery, num);
                function delay_loop(items, num) {
                    let data = items.shift(),
                        // delay between each loop
                        delay = 500;
                    // start a delay
                    setTimeout(function () {
                        let s1 = data["0"]["countQuery"];
                        let s2 = data["0"]["insertQuery"];
                        new sql.Request().query(s1, (err, result) => {
                            let count = result.rowsAffected["0"];
                            if (count >= 1) {
                                console.log('Already Data')
                            } else {
                                console.log('Insert Data Success')
                                new sql.Request().query(s2, (err, result) => {
                                })
                            }
                        });
                        // recursive call 
                        num--;
                        if (items.length) {
                            delay_loop(items, num)
                        } else {
                            console.log('Task End')
                        }
                    }, delay);
                }
            });
    });
});

app.get('/api/allData', function (req, res) {
	getAPI.getAllData(res);
})

app.get('/api/sumData', function (req, res) {
	getAPI.getSumData(res);
})



app.listen(port, function () {
    console.log("App start on http://localhost:8181");
});
