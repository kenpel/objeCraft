(function() {
    var IR_url = "http://www.dream-pro.info/~lavalse/LR2IR/search.cgi?mode=ranking&bmsmd5=";
    var xhr = new XMLHttpRequest();

    // 難易度表データjsonを取得してテーブル生成関数を呼び出す
    var header_url = document.querySelector("meta[name='bmstable']").content;
    xhr.open("GET", header_url);
    xhr.onload = function() {
        var header = JSON.parse(xhr.response);
        xhr.open("GET", header.data_url);
        xhr.onload = function() {
            var data = JSON.parse(xhr.response);
            makeBMSTable(data, header.symbol);
        };
        xhr.send();
    };
    xhr.send();

    // テーブル生成関数
    function makeBMSTable(rows, symbol) {
        // 進捗初期設定
        var progress = document.querySelector("#difficulty_table progress");
        progress.max = rows.length - 1;

        // 難易度表データ注入
        var tbody = document.querySelector("#difficulty_table > tbody");
        tbody.innerHTML = rows.reduce(function(acc, row, idx, array) {
            // 進捗どうですか
            progress.value = idx;

            // レベル区切りのキャプションを生成
            if (idx === 0 || row.level !== array[idx - 1].level) {
                var count = array.filter(function(arr) {
                    return arr.level === row.level;
                }).length;

                acc += (
                    "<tr id='" + symbol + row.level +
                    "' class='tr_separate'><th colspan='6'>" + symbol + row.level +
                    " (" + count + "譜面)"
                );
            }

            // 譜面データ行を生成
            return acc + (
                "<tr class='tr_normal' title='" + symbol + row.rawlevel + "'><td>" + symbol + row.level +
                "<td><a href='" + IR_url + row.md5 + "' target='_blank'>" + escapeEntity(row.title) +
                "<\/a><td>" + escapeEntity(row.artist) +
                "<td><a href='" + row.url + "' target='_blank'>" + row.url +
                "<td><a href='" + row.url_diff + "' target='_blank'>" + row.url_diff +
                "<td>" + escapeEntity(row.comment)
            );
        }, "");

        // 進捗爆破
        progress.parentNode.removeChild(progress);

        function escapeEntity(str) {
            str = str.replace(/</g, "&lt;");
            str = str.replace(/>/g, "&gt;");
            return str;
        }
    }
})();