/**
 * Todos.js
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
        todo_date: {
            collection: 'attendance',
            via: 'todos'
        },
        project: {
            model: 'projects'
        },
        task_name: {
            model: 'tasks'
        },
        task_type: {
            model: 'task_type'
        },
        description: {
            type: 'string',
            required: true
        },
        status: {
            type: 'string'
        },
        estimated_hour: {
            type: 'integer'
        },
        estimated_minute: {
            type: 'integer'
        },
        actual_hour: {
            type: 'integer'
        },
        actual_minute: {
            type: 'integer'
        },
        priority: {
            type: 'string'
        },
        getEstimatedDuration: function() {
            var duration = this.estimated_hour + ':' + this.estimated_minute + ':00';
            return moment(duration, "HH:mm:ss").format("HH:mm:ss");
        },
        getActualDuration: function() {
            var duration = this.actual_hour + ':' + this.actual_minute + ':00';
            return moment(duration, "HH:mm:ss").format("HH:mm:ss");
        },
        getTimeVariation: function() {
            var estimates = moment(this.getEstimatedDuration, 'HH:mm:ss');
            var actuals = moment(this.getActualDuration, 'HH:mm:ss');

            var durationDiff = moment.duration(estimates.diff(actuals));

            return duration.asMinutes();
        }
    }
};
