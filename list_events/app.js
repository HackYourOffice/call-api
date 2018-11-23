'use strict';

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const table = "call_events";

exports.lambdaHandler = async (event, context) => {
    console.log('event', event);

    var body = {};
    var statusCode = 200;

    try {
        var params = {
            TableName : table
        };

        const data = await docClient.scan(params).promise();
        body.events = [];
        for (var i = 0; i < data.Items.length; i++) {
            var item = data.Items[i];
            body.events.push({
                "eventid": item.eventid,
                "title": item.title,
                "description": item.description
            });
        }
    } catch (err) {
        console.log(err);
        statusCode = 500;
        body.message = err.toString();
    }

    return {
        'statusCode': statusCode,
        'body': JSON.stringify(body)
    }
};
