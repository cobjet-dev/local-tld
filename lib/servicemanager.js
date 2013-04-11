var os = require("os");
var path = require("path");
var fs = require("fs");
var exec = require("child_process").exec;
var service = {};

var service_file = path.join(path.dirname(module.filename),"service.js");

switch (os.platform()) {
  case "win32":
    var win = require("node-windows");
    var svc = new win.Service({
      name: "Local-tld",
      description: "Routes local.dev domains",
      script: service_file
    });
    service = {
      install: function(done){
        svc.on("install",function(){
          if (done) done();
        });
        svc.install();
      },
      remove: function(done){
        svc.on("uninstall",function(){
          if (done) done();
        });
        svc.uninstall();
      },
      start: function(done){
        svc.on("start",function(){
          if (done) done();
        });
        svc.start();
      },
      stop: function(done){
        svc.on("stop",function(){
          if (done) done();
        });
        svc.stop();
      }
    };
    break;
  case "darwin":
    var launchDTpl = path.join(path.dirname(module.filename),"../etc/ie.hood.local-tld-service.plist.tpl");
    var launchD = "/Library/LaunchDaemons/ie.hood.local-tld-service.plist";
    service = {
      install: function(done){
        fs.readFile(launchDTpl,{ encoding:"utf8" },function(err,data){
          if (err) throw err;
          data = data.replace("{{ NODE_BIN }}",process.execPath).replace("{{ SERVICE_FILE }}",service_file);
          fs.writeFile(launchD,data,{ encoding:"utf8" },function(err){
            if (err) throw err;
            if (done) done();
          });
        });
      },
      remove: function(done){
        fs.unlink(launchD,function(err){
          if (err) throw err;
          if (done) done();
        });
      },
      start: function(done){
        exec("launchctl load -wF " + launchD, function(err){
          if (err) throw err;
          if (done) done();
        });
      },
      stop: function(done){
        exec("launchctl unload " + launchD, function(err){
          if (err) throw err;
          if (done) done();
        });
      }
    };
    break;
  case "linux":
    throw new Error("Not implemented");
}

module.exports = service;