/**
 * Tasks.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        project: {
            model: 'projects'
        },
        task_name: {
            type: 'string',
            required: true
        },
        expected_delivery_date: {
            type: 'date'
        },
        task_type: {
            collection: 'task_type',
            via: 'id'
        },
        todos: {
            collection: 'todos',
            via: 'task_name'
        }
    }
};
