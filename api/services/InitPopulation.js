/**
 * Created by 짱경노 on 2015-04-14.
 */

var _ = require('lodash');

module.exports = InitPopulation;

function InitPopulation(){

  var chrs = [];
  var chromosome = [];

  this.init = function(archive_size, num_resources, num_tasks, num_jobs) {
    for(var j=0;j<archive_size;j++) {
      chromosome = [];
      for (var i = 0; i < num_tasks; i++) {
        chromosome.push([Math.floor(Math.random() * num_jobs) + 1, Math.floor(Math.random() * num_resources) + 1]); // i task -> rand resource
      }
      chrs.push(chromosome);
      //Archive.create({'chr': chromosome, chrid: j}).exec(function (err, t) {
     // });
    }
    return chrs;
  }
  this.initJobs = function(num_jobs, max_time){
    var jobs = [];
    for(var i=0;i<num_jobs;i++) {
      //console.log( (Math.random() * max_time));
      jobs.push( (Math.random() * max_time));
      //Jobs.create({'exec': (Math.random() * max_time)}).exec(function (err, t){});
    }
    return jobs;
  }
}
