const express = require('express');
const app = express();
const router = express.Router();
const request = require('request-promise');
const sql = require('mssql');
const moment = require('moment');
const _ = require('lodash');
const async = require('async');
const googleTrends = require('google-trends-api');
// const { ExploreTrendRequest, SearchProviders } = require('g-trends')
// const explorer = new ExploreTrendRequest()
const config = {
    user: 'WebCSA',
    password: '1SA@webCrawler',
    server: 'wclr.database.windows.net',
    database: 'webcrawler',
    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}
let fQuery = [];
require('events').EventEmitter.prototype._maxListeners = 10000;
module.exports = {

    getAllData: function (res, catid) {
        return getAllData(res, catid);
    }
    , getSumData: function (res) {
        return getSumData(res);
    },
    getCategory: function (res) {
        return getCategory(res);
    },
    addCategory: function (res, category) {
        return addCategory(res, category);
    },
    addKeyword: function (res, keyword, categoryId) {
        return addKeyword(res, keyword, categoryId);
    },
    addBase: function (res) {
        return addBase(res);
    }

}//end export

let getAllData = (res, id) => {
    if (id > 0 && id < 5) {
        var sqlSelectAll = "SELECT searchTime,searchCount,locationName FROM searchData WHERE keyword_Id = " + id + " ORDER BY datekey ASC";
    } else {
        var sqlSelectAll = "SELECT searchTime,searchCount,locationName FROM searchData WHERE keyword_Id = 1 ORDER BY datekey ASC";
    }
    sql.close();
    sql.connect(config, err => {
        new sql.Request().query(sqlSelectAll, (sqlSelectAll, result) => {
            let resultList = [];
            let countString = '';
            let timeString = '';

            let data = result.recordset;
            let dataLength = (result.recordset).length
            let grouped = _.mapValues(_.groupBy(data, 'locationName'), clist => clist.map(data => _.omit(data, 'locationName')));

            for (let location in grouped) {
                let countNum = [];
                let time = [];
                _.each(grouped[location], item => {
                    countString += countNum.push(item['searchCount'])
                    let datetime = moment(item['searchTime']).format('DD-MM-YYYY');
                    timeString += time.push(datetime)

                })
                resultList.push({
                    location: location,
                    countNum: countNum,
                    time: time
                })
            }

            let dataSend = { resultList }
            res.send(dataSend);
        })
    });
}

let getSumData = (res) => {
    var sqlSumSelect = "SELECT locationName ,SUM(searchCount) as searchCount FROM searchData GROUP BY locationName";
    sql.close();
    sql.connect(config, err => {
        new sql.Request().query(sqlSumSelect, (sqlSumSelect, result) => {
            var data = [];
            data.push({
                resultList: result.recordset
            })
            res.send(data['0']);
        })
    });
}

let getCategory = (res) => {
    var sqlSumSelect = "SELECT * FROM Category";
    sql.close();
    sql.connect(config, err => {
        new sql.Request().query(sqlSumSelect, (sqlSumSelect, result) => {
            var data = [];
            data.push({
                resultList: result.recordset
            })
            res.send(data['0']);
        })
    });
}

let addCategory = (res, category) => {
    var sqlInsert = "INSERT INTO Category (category_name) values ('" + category + "')";
    sql.close();
    sql.connect(config, err => {
        new sql.Request().query(sqlInsert, (result) => {
        })
    });
}

let addKeyword = (res, keyword, categoryId) => {
    var sqlInsert = "INSERT INTO Keyword (keyword_name,category_Id) values ('" + keyword + "'," + categoryId + ")";
    sql.close();
    sql.connect(config, err => {
        new sql.Request().query(sqlInsert, (result) => {
        })
    });
}

let addBase = (res) => {
    let sqlSelect = "SELECT * FROM Keyword";
    sql.close();
    sql.connect(config, err => {
        new sql.Request().query(sqlSelect, (sqlSelect, result) => {
            let data = result.recordset;
            let dataLength = Object.keys(data).length
            delay_loop(data, dataLength);
            function delay_loop(items, num) {
                let data = items.shift(),
                    // delay between each loop
                    delay = 2500;
                // start a delay
                setTimeout(function () {
                    // console.log(data.keyword_name)
                    let s1 = data.keyword_name;
                    // let s2 = data["0"]["insertQuery"];
                    // new sql.Request().query(s1, (err, result) => {
                    //     let count = result.rowsAffected["0"];
                    //     if (count >= 1) {
                    //         console.log('Already Data')
                    //     } else {
                    //         console.log('Insert Data Success')
                    //         new sql.Request().query(s2, (err, result) => {
                    //         })
                    //     }
                    // });
                    // recursive call 
                    googleTrends.interestOverTime({ keyword: s1 })
                        .then(function (results) {
                            console.log(results.default)
                        })
                        .catch(function (err) {
                        });
                    num--;
                    if (items.length) {
                        delay_loop(items, num)
                    } else {
                        console.log('Task End')
                    }
                }, delay);
            }
            // googleTrends.interestOverTime({keyword: 'Women\'s march'})
            // .then(function(results){
            //   console.log('These results are awesome', results);
            // })
            // .catch(function(err){
            //   console.error('Oh no there was an error', err);
            // });
        })
    });


};
