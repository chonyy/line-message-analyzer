const swup = new Swup();
content = ""
console.log("testing3")
if (document.getElementById("file")) {
    var file = document.getElementById("file");
    file.addEventListener("change", getFile);

}

function getFile() {
    var fr = new FileReader();
    fr.onload = function () {
        content = this.result;
        changePage();
    }
    fr.readAsText(this.files[0]);
}

async function samplefile() {
    var text = await fetch('./sample.txt');
    content = (await text.text());
    changePage();
}

function changePage() {
    // var url = (window.screen.width > 768) ? '/analyze.html' : 'analyze_mobile.html'
    swup.loadPage({
        url: './analyze.html', // route of request (defaults to current url)
        method: 'GET', // method of request (defaults to "GET")
        data: "", // data passed into XMLHttpRequest send method
        customTransition: '' // name of your transition used for adding custom class to html element and choosing custom animation in swupjs (as setting data-swup-transition attribute on link)
    });
}

document.addEventListener('swup:contentReplaced', (event) => {
    if (document.querySelector('[chat-title]'))
        analyse();
});

var chatname = ""
var environment = 0;
var moreThanAHour = 0;
var messageInADayAll = [];
var callTimeInADay = [];
var callSecondInADay = [];
var members = [];
var maxCallTime = new Array(3).fill(0);
var maxCallDate = "";
var dates = [];
var lines;
var length;
var date;
var message;
var memberMessageList = {};
var dayTime = {
    hour: 0,
    min: 0,
    sec: 0,
    calls: 0
};
var time = {
    hour: 0,
    min: 0,
    sec: 0,
    calls: 0
};
var memberMessageNum = {};
var maxDate = "";
var eachMemberMessages = new Array(500).fill(0);
var eachMemberStickers = new Array(500).fill(0);
var eachMemberPhotos = new Array(500).fill(0);
var maxMessage = 0;
var totalDays = 0;
var totalMessages = 0;
var messageNumAll = 0;
var unsent = 0;

var options = { minimumCount: 30 };

function processlist(cloudlist) {
    var newlist = []
    var maxfontsize = (window.screen.width > 768) ? 80 : 20
    for (i = 0; i < cloudlist.length; i++) {
        var validkey = 1
        for (j = 0; j < members.length; j++) {
            if ((members[j] == cloudlist[i][0]) || members[j].includes(cloudlist[i][0]) || cloudlist[i][0].includes(members[j]) || cloudlist[i][0].includes("貼圖") || cloudlist[i][0].includes("照片") || cloudlist[i][0].includes("上午") || cloudlist[i][0].includes("下午") || cloudlist[i][0].includes("通話") || cloudlist[i][0].includes("未接來電") || cloudlist[i][0].includes("時間")) {
                validkey = 0;
            }
        }
        if (validkey)
            newlist.push(cloudlist[i])
    }
    // console.log(newlist)
    var max = 0;
    for (var i = 0; i < newlist.length; i++) {
        if (newlist[i][1] > max)
            max = newlist[i][1];
    }
    var ratio = max / maxfontsize;
    // console.log(ratio);
    for (var i = 0; i < newlist.length; i++) {
        newlist[i][1] = Math.round(newlist[i][1] / ratio);
    }

    return newlist
}

function getMaxCallTime(time) {
    if (parseInt(time.hour) > parseInt(maxCallTime[0])) {
        maxCallTime[0] = time.hour;
        maxCallTime[1] = time.min;
        maxCallTime[2] = time.sec;
        maxCallDate = dates[dates.length - 1];
    }
    else if (parseInt(time.hour) == parseInt(maxCallTime[0]) && parseInt(time.min) > parseInt(maxCallTime[1])) {
        maxCallTime[0] = time.hour;
        maxCallTime[1] = time.min;
        maxCallTime[2] = time.sec;
        maxCallDate = dates[dates.length - 1];
    }
    else if (parseInt(time.hour) == parseInt(maxCallTime[0]) && parseInt(time.min) == parseInt(maxCallTime[1]) && parseInt(time.sec) > parseInt(maxCallTime[2])) {
        maxCallTime[0] = time.hour;
        maxCallTime[1] = time.min;
        maxCallTime[2] = time.sec;
        maxCallDate = dates[dates.length - 1];
    }
    // console.log([maxCallTime[0], maxCallTime[1], maxCallTime[2]]);

}

function addTime(splited, time) {
    // console.log(splited, maxCallTime);
    if (splited.length == 2) {
        time.sec += parseInt(splited[1]);
        time.min += parseInt(splited[0]);
        if (!moreThanAHour) {
            if (parseInt(splited[0]) > parseInt(maxCallTime[1])) {
                maxCallTime[1] = splited[0];
                maxCallTime[2] = splited[1];
                maxCallDate = dates[dates.length - 1];
            }
            else if (parseInt(splited[0]) == parseInt(maxCallTime[1]) && parseInt(splited[1]) > parseInt(maxCallTime[2])) {
                maxCallTime[1] = splited[0];
                maxCallTime[2] = splited[1];
                maxCallDate = dates[dates.length - 1];
            }
        }
    }
    else if (splited.length == 3) {
        moreThanAHour = 1;
        time.sec += parseInt(splited[2]);
        time.min += parseInt(splited[1]);
        time.hour += parseInt(splited[0]);
        if (parseInt(splited[0]) > parseInt(maxCallTime[0])) {
            maxCallTime[0] = splited[0];
            maxCallTime[1] = splited[1];
            maxCallTime[2] = splited[2];
            maxCallDate = dates[dates.length - 1];
        }
        else if (parseInt(splited[0]) == parseInt(maxCallTime[0]) && parseInt(splited[1]) > parseInt(maxCallTime[1])) {
            maxCallTime[0] = splited[0];
            maxCallTime[1] = splited[1];
            maxCallTime[2] = splited[2];
            maxCallDate = dates[dates.length - 1];
        }
        else if (parseInt(splited[0]) == parseInt(maxCallTime[0]) && parseInt(splited[1]) == parseInt(maxCallTime[1]) && parseInt(splited[2]) > parseInt(maxCallTime[2])) {
            maxCallTime[0] = splited[0];
            maxCallTime[1] = splited[1];
            maxCallTime[2] = splited[2];
            maxCallDate = dates[dates.length - 1];
        }
    }
    time.calls++;
}

function getCallTime(line, time) {
    if (line.split(/(\s+)/)[4] == "通話時間") {
        var splitedAndroid = line.split(/(\s+)/)[6].split(":");
        addTime(splitedAndroid, time);
        if (!environment)
            environment = 1;
    }
    else if (line.split(/(\s+)/)[6] != undefined) {
        if (line.split(/(\s+)/)[6].substring(0, 4) == "通話時間") {
            var beforeSplited = line.split(/(\s+)/)[6].substring(4, line.split(/(\s+)/)[6].length);
            var splitedIOS = beforeSplited.split(":");
            addTime(splitedIOS, time);
            if (!environment)
                environment = 2;
        }
    }
}

function adjustTime(time) {
    time.min += parseInt(time.sec / 60);
    time.hour += parseInt(time.min / 60);
    time.sec = time.sec % 60;
    time.min = time.min % 60;
}

function analyse() {
    lines = content.split("\n");
    length = lines.length;
    date = new RegExp("^([0-9]{4})([./]{1})([0-9]{1,2})([./]{1})([0-9]{1,2})");
    message = new RegExp("^([\u4e00-\u9fa5]{0,2})([0-9]{1,2})[:]{1}([0-9]{1,2})");
    chatname = lines[0].split(" ")[1]

    for (i = 0; i < length; i++) {
        if (date.test(lines[i].substring(0, 10))) {
            if (messageNumAll != 0) { //date
                if (messageNumAll > maxMessage) {
                    maxMessage = messageNumAll;
                    maxDate = dates[dates.length - 1];
                }
                messageInADayAll.push(messageNumAll);
                Object.keys(memberMessageList).forEach(k => memberMessageList[k].push(memberMessageNum[k]));
                Object.keys(memberMessageNum).forEach(k => memberMessageNum[k] = 0);
                messageNumAll = 0;
                adjustTime(dayTime); //call time a day
                getMaxCallTime(dayTime);
                callTimeInADay.push([dayTime.hour, dayTime.min, dayTime.sec]);
                callSecondInADay.push(dayTime.hour * 3600 + dayTime.min * 60 + dayTime.sec);
                Object.keys(dayTime).forEach(v => dayTime[v] = 0);
            }
            dates.push(lines[i]);
            totalDays++;
        }
        if (message.test(lines[i].split(/(\s+)/)[0])) { //message
            //new member
            var membername = lines[i].split(/(\s+)/)[2];
            if (membername != undefined) {
                if (!members.includes(membername) && (!membername.includes("收回訊息") && !membername.includes("邀請") && !membername.includes("加入") && !membername.includes("退出") && !membername.includes("更改了群組圖片") && !membername.includes("通話") && !membername.includes("相簿") && !membername.includes("群組名稱") && !membername.includes("已讓") && !membername.includes("離開"))) {
                    console.log(membername)
                    members.push(membername);
                    memberMessageNum[membername] = 0;
                    memberMessageList[membername] = new Array(dates.length - 1).fill(0);
                }
                eachMemberMessages[members.indexOf(membername)]++;
                memberMessageNum[membername]++;
                getCallTime(lines[i], dayTime); //Phone call
                getCallTime(lines[i], time);
                if ((!membername.includes("收回訊息") && !membername.includes("邀請") && !membername.includes("加入") && !membername.includes("退出") && !membername.includes("更改了群組圖片") && !membername.includes("通話") && !membername.includes("相簿") && !membername.includes("群組名稱") && !membername.includes("已讓") && !membername.includes("離開"))) {
                    messageNumAll++;
                    totalMessages++;
                }
            }
        }
        if (i == length - 1) { //last day
            if (messageNumAll > maxMessage) {
                maxMessage = messageNumAll;
                maxDate = lines[i];
            }
            callTimeInADay.push([dayTime.hour, dayTime.min, dayTime.sec]);
            messageInADayAll.push(messageNumAll);
            Object.keys(memberMessageList).forEach(k => memberMessageList[k].push(memberMessageNum[k]));
            Object.keys(memberMessageNum).forEach(k => memberMessageNum[k] = 0);
        }
        if (lines[i].split(/(\s+)/)[4] != undefined) {
            if (lines[i].split(/(\s+)/)[4].substring(0, 4) == "[貼圖]")
                eachMemberStickers[members.indexOf(lines[i].split(/(\s+)/)[2])]++;
            else if (lines[i].split(/(\s+)/)[4].substring(0, 4) == "[照片]")
                eachMemberPhotos[members.indexOf(lines[i].split(/(\s+)/)[2])]++;
        }
    }
    console.log(totalDays)
    console.log(totalMessages)

    for (i = 0; i < members.length; i++) {
        if (!members[i].includes("收回訊息") && !members[i].includes("邀請") && !members[i].includes("加入") && !members[i].includes("退出") && !members[i].includes("更改了群組圖片") && !members[i].includes("通話") && !members[i].includes("相簿") && !members[i].includes("已讓") && !members[i].includes("離開")) {
            console.log(members[i])
            console.log(eachMemberMessages[i])
            console.log(eachMemberStickers[i])
            console.log(eachMemberPhotos[i])
        }
        else
            unsent += eachMemberMessages[i];
    }
    if (unsent)
        console.log("unsent", unsent)

    console.log("max", maxMessage, maxDate)

    adjustTime(time);
    console.log("Total call time : ", "normal", time.hour + " hours " + time.min + " minute " + time.sec + " second");
    console.log("Maximum Call time : ", "normal", maxCallTime[0] + " hours " + maxCallTime[1] + " minute " + maxCallTime[2] + " second on " + maxCallDate);
    console.log("Total calls : " + time.calls + " phone calls ");

    displayResult();

    generateDonut('myCanvas', [eachMemberMessages[1], eachMemberMessages[0]], ['#7C7877', '#F0E5DE']);
    generateDonut('memberCanvas1', [eachMemberMessages[0] - eachMemberStickers[0] - eachMemberPhotos[0], eachMemberStickers[0], eachMemberPhotos[0]], ['#EB9F9F', '#F0E5DE', '#7C7877']);
    generateDonut('memberCanvas2', [eachMemberMessages[1] - eachMemberStickers[1] - eachMemberPhotos[1], eachMemberStickers[1], eachMemberPhotos[1]], ['#EB9F9F', '#F0E5DE', '#7C7877']);

    generatePlots();

    cloudlist = WordFreqSync(options).process(content);
    cloudlist = processlist(cloudlist);
    if (window.screen.width > 768)
        WordCloud(document.getElementById('wordcloud'), { list: cloudlist, shrinktofit: true, drawOutOfBound: false });
    else
        WordCloud(document.getElementById('wordcloud-mobile'), { list: cloudlist, shrinktofit: true, drawOutOfBound: false });

}

function displayResult() {
    const chatTitle = document.querySelector('[chat-title]')
    const member1Name = document.querySelector('[member1-name]')
    const member2Name = document.querySelector('[member2-name]')
    const member1Message = document.querySelector('[member1-message]')
    const member2Message = document.querySelector('[member2-message]')
    const statDay = document.querySelector('[stat-day]')
    const statMessage = document.querySelector('[stat-message]')
    const statCall = document.querySelector('[stat-call]')
    const statCalltime = document.querySelector('[stat-calltime]')
    const member1Chart = document.querySelector('[member1-chart]')
    const member1Texts = document.querySelector('[member1-texts]')
    const member1Stickers = document.querySelector('[member1-stickers]')
    const member1Photos = document.querySelector('[member1-photos]')
    const member2Chart = document.querySelector('[member2-chart]')
    const member2Texts = document.querySelector('[member2-texts]')
    const member2Stickers = document.querySelector('[member2-stickers]')
    const member2Photos = document.querySelector('[member2-photos]')
    const maxMessageResult = document.querySelectorAll('[max-message]')
    const maxYear = document.querySelectorAll('[max-year]')
    const maxMonth = document.querySelectorAll('[max-month]')
    const maxDay = document.querySelectorAll('[max-day]')
    const maxCalltime = document.querySelectorAll('[max-calltime]')
    const maxCalltimeyear = document.querySelectorAll('[max-calltime-year]')
    const maxCalltimemonth = document.querySelectorAll('[max-calltime-month]')
    const maxCalltimeday = document.querySelectorAll('[max-calltime-day]')

    var maxIdx = (window.screen.width) > 768 ? 0 : 1;

    chatTitle.textContent = chatname + ':'
    member1Name.textContent = members[0]
    member2Name.textContent = members[1]
    member1Message.textContent = eachMemberMessages[0] + ' 則'
    member2Message.textContent = eachMemberMessages[1] + ' 則'
    statDay.textContent = totalDays
    statMessage.textContent = totalMessages
    statCall.textContent = time.calls
    statCalltime.textContent = time.hour + '時' + time.min + '分' + time.sec + '秒'

    maxlist = maxDate.split(/[/（ ()]+/)
    maxMessageResult[maxIdx].textContent = maxMessage + ' 則'
    maxYear[maxIdx].textContent = maxlist[0]
    maxMonth[maxIdx].textContent = maxlist[1]
    maxDay[maxIdx].textContent = maxlist[2]

    if (time.calls) {
        maxCalltimeList = maxCallDate.split(/[/（ ()]+/)
        maxCalltime[maxIdx].textContent = maxCallTime[0] + '時' + maxCallTime[1] + '分' + maxCallTime[2] + '秒'
        maxCalltimeyear[maxIdx].textContent = maxCalltimeList[0]
        maxCalltimemonth[maxIdx].textContent = maxCalltimeList[1]
        maxCalltimeday[maxIdx].textContent = maxCalltimeList[2]
    }

    member1Chart.textContent = members[0]
    member1Texts.textContent = eachMemberMessages[0] - eachMemberStickers[0] - eachMemberPhotos[0] + ' 訊息'
    member1Stickers.textContent = eachMemberStickers[0] + ' 貼圖'
    member1Photos.textContent = eachMemberPhotos[0] + ' 照片'
    member2Chart.textContent = members[1]
    member2Texts.textContent = eachMemberMessages[1] - eachMemberStickers[1] - eachMemberPhotos[1] + ' 訊息'
    member2Stickers.textContent = eachMemberStickers[1] + ' 貼圖'
    member2Photos.textContent = eachMemberPhotos[1] + ' 照片'

}

function findword() {
    var wordInADay = [];
    var wordNum;
    var splitedMessage = [];

    if (window.screen.width > 768)
        var searchbox = document.querySelector(".searchbox")
    else
        var searchbox = document.getElementById("searchbox-mobile")
    var wordtofind = searchbox.value
    searchbox.value = ""
    if (window.screen.width > 768) { //responsive on the plots
        var fontsize = 18
        var margin = 50
    }
    else {
        var fontsize = 12
        var margin = 45
    }
    for (i = 0; i < length; i++) {
        if (date.test(lines[i].substring(0, 10))) {
            wordInADay.push(wordNum);
            wordNum = 0;
        }
        if (message.test(lines[i].split(/(\s+)/)[0])) { //word
            splitedMessage = lines[i].split(/(\s+)/);
            splitedMessage.shift();
            splitedMessage.shift();
            splitedMessage.shift();
            splitedMessage.shift();
            for (j = 0; j < splitedMessage.length; j++) {
                if (splitedMessage[j].includes(wordtofind)) {
                    wordNum++;
                    break;
                }
            }
        }
        if (i == length - 1) //last day
            wordInADay.push(wordNum);
    }
    var specificWord = {
        y: wordInADay,
        line: { shape: 'spline' },
        type: 'scatter'
    };
    var wordLayout = {
        title: '每日說 ' + wordtofind + ' 次數',
        xaxis: {
            title: '天數'
        },
        yaxis: {
            title: '次數'
        },
        legend: {
            font: {
                size: fontsize
            }
        },
        margin: {
            t: margin,
            r: margin,
            l: margin,
            b: margin
        }
    };
    var wordPlot = [specificWord];
    wordplot = document.getElementById('findingWord')
    wordplot.className = "message-plot word-plot" //remove hidden class
    Plotly.newPlot('findingWord', wordPlot, wordLayout, { displayModeBar: false });
}

function generateDonut(id, valuelist, colorlist) {
    generatePieGraph(id, {
        values: valuelist,
        colors: colorlist,
        animation: true,
        animationSpeed: 5,
        fillTextData: true,
        fillTextColor: 'black',
        fillTextAlign: 1.35,
        fillTextPosition: 'inner',
        doughnutHoleSize: 50,
        doughnutHoleColor: '#F1BBBA',
        offset: 1,
    });
}

function generatePlots() {
    var memberMessage = [];
    if (window.screen.width > 768) { //responsive on the plots
        var fontsize = 18
        var margin = 50
    }
    else {
        var fontsize = 12
        var margin = 45
    }

    for (i = 0; i < members.length; i++) {
        memberMessage.push({
            y: memberMessageList[members[i]],
            line: { shape: 'spline' },
            type: 'scatter',
            name: members[i],
            opacity: 0.5,
            font: {
                size: 30
            },
            line: {
                width: 3
            }
        })
    }

    var allMessage = {
        y: messageInADayAll,
        line: { shape: 'spline' },
        type: 'scatter'
    };

    var callTime = {
        y: callSecondInADay,
        line: { shape: 'spline' },
        type: 'scatter'
    };


    var layout1 = {
        title: '每日訊息數',
        xaxis: {
            title: '天數'
        },
        yaxis: {
            title: '訊息數'
        },
        legend: {
            font: {
                size: fontsize
            }
        },
        margin: {
            t: margin,
            r: margin,
            l: margin,
            b: margin
        }
    };

    var layout2 = {
        title: '各自訊息數',
        xaxis: {
            title: '天數'
        },
        yaxis: {
            title: '訊息數'
        },
        legend: {
            font: {
                size: fontsize
            }
        },
        margin: {
            t: margin,
            r: margin,
            l: margin,
            b: margin
        }
    };

    var layout3 = {
        title: '每日通話秒數',
        xaxis: {
            title: '天數'
        },
        yaxis: {
            title: '秒'
        },
        legend: {
            font: {
                size: fontsize
            }
        },
        margin: {
            t: margin,
            r: margin,
            l: margin,
            b: margin
        }
    };

    var allMessagePlot = [allMessage];
    Plotly.newPlot('allMessage', allMessagePlot, layout1, { displayModeBar: false });

    var eachMessagePlot = memberMessage;
    Plotly.newPlot('memberMessage', eachMessagePlot, layout2, { displayModeBar: false });

    var callTimePlot = [callTime];
    Plotly.newPlot('callTime', callTimePlot, layout3, { displayModeBar: false });
}
