var p, pub, sub, sec, chan, chanlist, chanlist_array, uuid, moduleName, channelCount = null;


// Ensure Tests are run in order (all tests, not just failed ones)
QUnit.config.reorder = false;

QUnit.module( "PRESENCE - CHANNEL ARRAY2", {
    setupOnce: function () {

        moduleName = QUnit.config.current.module.name;

        console.info("*** START :: " + moduleName);

        pub = "pub-c-ef9e786b-f172-4946-9b8c-9a2c24c2d25b";
        sub = "sub-c-564d94c2-895e-11e4-a06c-02ee2ddab7fe";
        sec = "sec-c-Yjc5MTg5Y2MtODRmNi00OTc5LTlmZDItNWJkMjFkYmMyNDRl";

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
        p = null;
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

QUnit.test( "State Check :: state info on init, 1 user, 3 channels", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var timestamp = (new Date).getTime();
    var done = assert.async();
    uuid = random_chars(5, "uu");


    console.log("\tUUID: ", uuid);
    assert.ok(true, "UUID: " + uuid);

    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec,
        uuid: uuid,
        state: {
            user: "User",
            test: "TEST:: " + QUnit.config.current.testName,
            timestamp: timestamp
        }
    });

    setTimeout(function(){
        done();
    }, 6000);

    var here_now = function(ch) {
        setTimeout(function(){
            p.here_now({
                channel: ch,
                state: true,
                uuids: true,
                callback: function(a) {
                    console.log("\tHERE_NOW: ", ch,a);
                    assert.equal(a.occupancy, 1, "Occupancy of 1");
                    _.forEach(a.uuids, function(u){
                        assert.contains_keys(['uuid','state'], u);
                    });
                }
            });
        }, 3000);
    };

    p.subscribe({
        channel: chanlist_array,
        noheresync: true,
        message: function(m,e,a,b) {
            var msg = normalize_subscribe_message_callback_object(m,e);
            console.log ("\tMESSAGE: ", msg);
            assert.analyze_message("subscribe", "message", "pubsub", m, e, a, b);
        },
        presence: function(m,e,a,b,c,d) {
            var msg = normalize_presence_message_callback_object(m,e);
            console.log ("\tPRESENCE: ", m,e,a,b,c,d);
            assert.analyze_message("subscribe", "presence", "presence", m, e, a, b);
        },
        connect: function(m) {
            console.log("\tCONNECTED: ", m);
            here_now(m);
        }
    })

});


QUnit.test( "State Check :: state info on subscribe, 1 user, 3 channels", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var timestamp = (new Date).getTime();
    var done = assert.async();
    uuid = random_chars(5, "uu");


    console.log("\tUUID: ", uuid);
    assert.ok(true, "UUID: " + uuid);

    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec,
        uuid: uuid
    });

    setTimeout(function(){
        done();
    }, 6000);

    var here_now = function(ch) {
        setTimeout(function(){
            p.here_now({
                channel: ch,
                state: true,
                uuids: true,
                callback: function(a) {
                    console.log("\tHERE_NOW: ", ch,a);
                    assert.equal(a.occupancy, 1, "Occupancy of 1");
                    _.forEach(a.uuids, function(u){
                        assert.contains_keys(['uuid','state'], u);
                    });
                }
            });
        }, 3000);
    };

    p.subscribe({
        channel: chanlist_array,
        noheresync: true,
        message: function(m,e,a,b) {
            var msg = normalize_subscribe_message_callback_object(m,e);
            console.log ("\tMESSAGE: ", msg);
            assert.analyze_message("subscribe", "message", "pubsub", m, e, a, b);
        },
        presence: function(m,e,a,b,c,d) {
            var msg = normalize_presence_message_callback_object(m,e);
            console.log ("\tPRESENCE: ", m,e,a,b,c,d);
            assert.analyze_message("subscribe", "presence", "presence", m, e, a, b);
        },
        connect: function(m) {
            console.log("\tCONNECTED: ", m);
            here_now(m);
        },
        state: {
            user: "User",
            test: "TEST:: " + QUnit.config.current.testName,
            timestamp: timestamp
        }
    })

});