/**
 * Breaks.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var moment = require('moment');

module.exports = {

    attributes: {
        user: {
            model: 'userdetails'
        },
        attendance_date: {
            model: 'attendance'
        },
        reason: {
            type: 'string',
            required: true
        },
        start_time: {
            type: 'datetime',
            required: true
        },
        end_time: {
            type: 'datetime'
        },
        comments: {
            type: 'string'
        },
        getBreakDuration: function() {
            var duration = moment.duration(moment(this.end_time).diff(moment(this.start_time), 'minutes'), 'minutes').asMinutes();
            return moment(Math.floor(duration / 60) + ':' + duration % 60 + ':00', "HH:mm:ss").format("HH:mm:ss");
        },
        getBreakMinutes: function() {
            var duration = moment.duration(moment(this.end_time).diff(moment(this.start_time), 'minutes'), 'minutes').asMinutes();
            return duration;
        }
    }
};
