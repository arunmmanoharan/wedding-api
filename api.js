'use strict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const compression = require('compression');

app.use(bodyParser.json());
app.use(compression());

cloudinary.config({
	cloud_name: 'arun6630',
	api_key: '451942662496287',
	api_secret: 'izjZCfSwcNo_l-ECTfe_ZZ1LCnw'
});

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.get('/', (req, res) => {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('<h1>Hello from Express.js!</h1>');
	res.end();
});

app.get('/video', (req, res) => {
	const path = './wedding.mp4';
	const stat = fs.statSync(path);
	const fileSize = stat.size;
	const range = req.headers.range;
	if (range) {
		const parts = range.replace(/bytes=/, '').split('-');
		const start = parseInt(parts[0], 10);
		const end = parts[1]
			? parseInt(parts[1], 10)
			: fileSize - 1;
		const chunkSize = (end - start) + 1;
		const file = fs.createReadStream(path, {start, end});
		const head = {
			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunkSize,
			'Content-Type': 'video/mp4',
		};
		res.writeHead(206, head);
		file.pipe(res);
	} else {
		const head = {
			'Content-Length': fileSize,
			'Content-Type': 'video/mp4',
		};
		res.writeHead(200, head);
		fs.createReadStream(path).pipe(res);
	}
});

app.post('/content', (req, res) => {

	const itemsPerPage = req.body.itemsPerPage;
	const nextCursor = req.body.nextCursor ? req.body.nextCursor : '';

	cloudinary.api.resources({
		type: 'upload',
		prefix: 'Wedding/',
		max_results: itemsPerPage,
		next_cursor: nextCursor
	}, (error, result) => {
		res.send(result);
	});

});

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log('Express server listening on port', port)
});
