var p, pub, sub, sec, chan, chgr, uuid, moduleName = null;

window.rand = null;

QUnit.assert.contains = function( value, expected, message ) {
    var actual = null;

    if (_.contains(value,expected)) {
        actual = expected;
    }
    this.push( actual === expected, actual, expected, message );
};

QUnit.module( "CHANNEL GROUP MESSAGES NOPRESENCE", {
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

QUnit.test( "TEST: Message Callback :: no presence callback defined", function( assert ) {

    console.log(QUnit.config.current.testName);

    var done = assert.async();

    var all_clear = true;

    var check_channel_membership = function() {
        p.channel_group_list_channels({
            channel_group: chgr,
            callback: function(msg) {
                assert.contains(msg.channels, chan, "Channel Group contains channel");
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

    var check_messages = function(msg, ch) {

        assert.ok(1 == "1", "Message Received on " + ch);

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
            message: message,
            callback: function(msg) {
                console.log("\tPUBLISHED: ", msg);
                assert.ok(1 == "1", "Message Published to " + chan );
            }
        });

        console.log("\tWAIT 5 SECONDS TO CHECK IF PRESENCE MESSAGES ARE BEING RECEIVED IN MESSAGE CALLBACK");
        setTimeout(function(){
            finalize();
        }, 5000);

    }, 5000);

    p.subscribe({
        channel_group: chgr,
        message: function(msg, env, ch) {
            console.log("\tMESSAGE: ", msg, env, ch);
            check_messages(msg, env[3]);
        },
        connect: function() {
            console.log("\tCONNECTED: ", chan);
        }
    });


});



