var p, pub, sub, sec, chan, chanlist, chanlist_array, uuid, moduleName, channelCount = null;


// Ensure Tests are run in order (all tests, not just failed ones)
QUnit.config.reorder = false;

QUnit.module( "PRESENCE - CHANNEL LIST", {
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

QUnit.test( "State Check :: state info on init", function( assert ) {
    p = PUBNUB.init({
        publish_key: pub,
        subscribe_key: sub,
        secret_key: sec
    });
});