const express = require('express');
const app = express();
const router = express.Router();
const request = require('request');
const sql = require('mssql');
const _ = require('lodash');
const config = {
    user: 'WebCSA',
    password: '1SA@webCrawler',
    server: 'wclr.database.windows.net',
    database: 'webcrawler',
    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}

module.exports = {

    getAllData: function (res) {
        return getAll(res);
    }
    ,getSumData: function(res){
        return getSumCount(res);
    }

}//end export

let getAll = (res) => {
    var sqlSelectAll = "SELECT * FROM searchData";
    sql.close();
    sql.connect(config, err => {
        new sql.Request().query(sqlSelectAll, (sqlSelectAll, result) => {
            var data = result.recordset;
            var grouped = _.mapValues(_.groupBy(data, 'locationName'),clist => clist.map(data => _.omit(data, 'locationName')));
            res.send(grouped);
        })
    });
}

let getSumCount = (res) => {
    var sqlSumSelect = "SELECT locationName ,SUM(searchCount) as seachCount FROM searchData GROUP BY locationName";
    sql.close();
    sql.connect(config, err => {
        new sql.Request().query(sqlSumSelect, (sqlSelectAll, result) => {
            var data = result.recordset;
            res.send(data);
        })
    });
}
