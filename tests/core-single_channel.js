var p, pub, sub, sec, chan, uuid, moduleName = null;


// Ensure Tests are run in order (all tests, not just failed ones)
QUnit.config.reorder = false;

QUnit.module( "CORE - SINGLE CHANNEL", {
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
        chan = random_chars(5, 'ch');
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

    p.subscribe({
        channel: chan,
        message: function(msg) { },
        connect: function() {
            assert.ok(true, "Connect to PubNub on Channel " + chan);
            p.unsubscribe({
                channel: chan,
                callback: function() {
                    assert.ok(true, "Unsubscribed to Channel " + chan);
                    console.log("\tUNSUBSCRIBE: ", chan);
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
        channel: chan,
        message: function(msg) { },
        presence: function(msg) { },
        connect: function() {
            assert.ok(true, "Connect to PubNub on Channel " + chan);
            p.unsubscribe({
                channel: chan,
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
            channel: chan,
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
            chan: chan,
                test: "TEST: Message Callback",
                rand: window.rand
        };

        p.publish({
            channel: chan,
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
            channel: chan,
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
            chan: chan,
            test: "TEST: Message Callback",
            rand: window.rand
        };

        p.publish({
            channel: chan,
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

QUnit.test( "Message Callback :: presence callback defined, normalize message callback", function( assert ) {

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
            channel: chan,
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
            chan: chan,
            test: "TEST: Message Callback",
            rand: window.rand
        };

        p.publish({
            channel: chan,
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
            assert.ok(true, "Received Message on " + ch);
            var result = normalize_subscribe_message_callback_object(msg, env);
            console.log("\tRESULT: ", result);
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
        channel: chan,
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
            channel: chan,
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
        channel: chan,
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
            channel: chan,
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
        channel: chan,
        callback: function() {
            console.log("\tUNSUBSCRIBE: ", chan);
            clearTimeout(timeout);
            check_success(true, "Unsubscribe callback called")
        }
    });

});

QUnit.test( "Message Over 32K :: presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();
    var timeout = null;
    var isSubscribed = false;
    var operation = "publish()";

    var check_messages = function(msg) {
        if (msg.rand === window.rand) {
            assert.ok(true, "Message contained expected value");
        }
        else if ('action' in msg) {
            assert.ok(false, "Message did not contain expected value");
        }
    };

    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, operation + " Error Callback Executed As Expected");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, operation + " Error Callback Executed, But No Error Message Provided");
        }
        else if (resultCode === -2) {
            assert.ok(false, operation + " Callback Executed, Not Expected");
        }
        else if (resultCode === -3) {
            assert.ok(false, "Subscribe Message Callback Called, Not Expected");
        }
        else if (resultCode === -4) {
            assert.ok(false, "Timeout Reached, " + operation + " Error Callback Not Executed");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        if (isSubscribed) {
            timeout = setTimeout(function() {
                isSubscribed = false;
                finalize(-10);
            }, 3000);

            p.unsubscribe({
                channel: chan,
                callback: function() {
                    isSubscribed = false;
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

    var publish = function() {
        assert.ok(true, "Publish 33K Message");
        window.rand = PUBNUB.uuid();

        var msg = {
            chan: chan,
            test: "TEST: Message Callback",
            long: random_chars(1024*33),
            rand: window.rand
        };

        p.publish({
            channel: chan,
            message: msg,
            error: function(m) {
                console.log("PUBLISH ERROR: ", m);
                clearTimeout(timeout);
                if (m.hasOwnProperty('message')) {
                    finalize(1);
                }
                else {
                    finalize(-1);
                }

            },
            callback: function(m) {
                clearTimeout(timeout);
                assert.ok(false, "Publish Succeeded");
                console.log("PUBLISH CALLBCK: ", m);
                finalize(-2);
            }
        });

        console.log("\tWAIT 2 SECONDS TO CHECK FOR PUBLISH ERROR CALLBACK");
        timeout = setTimeout(function(){
            finalize(-4);
        }, 2000);
    };


    assert.ok(true, "Subscribe to Channel " + chan);
    p.subscribe({
        channel: chan,
        message: function(msg, env, ch) {
            console.log("\tMESSAGE: ", msg, env, ch);
            assert.ok(true, "Received Message on " + ch);
            check_messages(msg, ch);
            finalize(-3);
        },
        presence: function(msg, env, ch) {
            console.log("\tPRESENCE: ", msg, env, ch);
            assert.ok(true, "Received Presence on " + ch);
        },
        connect: function() {
            assert.ok(true, "Connected to PubNub on Channel " + chan);
            console.log("\tCONNECTED: ", chan);
            isSubscribed = true;
            publish();
        }
    });

});