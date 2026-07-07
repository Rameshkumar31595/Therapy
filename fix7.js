const fs = require('fs');

function replaceAll(filepath, replacements) {
    if (!fs.existsSync(filepath)) return;
    let content = fs.readFileSync(filepath, 'utf8');
    for (let r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(filepath, content, 'utf8');
}

// 1. css/styles.css
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/css/styles.css', [
    { search: /\.monday-special/g, replace: '.halfday-special' },
    { search: /\.monday-note/g, replace: '.halfday-note' }
]);

// 2. js/main.js
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/js/main.js', [
    { search: /"time\.foot": "✦ &nbsp;సోమవారం ఉదయం మాత్రమే, ముందుగా బుక్ చేసుకోండి&nbsp; ✦"/g, replace: '"time.foot": "✦ &nbsp;శనివారం ఉదయం మాత్రమే, ముందుగా బుక్ చేసుకోండి&nbsp; ✦"' }
]);

// 3. index.html
const oldListHtml = `          <ul class="timings-list">
            <li data-day="2"><span data-i18n="day.tue">Tuesday</span><span>9:00 AM to 8:00 PM</span></li>
            <li data-day="3"><span data-i18n="day.wed">Wednesday</span><span>9:00 AM to 8:00 PM</span></li>
            <li data-day="4"><span data-i18n="day.thu">Thursday</span><span>9:00 AM to 8:00 PM</span></li>
            <li data-day="5"><span data-i18n="day.fri">Friday</span><span>9:00 AM to 8:00 PM</span></li>
            <li data-day="6"><span data-i18n="day.sat">Saturday</span><span>9:00 AM to 8:00 PM</span></li>
            <li data-day="0"><span data-i18n="day.sun">Sunday</span><span>9:00 AM to 8:00 PM</span></li>
            <li class="monday-special" data-day="1">
              <span><span data-i18n="day.mon">Monday</span> <em class="monday-note" data-i18n="day.half">Half Day</em></span>
              <span>9:00 AM to 1:00 PM</span>
            </li>
          </ul>
          <p class="timings-foot" data-i18n="time.foot">✦ &nbsp;Monday sessions are mornings only, so book early&nbsp; ✦</p>`;

const newListHtml = `          <ul class="timings-list">
            <li data-day="1"><span data-i18n="day.mon">Monday</span><span>9:00 AM to 8:00 PM</span></li>
            <li data-day="2"><span data-i18n="day.tue">Tuesday</span><span>9:00 AM to 8:00 PM</span></li>
            <li data-day="3"><span data-i18n="day.wed">Wednesday</span><span>9:00 AM to 8:00 PM</span></li>
            <li data-day="4"><span data-i18n="day.thu">Thursday</span><span>9:00 AM to 8:00 PM</span></li>
            <li data-day="5"><span data-i18n="day.fri">Friday</span><span>9:00 AM to 8:00 PM</span></li>
            <li class="halfday-special" data-day="6">
              <span><span data-i18n="day.sat">Saturday</span> <em class="halfday-note" data-i18n="day.half">Half Day</em></span>
              <span>9:00 AM to 1:00 PM</span>
            </li>
            <li data-day="0"><span data-i18n="day.sun">Sunday</span><span>9:00 AM to 8:00 PM</span></li>
          </ul>
          <p class="timings-foot" data-i18n="time.foot">✦ &nbsp;Saturday sessions are mornings only, so book early&nbsp; ✦</p>`;

replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/index.html', [
    { search: oldListHtml, replace: newListHtml }
]);
