var Docker = require('../lib/docker');

var docker = new Docker({socketPath: '/var/run/docker.sock'});

/**
 * Get env list from running container
 * @param container
 */
function runExec(container) {
    options = {
        "AttachStdout": true,
        "AttachStderr": true,
        "Tty": false,
        Cmd: ["env"]
    };
    container.exec(options, function (err, data) {
        container.execstart(data.Id, function (err, stream) {
            if (err != null) {
                callback(err, null);
                return;
            }

            stream.setEncoding('utf8');
            stream.on('data', function (chunk) {
                console.log(chunk);
            });
            stream.on('end', function () {
                console.log('--Done--');
            });
        });
    })
}

docker.createContainer({Image: 'ubuntu', Cmd: ['/bin/ls', '/stuff'], "Volumes": {"/stuff": {}}}, function (err, container) {
    container.attach({stream: true, stdout: true, stderr: true, tty: true}, function (err, stream) {
        stream.pipe(process.stdout);

        container.start({"Binds": ["/home/vagrant:/stuff"]}, function (err, data) {
            runExec(container);
        });
    });
});
