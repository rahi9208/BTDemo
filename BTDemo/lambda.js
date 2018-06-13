let AWS = require('aws-sdk');
const s3 = new AWS.S3();
const ddb = new AWS.DynamoDB.DocumentClient();
let validateJS = require("validate.js");
exports.handler = function (event, context, callback) {

	let validation = validateJS(event, {
		itemCode: { presence: true }
	});

	if (validation) {
		callback(JSON.stringify(validation), null);
		return;
	}

	ddb.put({
		TableName: 'BTMenu',
		Item: { 'itemCode': event.itemCode, 'itemName': event.itemName, 'itemPrice': event.itemPrice, 'itemType': event.itemType }
	}, function (err, data) {

		let image = Buffer.from(event.itemImage, "base64");
		let itemKey = event.itemCode + ".jpg";
		s3.putObject({
			"Body": image,
			"Bucket": "btbucket.images",
			"Key": itemKey,
			"ACL": "public-read",
			"ContentType":"image/jpeg"
		})
			.promise()
			.then(data => {
				console.log(data);           // successful response
				/*
				data = {
					ETag: "\\"6805f2cfc46c0f04559748bb039d69ae\\"", 
					VersionId: "pSKidl4pHBiNwukdbcPXAIs.sshFFOc0"
				}
				*/
			})
			.catch(err => {
				console.log(err, err.stack); // an error occurred
			});

		callback(err, data);
	});



}