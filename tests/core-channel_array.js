var p, pub, sub, sec, chan, chanlist, chanlist_array, uuid, moduleName, channelCount = null;


// Ensure Tests are run in order (all tests, not just failed ones)
QUnit.config.reorder = false;

QUnit.module( "CORE - CHANNEL ARRAY", {
    setupOnce: function () {

        moduleName = QUnit.config.current.module.name;

        console.info("*** START :: " + moduleName);

        pub = "pub-c-ef9e786b-f172-4946-9b8c-9a2c24c2d25b";
        sub = "sub-c-564d94c2-895e-11e4-a06c-02ee2ddab7fe";
        sec = "sec-c-Yjc5MTg5Y2MtODRmNi00OTc5LTlmZDItNWJkMjFkYmMyNDRl";

        p = null;

        p = PUBNUB.init({
            publish_key: pub,
            subscribe_key: sub,
            secret_key: sec
        });

        channelCount = 3;
    },
    setup: function () {

        chanlist_array = [];
        _.times(channelCount, function() {
           chanlist_array.push(random_chars(5, 'ch'));
        });
        chanlist = chanlist_array.join(',');

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

var checkUnsubscribeCallback = function(assert, msg) {
    if (_.isObject(msg)) {
        assert.equal(typeof msg, 'string', "Unsubscribe Callback Returned Object, Expected String of Channel Name");
    }
    if (_.isObject(msg) && msg.hasOwnProperty('action')){
        //assert.ok(false, "Unsubscribe callback object is a Presence Message");
        assert.push(false, msg.action, undefined, "Unsubscribe Callback Object was Presence Message (had 'action' property)");
    }
};

var removeChannelFromArray = function(ch) {
    chanlist_array = _.without(chanlist_array, ch);
};

var resetChannelListArray = function() {
    chanlist_array = chanlist.split(',');
};

// ***************************************************************************** //

QUnit.test( "Connect Callback :: no presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();
    var timeout = null;
    var operation = "subscribe()";

    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, "Subscribe and Unsubscribe Completed");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, operation + " Error Callback Executed");
        }
        else if (resultCode === -3) {
            assert.ok(false, "Timeout Reached, " + operation + " Callbacks Didn't Complete");
        }
        else if (resultCode === -4) {
            assert.ok(false, "Timeout Reached, unsubscribe() Callbacks Didn't Complete, or Channel Names Missing to Check");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        done();
    };

    console.log("\tWAIT 5 SECONDS FOR ALL SUBSCRIBES");
    timeout = setTimeout(function(){
        finalize(-3);
    }, 5000);

    assert.ok(true, "Subscribe to Channel List");
    p.subscribe({
        channel: chanlist_array,
        message: function(msg) { },
        connect: function(msg) {
            assert.ok(true, "\tConnected to PubNub on Channel: " + msg);
            console.log("\tSUBSCRIBE: ", msg);
            removeChannelFromArray(msg);

            if (chanlist_array.length === 0) {
                assert.ok(true, "All Channels Subscribed");
                clearTimeout(timeout);
                resetChannelListArray();


                console.log("\tWAIT 5 SECONDS FOR ALL UNSUBSCRIBES");
                timeout = setTimeout(function(){
                    finalize(-4);
                }, 5000);

                p.unsubscribe({
                    channel: chanlist_array,
                    callback: function(msg) {
                        assert.ok(true, "Unsubscribed to Channel: " + msg);
                        console.log("\tUNSUBSCRIBE: ", msg);

                        checkUnsubscribeCallback(assert, msg);
                        removeChannelFromArray(msg.channel);
                        if (chanlist_array.length === 0) {
                            finalize(1);
                        }
                    }
                });
            }
        },
        error: function(m) {
            assert.ok(false, "Subscribe Error");
            finalize(-1);
        }
    });
});

QUnit.test( "Connect Callback :: subscribe with presence: false", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();
    var timeout = null;
    var operation = "subscribe()";

    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, "Subscribe and Unsubscribe Completed");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, operation + " Error Callback Executed");
        }
        else if (resultCode === -3) {
            assert.ok(false, "Timeout Reached, " + operation + " Callbacks Didn't Complete");
        }
        else if (resultCode === -4) {
            assert.ok(false, "Timeout Reached, unsubscribe() Callbacks Didn't Complete, or Channel Names Missing to Check");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        done();
    };

    console.log("\tWAIT 5 SECONDS FOR ALL SUBSCRIBES");
    timeout = setTimeout(function(){
        finalize(-3);
    }, 5000);

    assert.ok(true, "Subscribe to Channel List");
    p.subscribe({
        channel: chanlist_array,
        presence: false,
        message: function(msg) { },
        connect: function(msg) {
            assert.ok(true, "\tConnected to PubNub on Channel: " + msg);
            console.log("\tSUBSCRIBE: ", msg);
            removeChannelFromArray(msg);

            if (chanlist_array.length === 0) {
                assert.ok(true, "All Channels Subscribed");
                clearTimeout(timeout);
                resetChannelListArray();

                console.log("\tWAIT 5 SECONDS FOR ALL UNSUBSCRIBES");
                timeout = setTimeout(function(){
                    finalize(-4);
                }, 5000);

                p.unsubscribe({
                    channel: chanlist_array,
                    callback: function(msg) {
                        assert.ok(true, "Unsubscribed to Channel: " + msg);
                        console.log("\tUNSUBSCRIBE: ", msg);

                        checkUnsubscribeCallback(assert, msg);
                        removeChannelFromArray(msg.channel);
                        if (chanlist_array.length === 0) {
                            finalize(1);
                        }
                    }
                });
            }
        },
        error: function(m) {
            assert.ok(false, "Subscribe Error");
            finalize(-1);
        }
    });
});

QUnit.test( "Connect Callback :: presence callback defined, no here_now sync", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();
    var timeout = null;
    var operation = "subscribe()";

    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, "Subscribe and Unsubscribe Completed");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, operation + " Error Callback Executed");
        }
        else if (resultCode === -3) {
            assert.ok(false, "Timeout Reached, " + operation + " Callbacks Didn't Complete");
        }
        else if (resultCode === -4) {
            assert.ok(false, "Timeout Reached, unsubscribe() Callbacks Didn't Complete, or Channel Names Missing to Check");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        done();
    };

    console.log("\tWAIT 5 SECONDS FOR ALL SUBSCRIBES");
    timeout = setTimeout(function(){
        finalize(-3);
    }, 5000);

    assert.ok(true, "Subscribe to Channel List");
    p.subscribe({
        channel: chanlist_array,
        noheresync: true,
        presence: function(m){
            console.log("\tPRESENCE: ", m);
            assert.ok(true, "Presence Message Received");
        },
        message: function(msg) { },
        connect: function(msg) {
            assert.ok(true, "\tConnected to PubNub on Channel: " + msg);
            console.log("\tSUBSCRIBE: ", msg);
            removeChannelFromArray(msg);

            if (chanlist_array.length === 0) {
                assert.ok(true, "All Channels Subscribed");
                clearTimeout(timeout);
                resetChannelListArray();


                console.log("\tWAIT 5 SECONDS FOR ALL UNSUBSCRIBES");
                timeout = setTimeout(function(){
                    finalize(-4);
                }, 5000);

                p.unsubscribe({
                    channel: chanlist_array,
                    callback: function(msg) {
                        assert.ok(true, "Unsubscribed to Channel: " + msg);
                        console.log("\tUNSUBSCRIBE: ", msg);

                        checkUnsubscribeCallback(assert, msg);
                        removeChannelFromArray(msg.channel);
                        if (chanlist_array.length === 0) {
                            finalize(1);
                        }
                    }
                });
            }
        },
        error: function(m) {
            assert.ok(false, "Subscribe Error");
            finalize(-1);
        }
    });
});

QUnit.test( "Connect Callback :: presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();
    var timeout = null;
    var operation = "subscribe()";
    var presenceMessageCount = 0;

    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, "Subscribe and Unsubscribe Completed");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, operation + " Error Callback Executed");
        }
        else if (resultCode === -3) {
            assert.ok(false, "Timeout Reached, " + operation + " Callbacks Didn't Complete");
        }
        else if (resultCode === -4) {
            assert.ok(false, "Timeout Reached, unsubscribe() Callbacks Didn't Complete, or Channel Names Missing to Check");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        assert.equal(presenceMessageCount, channelCount, "Expected " + channelCount + " Presence Messages, Received " + presenceMessageCount);
        done();
    };

    console.log("\tWAIT 10 SECONDS FOR ALL SUBSCRIBES, PRESENCE AND UNSUBSCRIBES");
    timeout = setTimeout(function(){
        finalize(-3);
    }, 10000);

    assert.ok(true, "Subscribe to Channel List");
    p.subscribe({
        channel: chanlist_array,
        presence: function(m, a, ch){
            console.log("\tPRESENCE: ", m, ch);
            assert.ok(true, "Presence Message Received on Channel: " + ch);
            presenceMessageCount += 1;
        },
        message: function(msg) { },
        connect: function(msg) {
            assert.ok(true, "\tConnected to PubNub on Channel: " + msg);
            console.log("\tSUBSCRIBE: ", msg);
            removeChannelFromArray(msg);

            if (chanlist_array.length === 0) {

                console.log("\tWAIT 5 SECONDS FOR ALL PRESENCE MESSAGES");
                setTimeout(function(){
                    assert.ok(true, "All Channels Subscribed");
                    clearTimeout(timeout);
                    resetChannelListArray();


                    console.log("\tWAIT 5 SECONDS FOR ALL UNSUBSCRIBES");
                    timeout = setTimeout(function(){
                        finalize(-4);
                    }, 5000);

                    p.unsubscribe({
                        channel: chanlist_array,
                        callback: function(msg) {
                            assert.ok(true, "Unsubscribed to Channel: " + msg);
                            console.log("\tUNSUBSCRIBE: ", msg);

                            checkUnsubscribeCallback(assert, msg);
                            removeChannelFromArray(msg.channel);
                            if (chanlist_array.length === 0) {
                                finalize(1);
                            }
                        }
                    });
                }, 5000);
            }
        },
        error: function(m) {
            assert.ok(false, "Subscribe Error");
            finalize(-1);
        }
    });
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
        channel: chanlist_array,
        callback: function(chan) {
            console.log("\tUNSUBSCRIBE: ", chan);
            clearTimeout(timeout);
            check_success(true, "Unsubscribe callback called")
        }
    });

});
