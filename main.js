(function() {
    'use strict';
    //////////////////////////////////////////////////
    var lineCount = 0;
    var clearAllInterval = (function() {
        // setTimeoutとsetIntervalをコピー
        var setTimeout_copy = window.setTimeout;
        var setInterval_copy = window.setInterval;
        //-----------------------------
        var ids = [];
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
        return function() { // setIntervalを全てクリアする関数
            while (ids.length) clearInterval(ids.pop());
        };
    })();
    (function() {
        function addResult(text, back, color, symbol) {
            var line = $("<div>").css({
                backgroundColor: back,
                color: color,
                textAlign: "left",
                maxWidth: "100%"
            }).appendTo("#result");
            var symbolColor = yaju1919.getCSS(line).backgroundColor.match(/[0-9]+/g).map(function(v, i) {
                var n = Number(v);
                var d = (n - n * 0.1);
                return d >= 0 ? d : 0;
            });
            $("<div>").text(symbol || lineCount++).css({
                backgroundColor: "rgb(" + symbolColor + ")",
                width: "3em",
                textAlign: "center"
            }).appendTo(line);
            $("<div>").text(text).css("margin-left", "1em").appendTo(line);
            line.find("div").css("display", "inline-block");
        };
        var list = { // back, color, symbol
            log: ["white", "black", ""],
            error: ["pink", "red", "×"],
            warn: ["lightyellow", "orange", "▲"],
            info: ["lightblue", "blue", "●"]
        };
        var origin = {};
        if (!window.console) window.console = {};
        for (var k in list) {
            origin[k] = window.console[k] || function() {};
            var aarr = list[k]; // aarr!!!
            window.console[k] = (function() {
                var key = k,
                    back = aarr[0],
                    color = aarr[1],
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
                        } else if (yaju1919.judgeType(x, "Array")) return "[" + String(x) + "]";
                        else if (!yaju1919.judgeType(x, ["Number", "String", "RegExp", "Boolean", "Error"])) return yaju1919.getType(x);
                        return String(x);
                    }).join(", ");
                    addResult(str, back, color, symbol)
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
    var desc = $("<div>").text("参考ページ: ").css({
        backgroundColor: "darkgray",
        fontSize: "12px",
        borderRadius: "25px",
        padding: "1em"
    }).appendTo(h);
    $("<a>", {}).text("HTML & JavaScript エディタ").appendTo(desc);
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
    addBtn(tools, "入力クリア", clearInput);
    addBtn(tools, "コピー", copyCode);
    var inputFormatBool = yaju1919.addInputBool(tools, {
        save: "inputFormatBool",
        id: "format-btn",
        title: "自動コード整形",
        value: false,
        change: formatCode
    });
    tools.find("button").css("margin", "1px");
    //////////////////////////////////////////////////
    function addBtn(h, title, func) { // ボタンを追加する関数
        return $("<button>").text(title).click(func).appendTo(h);
    };

    function disableElement(h, bool) { // 要素を無効化する関数
        h.find("*").each(function(i, e) {
            e.disabled = bool;
        });
    };

    function formatCode() { // 入力コードを整形する関数
        if (inputFormatBool === undefined) return;
        if (!inputFormatBool()) return;
        $("#js").val(js_beautify($("#js").val(), {
            max_preserve_newlines: 2
        }));
    };

    function clearInput() { // コード入力欄を空にする関数
        $("#js").val("");
        yaju1919.save("inputJs".$("#js").val());
    };

    function copyCode() { // 入力コードをコピーする関数
        yaju1919.copy($("#js").val());
        alert("コードをコピーしました");
    };

    function clearConsole() { // 結果をクリアする関数
        clearAllInterval();
        $("#result").empty();
        lineCount = 0;
    };

    function run() { // 入力コードを実行する関数
        clearConsole();
        try {
            console.log((0, eval)($("#js").val()));
        } catch (e) {
            console.error(e)
        };
    };

    function togglePrettify() { // 構文強調を切り替える関数
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
