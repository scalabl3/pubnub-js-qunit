function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function random_chars(size, prefix) {
    size = _.isUndefined(size) ? 7 : size;
    prefix = _.isUndefined(prefix) ? '' : prefix + '-';

    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < size; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return prefix + text;
}

function cloneObject(o) {
    return JSON.parse(JSON.stringify(o));
}

function normalize_subscribe_message_callback_object(msg, envelope) {
    var result = {
        channel_group: null,
        channel: null,
        message: msg
    };
    // if the message received through channel group
    if (envelope.length === 4) {
        result.channel_group = envelope[2];
        result.channel = envelope[3];
    }
    // if message received through channel only
    else if (envelope.length === 3) {
        result.channel = envelope[2];
    }
    else {
        console.error("Subscribe Message Callback envelope parameter array length NOT IN [3,4]")
    }

    return result;
}

function normalize_presence_message_callback_object(msg, envelope) {
    var result = {
        channel_group: null,
        channel: null,
        message: msg
    };
    console.log("");
    console.log("");
    console.log("msg: ", msg);
    console.log("env: ", envelope);

    // if the message received through channel group
    if (envelope.length === 4) {
        //console.log(envelope[2], _.initial(envelope[2], 7).join(''), envelope[2].slice(0, envelope[2].length - 7));
        //console.log(envelope[3], _.initial(envelope[3], 7).join(''), envelope[2].slice(0, envelope[3].length - 7));
        result.channel_group = _.initial(envelope[2], 7).join('');
        result.channel = _.initial(envelope[3], 7).join('');
    }
    // if message received through channel only
    else if (envelope.length === 3) {
        result.channel = _.initial(envelope[2], 7).join('');
    }
    else {
        console.error("Presence Message Callback envelope parameter array length NOT IN [3,4]")
    }

    console.log("");
    console.log("");
    return result;
}

function generate_nav() {
    var page = window.location.pathname.split("/").pop();
    var pages = [];

    pages.push(["index-core.html", "Core", "Core Functionality"]);
    pages.push(["index-presence.html", "Presence", "Presence"]);
    pages.push(["index-pam.html", "PAM", "PAM"]);
    pages.push(["index-cleanup.html", "Test Cleanup", "Cleanup/Delete Channel Groups (PAM & NON-PAM)"]);

    $("#nav").find("li").remove();

    // For Nav Links, preserve all query string params except "module=" and "testId="
    var query_params_array = location.search.split('&');

    query_params_array = _.remove(query_params_array, function(a){
       return (a.indexOf("module=") !== 0 && a.indexOf("testId=") !== 0);
    });

    var query_params = query_params_array.join('&');

    _.forEach(pages, function(p) {
        var li = "<li";
        if (page === p[0]) {
            li += " class=\"active\"";
            document.title = p[2];
        }
        li += ">";

        if (p[0].length > 0) {
            li += "<a href=\"" + p[0] + query_params + "\">" + p[1] + "</a>";
        }
        else {
            li += "<a>&nbsp;</a>";
        }

        li += "</li>";
        $("#nav").append(li);
    });
}


$(document).ready(function(){
    generate_nav();
});

console.json = function(x) {
    console.log(JSON.stringify(x, null, '\t'));
};

window.PUBNUB = null;

QUnit.config.autostart = false;

QUnit.assert.analyze_message = function(api_method_name, api_callback_name, expected_type, param_1, param_2, param_3, param_4) {
    var self = this;
    var analysis = {
        expected_type: expected_type,
        message_type: "undetermined",
        api_method: api_method_name,
        api_method_callback: api_callback_name,
        assert_result_message: "",
        isMessage: true,
        isPresence: false,
        isAPS: false,
        channel_group: null,
        channel: null,
        channel_group_presence: null,
        channel_presence: null,
        timetoken: null,
        uuid: null,
        payload: param_1,
        param_1_type: typeof param_1,
        param_2_type: typeof param_2,
        param_3_type: typeof param_3,
        param_4_type: typeof param_4
    };

    var check_if_presence = function(msg,a,b,c) {
        if ('type')
        if ('action' in msg && 'occupancy' in msg && 'timestamp' in msg && 'uuid' in msg) {
            analysis.message_type = "presence";
            analysis.isMessage = false;
            analysis.isPresence = true;
            // if it was received on channel, not channel group
            if (a.length === 3) {
                analysis.channel_presence = a[2];
                analysis.channel = a[2].replace('-pnpres', '');
            }
            // if it was received through channel group
            else {
                analysis.channel_group_presence = b[2];
                analysis.channel_presence = b[3];

                analysis.channel_group = a[2].replace('-pnpres', '');
                analysis.channel = a[3].replace('-pnpres', '');
            }
            analysis.uuid = msg.uuid;
            analysis.timetoken = b[1];
        }
    };

    var check_if_error = function(msg,a,b,c) {
        if ('type' in msg && msg.type === "error") {
            analysis.message_type = "error";
            analysis.isPresence = false;
            analysis.isMessage = false;
        }
    };


    check_if_presence(param_1, param_2, param_3, param_4);
    check_if_error(param_1, param_2, param_3, param_4);

    if (analysis.expected_type === analysis.message_type) {
        analysis.assert_result_message = "Callback Result Correct";
    }
    else {
        analysis.assert_result_message = "Callback Result Incorrect";
    }

    analysis.assert_result_message += " Response " + api_method_name + "." + api_callback_name + " [" + analysis.expected_type + "][" + analysis.message_type + "]";

    self.push(analysis.expected_type === analysis.message_type, analysis.message_type, analysis.expected_type, analysis.assert_result_message );

    console.log("\tMessage Analysis: ", analysis);
    return analysis;
};

QUnit.assert.contains = function( value, expected, message ) {
    var actual = null;
    var self = this;

    if (_.isArray(value)) {
        if (_.contains(value, expected)) {
            actual = expected;
        }
        this.push( actual === expected, actual, expected, message );
    }
    else if (_.isObject(value)) {
        _.forEach(_.keys(expected), function(k) {
            if (_.has(value, k)) {
                actual = value[k];
                self.push( actual === expected[k], actual, expected[k], message );
            }
            else {
                actual = -9999999999;
                self.push( actual === expected[k], actual, expected[k], message );
            }
        });
    }
};

QUnit.assert.contains_keys = function(required_keys_array, object_to_check) {
    var self = this;

    var keys = _.keys(object_to_check);
    var insc = _.intersection(required_keys_array,_.keys(object_to_check));
    var diff = _.difference(required_keys_array,insc);

    //console.log(keys);
    //console.log(insc);
    //console.log(diff);
    //console.log(_.isEmpty(diff));

    if (_.keys(object_to_check).length < required_keys_array.length) {
        self.push(false, _.keys(object_to_check), required_keys_array, "Required Keys not present in Object");
    }
    else if (!_.isEmpty(diff)) {
        self.push(false, _.keys(object_to_check), required_keys_array, "Required Keys not present in Object");
    }
    else {
        self.push(true, _.keys(object_to_check), required_keys_array, "Required Keys Present in Object");
    }

};

// Clear Default Config Params
QUnit.config.urlConfig = [];

QUnit.config.urlConfig.push({
    id: "channel_module",
    label: "Channel Module",
    value: ["Single_Channel", "Channel_List", "Channel_Array", "Channel_Group"],
    tooltip: "Select the subset of tests to run for channel structure"
});

QUnit.config.urlConfig.push({
    id: "js_sdk",
    label: "SDK Version",
    value: [ "3.7.7", "3.7.6", "3.7.5", "3.7.2", "3.7.0", "3.6.1", "3.5.48", "3.5.47", "DEV", "pubnub.js" ],
    tooltip: "Which JS SDK To Test Against"
});

QUnit.config.urlConfig.push({
    id: "min",
    label: "Minified",
    value: "true",
    tooltip: "Load minified source files instead of the regular unminified ones"
});

//QUnit.config.urlConfig.push({
//    id: "pubnub_reset",
//    label: "Reset PubNub Between Tests",
//    value: "true",
//    tooltip: "Reset the PubNub object and call PUBNUB.init between tests"
//});

var channel_module = getParameterByName('channel_module');
var sdk_version = getParameterByName('js_sdk');
var page = window.location.pathname.split("/").pop();
var module = null;

if (page == "index-cleanup.html") {
    module = "tests/test-cleanup";
}
else if (page === "index.html") {
    module = null;
}
else {
    module = "tests/" + page.replace("index-", "").replace(".html", "") + "-" + channel_module.toLowerCase();
    $("#qunit-header").text($("#qunit-header").text() + " - " + channel_module.replace("_", " "));
    document.title = document.title + " - " + channel_module.replace("_", " ");
}



if (_.isEmpty(channel_module) && _.isEmpty(sdk_version)) {
    channel_module = _.find(QUnit.config.urlConfig, { id: "channel_module" }).value[0];
    sdk_version = _.find(QUnit.config.urlConfig, { id: "js_sdk" }).value[0];
    window.location.replace(window.location + "?channel_module=" + channel_module + "&js_sdk=" + sdk_version);
}
else if (_.isEmpty(channel_module)) {
    channel_module = _.find(QUnit.config.urlConfig, { id: "channel_module" }).value[0];
    window.location.replace(window.location + location.search + "channel_module=" + channel_module);
}
else if (_.isEmpty(sdk_version)) {
    sdk_version = _.find(QUnit.config.urlConfig, { id: "js_sdk" }).value[0];
    window.location.replace(window.location + location.search + "&js_sdk=" + sdk_version);
}

sdk_version = sdk_version.replace(".min.js", "");
sdk_version = sdk_version.replace(".js", "");

var minified = getParameterByName('min');
minified = _.isEmpty(minified) ? '' : (minified === 'true' ? '.min' : '');

var filename, fileref = null;

if (sdk_version.indexOf("http") === 0 || sdk_version.indexOf("//") === 0) {
    filename = decodeURIComponent(sdk_version) + minified + ".js";
    fileref = document.createElement('script');
    fileref.setAttribute("type","text/javascript");
    fileref.setAttribute("src", filename);
}
else if (sdk_version === "DEV") {
    filename = "//rawgit.com/pubnub/javascript/develop/web/pubnub" + minified + ".js";
    fileref = document.createElement('script');
    fileref.setAttribute("type","text/javascript");
    fileref.setAttribute("src", filename);
}
else if (sdk_version === "pubnub") {
    filename = "//cdn.pubnub.com/pubnub" + minified + ".js";
    fileref = document.createElement('script');
    fileref.setAttribute("type","text/javascript");
    fileref.setAttribute("src", filename);
}
else {
    fileref = document.createElement('script');
    fileref.setAttribute("type","text/javascript");
    fileref.setAttribute("src", "//cdn.pubnub.com/pubnub-" + sdk_version + minified + ".js");
}

console.clear();

if (!_.isEmpty(module)) {

    require(
        [ module ],
        function() {
            setTimeout(function(){
                console.log(" ");
                console.info("PAGE: ", page);
                console.info("MODULE: ", module + ".js");
                console.info("SDK VERSION: ", sdk_version);
                console.info("MINIFIED: ", minified === ".min");
                document.getElementsByTagName("head")[0].appendChild(fileref);
                var PB_CHECK = setInterval(function() {
                    if (_.isUndefined(PUBNUB) || _.isNull(PUBNUB)) {
                        console.error("PUBNUB LIBRARY WASN'T LOADED: ", fileref, " CHECK AGAIN IN 1 SECOND");
                    }
                    else {
                        clearInterval(PB_CHECK);
                        console.info("SDK REPORTED VERSION: ", PUBNUB.get_version());
                        console.info("SDK TAG: ", fileref);
                        console.log(" ");
                        QUnit.start();
                    }
                }, 1000);

            }, 1000);
        }
    );
}

