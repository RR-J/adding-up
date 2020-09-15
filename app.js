'use strict';
// fs(file system)モジュールを読み込んで使えるようにする
const fs = require('fs');
// readlineモジュールを読み込んで使えるようにする
const readline = require('readline');
// pupu-pref.csvをファイルとして読み込める状態に準備する
const rs = fs.createReadStream('./popu-pref.csv');
// readlineモジュールにfsを設定する
const rl = readline.createInterface({input: rs, output: {} });
const prefectureDateMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト
// pupu-pref.csvのデータを1行ずつ読み込んで、設定された関数を実行する
rl.on('line', lineString => {
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    if (year === 2010 || year === 2015) {
        // 都道府県ごとのデータを作る
        let value = prefectureDateMap.get(prefecture);
        // データがなかったら初期化
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDateMap.set(prefecture, value);
    }
});
rl.on ('close', () => {
    // 全データをループして変化率を計算
    for (let [key, data] of prefectureDateMap) {
        data.change = data.popu15 / data.popu10;
    }
    // 並び替えを行う
    const rankingArray = Array.from(prefectureDateMap).sort((pair1, pair2) => {
        // 引き算の結果、マイナスなら降順、プラスなら昇順に入れ替え
        return pair2[1].change - pair1[1].change; 
    });
    const rankingStrings = rankingArray.map(([key, value]) => {
        return (
            `${key}:${value.popu10}=>${value.popu15} 変化率:${value.change}`
          );
    });
    console.log(rankingStrings);
});
