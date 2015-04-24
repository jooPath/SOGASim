/**
 * Created by 짱경노 on 2015-04-15.
 */

var _ = require('lodash');

var config = {
	prob: [],
	archive_size: 500,  // 500
	pop_size: 100,
	num_resources: 500,  // 500
	num_tasks: 10000,    // 53656
	num_iteration: 20000,  // 50000
	num_jobs: 5,
	max_exectime: 5000,
	jobs: [],
	p_c: 0.5,
	p_m: 0.01,
	chrs: []
};


module.exports = {
	start: function (mode) {// 1: SOGA1, 2: SOGA2

		var d = new Date();
		var time_default = d.getTime();
		console.log('soga' + time_default);
		chr_init();

		fitness(0.5);
		//init();
		console.log("prob", JSON.stringify(config.prob));

		for (var gen = 1; gen <= config.num_iteration; gen++) {

			if(gen == 1 || gen %1000 == 0)
			{
				d = new Date();
				var telapse = d.getTime() - time_default;
				console.log(gen + ": " + _.max(config.chrs, function (chr) {
						return chr.fit;
					}).fit + ", avg :" + _.sum(config.chrs, function (chr) {
						return chr.fit;
					}) / config.chrs.length + ", elapsed: " + telapse);
			}
			//console.log(JSON.stringify(config.chrs));

			for (var i = 0; i < config.pop_size / 2; i++) {
				var s = select();
				var p1 = config.chrs[s[0]];
				var p2 = config.chrs[s[1]];

				//console.log(JSON.stringify(p1) + '\n' + JSON.stringify(p2));
				var p = Math.random();

				if (mode == 1) {
					config.p_c = 0.5;
					config.p_m = 0.01;
				}
				else {
					var q_avg = _.sum(config.chrs, function (chr) {
							return chr.fit;
						}) / config.chrs.length;
					var q_max = _.max(config.chrs, function (chr) {
						return chr.fit;
					}).fit;
					var q_hat = Math.max(p1.fit, p2.fit);

					if (q_hat >= q_avg) {
						config.p_c = 0.9 * (q_max - q_hat) / (q_max - q_avg);
					}
					else {
						config.p_c = 0.9;
					}

					if (config.p_c <= 0.5) config.p_c = 0.5;
					else if (config.p_c >= 0.9) config.p_c = 0.9;
				}

				if (p <= config.p_c) {
					var c0 = crossover(p1.chr, p2.chr);
					//console.log('crossover', JSON.stringify(c0));


					if (mode != 1) {
						var mkspanc0 = mkspan(c0);
						var min_ms = _.min(fit, function (chr) {
							return chr.makespan;
						}).makespan;
						min_ms = Math.min(min_ms, mkspanc0.makespan);

						var q_i = 0.5 * min_ms / mkspanc0.makespan + 0.5 * mkspanc0.utility;
						if (q_i >= q_avg) {
							config.p_m = 0.5 * (q_max - q_i) / (q_max - q_avg);
						}
						else {
							config.p_m = 0.5;
						}
						if (config.p_m >= 0.5) config.p_m = 0.5;
						else if (config.p_m <= 0.01) config.p_m = 0.01;
						//console.log(min_ms  +' ' + mkspanc0.makespan + ' ' + q_i + ' ' + q_avg + ' ' + q_hat + ' ' + q_max + ' ' + p_c + ' ' + p_m);
					}

					c0 = mutation(c0);
					//console.log('mutation', JSON.stringify(c0) );
					//if(mode == 1)
					var mindex = _.findIndex(config.chrs, _.min(config.chrs, function (chr) {
						return chr.fit;
					}));
					res = mkspan(c0);
					config.chrs[mindex].chr = c0;
					config.chrs[mindex].ms = res.makespan;
					config.chrs[mindex].au = res.utility;
					config.chrs[mindex].fit = 0;

					fitness(0.5);
				}
			}
		}
		var ch_opt = simple_scheduling();
		var mindex = _.findIndex(config.chrs, _.min(config.chrs, function (chr) {
			return chr.fit;
		}));
		config.chrs[mindex].chr = ch_opt.chr;
		config.chrs[mindex].ms = ch_opt.ms;
		config.chrs[mindex].au = ch_opt.au;

		fitness(0.5);
		console.log("opt1 : " + config.chrs[mindex].fit);// + ", avg :" + _.sum(config.chrs, function (chr) {return chr.fit;}) / config.chrs.length);

	},
	init: function () {
		console.log('init-init');
		for (var i = 0; i < config.num_jobs; i++) {
			config.jobs.push((Math.random() * config.max_exectime));
			//console.log('A');
		}
		for (var i = 0; i < config.num_tasks; i++) {
			config.prob.push(Math.floor(Math.random() * config.num_jobs));
			//console.log('a');
		}
		console.log('end-init');
	}
};

function chr_init() {
	config.chrs = new Array(config.archive_size); // [];
	for (var j = 0; j < config.archive_size; j++) {
		var chromosome = new Array( config.num_tasks );
		for (var i = 0; i < config.num_tasks; i++) {
			//chromosome.push([Math.floor(Math.random() * num_jobs), Math.floor(Math.random() * num_resources)]); // i task -> rand resource
			//chromosome.push(Math.floor(Math.random() * config.num_resources)); // i task -> rand resource
			chromosome[i] = Math.floor(Math.random() * config.num_resources); // i task -> rand resource
		}
		//var fit = fitness(chromosome, 0.5);

		var mk = mkspan(chromosome);
		config.chrs[j] = {chr: chromosome, ms: mk.makespan, au: mk.utility, fit: 0};
		//config.chrs.push({chr: chromosome, ms: mk.makespan, au: mk.utility, fit: 0});
	}
}

function mkspan(chromosome) {
	var makespans = new Array(config.num_resources), ms = 0, au = 0, sum = 0;

	for (var i = 0; i < config.num_resources; i++)
		makespans[i] = 0;

	for (var i = 0; i < chromosome.length; i++) {
		makespans[chromosome[i]] += config.jobs[config.prob[i]];
	}
	for (var i = 0; i < makespans.length; i++) {
		sum += makespans[i];
		if (makespans[i] >= ms)
			ms = makespans[i];
	}
	au = sum / (ms * config.num_resources);    // 0 <= au <= 1
	return {makespan: ms, utility: au};
};

function fitness(alpha) {
	var min = 99999;
	min = _.min(config.chrs, function (chr) {
		return chr.ms;
	}).ms;

	// console.log(min);
	for (var i = 0; i < config.chrs.length; i++) {
		config.chrs[i].fit = alpha * (min / config.chrs[i].ms) + (1 - alpha) * config.chrs[i].au;
	}
	//if(alpha == 0.501)console.log(ms + ' ' + au);
};

function select() {
	var p1 = Math.random();
	var p2 = Math.random();
	var sum = 0, tmp = 0;
	var res = [-1, -1];

	for (var i = 0; i < config.chrs.length; i++) {
		sum += config.chrs[i].fit;
	}
	//console.log(sum);
	for (var i = 0; i < config.chrs.length; i++) {
		tmp += config.chrs[i].fit / sum;
		if (res[0] == -1 && tmp >= p1)res[0] = i;
		if (res[1] == -1 && tmp >= p2)res[1] = i;
	}
	return res;
}

function crossover(c1, c2) {
	var p = Math.floor(Math.random() * config.num_tasks);
	var c0 = [];

	for (var i = 0; i < p; i++) {
		c0.push(c1[i]);
	}
	for (var i = p; i < c2.length; i++) {
		c0.push(c2[i]);
	}
	return c0;
};

function mutation(chromosome) {

	for (var i = 0; i < chromosome.length; i++) {
		if (Math.random() <= config.p_m) {
			var p1 = Math.floor(Math.random() * config.num_tasks);
			while (i == p1) {
				p1 = Math.floor(Math.random() * config.num_tasks);
			}
			var tmp = chromosome[p1];
			chromosome[p1] = chromosome[i];
			chromosome[i] = tmp;
		}
	}
	return chromosome;
};

function simple_scheduling(){
	var makespans = new Array(config.num_resources), ms = 0, au = 0, sum = 0;
	var chr = new Array(config.num_tasks);
	for(var i=0;i<config.num_resources;i++)makespans[i] = 0;
	for(var i=0;i<config.prob.length;i++){
		var mindex =_.findIndex(config.chrs,  _.min(makespans));
		chr[i] = mindex;
		makespans[mindex] += config.jobs[config.prob[i]];
	}

	for (var i = 0; i < makespans.length; i++) {
		sum += makespans[i];
		if (makespans[i] >= ms)
			ms = makespans[i];
	}
	au = sum / (ms * config.num_resources);    // 0 <= au <= 1
	return {chr: chr, ms: ms, au: au};
}
