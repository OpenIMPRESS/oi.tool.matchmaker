var parseString = require('xml2js').parseString;
var _ = require("underscore");
var format = require("string-template");
var request = require('request');
var config = require('./updateDNS.config.json');
var util = require('util');

export class UpdateDNSService {
    
    static CheckRecord = (cb) => {
        var fullHost = config.record+'.'+config.domain;
        var _dnsListRecords = "https://www.namesilo.com/api/dnsListRecords?version=1&type=xml&key={apikey}&domain={domain}";
        var dnsListRecords = format(_dnsListRecords, config);
        request(dnsListRecords, function(err, response, body) {
            if (err) return cb(err);
            parseString(body, function (err, result) {
                if (err) return cb(err);
                var thisIp = result.namesilo.request[0].ip[0];

                var record = _.filter(result.namesilo.reply[0].resource_record, function(record) {
                    return record.host[0] == fullHost && record.type[0] == 'A';
                });
                var recordId = record[0].record_id[0];
                var currentIp = record[0].value[0];

                if (thisIp == currentIp) {
                    return cb("Update not needed");
                } else {
                    return cb(null, thisIp, recordId);
                }
            });
        });
    }

    static UpdateRecord = (ip, recordId, cb) => {
        config.ip = ip;
        config.recordId = recordId;
        var _dnsUpdateRecord = "https://www.namesilo.com/api/dnsUpdateRecord?version=1&type=xml&key={apikey}&domain={domain}&rrid={recordId}&rrhost={record}&rrvalue={ip}&rrttl=3600";
        var dnsUpdateRecord = format(_dnsUpdateRecord, config);
        return;
        /*
        request(dnsUpdateRecord, function(err, response, body) {
            if (err) return cb(err);
            parseString(body, function (err, result) {
                if (err) return cb(err);
                if (result.namesilo.reply[0].code[0] == '300') {
                    cb(null);
                } else {
                    cb(result.namesilo.reply[0]);
                }
            });
        });*/
    }

}
