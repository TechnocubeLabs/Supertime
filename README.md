# SuperTime #

SuperTime is a general purpose attendance management system built using a sailsjs framework.

### Features ###

1. User registration
2. Login - login time recorded on login.
3. Logout - logout time for the given attendance date is updated on logout.
4. Admin User - a user with role = 2 is recognised as an admin. The admin can create projects and modules, fixing dateline for the module. Giving admin rights to a user is done by a database administrator by setting the role of a registered user.
5. To do(s) or Tasks - A user can create its own task log by selecting projects, module and task_type and then providing the description of the task. An estimated time may also me provided.
6. Day-to-day task - user can pick work/task from task list. Once a task is pick from list, the task will be updated for the next day and the day to come until its completion.
7. Report - user's work for today, attendance log, break log, task list and work log is generated in the report tab. An admin user can view this report for all users while a general user can view only his/her own data.

### Installation procedure ###

1. Download and install [nodejs](https://nodejs.org/en/).
2. Install sails. 
 	```$ sudo npm -g install sails```
3. Install bower.
	```$ npm install -g bower```
4. Setup your database -  Create a username "myusername" with password "mypassword" in your mysql. Create a database named "supertime_db" and grant all priviledges on the new database to the newly created user "myusername". Alternatively, you can create your desired username, password and database in your mysql and change the configuration of the database of this application in
	config/connections.js file.
5. Install [redis](http://redis.io/download) for session storage. Follow the installation guide from the download page.
6. Download the [SuperTime code repository](https://github.com/TechnocubeOpenSource/supertime/archive/master.zip).
7. Extract the downloaded file change your directory to the newly extracted folder.
8. Install dependencies.
	```$ npm install```
9. Install bower components. change directory to "assets" folder.
	```$ cd assets```
	```$ bower install```
10. Now, start your server.
	```$ sails lift```

By default, this application listens to PORT 3040 on your local machine. You can change the port settings in config/local.js file or lift sails with the port argument, like
	```$ sails lift --port PORT_NUMBER ```

### License ###

SuperTime is licensed under [Apache v2.0](https://github.com/TechnocubeLabs/Supertime/blob/master/LICENSE). Every code patch accepted in SuperTime codebase is licensed under [Apache v2.0](https://github.com/TechnocubeLabs/Supertime/blob/master/LICENSE). You must be careful to not include any code that can not be licensed under this license.

Please read carefully our [license](https://github.com/TechnocubeLabs/Supertime/blob/master/LICENSE) and ask us if you have any questions.

### Developer Guidelines ###

SuperTime community welcomes your contribution. To make the process as seamless as possible. Go ahead and fork the project and make your changes. We encourage pull requests to discuss code changes. We ask you the following steps:

1. Fork the SuperTime repo.
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create new Pull Request

### Contact us ###
We would love to hear your queries, feedback, suggestions, or anything else. Mail us at [info@technocube.in](mailto:info@technocube.in) 


A [TechnoCube](http://technocube.co/) initiative. We're proudly open! See more of our work [here](http://technocube.co/work.html). 
