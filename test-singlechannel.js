var p, pub, sub, sec, chan, uuid = null;

uuid = PUBNUB.uuid();

QUnit.module( "SINGLE CHANNEL", {
    setupOnce: function () {
        console.info("*** START :: SINGLE CHANNEL TESTS");

        pub = "pub-c-ef9e786b-f172-4946-9b8c-9a2c24c2d25b";
        sub = "sub-c-564d94c2-895e-11e4-a06c-02ee2ddab7fe";
        sec = "sec-c-Yjc5MTg5Y2MtODRmNi00OTc5LTlmZDItNWJkMjFkYmMyNDRl";
        p = PUBNUB.init({
            publish_key: pub,
            subscribe_key: sub,
            secret_key: sec
        });
    },
    setup: function () {
        chan = PUBNUB.uuid();
    },
    teardown: function () {
        p.unsubscribe({
            channel: chan
        });
    },
    teardownOnce: function () {
        p = null;
        console.info("*** DONE :: SINGLE CHANNEL TESTS");
        console.log(" ");
    }
});

QUnit.test( "TEST: Connect Callback :: no presence callback defined", function( assert ) {

    console.log("TEST: Connect Callback :: no presence callback defined");

    var done = assert.async();

    p.subscribe({
        channel: chan,
        message: function(msg) { },
        connect: function() {
            assert.ok(1 == "1", "Passed!");
            p.unsubscribe({ channel: chan });
            done();
        }
    });

});

QUnit.test( "TEST: Connect Callback :: presence callback defined", function( assert ) {

    console.log("TEST: Connect Callback :: presence callback defined");

    var done = assert.async();

    p.subscribe({
        channel: chan,
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

    var rand = p.uuid();

    setTimeout(function() {
        p.publish({
            channel: chan,
            message: {
                chan: chan,
                test: "TEST: Message Callback",
                rand: rand
            }
        });
    }, 5000);

    p.subscribe({
        channel: chan,
        message: function(msg) {
            console.log("\tMESSAGE: ", msg);
            assert.equal(msg.rand, rand, "Received Expected Value");
            done();
        },
        connect: function() {
            console.log("\tCONNECTED: ", chan);
        }
    });

});

QUnit.test( "TEST: Message Callback :: presence callback defined", function( assert ) {

    console.log("TEST: Message Callback :: presence callback defined");

    assert.expect( 2 );

    var done1 = assert.async();
    var done2 = assert.async();

    var rand = p.uuid();

    setTimeout(function() {
        var message = {
            chan: chan,
            test: "TEST: Message Callback :: single channel, presence callback",
            rand: rand
        };

        console.log("\tPUBLISH: ", message)
        p.publish({
            channel: chan,
            message: message
        });
    }, 5000);

    p.subscribe({
        channel: chan,
        message: function(msg) {
            console.log("\tMESSAGE: ", msg);
            assert.equal(msg.rand, rand, "Received Expected Value");
            done1();
        },
        presence: function(msg) {
            console.log("\tPRESENCE: ", msg);
            assert.ok(1 == "1", "Passed!");
            done2();
        },
        connect: function() {
            console.log("\tCONNECTED: ", chan);
        }
    });

});
