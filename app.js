const express = require('express');
const app = express();
const router = express.Router();
const request = require('request');
const sql = require('mssql');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const { ExploreTrendRequest, SearchProviders } = require('g-trends')
const explorer = new ExploreTrendRequest()
require('events').EventEmitter.prototype._maxListeners = 10000;

const port = process.env.PORT || 8086;
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
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'appid, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let location = [];
let fQuery = [];
// getAPI.addBase();

//  let jobSchedule = schedule.scheduleJob('5 0 * * *', function () {
//    sql.close();
//    sql.connect(config, err => {
//        explorer.past30Days()
//            .compare('Ginger & The House Shop')
//            .compare('Sankampaeng Craft Street')
//            .compare('Central Plaza Chiangmai Airport')
//            .compare('Warorot Market')
//            .compare('Central Festival Chiangmai')
//            .download().then(csv => {
//                let dataKeyword = csv["0"].length
//                for (let i = 1; i < dataKeyword; i++) {
//                    let dataLocation = csv["0"][i];
//                    let finalDataLocation = dataLocation.split(':')["0"];//

//                    for (let x = 1; x < csv.length; x++) {
//                        let locationName = finalDataLocation
//                        let searchTime = csv[x]["0"];
//                        let searchCount = csv[x][i];
//                        let dateKey = ((csv[x]["0"]).split("-")["0"]) + '' + ((csv[x]["0"]).split("-")["1"]) + '' + ((csv[x]["0"]).split("-")["2"]);
//                        let insertQuery = "INSERT INTO searchData (locationName, searchTime, searchCount, datekey,keyword_id) VALUES ('" + locationName + "','" + searchTime + "'," + searchCount + "," + dateKey + ",(SELECT category_Id FROM [Keyword] WHERE keyword_name = '"+locationName+"'))";
//                        let countQuery = "SELECT * FROM searchData WHERE  locationName = '" + locationName + "' AND searchTime = '" + searchTime + "' ";
//                        fQuery.push([
//                            { insertQuery, countQuery }
//                        ]);
//                    }
//                }
//                let num = fQuery.length - 1;
//                delay_loop(fQuery, num);
//                function delay_loop(items, num) {
//                    let data = items.shift(),
//                        // delay between each loop
//                        delay = 500;
//                    // start a delay
//                    setTimeout(function () {
//                        let s1 = data["0"]["countQuery"];
//                        let s2 = data["0"]["insertQuery"];
//                        new sql.Request().query(s1, (err, result) => {
//                            let count = result.rowsAffected["0"];
//                            if (count >= 1) {
//                                console.log('Already Data')
//                            } else {
//                                console.log('Insert Data Success')
//                                new sql.Request().query(s2, (err, result) => {
//                                })
//                            }
//                        });
//                        // recursive call 
//                        num--;
//                        if (items.length) {
//                            delay_loop(items, num)
//                        } else {
//                            console.log('Task End')
//                        }
//                    }, delay);
//                }
//            });
//    });
//  });

router.use(function (req, res, next) {
    next();
});

router.route('/data/:id')
    .get(function (req, res) {
        let catid = req.params.id
        console.log(catid)
        getAPI.getAllData(res, catid);
    })

router.route('/sumdata')
    .get(function (req, res) {
        getAPI.getSumData(res);
    })

router.route('/keyword')
    .post(function (req, res) {
        getAPI.addKeyword(res, keyword);
        res.end('save success');
    })

router.route('/category')
    .post(function (req, res) {
        let category = req.body.category;
        getAPI.addCategory(res, category);
        res.end('save success');
    })

    .get(function (req, res) {
        getAPI.getCategory(res);
    })
router.route('/testing')

    .get(function (req, res) {
        getAPI.addBase(res);
    })

app.use('/api', router);

app.listen(port, function () {
    console.log("App start on http://localhost:8086");
});
