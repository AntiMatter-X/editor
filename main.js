(function() {
    'use strict';
    //--------------------------------------------------
    var h = $("<div>").css({
        backgroundColor: "lightgray",
        borderRadius: "25px",
        padding: "1em"
    }).appendTo("body");
    $("<h1>").text($("title").text()).appendTo(h);
    var desc = $("<div>").text("参考にしたページ: ").css({
        backgroundColor: "darkgray",
        fontSize: "12px",
        borderRadius: "25px",
        padding: "1em"
    }).appendTo(h);
    $("<a>", {
        href: "https://yaju1919.github.io/edita/",
        target: "_blank"
    }).text("HTML & JavaScript エディタ").appendTo(desc);
    h.append("<hr>");
    //--------------------------------------------------
    var tools = $("<div>").css("padding", "0 0 5px 0").appendTo(h),
        inputPrettifyBool = antimatterx.addInputBool(h, {
            title: "構文強調",
            value: false,
            change: function(flag) {
                switchPrettify(flag);
            }
        });
    h.append("<hr>");
    var area = {
            JavaScript: $("<div>"),
            HTML: $("<div>"),
            CSS: $("<div>")
        },
        inputJS = antimatterx.addInputText(area.JavaScript, {
            save: "inputJS",
            placeholder: "JavaScriptを入力",
            width: "100%",
            textarea: true,
            trim: false,
            hankaku: false
        }),
        inputHTML = antimatterx.addInputText(area.HTML, {
            save: "inputHTML",
            placeholder: "HTMLを入力",
            width: "100%",
            textarea: true,
            trim: false,
            hankaku: false
        }),
        inputCSS = antimatterx.addInputText(area.CSS, {
            save: "inputCSS",
            placeholder: "CSSを入力",
            width: "100%",
            textarea: true,
            trim: false,
            hankaku: false
        }),
        jsResult = $("<div>"),
        htmlResult = $("<div>");
    jsResult.add(htmlResult).css({
        width: "100%",
        maxHeight: $(window).height() / 3,
        padding: "1em",
        boxSizing: "border-box",
        overflow: "visible scroll"
    });
    for (var k in area) {
        if (k === "JavaScript") jsResult.appendTo(area[k]);
        else if (k === "HTML") htmlResult.appendTo(area[k]);
        area[k].find("textarea").css({
            backgroundColor: "black",
            color: "lightblue",
            padding: "1em",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflowY: "scroll"
        });
    };
    var tabs = antimatterx.addTab(h, {
            list: area
        }),
        code = $("<pre>", {
            class: "prettyprint linenums"
        }).appendTo(h).hide();
    tabs.children("div").eq(0).find("button").each(function(i, e) {
        e.addEventListener("click", function() {
            inputFormatBool[e.textContent === "JavaScript" ? "show" : "hide"]();
        });
    });
    //--------------------------------------------------
    var basicToolButton = {
        "実行": run,
        "クリア": clearResult,
        "入力クリア": clearInput,
        "コピー": copyCode
    };
    for (var k in basicToolButton) antimatterx.addButton(tools, {
        title: k,
        click: basicToolButton[k]
    });
    var inputFormatBool = antimatterx.addInputBool(tools, {
        save: "inputFormatBool",
        title: "自動コード整形",
        value: false,
        change: function(flag) {
            formatCode(flag);
        }
    });
    inputJS.on("keyup", function(e) {
        if ("}];".indexOf(e.key) !== 1) formatCode(inputFormatBool.find("input[type='checkbox']").prop("checked"));
    });
    tools.append("<hr>");
    var selectFileType = antimatterx.addSelect(tools, {
            title: "ファイル形式",
            placeholder: "ファイルの形式を選択",
            save: "selectFileType",
            list: {
                "テキスト": 0,
                "画像": 1
            }
        }).val("0"),
        fileButton = {
            "インポート": function() {
                $("<input>", {
                    type: "file"
                }).on("change", function(e) {
                    var file = e.target.files[0],
                        elm = area[getCurrentTabName()].find("textarea");
                    if (selectFileType.val() === "0") {
                        var reader = new FileReader();
                        reader.readAsText(file);
                        reader.onload = function() {
                            elm.val(reader.result);
                            saveCurrentTabInput();
                        };
                    } else antimatterx.toImage.decode(file, function(v) {
                        elm.val(v);
                        saveCurrentTabInput();
                    });
                }).click();
            },
            "エクスポート": function() {
                var currentTabName = getCurrentTabName(),
                    title = currentTabName.replace(/[a-z]/g, "").toLowerCase() + "-" + antimatterx.randStr(antimatterx.makeBaseStr(16), 32),
                    elm = area[currentTabName].find("textarea");
                if (elm.val().length === 0) return;
                if (selectFileType.val() === "0") antimatterx.download.text(title, elm.val());
                else antimatterx.toImage.encode(elm.val(), function(v) {
                    antimatterx.download.image(title, v);
                });
            }
        };
    for (var k in fileButton) antimatterx.addButton(tools, {
        title: k,
        click: fileButton[k]
    });
    tools.append("<hr>").find("button").css("margin", "1px");
    //--------------------------------------------------
    function disableElement(h, bool) { // 指定要素内の要素を無効化する
        h.find("*").each(function(i, e) {
            e.disabled = bool;
        });
    };

    function getCurrentTabName() { // 現在のタブ名を取得する
        return Array.prototype.slice.call(tabs.children("div").eq(0).find("button")).filter(function(e) {
            return e.style.backgroundColor === "yellow" ? true : false;
        })[0].textContent;
    };

    function saveCurrentTabInput() { // 現在のタブの入力欄の値を保存する
        var currentTabName = getCurrentTabName(),
            elm = area[currentTabName].find("textarea");
        antimatterx.save("input" + currentTabName.replace(/[a-z]/g, ""), elm.val());
    };

    function run() { // 入力コードを実行する
        var currentTabName = getCurrentTabName();
        if (currentTabName === "JavaScript") {
            clearResult();
            try {
                console.log((0, eval)(inputJS.val()));
            } catch (e) {
                console.error(e);
            };
        } else if (currentTabName === "HTML") htmlResult.html(inputHTML.val());
        else g_styles.push($("<style>", {
            type: "text/css"
        }).text(inputCSS.val()).appendTo("body"));
    };

    function clearResult() { // 結果をクリアする
        var currentTabName = getCurrentTabName();
        if (currentTabName === "JavaScript") {
            clearAllInterval();
            jsResult.empty();
            g_lineCount = 0;
        } else if (currentTabName === "HTML") htmlResult.empty();
        else
            while (g_styles.length) g_styles.pop().remove();
    };

    function clearInput() { // 入力コードをクリアする
        area[getCurrentTabName()].find("textarea").val("");
        saveCurrentTabInput();
    };

    function copyCode() { // 入力コードをコピーする
        antimatterx.copy(area[getCurrentTabName()].find("textarea").val());
        alert("コードをコピーしました");
    };

    function switchPrettify(flag) { // 構文強調を切り替える
        if (inputPrettifyBool === undefined) return;
        var currentTabName = getCurrentTabName();
        disableElement(tools, flag);
        disableElement(tabs.children("div").eq(0), flag);
        if (flag) {
            area[currentTabName].hide();
            code.text(area[currentTabName].find("textarea").val()).show();
            PR.prettyPrint()
        } else {
            code.empty().removeClass("prettyprinted").hide();
            area[currentTabName].show();
        };
    };

    function formatCode(flag) { // JavaScriptの入力コードを整形
        if (!flag || getCurrentTabName === "JavaScript") return;
        inputJS.val(js_beautify(inputJS.val(), {
            max_preserve: 2
        }));
        saveCurrentTabInput();
    };
    //--------------------------------------------------
    var g_lineCount = 0, // コンソールの行数
        g_styles = [], // 反映したCSSを格納
        clearAllInterval = (function() {
            // setTimeoutとsetIntervalをコピー
            var setTimeout_copy = window.setTimeout,
                setInterval_copy = window.setInterval;
            //--------------------------------------------------
            var setIds = []; // 時間差関数のidを格納
            window.setTimeout = function(func, delay, param1, param2, param3) {
                var id = setTimeout_copy(func, delay, param1, param2, param3);
                setIds.push(id);
                return id;
            };
            window.setInterval = function(func, delay, param1, param2, param3) {
                var id = setInterval_copy(func, delay, param1, param2, param3);
                setIds.push(id);
                return id;
            };
            return function() { // 時間差関数を全てクリアする
                while (setIds.length) clearInterval(setIds.pop());
            };
        })();
    (function() {
        function addResult(str, back, color, symbol) {
            var line = $("<div>").css({
                    backgroundColor: back,
                    color: color,
                    textAlign: "left",
                    maxWidth: "100%"
                }).appendTo(jsResult),
                symbolColor = antimatterx.getCSS(line).backgroundColor.match(/[0-9]+/g).map(function(v, i) {
                    var n = Number(v),
                        d = (n - n * 0.1);
                    return d >= 0 ? d : 0;
                });
            $("<div>").text(symbol || g_lineCount++).css({
                backgroundColor: "rgb(" + symbolColor + ")",
                width: "3em",
                textAlign: "center"
            }).appendTo(line);
            $("<div>").text(str).css("margin-left", "1em").appendTo(line);
            line.find("div").css("display", "inline-block");
        };
        var list = { // back, color, symbol
                log: ["white", "black", ""],
                error: ["pink", "red", "×"],
                warn: ["lightyellow", "orange", "▲"],
                info: ["lightblue", "blue", "●"]
            },
            origin = {};
        if (!window.console) window.console = {};
        for (var k in list) {
            origin[k] = window.console[k] || function() {};
            var arr = list[k];
            window.console[k] = (function() {
                var key = k,
                    back = arr[0],
                    color = arr[1],
                    symbol = arr[2];
                return function() {
                    var args = arguments;
                    origin[key].apply(console, args);
                    var str = antimatterx.makeArray(args.length).map(function(i) {
                        var x = args[i];
                        if (antimatterx.judgeType(x, "Object")) return "{" + Object.keys(x).map(function(k) {
                            return k + ":" + String(x[k]);
                        }).join(",") + "}";
                        else if (antimatterx.judgeType(x, "Array")) return "[" + String(x) + "]";
                        else if (!antimatterx.judgeType(x, ["Number", "String", "RegExp", "Boolean", "Error"])) return antimatterx.getType(x);
                        return String(x);
                    }).join(", ");
                    addResult(str, back, color, symbol);
                };
            })();
        };
    })();
    (function() { // js-beautifyをIEでも使えるようにする
        if (antimatterx.judgeType(Object.assign, "Function")) return;
        Object.defineProperty(Object, "assign", { // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
            value: function assign(target, varArgs) {
                if (target === null || target === undefined) throw new TypeError("Cannot convert undefined or null to object");
                var to = Object(target);
                for (var i = 1; i < arguments.length; i++) {
                    var nextSource = arguments[i];
                    if (nextSource !== null && nextSource !== undefined)
                        for (var k in nextSource)
                            if (Object.prototype.hasOwnProperty.call(nextSource, k)) to[k] = nextSource[k];
                };
                return to;
            },
            writable: true,
            configurable: true
        });
    })();
    //--------------------------------------------------
})();
