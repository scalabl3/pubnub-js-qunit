var p, pub, sub, sec, chan, chgr, uuid, moduleName = null;

window.rand = null;

// Ensure Tests are run in order (all tests, not just failed ones)
QUnit.config.reorder = false;

QUnit.module( "CHANNEL GROUP", {
    setupOnce: function () {

        moduleName = QUnit.config.current.module.name;

        console.info("*** START :: " + moduleName);

        pub = "pub-c-ef9e786b-f172-4946-9b8c-9a2c24c2d25b";
        sub = "sub-c-564d94c2-895e-11e4-a06c-02ee2ddab7fe";
        sec = "sec-c-Yjc5MTg5Y2MtODRmNi00OTc5LTlmZDItNWJkMjFkYmMyNDRl";

        chgr = PUBNUB.uuid();
        chan = PUBNUB.uuid();
        uuid = PUBNUB.uuid();

        console.log("PUBNUB INIT");

        p = PUBNUB.init({
            publish_key: pub,
            subscribe_key: sub,
            secret_key: sec,
            uuid: uuid
        });

        console.info("Channel Group: ", chgr);
        console.info("Channel: ", chan);
        console.info("UUID: ", uuid);
    },
    setup: function () {
        rand = PUBNUB.uuid();
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

//QUnit.test("TEST: List Channel Groups", function(assert) {
//
//    console.log("TEST: List Channel Groups");
//
//    var done = assert.async();
//
//    var list_channels_in_group = function(g) {
//
//        p.channel_group_list_channels({
//            channel_group: g,
//            callback: function(msg) {
//                console.log("\tCHANNELS: ", msg.channels, " IN GROUP: ", g, msg);
//            }
//        });
//    };
//
//    p.channel_group_list_groups({
//        callback: function(msg) {
//            console.log("\tCHANNEL GROUPS: ", msg);
//
//            if (msg.groups.length == 0) {
//                assert.ok(1 == "1", "Channel Groups Empty!")
//                done();
//            }
//            else {
//                _.after(msg.groups.length, function() {
//                    assert.ok(1 == "1", "Channel Groups and Channels Listed!")
//                    done();
//                });
//
//                _.forEach(msg.groups, function(g) {
//                    list_channels_in_group(g);
//                });
//            }
//        }
//    });
//
//});

QUnit.test("TEST: Create Channel Group", function(assert) {

    console.log(QUnit.config.current.testName);

    var done = assert.async();

    var check_channel_membership = function() {
        p.channel_group_list_channels({
            channel_group: chgr,
            callback: function(msg) {
                console.log("\tCHANNEL GROUP CHANNEL LIST: ", msg);
                assert.ok(1 == "1", "Passed!");
                done();
            }
        })
    };

    p.channel_group_add_channel({
        callback: function(msg) {
            console.log("\tCHANNEL GROUP ADD CHANNEL: ", msg);
            check_channel_membership();
        },
        error: function(msg) {
            console.log("\tERROR CHANNEL GROUP ADD CHANNEL: ", msg);
            assert.ok(0 == "1", "Failed!");
            done();
        },
        channel: chan,
        channel_group: chgr
    });
});

QUnit.test( "TEST: Connect Callback :: no presence callback defined", function( assert ) {

    console.log(QUnit.config.current.testName);

    var done = assert.async();

    p.subscribe({
        channel_group: chgr,
        message: function(msg) { },
        connect: function() {
            assert.ok(1 == "1", "Connect Callback called!");

            p.unsubscribe({
                channel_group: chgr,
                callback: function(msg) {
                    console.log("UNSUBSCRIBE: ", chgr, msg);
                }
            });

            done();
        }
    });

});

QUnit.test( "TEST: Connect Callback :: presence callback defined", function( assert ) {

    console.log(QUnit.config.current.testName);

    var done = assert.async();

    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub
    });

    p.subscribe({
        channel_group: chgr,
        message: function(msg) { },
        presence: function(msg) { },
        connect: function() {
            assert.ok(1 == "1", "Connect Callback called!");

            p.unsubscribe({
                channel_group: chgr,
                callback: function(msg) {
                    console.log("UNSUBSCRIBE: ", chgr, msg);
                }
            });

            done();
        }
    });

});

QUnit.test( "TEST: Message Callback :: no presence callback defined", function( assert ) {

    console.log(QUnit.config.current.testName);

    var done = assert.async();

    var all_clear = true;

    var check_messages = function(msg) {

        if (msg.rand === window.rand) {
            // ignore, this is all good
        }
        else if ('action' in msg) {
            // Oops we received something we shouldn't have
            all_clear = false;
        }
    };

    var finalize = function() {
        if (all_clear) {
            assert.ok(1 == "1", "Presence Message Not Detected in Message-Callback");
        }
        else {
            assert.ok(0 == "1", "Presence Message Detected in Message-Callback");
        }

        p.unsubscribe({
            channel_group: chgr,
            callback: function(msg) {
                console.log("UNSUBSCRIBE: ", chgr, msg);
            }
        });

        done();
    };

    window.rand = PUBNUB.uuid();

    setTimeout(function() {
        var message = {
            chan: chan,
            test: "TEST: Message Callback :: no presence callback defined",
            rand: window.rand
        };

        console.log("\tPUBLISH: ", message);
        p.publish({
            channel: chan,
            message: message
        });

        console.log("\tWAIT 5 SECONDS TO CHECK IF PRESENCE MESSAGES ARE BEING RECEIVED IN MESSAGE CALLBACK");
        setTimeout(function(){
            finalize();
        }, 5000);

    }, 5000);

    p.subscribe({
        channel_group: chgr,
        message: function(msg) {
            console.log("\tMESSAGE: ", msg);
            check_messages(msg);
        },
        connect: function() {
            console.log("\tCONNECTED: ", chan);
        }
    });

});

QUnit.test( "TEST: Message Callback :: presence callback defined", function( assert ) {

    console.log(QUnit.config.current.testName);

    assert.expect( 1 );

    var done = assert.async();

    var all_clear = true;

    var check_messages = function(msg) {
        if (msg.rand === window.rand) {
            // ignore, this is all good
        }
        else if ('action' in msg) {
            // Oops we received something we shouldn't have
            all_clear = false;
        }
    };

    var finalize = function() {
        if (all_clear) {
            assert.ok(1 == "1", "Presence Message Not Detected in Message-Callback");
        }
        else {
            assert.ok(0 == "1", "Presence Message Detected in Message-Callback");
        }

        p.unsubscribe({
            channel_group: chgr,
            callback: function(msg) {
                console.log("UNSUBSCRIBE: ", chgr, msg);
            }
        });

        done();
    };

    window.rand = PUBNUB.uuid();

    setTimeout(function() {
        var message = {
            chan: chan,
            test: "TEST: Message Callback :: presence callback defined",
            rand: window.rand
        };

        console.log("\tPUBLISH: ", message);
        p.publish({
            channel: chan,
            message: message
        });

        console.log("\tWAIT 5 SECONDS TO CHECK IF PRESENCE MESSAGES ARE BEING RECEIVED IN MESSAGE CALLBACK");
        setTimeout(function(){
            finalize();
        }, 5000);

    }, 5000);

    p.subscribe({
        channel_group: chgr,
        message: function(msg) {
            console.log("\tMESSAGE: ", msg);
            check_messages(msg);
        },
        presence: function(msg) {
            console.log("\tPRESENCE: ", msg);
        },
        connect: function() {
            console.log("\tCONNECTED: ", chan);
        }
    });

});

QUnit.test( "TEST: Unsubscribe Callback :: no presence callback defined", function( assert ) {

    console.log(QUnit.config.current.testName);

    assert.expect( 1 );

    var done1 = assert.async();
    var check_completed = false;

    var check_success = function(result, msg) {
        if (!check_completed) {
            check_completed = true;
            assert.ok(true == result, msg);
            done1();
        }
        else {
            console.error("\tUnsubscribe callback called after more than 5 seconds.")
        }
    };

    p.subscribe({
        channel_group: chgr,
        message: function(msg) {
            console.log("\tMESSAGE: ", msg);
        },
        connect: function() {
            console.log("\tCONNECTED: ", chan);
        }
    });

    console.log("\tWAIT 5 SECONDS AND UNSUBSCRIBE, 5 MORE SECONDS FOR UNSUBSCRIBE CALLBACK");

    var timeout = setTimeout(function() {
        check_success(false, "\tUnsubscribe callback not called within 5 seconds")
    }, 10000);

    setTimeout(function(){
        p.unsubscribe({
            channel_group: chgr,
            callback: function() {
                console.log("\tUNSUBSCRIBE: ", chgr);
                clearTimeout(timeout);
                check_success(true, "Unsubscribe callback called")
            }
        });
    }, 5000);

});

QUnit.test( "TEST: Unsubscribe Callback :: presence callback defined", function( assert ) {

    console.log(QUnit.config.current.testName);

    assert.expect( 1 );

    var done1 = assert.async();
    var check_completed = false;

    var check_success = function(result, msg) {
        if (!check_completed) {
            check_completed = true;
            assert.ok(true == result, msg);
            done1();
        }
        else {
            console.error("\tUnsubscribe callback called after more than 5 seconds.")
        }
    };

    p.subscribe({
        channel_group: chgr,
        message: function(msg) {
            console.log("\tMESSAGE: ", msg);
        },
        presence: function(msg) {
            console.log("\tPRESENCE: ", msg);
        },
        connect: function() {
            console.log("\tCONNECTED: ", chan);
        }
    });

    console.log("\tWAIT 5 SECONDS AND UNSUBSCRIBE, 5 MORE SECONDS FOR UNSUBSCRIBE CALLBACK");

    var timeout = setTimeout(function() {
        check_success(false, "\tUnsubscribe callback not called within 5 seconds")
    }, 10000);

    setTimeout(function(){
        p.unsubscribe({
            channel_group: chgr,
            callback: function() {
                console.log("\tUNSUBSCRIBE: ", chgr);
                clearTimeout(timeout);
                check_success(true, "Unsubscribe callback called")
            }
        });
    }, 5000);

});


QUnit.test("TEST: Remove Channel Group", function(assert) {

    console.log(QUnit.config.current.testName);

    var done = assert.async();

    var done_remove = function() {
        setTimeout(function(){
            p.channel_group_list_groups({
                callback: function(msg) {
                    console.log("\tCHANNEL GROUPS: ", msg);
                    assert.ok(1 == "1", "Channel Remove from Group, Group Empty");
                    done();
                }
            });
        }, 5000);
    };

    p.channel_group_remove_channel({
        callback: function(msg) {
            console.log("\tCHANNEL GROUP REMOVE CHANNEL: ", msg);
            done_remove();
        },
        error: function(msg) {
            console.log("\tERROR CHANNEL GROUP REMOVE CHANNEL: ", msg);
            done_remove();
        },
        channel: chan,
        channel_group: chgr
    });
});

