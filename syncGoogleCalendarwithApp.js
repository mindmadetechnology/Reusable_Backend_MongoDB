const ScheduleModel = require('../models/ScheduleModel');
const UserModel = require("../models/userModel");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const moment = require('moment-timezone');
require('dotenv').config();

//Create new Propose Meeting
const CreateProposeMeeting = (req, res) => {
    const ScheduleDate = req.body.ScheduleDate;
    const ScheduleTime = req.body.ScheduleTime;
    const ProgramName = req.body.ProgramName;
    const ProgramID = req.body.ProgramID;
    const Title = req.body.Title;
    const Participants = req.body.Participants;//should be array
    const PurposeOfMeeting = req.body.PurposeOfMeeting;
    const MeetingCategory = "Proposal";
    const ProposedBy = req.body.ProposedBy;
    const Created_On = moment().tz('Asia/Kolkata').format("DD-MM-YYYY hh:mm A");

    try {
        if (!ScheduleDate || !ScheduleTime || !ProgramName || !Participants || !PurposeOfMeeting || !MeetingCategory) {
            res.send({ statusCode: 400, message: "*required" })
        } else {
            const NewProposedMeeting = new ScheduleModel({
                ScheduleDate: ScheduleDate,
                ScheduleTime: ScheduleTime,
                ProgramName: ProgramName,
                Title: Title,
                ProgramID: ProgramID,
                Participants: Participants,//should be array
                PurposeOfMeeting: PurposeOfMeeting,
                MeetingCategory: MeetingCategory,
                ProposedBy: ProposedBy,
                Created_On: Created_On
            });
            NewProposedMeeting.save(function (err, result) {
                if (err) {
                    res.send({ statusCode: 400, message: "Failed" });
                } else {
                    res.send({ statusCode: 200, message: "New Proposal meeting request Created Successfully" })
                }
            })
        }
    } catch (err) {
        res.send({ statusCode: 400, message: "Catch err", err });
    }
}

// Create New Schedule
const CreateSchedule = (req, res) => {
    const ProgramID = req.body.ProgramID;
    const Title = req.body.Title;
    const ScheduleDate = req.body.ScheduleDate;
    const ScheduleTime = req.body.ScheduleTime;
    const Agenda = req.body.Agenda;
    const Participants = req.body.Participants;
    const MeetingCategory = "Scheduled";
    const Status = req.body.Status;
    const MeetingLink = req.body.MeetingLink;
    const MeetingLocation = req.body.Location;
    const PurposeOfMeeting = req.body.PurposeOfMeeting;
    const Organiser = req.body.Organiser;
    const Created_On = moment().tz('Asia/Kolkata').format("DD-MM-YYYY hh:mm A");
    // Documents

    try {
        if (!ProgramID || !Title || !ScheduleDate || !ScheduleTime || !Agenda || !Participants || !Status || !PurposeOfMeeting) {
            res.send({ statusCode: 400, message: '*required' });
        } else {


            var FinalDocuments = [];

            if (req.files['Documents'] === undefined) {
                FinalDocuments = [];
            } else {
                for (let i = 0; i < req.files['Documents'].length; i++) {
                    FinalDocuments.push(req.files['Documents'][i])
                }
            };
            const OAuth2Client = new OAuth2(
                process.env.ClientID, //client Id
                process.env.ClientSecret //client Secret
            )
            OAuth2Client.setCredentials({
                refresh_token: process.env.refresh_token
            })
            const calendar = google.calendar({ version: 'v3', auth: OAuth2Client })
            const StartDateInput = ScheduleDate + ' ' + ScheduleTime;

            var zone = "Asia/Kolkata";
            const fmt = 'DD-MM-YYYY hh:mm:ss A'
            // var eventStartTime = moment.tz(StartDateInput, fmt, zone).utc(StartDateInput).format();
            var eventStartTime = moment.tz(StartDateInput, fmt, zone).utc(StartDateInput).format();
            const eventEndTime = new Date(eventStartTime);
            eventEndTime.setUTCMinutes(eventEndTime.getUTCMinutes() + 60);
            const FinaleventEndTime = JSON.parse(JSON.stringify(eventEndTime));
            console.log("StartDateInput", StartDateInput)
            console.log("eventStartTime", eventStartTime)
            console.log("eventEndTime", eventEndTime);
            console.log("FinaleventEndTime", FinaleventEndTime);
            const FinalParticipants = JSON.parse(Participants);
            var attendeesList = [];
            for (let i = 0; i < FinalParticipants.length; i++) {
                const gArray = { email: FinalParticipants[i].Email };
                attendeesList.push(gArray)
                // console.log(FinalParticipants[i].email)
            }
            console.log("attendeesList", attendeesList)
            let event = {
                summary: Title,
                description: PurposeOfMeeting,
                start: {
                    dateTime: eventStartTime,
                    timezone: 'Asia/kolkata'
                },

                end: {
                    dateTime: FinaleventEndTime,
                    timezone: 'Asia/kolkata'
                },
                attendees: attendeesList,
                colorId: 0, //google calendar api have 11 different colors to display an event
                conferenceData: {
                    createRequest: {
                        requestId: "sample123",
                        conferenceSolutionKey: { type: "hangoutsMeet" },
                    },
                },
            }
            console.log("event", event)
            // check the available slots
            calendar.freebusy.query(
                {
                    resource: {
                        timeMin: eventStartTime,
                        timeMax: FinaleventEndTime,
                        timezone: 'Asia/kolkata',
                        items: [{ id: 'primary' }] //items should check user's all the calendars 
                    }
                }, (err, res) => {
                    if (err) {
                        return console.error("Free busy query err", err)
                    } else {
                        calendar.events.insert(
                            { calendarId: 'primary', resource: event, conferenceDataVersion: 1 },
                            (err, result) => {
                                if (err) console.error("Calendar event creation err", err)

                                return console.log('Calendar Event Created successfully', result?.data?.hangoutLink)
                            }
                        )
                    }


                })
             const NewSchedule = new ScheduleModel({
                ProgramID: ProgramID,
                 Title: Title,
          ScheduleDate: ScheduleDate,
                 ScheduleTime: ScheduleTime,
                 Agenda: Agenda,
                 Participants: FinalParticipants,
                 MeetingCategory : MeetingCategory,
                 MeetingLink: MeetingLink,
                 MeetingLocation: MeetingLocation,
                 Organiser: Organiser,
                 Documents: FinalDocuments,
                 Created_On: Created_On
             });
             NewSchedule.save(function (err, result) {
                 if (err) {
                     res.send({ statusCode: 400, message: 'Failed' });
                 } else {
                     res.send({ statusCode: 200, message: 'Schedule created successfully' })
                 }
             })
        }
    } catch (err) {
        res.send({ statusCode: 400, message: "Error Occur at Catch" })
        // res.send({ statusCode: 400, message: 'Failed' });
    }
};


//Confirm the Schedule while accept the proposal meeting and Reschedule proposal request accepted

const ConfirmSchedule = (req, res) => {
    const ScheduleID = req.params.ScheduleID;
    const Status = req.body.Status;
    const Updated_On = moment().tz('Asia/Kolkata').format("DD-MM-YYYY hh:mm A");
    const Updated_By = req.body.Updated_By;

    try {
        ScheduleModel.findOne({ _id: ScheduleID }, function (err, result) {
            if (err) {
                res.send({ statusCode: 400, message: "Error Occured" })
            } else if (result === null) {
                res.send({ statusCode: 400, message: "ScheduleID Doesnot exist" })
            } else {
                var CategoryOfMeeting;
                if (Status === "Confirmed") {
                    CategoryOfMeeting = "Confirmed";
                }

                const CommonEmail = { email: 'kaviyapriya@mindmade.in' };

                var attendeesList = [];
                attendeesList.push(CommonEmail);
                for (let i = 0; i < result.Participants.length; i++) {
                    const gArray = { email: result.Participants[i].Email };
                    attendeesList.push(gArray)
                }

                //google calendar credentials setup
                const OAuth2Client = new OAuth2(
                    process.env.ClientID, //client Id
                    process.env.ClientSecret //client Secret
                )
                OAuth2Client.setCredentials({
                    refresh_token: process.env.refresh_token
                })
                const calendar = google.calendar({ version: 'v3', auth: OAuth2Client })

                //Event start time and Event End Time for sync with google calendar

                const date = result.ScheduleDate;

                const [day, month, year] = date.split('-');

                const ScheduleDate = [year, month, day].join('-'); //convertion "DD-MM-YYYY" to "YYYY-MM-DD"

                const InputDateTimeStart = ScheduleDate + ' ' + result.ScheduleTime;
                const InputDateTimeObject = new Date(InputDateTimeStart);

                let EndTimeUTC = new Date(new Date(InputDateTimeObject).setHours(InputDateTimeObject.getHours() + 1)) // it will add 1hour to InputDate and return UTC time
                const InputDateTimeEnd = moment(EndTimeUTC).format('YYYY-MM-DD hh:mm A'); //convertion from utc to local time(2022-07-08T07:30:00.000Z to 08-07-2022 01:00 PM)

                // convertion to local time
                var zone = "Asia/Kolkata";
                const fmt = "YYYY-MM-DD hh:mm A"
                var eventStartTime = moment.tz(InputDateTimeStart, fmt, zone).utc().local().format(); //eventStartTime 2022-08-07T12:00:00+05:30
                var eventEndTime = moment.tz(InputDateTimeEnd, fmt, zone).local().format(); //eventEndTime 2022-08-07T13:00:00+05:30

                // Event 
                let event = {
                    summary: result.Title,
                    description: result.PurposeOfMeeting,
                    start: {
                        dateTime: eventStartTime,
                        timezone: 'Asia/kolkata'
                    },
                    end: {
                        dateTime: eventEndTime,
                        timezone: 'Asia/kolkata'
                    },
                    attendees: attendeesList,
                    colorId: 0, //google calendar api have 11 different colors to display an event
                    conferenceData: {
                        createRequest: {
                            requestId: "sample123",
                            conferenceSolutionKey: { type: "hangoutsMeet" },
                        },
                    },
                }

                // insert the event to the google calendar
                calendar.freebusy.query(
                    {
                        resource: {
                            timeMin: eventStartTime,
                            timeMax: eventEndTime,
                            timezone: 'Asia/kolkata',
                            items: [{ id: 'primary' }] //items should check user's all the calendars 
                        }
                    }, (err) => {
                        if (err) {
                            return console.error("Free busy query err", err)
                        } else {
                            calendar.events.insert(
                                { calendarId: 'primary', resource: event, conferenceDataVersion: 1 },
                                (err, result) => {
                                    if (err) {
                                        console.error("Calendar event creation err", err)
                                    } else {
                                        console.log('Calendar Event Created successfully')

                                        // update the meeting details in scheduleModel
                                        ScheduleModel.findOneAndUpdate({ _id: ScheduleID }, {
                                            $set: {
                                                EventID: result.data.id,
                                                MeetingLink: result.data.hangoutLink,
                                                Status: Status,
                                                MeetingCategory: CategoryOfMeeting,
                                                Organizer: result.data.organizer.email,
                                                Updated_On: Updated_On,
                                                Updated_By: Updated_By
                                            }
                                        }, function (err, result) {
                                            if (err) {
                                                res.send({ statusCode: 400, message: "Failed", err })
                                            } else {
                                                res.send({ statusCode: 200, message: "Meeting Schedule is Confirmed Successfully" })
                                            }
                                        })
                                    }
                                }
                            )
                        }
                    })
            }
        })
    } catch (err) {
        res.send({ statusCode: 400, message: 'Failed' });
    }
};

// Update the Schedule
const UpdateSchedule = (req, res) => {

    const ScheduleID = req.params.ScheduleID;
    const Agenda = req.body.Agenda;
    const Participants = req.body.Participants;
    const Location = req.body.Location;
    const Updated_On = moment().tz('Asia/kolkata').format('DD-MM-YYYY hh:mm A');
    const Updated_By = req.body.Updated_By;

    try {

        const FinalUpdated_By = JSON.parse(Updated_By);

        ScheduleModel.findOne({ _id: ScheduleID }, function (err, result) {
            if (err) {
                res.send({ statusCode: 400, message: "Failed", err })
            } else if (result === null) {
                res.send({ statusCode: 400, message: "Schedule ID doesnt exist" })
            } else {
                const FinalParticipants = JSON.parse(Participants);

                var FinalDocuments = [];
                if (req.files['Documents'] === undefined) {
                    FinalDocuments = [];
                } else {
                    for (let i = 0; i < req.files['Documents'].length; i++) {
                        FinalDocuments.push(req.files['Documents'][i])
                    }
                };

                const CommonEmail = { email: 'kaviyapriya@mindmade.in' };

                var attendeesList = [];
                attendeesList.push(CommonEmail);

                for (let i = 0; i < FinalParticipants.length; i++) {
                    const gArray = { email: FinalParticipants[i].Email };
                    attendeesList.push(gArray)
                }

                //google calendar credentials setup
                const OAuth2Client = new OAuth2(
                    process.env.ClientID, //client Id
                    process.env.ClientSecret //client Secret
                )
                OAuth2Client.setCredentials({
                    refresh_token: process.env.refresh_token
                })
                const calendar = google.calendar({ version: 'v3', auth: OAuth2Client })
                const eventId = result.EventID;

                var updateEvent = {
                    attendees: attendeesList,
                }
                calendar.events.patch(
                    {
                        calendarId: 'primary',
                        eventId: eventId,
                        resource: updateEvent,
                        sendUpdates: "all"
                    },
                    (err, result) => {
                        if (err) {
                            console.error("err", err)
                        } else {
                            ScheduleModel.findOneAndUpdate({ _id: ScheduleID }, {
                                $set: {
                                    Agenda: Agenda,
                                    Participants: FinalParticipants,
                                    MeetingLocation: Location,
                                    Documents: FinalDocuments,
                                    Updated_By: FinalUpdated_By,
                                    Updated_On: Updated_On
                                }
                            }, function (err, result) {
                                if (err) {
                                    res.send({ statusCode: 400, message: 'Failed' })
                                } else {
                                    res.send({ statusCode: 200, message: "Schedule Updated Successfully" })
                                }
                            })
                        }
                    })
            }
        })

    } catch (err) {
        res.send({ statusCode: 400, message: "Error occur at Catch" })
    }
}

// Create Proposal Meeting Reschedule Request
const ProposalMeetingRescheduleRequest = (req, res) => {

    const ScheduleID = req.params.ScheduleID;
    const StartDate = req.body.StartDate;
    const StartTime = req.body.StartTime;
    const Status = req.body.Status;
    const Updated_On = moment().tz('Asia/Kolkata').format("DD-MM-YYYY hh:mm A");
    const Updated_By = req.body.Updated_By;

    ScheduleModel.findOne({ _id: ScheduleID }, function (err, result) {
        if (err) {
            res.send({ statusCode: 400, message: "Failed" })
        } else if (result === null) {
            res.send({ statusCode: 400, message: "ScheduleID doesn't Exist" })
        } else {
            var CategoryOfMeeting;
            if (Status === "Proposal Meeting Reschedule Request") {
                console.log("inside if")
                CategoryOfMeeting = "Proposal Meeting Reschedule Request";
                ScheduleModel.findOneAndUpdate({ _id: ScheduleID }, {
                    $set: {
                        ScheduleDate: StartDate,
                        ScheduleTime: StartTime,
                        MeetingCategory: CategoryOfMeeting,
                        Status: Status,
                        Updated_On: Updated_On,
                        Updated_By: Updated_By
                    }
                }, function (err, result) {
                    if (err) {
                        res.send({ statusCode: 400, message: "Failed" })
                    } else {
                        res.send({ statusCode: 200, message: "Proposal Meeting Reschedule Request created Successfully" })
                    }
                })
            }
        }
    })

}

//Create Confirm Meeting Reschedule Request
const ConfirmMeetingRescheduleRequest = (req, res) => {

    const ScheduleID = req.params.ScheduleID;
    const RescheduleStartDate = req.body.StartDate;
    const RescheduleStartTime = req.body.StartTime;
    const RescheduleEndDate = req.body.EndDate;
    const RescheduleEndTime = req.body.EndTime;
    const Status = req.body.Status;
    const Updated_On = moment().tz('Asia/Kolkata').format("DD-MM-YYYY hh:mm A");
    const Updated_By = req.body.Updated_By;

    ScheduleModel.findOne({ _id: ScheduleID }, function (err, result) {
        if (err) {
            res.send({ statusCode: 400, message: "Failed" })
        } else if (result === null) {
            res.send({ statusCode: 400, message: "ScheduleID doesn't exist" });
        } else {
            var CategoryOfMeeting;
            if (Status === "Confirm Meeting Reschedule Request") {
                CategoryOfMeeting = "Confirm Meeting Reschedule Request";
            }
            ScheduleModel.findOneAndUpdate({ _id: ScheduleID }, {
                $set: {
                    ReScheduleStartDate: RescheduleStartDate,
                    ReScheduleStartTime: RescheduleStartTime,
                    ReScheduleEndDate: RescheduleEndDate,
                    ReScheduleEndTime: RescheduleEndTime,
                    MeetingCategory: CategoryOfMeeting,
                    Status: Status,
                    Updated_On: Updated_On,
                    Updated_By: Updated_By
                }
            }, function (err, result) {
                if (err) {
                    res.send({ statusCode: 400, message: "Failed" })
                } else {
                    res.send({ statusCode: 200, message: "Confirm Meeting Reschedule Request Created Successfully" })
                }
            })
        }
    })
}

//Update the event while accept the Confirm meeting Reschedule Request
const ConfirmMeetingRescheduleRequestAccepted = (req, res) => {

    const ScheduleID = req.params.ScheduleID;
    const Status = req.body.Status;
    const Updated_On = moment().tz('Asia/Kolkata').format("DD-MM-YYYY hh:mm A");
    const Updated_By = req.body.Updated_By;

    ScheduleModel.findOne({ _id: ScheduleID }, function (err, result) {
        if (err) {
            res.send({ statusCode: 400, message: "Failed" })
        } else if (result === null) {
            res.send({ statusCode: 400, message: "ScheduleID doesn't exist" });
        } else {
            var CategoryOfMeeting;
            if (Status === "Confirmed") {
                CategoryOfMeeting = "Confirmed";
            }

            //google calendar credentials setup
            const OAuth2Client = new OAuth2(
                process.env.ClientID, //client Id
                process.env.ClientSecret //client Secret
            )
            OAuth2Client.setCredentials({
                refresh_token: process.env.refresh_token
            })
            const calendar = google.calendar({ version: 'v3', auth: OAuth2Client })

            //Event start time and Event End Time for sync with google calendar
            const InputDateTimeStart = result.ReScheduleStartDate + ' ' + result.ReScheduleStartTime;
            const InputDateTimeEnd = result.ReScheduleEndDate + ' ' + result.ReScheduleEndTime;

            // convertion to local time
            var zone = "Asia/Kolkata";
            const fmt = "DD-MM-YYYY hh:mm A"
            var eventStartTime = moment.tz(InputDateTimeStart, fmt, zone).utc().local().format(); //eventStartTime 2022-08-07T11:00:00+05:30
            var eventEndTime = moment.tz(InputDateTimeEnd, fmt, zone).utc().local().format(); //eventStartTime 2022-08-07T12:00:00+05:30

            const EventID = result.EventID;

            const ScheduleDate = result.ReScheduleStartDate;
            const ScheduleTime = result.ReScheduleStartTime;

            var RescheduleEvent = {
                start: {
                    dateTime: eventStartTime,
                    timezone: 'Asia/kolkata'
                },
                end: {
                    dateTime: eventEndTime,
                    timezone: 'Asia/kolkata'
                },
            }
            calendar.events.patch(
                {
                    calendarId: 'primary',
                    eventId: EventID,
                    resource: RescheduleEvent,
                    sendUpdates: "all"
                },
                (err, result) => {
                    if (err) {
                        console.error("err", err)
                    } else {
                        ScheduleModel.findOneAndUpdate({ _id: ScheduleID }, {
                            $set: {
                                ScheduleDate: ScheduleDate,
                                ScheduleTime: ScheduleTime,
                                MeetingCategory: CategoryOfMeeting,
                                Status: Status,
                                Updated_On: Updated_On,
                                Updated_By: Updated_By

                            }
                        }, function (err, result) {
                            if (err) {
                                res.send({ statusCode: 400, message: 'Failed' })
                            } else {
                                res.send({ statusCode: 200, message: "Rescheduled Successfully" })
                            }
                        })
                    }
                })
        }
    })

}

//Get Schedule List
const GetScheduleList = (req, res) => {
    try {
        ScheduleModel.find({}, function (err, result) {
            if (err) {
                res.send({ statusCode: 400, message: 'Failed' });
            } else {
                if (result.length === 0) {
                    res.send({ message: 'No Records Found' });
                } else {
                    res.send(result);
                }
            }
        })
    } catch (err) {
        res.send({ statusCode: 400, message: 'Failed' });
    }
};

//Get Schedule List By Date and Email
const GetScheduleListByDateAndEmail = (req, res) => {
    const SelectedDate = req.params.ScheduleDate;
    const Email = req.params.Email;

    try {
        ScheduleModel.find({}, function (err, result) {
            if (err) {
                res.send({ statusCode: 400, message: 'Failed' });
            } else if (result.length === 0) {
                res.send({ message: "No Records Found " });
            } else {
                var UserScheduleList = [], UpcomingMeetingArray = [], PastMeetingArray = [],
                    TodayMeetingArray = [], UpcomingMeetings = [], PastMeetings = [], TodayMeetings = [];
                result.filter(val => {
                    val.Participants.filter(p => {
                        if (p.Email === Email) { UserScheduleList.push(val) };
                    });
                });
                console.log("UserScheduleList", UserScheduleList)
                if (SelectedDate === 'All') {
                    UserScheduleList.filter(val => {
                        if (val.ScheduleDate === moment().format('DD-MM-YYYY')) {
                            TodayMeetingArray.push(val);
                        } else {
                            var Diff = moment(val.ScheduleDate, 'DD-MM-YYYY').diff(moment(new Date(), 'DD-MM-YYYY'));
                            (Diff > 0) ? UpcomingMeetingArray.push(val) : PastMeetingArray.push(val);
                        }
                    });
                    //today meeting list
                    if (TodayMeetingArray.length === 0) {
                        TodayMeetings = [];
                    } else {
                        var NewArray = [];
                        const Array = TodayMeetingArray.map(val => {
                            return { ...val, date: moment(val.ScheduleDate + ' ' + val.ScheduleTime, 'DD-MM-YYYY hh:mm A').diff(moment(new Date(), 'DD-MM-YYYY hh:mm A')) };
                        });
                        Array.filter(val => {
                            (val.ScheduleDate < 0) ? PastMeetingArray.push(val._doc) : NewArray.push(val);
                        });
                        if (NewArray.length === 0) {
                            TodayMeetings = [];
                        } else if (NewArray.length === 1) {
                            TodayMeetings = NewArray[0]._doc;
                        } else {
                            const NewList = NewArray.sort((a, b) => { return a.date - b.date });
                            NewList.filter(val => { TodayMeetings.push(val._doc) });
                        };
                    };
                    //upcoming meetings list
                    if (UpcomingMeetingArray.length === 0) {
                        UpcomingMeetings = [];
                    } else if (UpcomingMeetingArray.length === 1) {
                        UpcomingMeetings = UpcomingMeetingArray;
                    } else {
                        const Array2 = UpcomingMeetingArray.map(val => {
                            return { ...val, date: moment(val.ScheduleDate + ' ' + val.ScheduleTime, 'DD-MM-YYYY hh:mm A').diff(moment(new Date(), 'DD-MM-YYYY hh:mm A')) };
                        });
                        const NewList = Array2.sort((a, b) => { return a.date - b.date });
                        NewList.filter(val => { UpcomingMeetings.push(val._doc) });
                    };
                    //past meetings list
                    if (PastMeetingArray.length === 0) {
                        PastMeetings = [];
                    } else if (PastMeetingArray.length === 1) {
                        PastMeetings = PastMeetingArray;
                    } else {
                        const Array2 = PastMeetingArray.map(val => {
                            return { ...val, date: moment(val.ScheduleDate + ' ' + val.ScheduleTime, 'DD-MM-YYYY hh:mm A').diff(moment(new Date(), 'DD-MM-YYYY hh:mm A')) };
                        });
                        const NewList = Array2.sort((a, b) => { return b.date - a.date });
                        NewList.filter(val => { PastMeetings.push(val._doc) });
                    };
                    const AllList = {
                        Today: TodayMeetings,
                        Upcoming: UpcomingMeetings,
                        Others: PastMeetings
                    };
                    res.send(AllList);
                } else {
                    if (UserScheduleList.length === 0) {
                        res.send({ message: 'No Records Found' });
                    } else {
                        var FinalResult = [];
                        UserScheduleList.filter(val => {
                            if (val.ScheduleDate === SelectedDate) {
                                FinalResult.push(val);
                            }
                        });
                        if (FinalResult.length === 0) {
                            res.send({ message: 'No Records Found' });
                        } else {
                            res.send(FinalResult);
                        }
                    }
                }
            }
        });
    } catch (err) {
        res.send({ statusCode: 400, message: 'Failed' });
    };
};

//Get Meeting Count By Email
const GetMeetingCountByEmail = (req, res) => {
    const Email = req.params.Email;
    const Month = req.params.Month;

    try {
        if (Email || Month) {
            ScheduleModel.find({}, function (err, result) {
                if (err) {
                    res.send({ statusCode: 400, message: 'Failed' });
                } else if (result.length === 0) {
                    res.send({ message: "No Records Found" });
                } else {
                    var UserScheduleList = [], FilteredArray = [];
                    result.filter(val => {
                        val.Participants.filter(p => {
                            if (p.Email === Email) { UserScheduleList.push(val) };
                        });
                    });
                    if (UserScheduleList.length === 0) {
                        FilteredArray = [];
                    } else {
                        UserScheduleList.filter(val => {
                            if (val.ScheduleDate.slice(3, 5) === Month) {
                                FilteredArray.push(val);
                            }
                        });
                    };
                    const MonthInChar = moment().month((Month - 1)).format('MMMM');
                    res.send({ message: `${FilteredArray.length} meeting in ${MonthInChar}` });
                }
            });
        } else {
            res.send({ statusCode: 400, message: "required" });
        };
    } catch (err) {
        res.send({ statusCode: 400, message: 'Failed' });
    };
};

// Get Schedule Details By id
const GetScheduleDetailsbyId = (req, res) => {
    const Id = req.params.id;

    try {
        ScheduleModel.findById({ _id: Id }, function (err, result) {
            if (err) {
                res.send({ statusCode: 400, message: 'Failed' });
            } else if (result === null) {
                res.send({ statusCode: 400, message: "Schedule does not Exist!" });
            } else {
                const UserProfile = [], List = [];
                UserModel.find({}, function (err, result2) {
                    if (err) {
                        res.send({ statusCode: 400, message: 'Failed' });
                    } else {
                        if (result2.length === 0) {
                            UserProfile = [];
                        } else {
                            result.Participants.filter(a => {
                                result2.filter(b => {
                                    if (a.Email === b.Email) {
                                        if (b.ProfileImage === undefined) {
                                            var NewArray = {
                                                Name: a.Name,
                                                Email: a.Email,
                                                Position: a.Position,
                                                ProfileImage: b.FirstName.slice(0, 1)
                                            };
                                            UserProfile.push(NewArray);
                                        } else {
                                            var NewArray = {
                                                Name: a.Name,
                                                Email: a.Email,
                                                Position: a.Position,
                                                ProfileImage: b.ProfileImage
                                            };
                                            UserProfile.push(NewArray);
                                        }
                                    }
                                });
                            });
                            res.send({ result, Participants_Profile: UserProfile });
                        }
                    }
                });
            }
        });
    } catch (err) {
        res.send({ statusCode: 400, message: 'Failed' });
    }
};

module.exports = {
    ConfirmSchedule,
    GetScheduleList,
    GetScheduleListByDateAndEmail,
    GetMeetingCountByEmail,
    GetScheduleDetailsbyId,
    CreateProposeMeeting,
    CreateSchedule,
    UpdateSchedule,
    ConfirmMeetingRescheduleRequest,
    ProposalMeetingRescheduleRequest,
    ConfirmMeetingRescheduleRequestAccepted
}
