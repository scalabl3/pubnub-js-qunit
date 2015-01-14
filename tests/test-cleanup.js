var p, pub, sub, sec, chan, chgr, uuid, moduleName = null;

// Ensure Tests are run in order (all tests, not just failed ones)
QUnit.config.reorder = false;


QUnit.module( "CHANNEL GROUP CLEANUP", {
    setupOnce: function () {

        moduleName = QUnit.config.current.module.name;

        console.info("*** START :: " + moduleName);

        uuid = PUBNUB.uuid();

        console.log("PUBNUB INIT");

        console.info("UUID: ", uuid);
    },
    setup: function () {

    },
    teardown: function () {

    },
    teardownOnce: function () {
        console.log("PUBNUB RESET TO NULL");
        p = null;
        console.info("*** DONE :: " + moduleName);
        console.log(" ");
    }
});

QUnit.test( "Delete all Channel Groups (KEY1)", function(assert) {

    p = null;

    console.log("TEST:: " + QUnit.config.current.testName);

    pub = "pub-c-ef9e786b-f172-4946-9b8c-9a2c24c2d25b";
    sub = "sub-c-564d94c2-895e-11e4-a06c-02ee2ddab7fe";
    sec = "sec-c-Yjc5MTg5Y2MtODRmNi00OTc5LTlmZDItNWJkMjFkYmMyNDRl";

    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec,
        uuid: uuid
    });

    var done = assert.async();

    var remove_channel_from_group = function(g,c) {
        p.channel_group_remove_channel({
            channel_group: g,
            channel: c,
            callback: function(msg) {
                assert.ok(true, "REMOVE: Channel: " + c + " in Group: ", g);
                console.log("REMOVE CHANNEL: ", c, " FROM GROUP: ", g, msg)
            }
        });
    };

    var remove_all_channels_from_group = function(g) {

        p.channel_group_list_channels({
            channel_group: g,
            callback: function(msg) {
                console.log("CHANNELS: ", msg.channels, " IN GROUP: ", g, msg);
                _.forEach(msg.channels, function(c) {
                    assert.ok(true, "LIST: Channel: " + c + " in Group: ", g);
                    remove_channel_from_group(g,c);
                })
            }
        });
    };

    p.channel_group_list_groups({
        callback: function(msg) {
            console.log("CHANNEL GROUPS: ", msg);

            _.forEach(msg.groups, function(g) {
                assert.ok(true, "LIST: Channel Group: ", g);
                remove_all_channels_from_group(g);
            });
        }
    });

    setTimeout(function(){
        console.log("REMOVAL COMPLETED.");
        done();
    }, 10000);

});

QUnit.test( "PAM - Delete all Namespaces and Channel Groups (KEY2)", function(assert) {

    p = null;

    console.log("TEST:: " + QUnit.config.current.testName);

    // PAM enabled keys
    pub = "pub-c-7127d5de-115a-4a6f-8f8f-012b63f2129c";
    sub = "sub-c-e8bf7cd2-904b-11e4-9852-02ee2ddab7fe";
    sec = "sec-c-YTI0MTEyY2UtNmQyNy00YjdlLWJiYjUtYjdlMjhhN2FmYTg0";
    authkey = random_chars(6, 'auth');

    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec,
        uuid: uuid,
        auth_key: authkey
    });

    var done = assert.async();

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

    var remove_channel_from_group = function(g,c) {
        p.channel_group_remove_channel({
            channel_group: g,
            channel: c,
            callback: function(msg) {
                assert.ok(true, "\tREMOVE: Channel: " + c + " in Group: ", g);
                console.log("\tREMOVE CHANNEL: ", c, " FROM GROUP: ", g, msg)
            }
        });
    };

    var remove_all_channels_from_group = function(g) {

        p.channel_group_list_channels({
            channel_group: g,
            callback: function(msg) {
                console.log("\tCHANNELS: ", msg.channels, " IN GROUP: ", g, msg);
                _.forEach(msg.channels, function(c) {
                    assert.ok(true, "LIST: Channel: " + c + " in Group: ", g);
                    remove_channel_from_group(g,c);
                })
            }
        });
    };

    var remove_namespaces = function() {

    };

    var list_groups = function(namespace) {
        namespace = _.isUndefined(namespace) ? false : namespace;
        console.log("\tLIST GROUPS [NAMESPACE = " + namespace + "]");
        if (namespace) {
            p.channel_group_list_groups({
                namespace: namespace,
                callback: function(msg) {
                    console.log("\tCHANNEL GROUPS: ", msg);

                    _.forEach(msg.groups, function(g) {
                        assert.ok(true, "LIST: Channel Group: ", g);
                        remove_all_channels_from_group(g);
                    });
                },
                error: function(msg) {
                    console.log("\tLIST GROUPS [NAMESPACE = " + namespace + "] ERROR: ", msg);
                    assert.ok(false, "List Groups [NAMESPACE = " + namespace + "] Failed - " + msg.message);
                }
            });
        }
        else {
            p.channel_group_list_groups({
                callback: function(msg) {
                    console.log("\tCHANNEL GROUPS: ", msg);

                    _.forEach(msg.groups, function(g) {
                        assert.ok(true, "LIST: Channel Group: ", g);
                        remove_all_channels_from_group(g);
                    });
                },
                error: function(msg) {
                    console.log("\tLIST GROUPS ERROR: ", msg);
                    assert.ok(false, "List Groups Failed - " + msg.message);
                }
            });
        }
    };

    var list_namespaces = function() {
        console.log("\tLIST NAMESPACES");
        p.channel_group_list_namespaces({
            callback: function(msg) {
                console.log("\tNAMESPACES: ", msg);

                _.forEach(msg.namespaces, function(n) {
                    assert.ok(true, "LIST: Namespace: ", n);
                    list_groups(n);
                });
            },
            error: function(msg) {
                console.log("\tNAMESPACES ERROR: ", msg);
                assert.ok(false, "List Namespaces Failed - " + msg.message);
                list_groups();
            }
        });
    };

    assert.ok(true, "Grant Global Manage Permissions");
    p.grant({
        manage: true,
        read: true,
        write: true,
        ttl: 3,
        callback: function(msg) {
            console.log("\tGRANT GLOBAL PERMISSIONS", msg);
            assert.contains(msg, { m: 1 }, "Manager Permissions Granted");
            assert.contains(msg, { level: "subkey" }, "Has Subkey Level Permissions");
            assert.contains(msg, { ttl: 3 }, "TTL is 3 Minutes");
            list_namespaces();
        },
        error: function(msg) {
            console.log("\tGRANT GLOBAL ERROR: ", msg);
            assert.ok(true, "Global Manage Permissions Failed - " + msg.message);
        }
    });

    setTimeout(function(){
        console.log("REMOVAL COMPLETED.");
        done();
    }, 10000);

});


