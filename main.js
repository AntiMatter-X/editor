(function() {
    'use strict';
    //////////////////////////////////////////////////
    var clearAllInterval; // setIntervalを全てクリアする関数を入れる変数
    (function() {
        // setTimeoutとsetIntervalをコピー
        var setTimeout_copy = window.setTimeout;
        var setInterval_copy = window.setInterval;
        //-----------------------------
        var ids = [];
        clearAllInterval = function() {
            while (ids.length) clearInterval(ids.pop());
        };
        window.setTimeout = function(func, delay, param1, param2, param3) {
            var id = setTimeout_copy(func, delay, param1, param2, param3);
            ids.push(id);
            return id;
        };
        window.setInterval = function(func, delay, param1, param2, param3) {
            var id = setInterval_copy(func, delay, param1, param2, param3);
            ids.push(id);
            return id;
        };
    })();
    (function() {
        function addResult(text, back, fontColor, symbol) {
            var line = $("<div>").css({
                backgroundColor: back,
                color: fontColor,
                textAlign: "left",
                maxWidth: "100%"
            }).appendTo("#result");
            var color = yaju1919.getCSS(line).backgroundColor.match(/[0-9]+/g).map(function(v, i) {
                var n = Number(v);
                var d = (n - n * 0.1);
                return d >= 0 ? d : 0;
            });
            $("<div>").text(symbol).css({
                backgroundColor: "rgb(" + color + ")",
                width: "4em",
                textAlign: "center"
            }).appendTo(line);
            $("<div>").text(text).css("margin-left", "1em").appendTo(line);
            line.find("div").css("display", "inline-block");
        };
        var list = { // back, fontColor, symbol
            log: ["white", "black", "LOG"],
            error: ["pink", "red", "ERROR"],
            warn: ["lightyellow", "orange", "WARN"],
            info: ["lightblue", "blue", "INFO"]
        };
        var origin = {};
        if (!window.console) window.console = {};
        for (var k in list) {
            origin[k] = window.console[k] || function() {};
            var aarr = list[k]; // aarr!!!
            window.console[k] = (function() {
                var key = k,
                    back = aarr[0],
                    fontColor = aarr[1],
                    symbol = aarr[2];
                return function() {
                    var args = arguments;
                    origin[key].apply(console, args);
                    var str = yaju1919.makeArray(args.length).map(function(i) {
                        var x = args[i];
                        if (yaju1919.judgeType(x, "Object")) {
                            return "{" + Object.keys(x).map(function(k) {
                                return k + ":" + String(x[k])
                            }).join(",") + "}";
                        } else if (yaju1919.judgeType(x, "Array")) {
                            return "[" + String(x) + "]";
                        } else if (!yaju1919.judgeType(x, ["Number", "String", "RegExp", "Boolean", "Error"])) return yaju1919.getType(x);
                        return String(x);
                    }).join(", ");
                    addResult(str, back, fontColor, symbol);
                };
            })();
        };
    })();
    //////////////////////////////////////////////////
    var h = $("<div>").css({
        backgroundColor: "lightgray",
        borderRadius: "25px",
        padding: "1em"
    }).appendTo("body");
    $("<h1>").text($("title").text()).appendTo(h);
    var desc = $("<div>").text("参考にしたページ: ").css({
        backgroundColor: "darkgray",
        fontSize: "10px",
        borderRadius: "25px",
        padding: "1em"
    }).appendTo(h);
    $("<a>", {
        href: "https://yaju1919.github.io/edita/"
    }).text("HTML & JavaScript エディタ").appendTo(desc);
    h.append("<hr>");
    //////////////////////////////////////////////////
    var tools = $("<div>").css("padding", "0 0 5px 0").appendTo(h);
    var inputPrettifyBool = yaju1919.addInputBool(h, {
        title: "構文強調",
        value: false,
        change: togglePrettify
    });
    h.append("<hr>");
    var inputJs = yaju1919.addInputText(h, {
        save: "inputJs",
        id: "js",
        placeholder: "JavaScriptのコードを入力",
        width: "100%",
        textarea: true,
        trim: false,
        hankaku: false
    });
    $("#js").css({
        backgroundColor: "black",
        color: "lightblue",
        padding: "1em",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowY: "scroll"
    }).on("keyup", function(e) {
        if ("}];".indexOf(e.key) !== -1) formatCode();
    });
    var result = $("<div>", {
        id: "result"
    }).css({
        width: "100%",
        maxHeight: $(window).height() / 3,
        padding: "1em",
        boxSizing: "border-box",
        overflow: "visible scroll"
    }).appendTo(h);
    $("<pre>", {
        id: "code",
        class: "prettyprint linenums"
    }).appendTo(h).hide();
    //////////////////////////////////////////////////
    addBtn(tools, "実行", run);
    addBtn(tools, "クリア", clearConsole);
    addBtn(tools, "入力クリア", function() {
        $("#js").val("");
        yaju1919.save("inputJs", $("#js").val());
    });
    addBtn(tools, "コピー", function() {
        yaju1919.copy($("#js").val());
    });
    var inputFormatBool = yaju1919.addInputBool(tools, {
        save: "inputFormatBool",
        id: "format-btn",
        title: "自動コード整形",
        value: false,
        change: formatCode
    });
    tools.find("button").css("margin", "1px");
    //////////////////////////////////////////////////
    function addBtn(h, title, func) {
        return $("<button>").text(title).click(func).appendTo(h);
    };

    function formatCode() {
        if (inputFormatBool === undefined) return;
        if (!inputFormatBool()) return;
        $("#js").val(js_beautify($("#js").val(), {
            max_preserve_newlines: 2
        }));
    };

    function clearConsole() {
        clearAllInterval();
        $("#result").empty();
    };

    function run() {
        clearConsole();
        try {
            console.log((0, eval)($("#js").val()));
        } catch (e) {
            console.error(e);
        };
    };

    function disableElement(h, bool) {
        h.find("*").each(function(i, e) {
            e.disabled = bool;
        });
    };

    function togglePrettify() {
        if (inputPrettifyBool === undefined) return;
        if (inputPrettifyBool()) {
            disableElement(tools, true);
            $("#js").hide();
            $("#result").hide();
            $("#code").show().text($("#js").val());
            PR.prettyPrint()
        } else {
            disableElement(tools, false);
            $("#code").hide().empty().removeClass("prettyprinted");
            $("#result").show();
            $("#js").show();
        };
    };
    //////////////////////////////////////////////////
})();
