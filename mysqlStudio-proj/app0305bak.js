// require

var express = require('express'),
	bodyParser = require('body-parser'),
	mysql = require('mysql');

var db_config = require('./config/secret.json');


// var

var app = express();


// set

app.locals.pretty = true;
app.set('view engine', 'jade');
app.set('views', __dirname+'/views');


// app use

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));


// listen

app.listen(3000, function(){
	console.log("* Connected To Port 3000 : app.js *");
});


// route - get & post

app.get('/', function(req, res){
	res.redirect('/root');
});

// app.get('/auth/login', function(req, res){
// 	res.render('login.jade');
// });

app.get('/:dbUser', function(req, res){
	var dbUser = req.params.dbUser;
	if(dbUser === db_config.user){
		var conn = mysql.createConnection({
			host: db_config.host,
			port: db_config.port,
			user: dbUser,
			password: db_config.password
		});
		// conn.connect();
		var sql = 'SHOW databases'
		conn.query(sql, function(err, rows, fields){
			if(err){
				console.log(err);
			}else{
				console.log(rows);
				res.render('databases.jade', {dbUser: dbUser, dbs: rows});
			}
		});
	}else{
		// console.log("Error");
		res.send("No DB user - "+dbUser);
	}
});

app.get('/:dbUser/:dbName', function(req, res){
	var dbUser = req.params.dbUser;
	var	dbName = req.params.dbName;
	var conn = mysql.createConnection({
		host: db_config.host,
		port: db_config.port,
		user: dbUser,
		password: db_config.password,
		database: dbName
	});
	var sql = 'SHOW tables';
	conn.query(sql, function(err, rows, fields){
		if(err){
			console.log(err);
			res.send("Unknown database - "+dbName);
		}else{
			console.log(rows);
			res.render('tables.jade', {tabs: rows, dbUser: dbUser, dbName: dbName});
		}
	});
});

app.get('/:dbUser/:dbName/:tabName', function(req, res){
	var dbUser = req.params.dbUser;
	var	dbName = req.params.dbName;
	var	tabName = req.params.tabName;
	var syntax = req.query.syntax;
	var crud = req.query.crud;
	var conn = mysql.createConnection({
		host: db_config.host,
		port: db_config.port,
		user: dbUser,
		password: db_config.password,
		database: dbName
	});
	// crud query
	if(crud === 'c'){
		var sql = 'INSERT INTO '+tabName+' title, description  VALUES (?, ?)'
		var params = [val1, val2];
		conn.query(sql, params, function(err, rows, fileds){
			console.log(rows);
		});
	}else if(crud === 'r'){
		var sql = 'SELECT title, description FROM '+tabName;
		conn.query(sql, function(err, rows, fields){
			console.log(rows);
			res.render('tableview.jade', {
				dbUser: dbUser,
				dbName: dbName,
				tabName: tabName,
				readrows: rows
			});
		});
	}else if(crud === 'u'){
		var sql = 'UPDATE '+tabName+' SET title=?, description=? WHERE id=?';
		var parmas = [val1, val2, id];
		conn.query(sql, params, function(err, rows, fileds){
			res.send(rows);
		});
	}else if(crud === 'd'){
		var sql = 'DELETE FROM '+tabName+' WHERE id=?';
		conn.query(sql, [id], function(err, rows, fileds){
			res.send(rows);
		});
	}else{
		res.render('tableview.jade', {
			dbUser: dbUser,
			dbName: dbName,
			tabName: tabName,
		});
	};
});
