/**
 * Created by ksdmitrieva on 04/15/2017.
 */
var GitHubApi = require("github");
var fs = require("fs");
var async = require("async");
const outputFile = "./resultfiles/authors_sails.csv";
const authorsFile = "./resultfiles/authors_sails.txt";
var configFile = "./config.json";

var github = new GitHubApi({
    debug: true,
    protocol: "https",
    host: "api.github.com",
    headers: {
        "user-agent": "My-User-Agent"
    },
    Promise: require("bluebird"),
    followRedirects: false,
    timeout: 5000
});

var config;
try {
    config = require(configFile);
    var git_username = config.username;
    var git_password = config.password

    github.authenticate({
        type: "basic",
        username: git_username,
        password: git_password
    });
}
catch (err) {
    config = {};
    console.log("unable to read file '" + configFile + "': ", err);
}

console.log("Starting the execution");
readUsers();

function readUsers() {
    var results = fs.readFileSync(authorsFile, 'utf8');
    var users = results.split('\n');
    console.log(users.length);

    async.eachSeries(users, queryUser);
}

function queryUser(user, callback) {
    user = user.replace(/^\s+|\s+$/g, '');
    console.log("user: "+user);
    fs.appendFileSync(outputFile, user+",");

    var processRepos = function (err,res) {
      if (err) {
        fs.appendFileSync(outputFile, "N/A,N/A,NA,N/A,N/A,N/A\n");
      } else {
        console.log("Return results: " + res.length);
        console.log("Repos");
        var results = [];
        var countJavaScript = 0;
        var countHTML = 0;
        var countCSS = 0;
        var countTypeScript = 0;
        var repo;
        for (var i=0; i < res.length; i++) {
            repo = res[i];
            if (repo.language == "JavaScript") {
                countJavaScript++;
                results.push(repo);
            } else if (repo.language == "HTML") {
                countHTML++;
                results.push(repo);
            } else if (repo.language == "CSS") {
                countCSS++;
                results.push(repo);
            } else if (repo.language == "TypeScript") {
                countTypeScript++;
                results.push(repo);
            }
        }
        console.log("Total: "+res.length);
        console.log("JS/HTML/CSS/TS: "+results.length);
        console.log("JavaScript: "+countJavaScript);
        console.log("HTML: "+countHTML);
        console.log("CSS: "+countCSS);
        console.log("TypeScript: "+countTypeScript);
        fs.appendFileSync(outputFile, res.length+","+results.length+","+countJavaScript+","+countHTML+","+countCSS+","+countTypeScript+"\n");
        callback();
      }
    };

    github.repos.getForUser({username: user, page: 1, per_page:100}, processRepos);
}
