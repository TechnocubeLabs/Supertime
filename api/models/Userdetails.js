/**
 * Userdetails.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        login_id: {
            model: 'user'
        },
        first_name: {
            type: 'string'
        },
        last_name: {
            type: 'string'
        },
        attendance_record: {
            collection: 'attendance',
            via: 'userdetails'
        },
        break_record: {
            collection: 'breaks',
            via: 'user'
        },
        todos: {
            collection: 'todos',
            via: 'user'
        },
        role: {
            type: 'integer'
        },
        getName: function() {
            return this.first_name + " "+ this.last_name;
        }
    }
};
