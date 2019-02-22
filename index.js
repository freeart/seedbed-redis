const assert = require('assert'),
	redis = require("redis")

module.exports = function () {
	assert(!this.redis, "field exists")

	this.redis = redis.createClient(Object.assign(this.config.get("redis.connection"), {
		retry_strategy: function (options) {
			if (options.error && options.error.code === 'ECONNREFUSED') {
				// End reconnecting on a specific error and flush all commands with
				// a individual error
				return new Error('The server refused the connection');
			}
			if (options.total_retry_time > 1000 * 60 * 60) {
				// End reconnecting after a specific timeout and flush all commands
				// with a individual error
				return new Error('Retry time exhausted');
			}
			if (options.attempt > 10) {
				// End reconnecting with built in error
				return undefined;
			}
			// reconnect after
			return Math.min(options.attempt * 100, 3000);
		}
	}));

	return Promise.resolve();
}