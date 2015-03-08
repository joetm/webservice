/*global module, console*/

/**
 * Time function that converts an integer value into a readable format (e.g. x minutes ago)
 * @param (integer) dateline - the unix timestamp (in seconds) to be converted in readable format
 */
module.exports = function (dateline) {
    "use strict";

    //based on fearofawhackplanet's answer on stackoverflow.com
    //May 24 '11 at 10:33
    //http://stackoverflow.com/a/6109105/426266

    //console.log(dateline);

    if (isNaN(dateline)) { dateline = 0; } //something went wrong here

    dateline = parseInt(dateline, 10);

    var current = parseInt(new Date().getTime() / 1000, 10),
        sPerMinute = 60,
        sPerHour = sPerMinute * 60,
        sPerDay = sPerHour * 24,
        sPerMonth = sPerDay * 30,
        sPerYear = sPerDay * 365,
        elapsed = current - dateline,
        seconds,
        minutes,
        hours,
        days,
        months,
        years,
        ago_str,
        ret = '';

    if (elapsed < sPerMinute) {
        seconds = Math.round(elapsed);
        if (seconds === 1) { ago_str = ' second ago'; } else { ago_str = ' seconds ago'; }
        ret = ' ' + seconds + ago_str;
    } else if (elapsed < sPerHour) {
        minutes = Math.round(elapsed / sPerMinute);
        if (minutes === 1) { ago_str = ' minute ago'; } else { ago_str = ' minutes ago'; }
        ret = minutes + ' minutes ago';
    } else if (elapsed < sPerDay) {
        hours = Math.round(elapsed / sPerHour);
        if (hours === 1) { ago_str = ' hour ago'; } else { ago_str = ' hours ago'; }
        ret = ' ' + hours + ago_str;
    } else if (elapsed < sPerMonth) {
        days = Math.round(elapsed / sPerDay);
        if (days === 1) { ago_str = ' day ago'; } else { ago_str = ' days ago'; }
        ret = ' ' + Math.round(elapsed / sPerDay) + ago_str;
    } else if (elapsed < sPerYear) {
        months = Math.round(elapsed / sPerMonth);
        if (months === 1) { ago_str = ' month ago'; } else { ago_str = ' months ago'; }
        ret = ' ' + months + ago_str;
    } else {
        years = Math.round(elapsed / sPerYear);
        if (years === 1) { ago_str = ' year ago'; } else { ago_str = ' years ago'; }
        ret = ' ' + years + ago_str;
    }

    //console.log(ret);

    return ret;

};//timeDifference
