import { Schema, model } from 'mongoose'

const studentsSchema = new Schema({
    profile_pic: {
        type: String,
        default: null
    },
    displayname: {
        type: String,
        validate: {
            validator: (displayname) => displayname !== "",
            message: "Displayname is not provided" 
        }
    },
    email: {
        type: String,
        validate: [
            {
                validator: (email) => email != "",
                message: "Email is not provided" 
            },
            {
                validator: (email: any) => email.includes("@"),
                message: `The email addess is not valid`
            },
        ],
        unique: true,
    },
    password: {
        type: Schema.Types.Mixed,
        validate: {
            validator: (password) => password !== "",
            message: "Password is not provided"
        }
    },
    studentID: {
        type: String,
        required: true,
        immutable: true,
        unique: true
    },
    rollnumber: {
        type: String,
        default: "Not given"
    },
    collegesection: {
        type: String,
        default: "Not selected"
    },
    collegeyear: {
        type: String,
        default: "Not Selected"
    },
    authProvider: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        minLength: 0,
        maxLength: 300,
        default: "Just a student surviving on caffeine, last-minute deadlines, and the hope that 'Ctrl + Z' works in real life."
    },
    favouritesubject: {
        type: String,
        default: "Not selected"
    },
    notfavsubject: {
        type: String,
        default: "Not selected"
    },
    group: {
        type: String,
        default: "Not given"
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    visibility: {
        type: String,
        default: "public"
    },
    owned_notes: {
        type: [Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    owned_posts: {
        type: [Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    saved_notes: {
        type: [Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    featured_notes: {
        type: [Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    downloaded_notes: {
        type: [Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    badges: {
        type: [Number],
        default: [0],
        unique: false
    },
    district: {
        type: String,
        default: ""
    },
    collegeID: {
        type: Schema.Types.Mixed, //* Either the college name (custom one) or the college ID (pre-defined one)
        default: "Not Given",
    },
    onboarded: {
        type: Boolean,
        default: false
    }
})

const studentsModel = model('students', studentsSchema)

export default studentsModel