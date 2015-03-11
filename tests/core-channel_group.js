var p, pub, sub, sec, chan, chgr, uuid, moduleName = null;

window.rand = null;

// Ensure Tests are run in order (all tests, not just failed ones)
QUnit.config.reorder = false;

QUnit.module( "CORE - CHANNEL GROUP", {
    setupOnce: function () {

        moduleName = QUnit.config.current.module.name;

        console.info("*** START :: " + moduleName);

        pub = "pub-c-ef9e786b-f172-4946-9b8c-9a2c24c2d25b";
        sub = "sub-c-564d94c2-895e-11e4-a06c-02ee2ddab7fe";
        sec = "sec-c-Yjc5MTg5Y2MtODRmNi00OTc5LTlmZDItNWJkMjFkYmMyNDRl";

        chgr = random_chars(5, 'cg');
        chan = random_chars(5, 'ch');
        uuid = random_chars(5, 'uuid');

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

// ***************************************************************************** //

QUnit.test(" Create Channel Group", function(assert) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();

    var check_channel_membership = function() {
        p.channel_group_list_channels({
            channel_group: chgr,
            callback: function(msg) {
                console.log("\tCHANNEL GROUP CHANNEL LIST: ", msg);
                assert.contains(msg.channels, chan, "Channel Group contains channel");
                done();
            }
        })
    };

    assert.ok(true, "Add channel " + chan + " to channel group " + chgr);
    p.channel_group_add_channel({
        callback: function(msg) {
            console.log("\tCHANNEL GROUP ADD CHANNEL: ", msg);
            check_channel_membership();
        },
        error: function(msg) {
            console.log("\tERROR CHANNEL GROUP ADD CHANNEL: ", msg);
            assert.ok(false, "ERROR Failed!");
            done();
        },
        channel: chan,
        channel_group: chgr
    });
});

QUnit.test( "Connect Callback :: no presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();

    assert.ok(true, "Subscribe to Channel Group " + chgr);
    p.subscribe({
        channel_group: chgr,
        message: function(msg) { },
        connect: function() {
            assert.ok(true, "Connected to PubNub on Channel Group " + chgr);

            p.unsubscribe({
                channel_group: chgr,
                callback: function(msg) {
                    assert.ok(true, "Unsubscribed to " + chgr);
                    console.log("\tUNSUBSCRIBE: ", chgr, msg);
                    done();
                }
            });


        }
    });

});

QUnit.test( "Connect Callback :: presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();

    assert.ok(true, "Subscribe to Channel Group " + chgr);
    p.subscribe({
        channel_group: chgr,
        message: function(msg) { },
        presence: function(msg) { },
        connect: function() {
            assert.ok(true, "Connected to PubNub on Channel Group " + chgr);

            p.unsubscribe({
                channel_group: chgr,
                callback: function(msg) {
                    assert.ok(true, "Unsubscribed to " + chgr);
                    console.log("\tUNSUBSCRIBE: ", chgr, msg);
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

    var check_messages = function(msg, ch) {

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
                assert.ok(true, "Unsubscribed to Channel Group " + chgr);
                console.log("\tUNSUBSCRIBE: ", chgr, msg);
                done();
            }
        });


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
                assert.ok(1 == "1", "Message Published to " + chan );
                console.log("\tPUBLISHED: ", msg);

            }
        });

        console.log("\tWAIT 5 SECONDS TO CHECK IF PRESENCE MESSAGES ARE BEING RECEIVED IN MESSAGE CALLBACK");
        setTimeout(function(){
            finalize();
        }, 5000);

    }, 5000);

    assert.ok(true, "Subscribe to Channel Group " + chgr);
    p.subscribe({
        channel_group: chgr,
        message: function(msg, env, ch) {
            console.log("\tMESSAGE: ", msg, env, ch);
            assert.ok(true, "Received message on " + env[2] + "->" + env[3]);
            check_messages(msg, env[3]);
        },
        connect: function() {
            assert.ok(true, "Connected to PubNub on Channel Group " + chgr);
            console.log("\tCONNECTED: ", chan);
        }
    });

});

QUnit.test( "Message Callback :: presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();

    var all_clear = true;

    var check_messages = function(msg, ch) {
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
                console.log("\tUNSUBSCRIBE: ", chgr, msg);
                assert.ok(true, "Unsubscribed to Channel Group " + chgr);
                done();
            }
        });

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

    assert.ok(true, "Subscribe to Channel Group " + chgr);
    p.subscribe({
        channel_group: chgr,
        message: function(msg, env, ch) {
            console.log("\tMESSAGE: ", msg, env, ch);
            assert.ok(true, "Received message on " + env[2] + "->" + env[3]);
            check_messages(msg, env[3]);
        },
        presence: function(msg, env, ch) {
            assert.ok(true, "Received Presence on " + env[2] + "->" + env[3]);
            console.log("\tPRESENCE: ", msg, env, ch);
        },
        connect: function() {
            assert.ok(true, "Connected to PubNub on Channel Group " + chgr);
            console.log("\tCONNECTED: ", chan);
        }
    });

});

QUnit.test( "Message Callback :: add_channel(1), subscribe, add_channel(2), publish(2)", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    chgr = random_chars(5, 'cg');

    var done = assert.async();
    var timeout = null;
    var channelCount = 3;
    var chanlist_array = [];
    var messageid_array = [];
    _.times(channelCount, function() {
        chanlist_array.push(random_chars(5, 'aa'));
        messageid_array.push(random_chars(5, 'msg'));
    });


    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, "Message Received on Dynamically Added Channel (after Subscribe)");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, "Timeout Reached, Message Callback Didn't Receive Published Message on " + chanlist_array[1]);
        }
        else if (resultCode === -4) {
            assert.ok(false, "Timeout Reached, unsubscribe() Callbacks Didn't Complete, or Channel Names Missing to Check");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        done();
    };


    var add_channel_to_group = function(channel, callbacks) {
        p.channel_group_add_channel({
            channel: channel,
            channel_group: chgr,
            callback: function(msg) {
                console.log("\tCHANNEL GROUP ADD CHANNEL: ", msg);
                assert.ok(true, "Added Channel to Channel Group: " + channel);
                callbacks.done();
            },
            error: function(msg) {
                console.log("\tERROR CHANNEL GROUP ADD CHANNEL: ", msg);
                assert.ok(false, "ERROR Failed!");
                done();
            }
        });
    };

    var publish = function(channel, message_id, callbacks) {

        var message = {
            chan: channel,
            id: message_id,
            test: "TEST:: " + QUnit.config.current.testNam
        };

        console.log("\tPUBLISH: ", message);
        p.publish({
            channel: channel,
            message: message,
            callback: function(msg) {
                console.log("\tPUBLISHED: ", msg);
                assert.ok(true, "Message Published to " + channel );
                callbacks.done();
            }
        });
    };

    var unsubscribe = function() {
        p.unsubscribe({
            channel_group: chgr,
            callback: function(msg) {
                console.log("\tUNSUBSCRIBE: ", chgr, msg);
                assert.ok(true, "Unsubscribed to Channel Group " + chgr);
            }
        });
    };

    var subscribe = function(callbacks) {
        assert.ok(true, "Subscribe to Channel Group: " + chgr);
        p.subscribe({
            channel_group: chgr,
            message: function(msg, env, ch) {
                console.log("\tMESSAGE: ", msg, env, ch);
                assert.ok(true, "Received message on " + env[2] + "->" + env[3]);
                var result = normalize_subscribe_message_callback_object(msg, env);
                console.log("\tRESULT: ", result);
                callbacks.message(result);
            },
            presence: function(msg, env, ch) {
                assert.ok(true, "Received Presence on: " + env[3].replace("-pnpres", ""));
                console.log("\tPRESENCE: ", msg, env, ch);
            },
            connect: function() {
                assert.ok(true, "Connected to PubNub on Channel Group: " + chgr);
                console.log("\tCONNECTED: ", chan);
                callbacks.connect();
            }
        });
    };

    var run_test = function(index) {

        subscribe({
            connect: function() {
                add_channel_to_group(chanlist_array[index], {
                    done: function() {
                        assert.ok(true, "Publish Message to 2nd Channel Added to Group")
                        publish(chanlist_array[index], messageid_array[index], {
                            done: function() {
                                console.log("WAIT 3 SECONDS FOR MESSAGE TO BE RECEIVED");
                                timeout = setTimeout(function() {
                                    finalize(-1);
                                }, 3000);
                            }
                        });
                    }
                });
            },
            message: function(result) {
                assert.equal(result.channel, chanlist_array[index], "Message Received on Correct Channel " + chanlist_array[index]);
                assert.equal(result.msg.id, messageid_array[index], "Message has Correct ID " + messageid_array[index]);
                clearTimeout(timeout);
                finalize(1);
            }
        });
    };

    // Add First Channel to Group, Check Membership, Then Subscribe to Group
    var check_channel_membership = function() {
        p.channel_group_list_channels({
            channel_group: chgr,
            callback: function(msg) {
                console.log("\tCHANNEL GROUP CHANNEL LIST: ", msg);
                assert.contains(msg.channels, chanlist_array[0], "Channel Group Contains Channel");
                run_test(1);
            },
            error: function(msg) {
                console.log("\tERROR GROUP CHANNEL LIST: ", msg);
                assert.ok(false, "ERROR Failed!");
                done();
            }
        });
    };

    assert.ok(true, "Add channel to Channel Group: " + chanlist_array[0]);
    p.channel_group_add_channel({
        channel: chanlist_array[0],
        channel_group: chgr,
        callback: function(msg) {
            console.log("\tCHANNEL GROUP ADD CHANNEL: ", msg);
            check_channel_membership();
        },
        error: function(msg) {
            console.log("\tERROR CHANNEL GROUP ADD CHANNEL: ", msg);
            assert.ok(false, "ERROR Failed!");
            done();
        }
    });
});

QUnit.test( "Message Callback :: add_channel(1), subscribe, add_channel(2), publish(1), publish(2)", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    chgr = random_chars(5, 'cg');

    var done = assert.async();
    var timeout = null;
    var channelCount = 3;
    var chanlist_array = [];
    var messageid_array = [];
    _.times(channelCount, function() {
        chanlist_array.push(random_chars(5, 'aa'));
        messageid_array.push(random_chars(5, 'msg'));
    });


    var finalize = function(resultCode) {
        resultCode = _.isUndefined(resultCode) ? -1 : resultCode;

        if (resultCode === 1) {
            assert.ok(true, "Message Received on Dynamically Added Channel (after Subscribe)");
            clearTimeout(timeout);
        }
        else if (resultCode === -1) {
            assert.ok(false, "Timeout Reached, Message Callback Didn't Receive Published Message");
        }
        else if (resultCode === -4) {
            assert.ok(false, "Timeout Reached, unsubscribe() Callbacks Didn't Complete, or Channel Names Missing to Check");
        }
        else {
            assert.ok(false, "Unknown Result Code (Check Test Config)");
        }

        done();
    };


    var add_channel_to_group = function(channel, doneCallback) {
        p.channel_group_add_channel({
            channel: channel,
            channel_group: chgr,
            callback: function(msg) {
                console.log("\tCHANNEL GROUP ADD CHANNEL: ", msg);
                assert.ok(true, "Added Channel to Channel Group " + chgr + "::" + channel);
                doneCallback();
            },
            error: function(msg) {
                console.log("\tERROR CHANNEL GROUP ADD CHANNEL: ", msg);
                assert.ok(false, "ERROR Failed!");
                done();
            }
        });
    };

    var publish = function(channel, message_id, publishCallback) {

        var message = {
            chan: channel,
            id: message_id,
            test: "TEST:: " + QUnit.config.current.testNam
        };

        console.log("\tPUBLISH: ", message);
        p.publish({
            channel: channel,
            message: message,
            callback: function(msg) {
                console.log("\tPUBLISHED: ", msg);
                assert.ok(true, "Message Published to " + channel );
                publishCallback();
            }
        });
    };

    var unsubscribe = function() {
        p.unsubscribe({
            channel_group: chgr,
            callback: function(msg) {
                console.log("\tUNSUBSCRIBE: ", chgr, msg);
                assert.ok(true, "Unsubscribed to Channel Group " + chgr);
            }
        });
    };

    var subscribe = function(callbacks) {
        assert.ok(true, "Subscribe to Channel Group");
        p.subscribe({
            channel_group: chgr,
            message: function(msg, env, ch) {
                console.log("\tMESSAGE: ", msg, env, ch);
                assert.ok(true, "Received Message on " + env[2] + "::" + env[3]);
                var result = normalize_subscribe_message_callback_object(msg, env);
                console.log("\tRESULT: ", result);
                callbacks.message(result);
            },
            presence: function(msg, env, ch) {
                assert.ok(true, "Received Presence on " + env[2] + "->" + env[3]);
                console.log("\tPRESENCE: ", msg, env, ch);
            },
            connect: function() {
                assert.ok(true, "Connected to PubNub on Channel Group " + chgr);
                console.log("\tCONNECTED: ", chan);
                callbacks.connect();
            }
        });
    };


    var run_test = function(index) {

        // Which Message to Check (index of chanlist_array)
        var check_publish = 0;

        var publish_callback_2 = function() {
            console.log("WAIT 5 SECONDS FOR MESSAGE TO BE RECEIVED");
            timeout = setTimeout(function() {
                finalize(-1);
            }, 5000);
        };

        // Post-Publish to First Channel in Group (Resets Connection to PubNub)
        var publish_callback_1 = function() {
            setTimeout(function() {
                check_publish = 1;
                publish(chanlist_array[1], messageid_array[1], publish_callback_2);
            }, 2000);
        };

        var add_channel_callback = function() {
            publish(chanlist_array[0], messageid_array[0], publish_callback_1);
        };

        subscribe({
            connect: function() {
                add_channel_to_group(chanlist_array[index], add_channel_callback);
            },
            message: function(result) {
                assert.equal(result.channel, chanlist_array[check_publish], "Message Received on Correct Channel " + chanlist_array[check_publish]);
                assert.equal(result.message.id, messageid_array[check_publish], "Message has Correct ID " + messageid_array[check_publish]);
                clearTimeout(timeout);
                if (check_publish === 1) {
                    finalize(1);
                }
            }
        });
    };

    // Add First Channel to Group, Check Membership, Then Subscribe to Group
    var check_channel_membership = function() {
        p.channel_group_list_channels({
            channel_group: chgr,
            callback: function(msg) {
                console.log("\tCHANNEL GROUP CHANNEL LIST: ", msg);
                assert.contains(msg.channels, chanlist_array[0], "Channel Group Contains Channel");
                run_test(1);
            },
            error: function(msg) {
                console.log("\tERROR GROUP CHANNEL LIST: ", msg);
                assert.ok(false, "ERROR Failed!");
                done();
            }
        });
    };

    assert.ok(true, "Add channel to channel group " + chgr + "::" + chanlist_array[0]);
    p.channel_group_add_channel({
        channel: chanlist_array[0],
        channel_group: chgr,
        callback: function(msg) {
            console.log("\tCHANNEL GROUP ADD CHANNEL: ", msg);
            check_channel_membership();
        },
        error: function(msg) {
            console.log("\tERROR CHANNEL GROUP ADD CHANNEL: ", msg);
            assert.ok(false, "ERROR Failed!");
            done();
        }
    });
});


QUnit.test( "Unsubscribe Callback :: no presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();
    var check_completed = false;

    var check_success = function(result, msg) {
        if (!check_completed) {
            check_completed = true;
            assert.ok(true == result, msg);
            done();
        }
        else {
            console.error("\tUnsubscribe callback called after more than 5 seconds.")
        }
    };

    assert.ok(true, "Subscribe to Channel Group " + chgr);
    p.subscribe({
        channel_group: chgr,
        message: function(msg) {
            console.log("\tMESSAGE: ", msg);
        },
        connect: function() {
            assert.ok(true, "Connected to PubNub on Channel Group " + chgr);
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

QUnit.test( "Unsubscribe Callback :: presence callback defined", function( assert ) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();
    var check_completed = false;

    var check_success = function(result, msg) {
        if (!check_completed) {
            check_completed = true;
            assert.ok(true == result, msg);
            done();
        }
        else {
            console.error("\tUnsubscribe callback called after more than 5 seconds.")
        }
    };

    assert.ok(true, "Subscribe to Channel Group " + chgr);
    p.subscribe({
        channel_group: chgr,
        message: function(msg) {
            console.log("\tMESSAGE: ", msg);
        },
        presence: function(msg) {
            console.log("\tPRESENCE: ", msg);
        },
        connect: function() {
            assert.ok(true, "Connected to PubNub on Channel Group " + chgr);
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


QUnit.test(" Remove Channel Group", function(assert) {

    console.log("TEST:: " + QUnit.config.current.testName);

    var done = assert.async();

    var done_remove = function() {
        setTimeout(function(){
            p.channel_group_list_groups({
                callback: function(msg) {
                    console.log("\tCHANNEL GROUPS: ", msg);
                    assert.ok(true, "Channel Remove from Group, Group Empty");
                    done();
                }
            });
        }, 5000);
    };

    assert.ok(true, "Remove Channel " + chan + " from Channel Group " + chgr);
    p.channel_group_remove_channel({
        callback: function(msg) {
            assert.ok(true, "Removed Channel " + chan + " from Channel Group " + chgr);
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

