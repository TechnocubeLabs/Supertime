/**
 * Attendance.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var moment = require('moment');

module.exports = {

    attributes: {
        user: {
            model: 'user',
            required: true
        },
        attendance_date: {
            type: 'date',
            required: true
        },
        login_time: {
            type: 'datetime',
            required: true
        },
        logout_time: {
            type: 'datetime'
        },
        todos: {
            collection: 'todos',
            via: 'todo_date'
        },
        userdetails: {
            model: 'userdetails'
        },
        breaks: {
            collection: 'breaks',
            via: 'attendance_date'
        },
        getLoginDuration: function() {
            var duration = moment.duration(moment(this.logout_time).diff(moment(this.login_time), 'minutes'), 'minutes').asMinutes();
            //console.log("duration is", duration);
            return moment(Math.floor(duration/60)+':'+duration%60+':00', "HH:mm:ss").format("HH:mm:ss");
        }
    }
};
