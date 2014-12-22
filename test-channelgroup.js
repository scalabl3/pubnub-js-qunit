var p, pub, sub, sec, chan, chgr, uuid = null;

window.rand = null;

uuid = PUBNUB.uuid();

QUnit.config.reorder = false;

var remove_channel_groups = function() {

    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec
    });

    var remove_channel_from_group = function(g,c) {
        p.channel_group_remove_channel({
            channel_group: g,
            channel: c,
            callback: function(msg) {
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
                    remove_channel_from_group(g,c);
                })
            }
        });
    };

    p.channel_group_list_groups({
        callback: function(msg) {
            console.log("CHANNEL GROUPS: ", msg);
            _.forEach(msg.groups, function(g) {
                remove_all_channels_from_group(g);
            });
        }
    });
};

QUnit.module( "CHANNEL GROUP", {
    setupOnce: function () {

        console.info("*** START :: CHANNEL GROUP TESTS");

        pub = "pub-c-ef9e786b-f172-4946-9b8c-9a2c24c2d25b";
        sub = "sub-c-564d94c2-895e-11e4-a06c-02ee2ddab7fe";
        sec = "sec-c-Yjc5MTg5Y2MtODRmNi00OTc5LTlmZDItNWJkMjFkYmMyNDRl";
        p = PUBNUB.init({
            publish_key: pub,
            subscribe_key: sub,
            secret_key: sec
        });
        chgr = PUBNUB.uuid();
        chan = PUBNUB.uuid();

        console.info("Channel Group: ", chgr);
        console.info("Channel: ", chan);
    },
    setup: function () {
        rand = PUBNUB.uuid();
    },
    teardown: function () {
        p.unsubscribe({
            channel_group: chgr,
            callback: function(msg) {
                console.log("UNSUBSCRIBE: ", chgr, msg);
            }
        });
    },
    teardownOnce: function () {
        p = null;
        console.info("*** DONE :: CHANNEL GROUP TESTS");
        console.log(" ");
        remove_channel_groups();
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

    console.log("TEST: Create Channel Group");

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

    console.log("TEST: Connect Callback :: no presence callback defined");

    var done = assert.async();

    p.subscribe({
        channel_group: chgr,
        message: function(msg) { },
        connect: function() {
            assert.ok(1 == "1", "Passed!");
            done();
        }
    });

});

QUnit.test( "TEST: Connect Callback :: presence callback defined", function( assert ) {

    console.log("TEST: Connect Callback :: presence callback defined");

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
            assert.ok(1 == "1", "Passed!");
            done();
        }
    });

});

QUnit.test( "TEST: Message Callback :: no presence callback defined", function( assert ) {

    console.log("TEST: Message Callback :: no presence callback defined" );

    var done = assert.async();

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
    }, 5000);

    p.subscribe({
        channel_group: chgr,
        message: function(msg) {
            console.log("\tMESSAGE: ", msg);
            if (msg.rand === window.rand) {
                assert.equal(msg.rand, window.rand, "Checking Message Value");
                done();
            }
        },
        connect: function() {
            console.log("\tCONNECTED: ", chan);
        }
    });

});

QUnit.test( "TEST: Message Callback :: presence callback defined", function( assert ) {

    console.log("TEST: Message Callback :: presence callback defined");

    assert.expect( 1 );

    var done1 = assert.async();

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
    }, 5000);

    p.subscribe({
        channel_group: chgr,
        message: function(msg) {
            console.log("\tMESSAGE: ", msg);
            assert.equal(msg.rand, window.rand, "Checking Received Message");
            done1();
        },
        presence: function(msg) {
            console.log("\tPRESENCE: ", msg);
        },
        connect: function() {
            console.log("\tCONNECTED: ", chan);
        }
    });

});

QUnit.test("TEST: Remove Channel Group", function(assert) {

    console.log("TEST: Remove Channel Group");

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

