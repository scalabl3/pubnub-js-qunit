var p, pub, sub, sec, chan, chanlist, uuid, moduleName = null;


// Ensure Tests are run in order (all tests, not just failed ones)
QUnit.config.reorder = false;

QUnit.module( "CHANNEL LIST", {
    setupOnce: function () {

        moduleName = QUnit.config.current.module.name;

        console.info("*** START :: " + moduleName);

        pub = "pub-c-ef9e786b-f172-4946-9b8c-9a2c24c2d25b";
        sub = "sub-c-564d94c2-895e-11e4-a06c-02ee2ddab7fe";
        sec = "sec-c-Yjc5MTg5Y2MtODRmNi00OTc5LTlmZDItNWJkMjFkYmMyNDRl";

        p = null;
        uuid = PUBNUB.uuid();

        p = PUBNUB.init({
            publish_key: pub,
            subscribe_key: sub,
            secret_key: sec,
            uuid: uuid
        });
    },
    setup: function () {
        chanlist = [];
        _.times(10, function() {
           chanlist.push(random_chars(5, 'cl'));
        });
        chanlist = chanlist.join(',');
        uuid = PUBNUB.uuid();
    },
    teardown: function () {

    },
    teardownOnce: function () {

        console.info("*** DONE :: " + moduleName);
        console.log(" ");

        p = null;
    }
});

// ***************************************************************************** //

QUnit.test( "Connect Callback :: no presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();

    assert.ok(true, "Subscribe to Channel List: " + chanlist);
    p.subscribe({
        channel: chanlist,
        message: function(msg) { },
        connect: function(msg) {
            assert.ok(true, "Connect to PubNub on Channels: " + chanlist);
            console.log("SUBSCRIBE: ", msg);
            p.unsubscribe({
                channel: chanlist,
                callback: function() {
                    assert.ok(true, "Unsubscribed to Channels: " + chanlist);
                    console.log("\tUNSUBSCRIBE: ", chanlist);
                    done();
                }
            });
        }
    });

});

QUnit.test( "Connect Callback :: presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();

    p.subscribe({
        channel: chanlist,
        message: function(msg) { },
        presence: function(msg) { },
        connect: function() {
            assert.ok(true, "Connect to PubNub on Channel " + chan);
            p.unsubscribe({
                channel: chanlist,
                callback: function() {
                    assert.ok(true, "Unsubscribed to Channel " + chan);
                    console.log("\tUNSUBSCRIBE: ", chan);
                    done();
                }
            });
        }
    });

});

QUnit.test( "Message Callback :: no presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

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
            channel: chanlist,
            callback: function() {
                assert.ok(true, "Unsubscribed to Channel " + chan);
                console.log("\tUNSUBSCRIBE: ", chan);
                done();
            }
        });
    };

    window.rand = PUBNUB.uuid();

    setTimeout(function() {

        var msg = {
            chan: chanlist[0],
                test: "TEST: Message Callback",
                rand: window.rand
        };

        p.publish({
            channel: chanlist[0],
            message: msg
        });

        console.log("\tWAIT 5 SECONDS TO CHECK IF PRESENCE MESSAGES ARE BEING RECEIVED IN MESSAGE CALLBACK");
        setTimeout(function(){
            finalize();
        }, 5000);

    }, 5000);

    assert.ok(true, "Subscribe to Channel " + chan);
    p.subscribe({
        channel: chanlist,
        message: function(msg, env, ch) {
            console.log("\tMESSAGE: ", msg, env, ch);
            assert.ok(true, "Received Message on " + ch);
            check_messages(msg, ch);
        },
        presence: function(msg, env, ch) {
            assert.ok(true, "Received Presence on " + ch);
            console.log("\tPRESENCE: ", msg, env, ch);
        },
        connect: function() {
            assert.ok(true, "Connected to PubNub on Channel " + chan);
            console.log("\tCONNECTED: ", chan);
        }
    });

});

QUnit.test( "Message Callback :: presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

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
            channel: chanlist,
            callback: function() {
                assert.ok(true, "Unsubscribed to Channel " + chanlist);
                console.log("\tUNSUBSCRIBE: ", chanlist);
                done();
            }
        });
    };

    window.rand = PUBNUB.uuid();

    setTimeout(function() {

        var msg = {
            chan: chanlist[0],
            test: "TEST: Message Callback",
            rand: window.rand
        };

        p.publish({
            channel: chanlist[0],
            message: msg
        });

        console.log("\tWAIT 5 SECONDS TO CHECK IF PRESENCE MESSAGES ARE BEING RECEIVED IN MESSAGE CALLBACK");
        setTimeout(function(){
            finalize();
        }, 5000);

    }, 5000);

    assert.ok(true, "Subscribe to Channel " + chan);
    p.subscribe({
        channel: chan,
        message: function(msg, env, ch) {
            console.log("\tMESSAGE: ", msg, env, ch);
            assert.ok(true, "Received message on " + ch);
            check_messages(msg, ch);
        },
        presence: function(msg, env, ch) {
            assert.ok(true, "Received Presence on " + ch);
            console.log("\tPRESENCE: ", msg, env, ch);
        },
        connect: function() {
            assert.ok(true, "Connected to PubNub on Channel " + chan);
            console.log("\tCONNECTED: ", chan);
        }
    });

});


QUnit.test( "Unsubscribe Callback :: no presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    assert.expect( 1 );

    var done1 = assert.async();
    var check_completed = false;
    var timeout = null;

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
        channel: chanlist,
        message: function(msg) {
            console.log("\tMESSAGE: ", msg);
        },
        connect: function() {
            console.log("\tCONNECTED: ", chan);
        }
    });

    console.log("\tWAIT 5 SECONDS AND UNSUBSCRIBE, 5 MORE SECONDS FOR UNSUBSCRIBE CALLBACK");

    timeout = setTimeout(function() {
        check_success(false, "\tUnsubscribe callback not called within 5 seconds")
    }, 10000);

    setTimeout(function(){
        p.unsubscribe({
            channel: chanlist,
            callback: function() {
                console.log("\tUNSUBSCRIBE: ", chan);
                clearTimeout(timeout);
                check_success(true, "Unsubscribe callback called")
            }
        });
    }, 5000);

});

QUnit.test( "Unsubscribe Callback :: presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

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
        channel: chanlist,
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
            channel: chanlist,
            callback: function() {
                console.log("\tUNSUBSCRIBE: ", chan);
                clearTimeout(timeout);
                check_success(true, "Unsubscribe callback called")
            }
        });
    }, 5000);

});

QUnit.test( "Unsubscribe Callback :: without subscribing first", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    assert.expect( 1 );

    var done1 = assert.async();
    var check_completed = false;
    var timeout = null;

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


    console.log("\tWAIT 5 SECONDS AND UNSUBSCRIBE, 5 MORE SECONDS FOR UNSUBSCRIBE CALLBACK");

    timeout = setTimeout(function() {
        check_success(false, "\tUnsubscribe callback not called within 5 seconds")
    }, 5000);


    p.unsubscribe({
        channel: chanlist,
        callback: function() {
            console.log("\tUNSUBSCRIBE: ", chan);
            clearTimeout(timeout);
            check_success(true, "Unsubscribe callback called")
        }
    });

});