const EventEmitter = require('events').EventEmitter,
    Modem = require('docker-modem'),
    tar = require('tar-fs'),
    zlib = require('zlib'),
    fs = require('fs'),
    concat = require('concat-stream'),
    path = require('path'),
    Container = require('./container'),
    Image = require('./image'),
    Volume = require('./volume'),
    Network = require('./network'),
    Service = require('./service'),
    Plugin = require('./plugin'),
    Secret = require('./secret'),
    Config = require('./config'),
    Task = require('./task'),
    Node = require('./node'),
    Exec = require('./exec'),
    util = require('./util'),
    extend = util.extend;

module.exports = class Docker {
    constructor(opts) {
        if (!(this instanceof Docker)) return new Docker(opts);

        var plibrary = global.Promise;

        if (opts && opts.Promise) {
            plibrary = opts.Promise;

            if (Object.keys(opts).length === 1) {
                opts = undefined;
            }
        }

        this.modem = new Modem(opts);
        this.modem.Promise = plibrary;
    }

    /**
     * Creates a new container
     * @param {Object}   opts     Create options
     * @param {Function} callback Callback
     */
    async createContainer() {
        var self = this;
        var optsf = {
            path: '/containers/create?',
            method: 'POST',
            options: opts,
            authconfig: opts.authconfig,
            statusCodes: {
                200: true, // unofficial, but proxies may return it
                201: true,
                404: 'no such container',
                406: 'impossible to attach',
                500: 'server error'
            }
        };

        delete opts.authconfig;

        if (callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(self.getContainer(data.Id));
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                if (err) return callback(err, data);
                callback(err, self.getContainer(data.Id));
            });
        }
    }

    /**
     * Creates a new image
     * @param {Object}   auth     Authentication (optional)
     * @param {Object}   opts     Create options
     * @param {Function} callback Callback
     */
    async createImage(auth, opts, callback) {
        var self = this;
        if (!callback && typeof opts === 'function') {
            callback = opts;
            opts = auth;
            auth = opts.authconfig || undefined;
        } else if (!callback && !opts) {
            opts = auth;
            auth = opts.authconfig;
        }

        var optsf = {
            path: '/images/create?',
            method: 'POST',
            options: opts,
            authconfig: auth,
            isStream: true,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                callback(err, data);
            });
        }
    };

    /**
     * Load image
     * @param {String}   file     File
     * @param {Object}   opts     Options (optional)
     * @param {Function} callback Callback
     */
    async loadImage(file, opts, callback) {
        var self = this;
        if (!callback && typeof opts === 'function') {
            callback = opts;
            opts = null;
        }

        var optsf = {
            path: '/images/load?',
            method: 'POST',
            options: opts,
            file: file,
            isStream: true,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                callback(err, data);
            });
        }
    };

    /**
     * Import image from a tar archive
     * @param {String}   file     File
     * @param {Object}   opts     Options (optional)
     * @param {Function} callback Callback
     */
    async importImage(file, opts, callback) {
        var self = this;
        if (!callback && typeof opts === 'function') {
            callback = opts;
            opts = {};
        }

        opts.fromSrc = '-';

        var optsf = {
            path: '/images/create?',
            method: 'POST',
            options: opts,
            file: file,
            isStream: true,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                callback(err, data);
            });
        }
    };

    /**
     * Verifies auth
     * @param {Object}   opts     Options
     * @param {Function} callback Callback
     */
    async checkAuth(opts, callback) {
        var self = this;
        var optsf = {
            path: '/auth',
            method: 'POST',
            options: opts,
            statusCodes: {
                200: true,
                204: true,
                500: 'server error'
            }
        };

        if (callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                callback(err, data);
            });
        }
    };

    /**
     * Builds an image
     * @param {String}   file     File
     * @param {Object}   opts     Options (optional)
     * @param {Function} callback Callback
     */
    async buildImage(file, opts, callback) {
        var self = this;
        var pack = tar.pack();
        var content;

        if (!callback && typeof opts === 'function') {
            callback = opts;
            opts = null;
        }

        async function build(file) {
            var optsf = {
                path: '/build?',
                method: 'POST',
                file: file,
                options: opts,
                isStream: true,
                statusCodes: {
                    200: true,
                    500: 'server error'
                }
            };

            if (opts) {
                if (opts.registryconfig) {
                    optsf.registryconfig = optsf.options.registryconfig;
                    delete optsf.options.registryconfig;
                }

                //undocumented?
                if (opts.authconfig) {
                    optsf.authconfig = optsf.options.authconfig;
                    delete optsf.options.authconfig;
                }
            }

            if (callback === undefined) {
                return new self.modem.Promise(function (resolve, reject) {
                    self.modem.dial(optsf, function (err, data) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(data);
                    });
                });
            } else {
                self.modem.dial(optsf, function (err, data) {
                    callback(err, data);
                });
            }
        }

        if (file && file.context) {
            file.src.forEach(function (filePath) {
                content = fs.readFileSync(path.join(file.context, filePath));
                pack.entry({
                    name: filePath
                }, content);
            });
            pack.finalize();
            return build(pack.pipe(zlib.createGzip()));
        } else {
            return build(file);
        }
    };

    /**
     * Fetches a Container by ID
     * @param {String} id Container's ID
     */
    getContainer(id) {
        return new Container(this.modem, id);
    };

    /**
     * Fetches an Image by name
     * @param {String} name Image's name
     */
    getImage(name) {
        return new Image(this.modem, name);
    };

    /**
     * Fetches a Volume by name
     * @param {String} name Volume's name
     */
    getVolume(name) {
        return new Volume(this.modem, name);
    };

    /**
     * Fetches a Plugin by name
     * @param {String} name Volume's name
     */
    getPlugin(name, remote) {
        return new Plugin(this.modem, name, remote);
    };

    /**
     * Fetches a Service by id
     * @param {String} id Services's id
     */
    getService(id) {
        return new Service(this.modem, id);
    };

    /**
     * Fetches a Task by id
     * @param {String} id Task's id
     */
    getTask(id) {
        return new Task(this.modem, id);
    };

    /**
     * Fetches Node by id
     * @param {String} id Node's id
     */
    getNode(id) {
        return new Node(this.modem, id);
    };

    /**
     * Fetches a Network by id
     * @param {String} id network's id
     */
    getNetwork(id) {
        return new Network(this.modem, id);
    };

    /**
     * Fetches a Secret by id
     * @param {String} id network's id
     */
    getSecret(id) {
        return new Secret(this.modem, id);
    };

    /**
     * Fetches a Config by id
     * @param {String} id network's id
     */
    getConfig(id) {
        return new Config(this.modem, id);
    };

    /**
     * Fetches an Exec instance by ID
     * @param {String} id Exec instance's ID
     */
    getExec(id) {
        return new Exec(this.modem, id);
    };

    /**
     * Lists containers
     * @param {Options}   opts     Options (optional)
     * @param {Function} callback Callback
     */
    async listContainers(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/containers/json?',
            method: 'GET',
            options: args.opts,
            statusCodes: {
                200: true,
                400: 'bad parameter',
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Lists images
     * @param {Options}   opts     Options (optional)
     * @param {Function} callback Callback
     */
    async listImages(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/images/json?',
            method: 'GET',
            options: args.opts,
            statusCodes: {
                200: true,
                400: 'bad parameter',
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Lists Services
     * @param {Function} callback Callback
     */
    async listServices(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/services?',
            method: 'GET',
            options: args.opts,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Lists Nodes
     * @param {Function} callback Callback
     */
    async listNodes(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/nodes?',
            method: 'GET',
            options: args.opts,
            statusCodes: {
                200: true,
                400: 'bad parameter',
                404: 'no such node',
                500: 'server error',
                503: 'node is not part of a swarm',
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Lists Tasks
     * @param {Function} callback Callback
     */
    async listTasks(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/tasks?',
            method: 'GET',
            options: args.opts,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Creates a new secret
     * @param {Object}   opts     Create options
     * @param {Function} callback Callback
     */
    async createSecret(opts, callback) {
        var args = util.processArgs(opts, callback);
        var self = this;
        var optsf = {
            path: '/secrets/create?',
            method: 'POST',
            options: args.opts,
            statusCodes: {
                200: true, // unofficial, but proxies may return it
                201: true,
                406: 'server error or node is not part of a swarm',
                409: 'name conflicts with an existing object',
                500: 'server error'
            }
        };


        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(self.getSecret(data.ID));
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                if (err) return args.callback(err, data);
                args.callback(err, self.getSecret(data.ID));
            });
        }
    };


    /**
     * Creates a new config
     * @param {Object}   opts     Config options
     * @param {Function} callback Callback
     */
    async createConfig(opts, callback) {
        var args = util.processArgs(opts, callback);
        var self = this;
        var optsf = {
            path: '/configs/create?',
            method: 'POST',
            options: args.opts,
            statusCodes: {
                200: true, // unofficial, but proxies may return it
                201: true,
                406: 'server error or node is not part of a swarm',
                409: 'name conflicts with an existing object',
                500: 'server error'
            }
        };


        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(self.getConfig(data.ID));
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                if (err) return args.callback(err, data);
                args.callback(err, self.getConfig(data.ID));
            });
        }
    };


    /**
     * Lists secrets
     * @param {Function} callback Callback
     */
    async listSecrets(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/secrets?',
            method: 'GET',
            options: args.opts,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Lists configs
     * @param {Function} callback Callback
     */
    async listConfigs(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/configs?',
            method: 'GET',
            options: args.opts,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Creates a new plugin
     * @param {Object}   opts     Create options
     * @param {Function} callback Callback
     */
    async createPlugin(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);
        var optsf = {
            path: '/plugins/create?',
            method: 'POST',
            options: args.opts,
            statusCodes: {
                200: true, // unofficial, but proxies may return it
                204: true,
                500: 'server error'
            }
        };


        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(self.getPlugin(args.opts.name));
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                if (err) return args.callback(err, data);
                args.callback(err, self.getPlugin(args.opts.name));
            });
        }
    };


    /**
     * Lists plugins
     * @param {Function} callback Callback
     */
    async listPlugins(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/plugins?',
            method: 'GET',
            options: args.opts,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Prune images
     * @param {Options}   opts     Options (optional)
     * @param {Function} callback Callback
     */
    async pruneImages(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/images/prune?',
            method: 'POST',
            options: args.opts,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Prune containers
     * @param {Options}   opts     Options (optional)
     * @param {Function} callback Callback
     */
    async pruneContainers(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/containers/prune?',
            method: 'POST',
            options: args.opts,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Prune volumes
     * @param {Options}   opts     Options (optional)
     * @param {Function} callback Callback
     */
    async pruneVolumes(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/volumes/prune?',
            method: 'POST',
            options: args.opts,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Prune networks
     * @param {Options}   opts     Options (optional)
     * @param {Function} callback Callback
     */
    async pruneNetworks(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/networks/prune?',
            method: 'POST',
            options: args.opts,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };


    /**
     * Creates a new volume
     * @param {Object}   opts     Create options
     * @param {Function} callback Callback
     */
    async createVolume(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);
        var optsf = {
            path: '/volumes/create?',
            method: 'POST',
            options: args.opts,
            statusCodes: {
                200: true, // unofficial, but proxies may return it
                201: true,
                500: 'server error'
            }
        };


        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(self.getVolume(data.Name));
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                if (err) return args.callback(err, data);
                args.callback(err, self.getVolume(data.Name));
            });
        }
    };

    /**
     * Creates a new service
     * @param {Object}   opts     Create options
     * @param {Function} callback Callback
     */
    createService(auth, opts, callback) {
        if (!callback && typeof opts === 'function') {
            callback = opts;
            opts = auth;
            auth = opts.authconfig || undefined;
        } else if (!opts && !callback) {
            opts = auth;
        }


        var self = this;
        var optsf = {
            path: '/services/create',
            method: 'POST',
            options: opts,
            authconfig: auth,
            statusCodes: {
                200: true,
                201: true,
                500: 'server error'
            }
        };


        if (callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(self.getService(data.ID || data.Id));
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                if (err) return callback(err, data);
                callback(err, self.getService(data.ID || data.Id));
            });
        }
    };

    /**
     * Lists volumes
     * @param {Options}   opts     Options (optional)
     * @param {Function} callback Callback
     */
    async listVolumes(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/volumes?',
            method: 'GET',
            options: args.opts,
            statusCodes: {
                200: true,
                400: 'bad parameter',
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Creates a new network
     * @param {Object}   opts     Create options
     * @param {Function} callback Callback
     */
    async createNetwork(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);
        var optsf = {
            path: '/networks/create?',
            method: 'POST',
            options: args.opts,
            statusCodes: {
                200: true, // unofficial, but proxies may return it
                201: true,
                404: 'driver not found',
                500: 'server error'
            }
        };


        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(self.getNetwork(data.Id));
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                if (err) return args.callback(err, data);
                args.callback(err, self.getNetwork(data.Id));
            });
        }
    };

    /**
     * Lists networkss
     * @param {Options}   opts     Options (optional)
     * @param {Function} callback Callback
     */
    async listNetworks(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/networks?',
            method: 'GET',
            options: args.opts,
            statusCodes: {
                200: true,
                400: 'bad parameter',
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Search images
     * @param {Object}   opts     Options
     * @param {Function} callback Callback
     */
    async searchImages(opts, callback) {
        var self = this;
        var optsf = {
            path: '/images/search?',
            method: 'GET',
            options: opts,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                callback(err, data);
            });
        }
    };

    /**
     * Info
     * @param  {Function} callback Callback with info
     */
    async info(callback) {
        var self = this;
        var opts = {
            path: '/info',
            method: 'GET',
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };


        if (callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(opts, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(opts, function (err, data) {
                callback(err, data);
            });
        }
    };

    /**
     * Version
     * @param  {Function} callback Callback
     */
    async version(callback) {
        var self = this;
        var opts = {
            path: '/version',
            method: 'GET',
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(opts, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(opts, function (err, data) {
                callback(err, data);
            });
        }
    };

    /**
     * Ping
     * @param  {Function} callback Callback
     */
    async ping(callback) {
        var self = this;
        var optsf = {
            path: '/_ping',
            method: 'GET',
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                callback(err, data);
            });
        }
    };

    /**
     * SystemDf 	equivalent to system/df API Engine
     *		get usage data information
     * @param  {Function} callback Callback
     */
    async df(callback) {
        var self = this;
        var optsf = {
            path: '/system/df',
            method: 'GET',
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                callback(err, data);
            });
        }
    };

    /**
     * Events
     * @param {Object}   opts     Events options, like 'since' (optional)
     * @param {Function} callback Callback
     */
    async getEvents(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/events?',
            method: 'GET',
            options: args.opts,
            isStream: true,
            statusCodes: {
                200: true,
                500: 'server error'
            }
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Pull is a wrapper around parsing out the tag from the image
     * (which create image cannot do but run can for whatever reasons) and create image overloading.
     * @param  {String}   repoTag  Repository tag
     * @param  {Object}   opts     Options (optional)
     * @param  {Function} callback Callback
     * @param  {Object}   auth     Authentication (optional)
     * @return {Object}            Image
     */
    pull(repoTag, opts, callback, auth) {
        var args = util.processArgs(opts, callback);

        var imageSrc = util.parseRepositoryTag(repoTag);
        args.opts.fromImage = imageSrc.repository;
        args.opts.tag = imageSrc.tag;

        var argsf = [args.opts, args.callback];
        if (auth) {
            argsf = [auth, args.opts, args.callback];
        }
        return this.createImage.apply(this, argsf);
    };

    /**
     * Like run command from Docker's CLI
     * @param  {String}   image         Image name to be used.
     * @param  {Array}   cmd           Command to run in array format.
     * @param  {Object}   streamo       Output stream
     * @param  {Object}   createOptions Container create options (optional)
     * @param  {Object}   startOptions  Container start options (optional)
     * @param  {Function} callback      Callback
     * @return {Object}                 EventEmitter
     */
    run(image, cmd, streamo, createOptions, startOptions, callback) {
        if (typeof arguments[arguments.length - 1] === 'function') {
            return this.runCallback(image, cmd, streamo, createOptions, startOptions, callback);
        } else {
            return this.runPromise(image, cmd, streamo, createOptions, startOptions);
        }
    };


    runCallback(image, cmd, streamo, createOptions, startOptions, callback) {
        if (!callback && typeof createOptions === 'function') {
            callback = createOptions;
            createOptions = {};
            startOptions = {};
        } else if (!callback && typeof startOptions === 'function') {
            callback = startOptions;
            startOptions = {};
        }

        var hub = new EventEmitter();

        function handler(err, container) {
            if (err) return callback(err, null, container);

            hub.emit('container', container);

            container.attach({
                stream: true,
                stdout: true,
                stderr: true
            }, function handler(err, stream) {
                if (err) return callback(err, null, container);

                hub.emit('stream', stream);

                if (streamo) {
                    if (streamo instanceof Array) {
                        stream.on('end', function () {
                            try {
                                streamo[0].end();
                            } catch (e) { }
                            try {
                                streamo[1].end();
                            } catch (e) { }
                        });
                        container.modem.demuxStream(stream, streamo[0], streamo[1]);
                    } else {
                        stream.setEncoding('utf8');
                        stream.pipe(streamo, {
                            end: true
                        });
                    }
                }

                container.start(startOptions, function (err, data) {
                    if (err) return callback(err, data, container);
                    hub.emit('start', container);

                    container.wait(function (err, data) {
                        hub.emit('data', data);
                        callback(err, data, container);
                    });
                });
            });
        }

        var optsc = {
            'Hostname': '',
            'User': '',
            'AttachStdin': false,
            'AttachStdout': true,
            'AttachStderr': true,
            'Tty': true,
            'OpenStdin': false,
            'StdinOnce': false,
            'Env': null,
            'Cmd': cmd,
            'Image': image,
            'Volumes': {},
            'VolumesFrom': []
        };

        extend(optsc, createOptions);

        this.createContainer(optsc, handler);

        return hub;
    };

    runPromise(image, cmd, streamo, createOptions, startOptions) {
        var self = this;

        createOptions = createOptions || {};
        startOptions = startOptions || {};

        var optsc = {
            'Hostname': '',
            'User': '',
            'AttachStdin': false,
            'AttachStdout': true,
            'AttachStderr': true,
            'Tty': true,
            'OpenStdin': false,
            'StdinOnce': false,
            'Env': null,
            'Cmd': cmd,
            'Image': image,
            'Volumes': {},
            'VolumesFrom': []
        };

        extend(optsc, createOptions);

        var containero;

        return new this.modem.Promise(function (resolve, reject) {
            self.createContainer(optsc).then(function (container) {
                containero = container;
                return container.attach({
                    stream: true,
                    stdout: true,
                    stderr: true
                });
            }).then(function (stream) {
                if (streamo) {
                    if (streamo instanceof Array) {
                        stream.on('end', function () {
                            try {
                                streamo[0].end();
                            } catch (e) { }
                            try {
                                streamo[1].end();
                            } catch (e) { }
                        });
                        containero.modem.demuxStream(stream, streamo[0], streamo[1]);
                    } else {
                        stream.setEncoding('utf8');
                        stream.pipe(streamo, {
                            end: true
                        });
                    }
                }
                return containero.start(startOptions);
            }).then(function (container) {
                return container.wait();
            }).then(function (data) {
                containero.output = data;
                resolve(containero);
            }).catch(function (err) {
                reject(err);
            });
        });
    };

    /**
     * Init swarm.
     *
     * @param {object} options
     * @param {function} callback
     */
    swarmInit(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/swarm/init',
            method: 'POST',
            statusCodes: {
                200: true,
                400: 'bad parameter',
                406: 'node is already part of a Swarm'
            },
            options: args.opts
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Join swarm.
     *
     * @param {object} options
     * @param {function} callback
     */
    swarmJoin(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/swarm/join',
            method: 'POST',
            statusCodes: {
                200: true,
                400: 'bad parameter',
                406: 'node is already part of a Swarm'
            },
            options: args.opts
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Leave swarm.
     *
     * @param {function} callback
     */
    swarmLeave(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/swarm/leave?',
            method: 'POST',
            statusCodes: {
                200: true,
                406: 'node is not part of a Swarm'
            },
            options: args.opts
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };

    /**
     * Update swarm.
     *
     * @param {function} callback
     */
    swarmUpdate(opts, callback) {
        var self = this;
        var args = util.processArgs(opts, callback);

        var optsf = {
            path: '/swarm/update?',
            method: 'POST',
            statusCodes: {
                200: true,
                400: 'bad parameter',
                406: 'node is already part of a Swarm'
            },
            options: args.opts
        };

        if (args.callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                args.callback(err, data);
            });
        }
    };


    /**
     * Inspect a Swarm.
     * Warning: This method is not documented in the API
     *
     * @param  {Function} callback Callback
     */
    swarmInspect(callback) {
        var self = this;
        var optsf = {
            path: '/swarm',
            method: 'GET',
            statusCodes: {
                200: true,
                406: 'This node is not a swarm manager',
                500: 'server error'
            }
        };

        if (callback === undefined) {
            return new this.modem.Promise(function (resolve, reject) {
                self.modem.dial(optsf, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        } else {
            this.modem.dial(optsf, function (err, data) {
                callback(err, data);
            });
        }
    };
}
