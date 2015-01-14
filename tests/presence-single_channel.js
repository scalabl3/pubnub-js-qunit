var p, pub, sub, sec, chan, uuid, moduleName = null;


// Ensure Tests are run in order (all tests, not just failed ones)
QUnit.config.reorder = false;

QUnit.module( "PRESENCE - SINGLE CHANNEL", {
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
