
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var path = require('path');

var apps = {};

var App = function(dir,info) {
	this.dir = dir;
	this.info = info;
	this.uses = [];
};

util.inherits(App,EventEmitter);

App.prototype.exit = function() {
	var v = apps[this.dir];
	if(v !== undefined) {
		v.emit('exit');
		delete apps[this.dir];
	}
};

App.prototype.exec = function(command,context) {
	
};

module.exports = function(dir,fn){

	var name = path.normalize(dir);
	var v = apps[name];
	var now = (new Date()).getTime();
	var f = path.join(name,'app.json');
	
	if(v !== undefined) {
		
		if(v.expires_in === undefined || now - v.ctime > v.expires_in ) {
			
			fs.stat(f,function(err,stat){
				if(err) {
					fn(err);
					v.app.exit();
				}
				else {
					if(v.mtime != stat.mtime.getTime()) {
						v.ctime = now;
						v.mtime = stat.mtime.getTime();
						var info = v.app.info;
						fs.readFile(f,function(err,data){
							if(err) {
								fn(err);
								v.app.exit();
							}
							else {
								v.app.info = JSON.parse(data.toString());
								v.app.emit("reload",info);
								fn(v.app);
							}
							
						});
					}
					else {
						v.ctime = now;
					}
				}
			});
		}
		
	}
	else {
		
		fs.stat(f,function(err,stat){
			if(err) {
				fn(err);
			}
			else {
				
				var v = { mtime : stat.mtime.getTime() , ctime : now};
				
				fs.readFile(f,function(err,data){
					if(err) {
						fn(err);
					}
					else {
						var info = JSON.parse(data.toString());
						v.expires_in = info.expires_in;
						v.app = new App(name,info);
						apps[name] = v;
						v.app.emit("load");
						fn(v.app);
					}
					
				});
				
			}
		});
	}
	
};

module.exports.App = App;

