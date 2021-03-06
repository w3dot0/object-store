// Generated by CoffeeScript 1.6.2
(function() {
  var ObjectStore, RedisStore, redis,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  redis = require('redis');

  ObjectStore = require('./object_store');

  RedisStore = (function(_super) {
    __extends(RedisStore, _super);

    function RedisStore(location, database) {
      var host, port, _ref;

      if (location == null) {
        location = 'localhost:6379';
      }
      if (database == null) {
        database = 7;
      }
      _ref = location.split(':'), host = _ref[0], port = _ref[1];
      this.client = redis.createClient(parseInt(port), host);
      this.client.on("error", this.makeErrorHandler());
      this.select(database, function() {});
    }

    RedisStore.prototype.get = function(key, callback) {
      var prefix_len;

      prefix_len = ObjectStore.JSON_OBJECT_PREFIX.length;
      return this.client.get(key, function(err, data) {
        var obj;

        if ((data != null ? data.substring(0, prefix_len) : void 0) === ObjectStore.JSON_OBJECT_PREFIX) {
          obj = JSON.parse(data.substring(prefix_len));
          return callback(err, obj);
        } else {
          return callback(err, data);
        }
      });
    };

    RedisStore.prototype.set = function(key, value, callback) {
      var val;

      val = (function() {
        switch (typeof value) {
          case 'object':
            return ObjectStore.JSON_OBJECT_PREFIX + JSON.stringify(value);
          default:
            return value;
        }
      })();
      return this.client.set(key, val, function(err, res) {
        var ret;

        ret = res === 'OK' ? true : false;
        return callback(err, ret);
      });
    };

    RedisStore.prototype.del = function(key, callback) {
      return this.client.del(key, function(err, res) {
        var ret;

        ret = res > 0 ? true : false;
        return callback(err, ret);
      });
    };

    RedisStore.prototype.has = function(key, callback) {
      return this.client.exists(key, function(err, res) {
        var ret;

        ret = res === 1 ? true : false;
        return callback(err, ret);
      });
    };

    RedisStore.prototype.keys = function(filter, callback) {
      if (filter == null) {
        filter = "*";
      }
      return this.client.send_command("keys", [filter], callback);
    };

    RedisStore.prototype.makeErrorHandler = function() {
      var _this = this;

      return function(err) {
        return console.error("redis: " + err);
      };
    };

    RedisStore.prototype.info = function(callback) {
      return this.client.info(function(err, resp) {
        var lines, redis_info;

        if (err) {
          return callback(err);
        }
        if (!resp) {
          return callback(new Error("Undefined"));
        }
        lines = resp.trim().split("\n");
        redis_info = _.map(lines, function(val) {
          var kv, _ref;

          kv = val.split(":");
          return {
            key: kv[0],
            value: (_ref = kv[1]) != null ? _ref.trim() : void 0
          };
        });
        return callback(err, redis_info);
      });
    };

    RedisStore.prototype.sendCommand = function(command, args, callback) {
      return this.client.send_command(command, args, callback);
    };

    RedisStore.prototype.flushdb = function(callback) {
      return this.client.flushdb(callback);
    };

    RedisStore.prototype.flush = function(callback) {
      return this.flushdb(callback);
    };

    RedisStore.prototype.select = function(db, callback) {
      return this.client.select(db, function(err, res) {
        var ret;

        ret = res === 'OK' ? true : false;
        return callback(err, ret);
      });
    };

    RedisStore.prototype.database = function() {
      return this.client.selected_db || 0;
    };

    RedisStore.prototype.quit = function() {
      return this.client.quit();
    };

    return RedisStore;

  })(ObjectStore);

  module.exports = RedisStore;

}).call(this);
