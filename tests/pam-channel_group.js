var p, pub, sub, sec, chan, chgr, uuid, moduleName = null;

window.rand = null;

// Ensure Tests are run in order (all tests, not just failed ones)
QUnit.config.reorder = false;

QUnit.module( "PAM - CHANNEL GROUP", {
    setupOnce: function () {

        moduleName = QUnit.config.current.module.name;

        console.info("*** START :: " + moduleName);

        // PAM enabled keys
        pub = "pub-c-7127d5de-115a-4a6f-8f8f-012b63f2129c";
        sub = "sub-c-e8bf7cd2-904b-11e4-9852-02ee2ddab7fe";
        sec = "sec-c-YTI0MTEyY2UtNmQyNy00YjdlLWJiYjUtYjdlMjhhN2FmYTg0";

        uuid = PUBNUB.uuid();

    },
    setup: function () {
        rand = PUBNUB.uuid();
        nspc = random_chars(6, 'nspc');
        chgr = random_chars(6, 'cgrp');
        chan = random_chars(6, 'chan');
        authkey = random_chars(6, 'auth');

    },
    teardown: function () {
        p = null;
        console.log("\tPUBNUB RESET TO NULL");
    },
    teardownOnce: function () {
        p = null;
        console.log("PUBNUB RESET TO NULL");
        console.info("*** DONE :: " + moduleName);
        console.log(" ");
    }
});

// ***************************************************************************** //

QUnit.test( "List Namespaces, 403-Error, No Manager Permission", function(assert) {

    console.log("TEST:: " + QUnit.config.current.testName);

    console.log("\tPUBNUB INIT");
    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec,
        uuid: uuid,
        auth_key: authkey
    });

    assert.ok(true, "Channel Group: " + chgr);
    assert.ok(true, "Channel:  " + chan);
    assert.ok(true, "AuthKey:  " + authkey);

    var done = assert.async();
    var timeout = null;
    var isSubscribed = false;
    var operation = "channel_group_list_namespaces()";

    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, operation + " Error Callback Executed");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, operation + " Callback Executed, No Error");
        }
        else if (resultCode === -2) {
            assert.ok(false, operation + " Error Callback Message !== 'Forbidden'");
        }
        else if (resultCode === -3) {
            assert.ok(false, "Timeout Reached, " + operation + " Error Callback Not Executed");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        if (isSubscribed) {
            timeout = setTimeout(function() {
                isSubscribed = false;
                finalize(-10);
            });

            p.unsubscribe({
                channel: chan,
                callback: function() {
                    clearTimeout(timeout);
                    assert.ok(true, "Unsubscribe from Channel");
                    done();
                }
            });
        }
        else {
            done();
        }

    };

    console.log("\tWAIT UP TO 5 SECONDS TO CHECK IF " + operation + " ERROR CALLBACK EXECUTED");
    timeout = setTimeout(function() {
        finalize(-3);
    }, 5000);

    p.channel_group_list_namespaces({
        callback: function(msg) {
            console.log("\tCHANNEL GROUP LIST NAMESPACES: ", msg);
            finalize(-2);
        },
        error: function(msg) {
            console.warn("\tLIST NAMESPACES ERROR: ", msg);
            if (msg.message !== "Forbidden") {
                finalize(-2);
            }
            else {
                finalize(1);
            }
        }
    });
});

QUnit.test( "List Groups, 403-Error, No Manager Permission", function(assert) {

    console.log("TEST:: " + QUnit.config.current.testName);

    console.log("\tPUBNUB INIT");
    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec,
        uuid: uuid,
        auth_key: authkey
    });

    assert.ok(true, "Channel Group: " + chgr);
    assert.ok(true, "Channel:  " + chan);
    assert.ok(true, "AuthKey:  " + authkey);

    var done = assert.async();
    var timeout = null;
    var isSubscribed = false;
    var operation = "channel_group_list_channels()";

    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, operation + " Error Callback Executed");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, operation + " Callback Executed, No Error");
        }
        else if (resultCode === -2) {
            assert.ok(false, operation + " Error Callback Message !== 'Forbidden'");
        }
        else if (resultCode === -3) {
            assert.ok(false, "Timeout Reached, " + operation + " Error Callback Not Executed");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        if (isSubscribed) {
            timeout = setTimeout(function() {
                isSubscribed = false;
                finalize(-10);
            });

            p.unsubscribe({
                channel: chan,
                callback: function() {
                    clearTimeout(timeout);
                    assert.ok(true, "Unsubscribe from Channel");
                    done();
                }
            });
        }
        else {
            done();
        }

    };

    console.log("\tWAIT UP TO 5 SECONDS TO CHECK IF " + operation + " ERROR CALLBACK EXECUTED");
    timeout = setTimeout(function() {
        finalize(-3);
    }, 5000);

    p.channel_group_list_groups({
        callback: function(msg) {
            console.log("\tCHANNEL GROUP LIST GROUPS: ", msg);
            finalize(-2);
        },
        error: function(msg) {
            console.warn("\tLIST GROUPS ERROR: ", msg)
            if (msg.message !== "Forbidden") {
                finalize(-2);
            }
            else {
                finalize(1);
            }
        }
    });
});

QUnit.test( "Add Channel to Group, 403-Error, No Manager Permission", function(assert) {

    console.log("TEST:: " + QUnit.config.current.testName);

    console.log("\tPUBNUB INIT");
    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec,
        uuid: uuid,
        auth_key: authkey
    });

    assert.ok(true, "Channel Group: " + chgr);
    assert.ok(true, "Channel:  " + chan);
    assert.ok(true, "AuthKey:  " + authkey);

    var done = assert.async();
    var timeout = null;
    var isSubscribed = false;
    var operation = "channel_group_add_channel()";


    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, operation + " Error Callback Executed");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, operation + " Callback Executed, No Error");
        }
        else if (resultCode === -2) {
            assert.ok(false, operation + " Error Callback Message !== 'Forbidden'");
        }
        else if (resultCode === -3) {
            assert.ok(false, "Timeout Reached, " + operation + " Error Callback Not Executed");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        if (isSubscribed) {
            timeout = setTimeout(function() {
                isSubscribed = false;
                finalize(-10);
            });

            p.unsubscribe({
                channel: chan,
                callback: function() {
                    clearTimeout(timeout);
                    assert.ok(true, "Unsubscribe from Channel");
                    done();
                }
            });
        }
        else {
            done();
        }

    };

    console.log("\tWAIT UP TO 5 SECONDS TO CHECK IF " + operation + " ERROR CALLBACK EXECUTED");
    timeout = setTimeout(function() {
        finalize(-3);
    }, 5000);

    p.channel_group_add_channel({
        channel_group: chgr,
        channel: chan,
        callback: function(msg) {
            console.log("\tCHANNEL GROUP ADD CHANNEL: ", msg);
            finalize(-2);
        },
        error: function(msg) {
            console.warn("\tADD CHANNEL ERROR: ", msg)
            if (msg.message !== "Forbidden") {
                finalize(-2);
            }
            else {
                finalize(1);
            }
        }
    });
});

QUnit.test( "Add Manager Permission [SUBKEY]", function(assert) {

    console.log("TEST:: " + QUnit.config.current.testName);

    console.log("\tPUBNUB INIT");
    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec,
        uuid: uuid,
        auth_key: authkey
    });

    assert.ok(true, "AuthKey:  " + authkey);

    var done = assert.async();
    var timeout = null;
    var isSubscribed = false;
    var operation = "grant()";


    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, operation + " Callback Executed, No Error");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, operation + " Error Callback Executed");
        }
        else if (resultCode === -2) {
            assert.ok(false, operation + " Error Callback Message !== 'Forbidden'");
        }
        else if (resultCode === -3) {
            assert.ok(false, "Timeout Reached, " + operation + " Error Callback Not Executed");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        if (isSubscribed) {
            timeout = setTimeout(function() {
                isSubscribed = false;
                finalize(-10);
            });

            p.unsubscribe({
                channel: chan,
                callback: function() {
                    clearTimeout(timeout);
                    assert.ok(true, "Unsubscribe from Channel");
                    done();
                }
            });
        }
        else {
            done();
        }

    };

    console.log("\tWAIT UP TO 5 SECONDS TO CHECK IF " + operation + " ERROR CALLBACK EXECUTED");
    timeout = setTimeout(function() {
        finalize(-3);
    }, 5000);

    p.grant({
        manage: true,
        ttl: 3,
        callback: function(msg) {
            console.log("\tADD GLOBAL MANAGER PERMISSION: ", msg);
            assert.contains(msg, { level: "subkey" }, "Subkey Level Permissions");
            assert.contains(msg, { ttl: 3 }, "TTL is 3 Minutes");
            assert.contains(msg, { m: 1 }, "Manager Permissions Granted");
            finalize(1);
        },
        error: function(msg) {
            console.warn("\tADD GLOBAL MANAGER PERMISSION ERROR: ", msg)
            if (msg.message !== "Forbidden") {
                finalize(-1);
            }
            else {
                finalize(-2);
            }
        }
    });
});

QUnit.test( "Add Manager Permission [NAMESPACE]", function(assert) {

    console.log("TEST:: " + QUnit.config.current.testName);

    console.log("\tPUBNUB INIT");
    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec,
        uuid: uuid,
        auth_key: authkey
    });

    assert.ok(true, "Namespace: " + nspc);
    assert.ok(true, "AuthKey:  " + authkey);

    var done = assert.async();
    var timeout = null;
    var isSubscribed = false;
    var operation = "grant()";


    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, operation + " Callback Executed, No Error");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, operation + " Error Callback Executed");
        }
        else if (resultCode === -2) {
            assert.ok(false, operation + " Error Callback Message !== 'Forbidden'");
        }
        else if (resultCode === -3) {
            assert.ok(false, "Timeout Reached, " + operation + " Error Callback Not Executed");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        if (isSubscribed) {
            timeout = setTimeout(function() {
                isSubscribed = false;
                finalize(-10);
            });

            p.unsubscribe({
                channel: chan,
                callback: function() {
                    clearTimeout(timeout);
                    assert.ok(true, "Unsubscribe from Channel");
                    done();
                }
            });
        }
        else {
            done();
        }

    };

    console.log("\tWAIT UP TO 5 SECONDS TO CHECK IF " + operation + " ERROR CALLBACK EXECUTED");
    timeout = setTimeout(function() {
        finalize(-3);
    }, 5000);

    p.grant({
        namespace: nspc,
        manage: true,
        ttl: 3,
        callback: function(msg) {
            console.log("\tADD NAMESPACE MANAGER PERMISSION: ", msg);
            assert.contains(msg, { level: "namespace" }, "Namespace Level Permissions");
            assert.contains(msg, { ttl: 3 }, "TTL is 3 Minutes");
            assert.contains(msg, { m: 1 }, "Manager Permissions Granted");
            finalize(1);
        },
        error: function(msg) {
            console.warn("\tADD NAMESPACE MANAGER PERMISSION ERROR: ", msg)
            if (msg.message !== "Forbidden") {
                finalize(-1);
            }
            else {
                finalize(-2);
            }
        }
    });
});

QUnit.test( "Add Manager Permission [NAMESPACE + CHANNEL GROUP]", function(assert) {

    console.log("TEST:: " + QUnit.config.current.testName);

    console.log("\tPUBNUB INIT");
    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec,
        uuid: uuid,
        auth_key: authkey
    });

    assert.ok(true, "Namespace: " + nspc);
    assert.ok(true, "Channel Group: " + chgr);
    assert.ok(true, "AuthKey:  " + authkey);

    var done = assert.async();
    var timeout = null;
    var isSubscribed = false;
    var operation = "grant()";


    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, operation + " Callback Executed, No Error");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, operation + " Error Callback Executed");
        }
        else if (resultCode === -2) {
            assert.ok(false, operation + " Error Callback Message !== 'Forbidden'");
        }
        else if (resultCode === -3) {
            assert.ok(false, "Timeout Reached, " + operation + " Error Callback Not Executed");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        if (isSubscribed) {
            timeout = setTimeout(function() {
                isSubscribed = false;
                finalize(-10);
            });

            p.unsubscribe({
                channel: chan,
                callback: function() {
                    clearTimeout(timeout);
                    assert.ok(true, "Unsubscribe from Channel");
                    done();
                }
            });
        }
        else {
            done();
        }

    };

    console.log("\tWAIT UP TO 5 SECONDS TO CHECK IF " + operation + " ERROR CALLBACK EXECUTED");
    timeout = setTimeout(function() {
        finalize(-3);
    }, 5000);

    p.grant({
        namespace: nspc,
        channel_group: chgr,
        manage: true,
        ttl: 3,
        callback: function(msg) {
            console.log("\tADD NAMESPACE + CHANNEL GROUP MANAGER PERMISSION: ", msg);
            assert.contains(msg, { level: "channel-group" }, "Channel Group Level Permissions");
            assert.contains(msg, { ttl: 3 }, "TTL is 3 Minutes");
            assert.contains(msg['channel-groups'][chgr], { m: 1 }, "Manager Permissions Granted");
            finalize(1);
        },
        error: function(msg) {
            console.warn("\tADD NAMESPACE + CHANNEL GROUP MANAGER PERMISSION ERROR: ", msg)
            if (msg.message !== "Forbidden") {
                finalize(-1);
            }
            else {
                finalize(-2);
            }
        }
    });
});

QUnit.test( "Add Manager Permission [CHANNEL GROUP]", function(assert) {

    console.log("TEST:: " + QUnit.config.current.testName);

    console.log("\tPUBNUB INIT");
    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec,
        uuid: uuid,
        auth_key: authkey
    });

    assert.ok(true, "Channel Group: " + chgr);
    assert.ok(true, "AuthKey:  " + authkey);

    var done = assert.async();
    var timeout = null;
    var isSubscribed = false;
    var operation = "grant()";


    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, operation + " Callback Executed, No Error");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, operation + " Error Callback Executed");
        }
        else if (resultCode === -2) {
            assert.ok(false, operation + " Error Callback Message !== 'Forbidden'");
        }
        else if (resultCode === -3) {
            assert.ok(false, "Timeout Reached, " + operation + " Error Callback Not Executed");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        if (isSubscribed) {
            timeout = setTimeout(function() {
                isSubscribed = false;
                finalize(-10);
            });

            p.unsubscribe({
                channel: chan,
                callback: function() {
                    clearTimeout(timeout);
                    assert.ok(true, "Unsubscribe from Channel");
                    done();
                }
            });
        }
        else {
            done();
        }

    };

    console.log("\tWAIT UP TO 5 SECONDS TO CHECK IF " + operation + " ERROR CALLBACK EXECUTED");
    timeout = setTimeout(function() {
        finalize(-3);
    }, 5000);

    p.grant({
        channel_group: chgr,
        manage: true,
        ttl: 3,
        callback: function(msg) {
            console.log("\tADD CHANNEL GROUP MANAGER PERMISSION: ", msg);
            assert.contains(msg, { level: "channel-group" }, "Channel Group Level Permissions");
            assert.contains(msg, { ttl: 3 }, "TTL is 3 Minutes");
            assert.contains(msg['channel-groups'][chgr], { m: 1 }, "Manager Permissions Granted");
            finalize(1);
        },
        error: function(msg) {
            console.warn("\tADD CHANNEL GROUP MANAGER PERMISSION ERROR: ", msg)
            if (msg.message !== "Forbidden") {
                finalize(-1);
            }
            else {
                finalize(-2);
            }
        }
    });
});

QUnit.test( "Add Namespace, Channel Group, and Channel", function(assert) {

    console.log("TEST:: " + QUnit.config.current.testName);

    console.log("\tPUBNUB INIT");
    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec,
        uuid: uuid,
        auth_key: authkey
    });

    assert.ok(true, "Namespace: " + nspc);
    assert.ok(true, "Channel Group: " + chgr);
    assert.ok(true, "Channel: " + chan);
    assert.ok(true, "AuthKey:  " + authkey);

    var done = assert.async();
    var timeout = null;
    var isSubscribed = false;
    var operation = "grant()";


    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, operation + " Callback Executed, No Error");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, operation + " Error Callback Executed");
        }
        else if (resultCode === -2) {
            assert.ok(false, operation + " Error Callback Message !== 'Forbidden'");
        }
        else if (resultCode === -3) {
            assert.ok(false, "Timeout Reached, " + operation + " Error Callback Not Executed");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        if (isSubscribed) {
            timeout = setTimeout(function() {
                isSubscribed = false;
                finalize(-10);
            });

            p.unsubscribe({
                channel: chan,
                callback: function() {
                    clearTimeout(timeout);
                    assert.ok(true, "Unsubscribe from Channel");
                    done();
                }
            });
        }
        else {
            done();
        }

    };

    console.log("\tWAIT UP TO 5 SECONDS TO CHECK IF " + operation + " ERROR CALLBACK EXECUTED");
    timeout = setTimeout(function() {
        finalize(-3);
    }, 5000);

    var subscribe = function() {
        // To Stop Retries
        isSubscribed = true;
        p.subscribe({
            namespace: nspc,
            message: function(msg) {
                console.log("\tMESSAGE: ", msg);
            },
            connect: function(msg) {
                console.log("\tCONNECTED: ", msg);
                finalize(-3);
            },
            error: function(msg) {
                console.log("\tSUBSCRIBE ERROR: ", msg);
                finalize(1);
            }
        });
    };

    var add_namespace = function() {

    };

    var add_channel_group = function() {

    };

    var add_channel = function() {

    };

    var list_namespaces = function() {

    };

    var list_channel_groups = function() {

    };

    var list_channels = function() {

    };


    p.grant({
        manage: true,
        ttl: 3,
        callback: function(msg) {
            console.log("\tADD GLOBAL MANAGER PERMISSION: ", msg);
            assert.contains(msg, { level: "channel-group" }, "Global Level Permissions");
            assert.contains(msg, { ttl: 3 }, "TTL is 3 Minutes");
            assert.contains(msg['channel-groups'][chgr], { m: 1 }, "Manager Permissions Granted");
            subscribe();
        },
        error: function(msg) {
            console.warn("\tADD GLOBAL MANAGER PERMISSION ERROR: ", msg)
            if (msg.message !== "Forbidden") {
                finalize(-1);
            }
            else {
                finalize(-2);
            }
        }
    });
});
