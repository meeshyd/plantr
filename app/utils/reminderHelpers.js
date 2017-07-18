// Include the Axios library for HTTP requests
var axios = require("axios");
var moment = require('moment');
require('moment-recur');

var displayReminders = [];
var sortedDisplayReminders = [];
var todaysDate = moment().format("MM-DD-YYYY")
var endDate = moment().add(7, 'days').format("MM-DD-YYYY")
var recurrence;

var reminderHelpers = {
	getReminders: function() {
	    return axios.get("/api/reminders").then(function(results) {
	        console.log(" 1. axios results", results.data);

	        var data = results.data;

	        var displayRemindersIndex = 0;
			// loop through results from DB and call the setReminder funtion to generate dates
			for (var i = 0; i<data.length; i++) {
				for (var j = 0; j<data[i].reminders.length; j++) {
					var newReminder = {
							plant: data[i].name,
							type: data[i].reminders[j].reminderType,
							dates: [],
							imageURL: data[i].imageURL
						}
					displayRemindersIndex++;

					console.log("new reminder", newReminder)

					displayReminders.push(newReminder);

					setReminder(data[i].reminders[j].created, data[i].reminders[j].days, data[i].reminders[j].frequency, displayRemindersIndex);

				}
			}
			console.log("2. display reminders", displayReminders)
			
			for (var i = 0; i<displayReminders.length; i++) {
				
				for (var j = 0; j<displayReminders[i].dates.length; j++) {
					var date = displayReminders[i].dates[j]
					var newObject = {
						plant: displayReminders[i].plant,
						type: displayReminders[i].type,
						day: moment(date,"MM-DD-YYYY").format("dddd"),
						date: date,
						imageURL: displayReminders[i].imageURL
					}
					sortedDisplayReminders.push(newObject);
				}
			}
			
			sortedDisplayReminders.sort(function(a,b) { 
	    		return new Date(a.date).getTime() - new Date(b.date).getTime() 
			});
			console.log("3. sorted display reminders ", sortedDisplayReminders)
			return sortedDisplayReminders
		});
	}
};

// function to grab reminder dates based on user settings
// currently only weekly, biweekly and monthly frequencies are working
function setReminder(createdDate, days, frequency, index) {
	
	// format the reminder created date for moment
	// var startDate = moment(createdDate,"MM-DD-YYYY");
	// find the day of the week for that date
	var day = moment(createdDate,"MM-DD-YYYY").format("ddd");
	// and what week in the month it occurs (1-4)
	var week = moment(createdDate).monthWeek()
	console.log("----Reminder Information-----")
	console.log("Created Date: ", createdDate)
	console.log("Start Date: ", todaysDate)
	console.log("End Date: ", endDate)
	console.log("Day: ", day)
	console.log("Week: ", week)
	console.log("===============================")

		// this test works
		if (frequency===0) {
			// using reminder created date, set the weekly recurrence based on selected days 
			recurrence = startDate.recur(todaysDate, endDate).every(days).daysOfWeek();
			// grab dates starting from current date
			recurrence.fromDate(todaysDate);
			// generate next three dates in recurrence
			nextDates = recurrence.next(3, "L")
			// loop through resulting array and push to the reminder object
			for (var i = 0; i < nextDates.length; i++) {
				displayReminders[index].dates.push(nextDates[i])
			}
			// dev function logs the generated recurrence dates
			logger(days, frequency, nextDates)

		// this test works
		}else if (frequency===1){
			// setting variable for which weeks the reminders should occur
			var weeks;
			var cal;
			var nextDates;
			// if the reminder created at date falls in week 0, 1 or 3, set the frequency for same weeks
			if (week === 0 || 2 ) {
				weeks = [0,2]
			// else, set the frequency for weeks 2 & 4
			}else {
				weeks = [1,3]
			}
			// setting a cal recurrence based on days of week and weeks variable determined above
			cal = startDate.recur(todaysDate, endDate).every(days).daysOfWeek()
	                    .every(weeks).weeksOfMonthByDay()
	        // grab dates starting from current date
	        cal.fromDate(todaysDate);
	        // generate next three dates in recurrence
	        nextDates = cal.next(3, "L")
	        // loop through resulting array and push to the reminder object
			for (var i = 0; i < nextDates.length; i++) {
				displayReminders[index].dates.push(nextDates[i])
			}
	        // call logger function to display the recurrence dates
			logger(days, frequency, nextDates)

		// this test works!
		}else {
			// setting a cal recurrence based on days of week at monthly frequency
			cal = startDate.recur(todaysDate, endDate).every(days).daysOfWeek()
	                    .every(week).weekOfMonth()
	        // grab dates starting from current date
	        cal.fromDate(todaysDate);
	        // generate next three dates in recurrence
	        nextDates = cal.next(3, "L")
	        // loop through resulting array and push to the reminder object
			for (var i = 0; i < nextDates.length; i++) {
				displayReminders[index].dates.push(nextDates[i])
			}
			// call logger function to display the recurrence dates
			logger(days, frequency, nextDates)
		}
	}
	// function created for development purposes to test accuracy
	function logger (days, frequency, dates) {
		console.log("-----Reminder Information-----")
		console.log("Days of the Week: ", days)
		console.log("Frequency: ", frequency)
		console.log("Reminder Dates: ", dates)
		console.log("===============================")
	}

// We export the helpers function
module.exports = reminderHelpers;