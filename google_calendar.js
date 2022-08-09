const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const moment = require('moment-timezone');
require('dotenv').config();



const OAuth2Client = new OAuth2(
    process.env.ClientID, //client Id
    process.env.ClientSecret //client Secret
)

OAuth2Client.setCredentials({
    refresh_token:process.env.refresh_token
})

const calendar = google.calendar({ version: 'v3', auth: OAuth2Client })
var eventStartTime = '2022-08-09T11:00:00Z'
var eventEndTime = '2022-08-09T12:00:00Z'

// var eventStartTime=new Date();
// eventStartTime=moment.utc(eventStartTime).local().format()
// console.log("eventStartTime",eventStartTime)
// // eventStartTime.setDate(eventStartTime.getDay()+2);

// console.log("date+2",eventStartTime)

// var eventEndTime = new Date();


// // eventEndTime.setDate(eventEndTime.getDay()+2);

// eventEndTime.setMinutes(eventEndTime.getMinutes()+45);
// eventEndTime=moment.utc(eventEndTime).local().format()


let event = {
    summary: 'New1 Meeting',
    description: 'sample description',
    start: {
        dateTime: eventStartTime,
        timezone: 'Asia/kolkata'
    },
   
    end: {
        dateTime: eventEndTime,
        timezone: 'Asia/kolkata'
    },
    attendees: [
        // { email: 'durgadevi@mindmade.in' },
        { email: 'madhupriya@mindmade.in' },
        
        {email:"durgadevi@mindmade.in",organizer:true}
        //should be included common//admin
    ],
    
    colorId: 0, //google calendar api have 11 different colors to display an event
    conferenceData: {
        createRequest: {
          requestId: "sample123",
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      organizer:"durgadevi@mindmade.in",
}

// check the available slots
calendar.freebusy.query(
    {
        resource: {
            timeMin: eventStartTime,
            timeMax: eventEndTime,
            timezone: 'Asia/kolkata',
            items: [{ id: 'primary' }] //items should check user's all the calendars 
        }
    }, (err, res) => {
        if (err) {
            return console.error("Free busy query err", err)
        }else{
            calendar.events.insert(
                { calendarId: 'primary', resource: event, conferenceDataVersion:1 },
                (err,result) => {
                    if (err) console.error("Calendar event creation err", err)

                    return console.log('Calendar Event Created successfully',result.data.hangoutLink)
                }
            )
        }
       
       
    })

//get list of events
const getEvents = async (dateTimeStart, dateTimeEnd) => {
    try {
        let response = await calendar.events.list({
            auth: OAuth2Client,
            calendarId: 'primary',
            timeMin: dateTimeStart,
            timeMax: dateTimeEnd,
            timeZone: "Asia/Kolkata"
        })
        let items = response['data']['items'];
        return items;
    } catch (err) {
        console.log("Error at Catch", err)
        return 0;
    }
}

let start = '2022-08-05T00:00:00Z';
let end = '2022-08-08T00:00:00Z';

getEvents(start,end).then((res) => {
    console.log(res)
}).catch((err) => {
        console.log(err)
    })