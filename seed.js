import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Participant from "./backend/app/model/Participant.js";
import Event from "./backend/app/model/Event.js";
import Venue from "./backend/app/model/Venue.js";
import Artist from "./backend/app/model/Artist.js";
import User from "./backend/app/model/User.js";

const MONGO_URI = "mongodb://127.0.0.1:27017/artist-tracker";

const allowedGenres = [
  "Pop", "Rock", "Hip Hop", "Jazz", "Classical",
  "Electronic", "Country", "R&B", "Indie", "Folk", "Other"
];
const allowedVenueTypes = [
  "Bar", "Club", "Theater", "Concert Hall", "Outdoor",
  "Stadium", "Cafe", "Restaurant", "Other"
];
const allowedCategories = [
  "Concert", "Open Mic", "Festival", "Private Event",
  "Workshop", "Album Release", "Other"
];
const allowedStatuses = ["upcoming", "ongoing", "completed", "cancelled"];

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Clean old data
  await User.deleteMany({});
  await Artist.deleteMany({});
  await Venue.deleteMany({});
  await Event.deleteMany({});
  await Participant.deleteMany({});

  // 1. Create 1000 users
  const users = [];
  for (let i = 0; i < 1000; i++) {
    users.push(new User({
      email: faker.internet.email(),
      password: faker.internet.password(), // For dev only!
      role: "fan",
      isActive: true,
    }));
  }
  await User.insertMany(users);

  // 2. Create 40 artists (linked to users)
  const artistUsers = users.slice(0, 40);
  const artists = [];
  for (let i = 0; i < 40; i++) {
    const artist = new Artist({
      user: artistUsers[i]._id,
      artistName: faker.person.fullName(),
      stageName: faker.person.fullName(),
      bio: faker.lorem.sentences(2),
      genre: [faker.helpers.arrayElement(allowedGenres)],
      profileImage: faker.image.avatar(),
      location: {
        city: faker.location.city(),
        state: faker.location.state(),
        country: "India",
      },
    });
    artists.push(artist);
    artistUsers[i].artistProfile = artist._id;
    await artistUsers[i].save();
  }
  await Artist.insertMany(artists);

  // 3. Create 50 venues (with lat/lng and logo)
  const venues = [];
  for (let i = 0; i < 50; i++) {
    venues.push(new Venue({
      name: faker.company.name(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: "India",
        zipCode: faker.location.zipCode(),
      },
      coordinates: {
        lat: parseFloat(faker.location.latitude()),
        lng: parseFloat(faker.location.longitude()),
      },
      venueType: faker.helpers.arrayElement(allowedVenueTypes),
      capacity: faker.number.int({ min: 50, max: 1000 }),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      images: [faker.image.urlPicsumPhotos({ width: 400, height: 300 })], // logo
      isActive: true,
    }));
  }
  await Venue.insertMany(venues);

  // 4. Create 100 events by random artists at random venues, with random status
  const events = [];
  for (let i = 0; i < 100; i++) {
    events.push(new Event({
      artist: faker.helpers.arrayElement(artists)._id,
      venue: faker.helpers.arrayElement(venues)._id,
      title: faker.lorem.words(3),
      description: faker.lorem.sentences(2),
      startDateTime: faker.date.future(),
      category: faker.helpers.arrayElement(allowedCategories),
      maxParticipants: faker.number.int({ min: 50, max: 500 }),
      poster: faker.image.urlPicsumPhotos({ width: 400, height: 600 }),
      status: faker.helpers.arrayElement(allowedStatuses), // <-- random status
    }));
  }
  await Event.insertMany(events);

  // 5. Register each user for 5 random events
  const allEvents = await Event.find({});
  const participants = [];
  for (let user of users) {
    const registeredEvents = faker.helpers.arrayElements(allEvents, 5);
    for (let event of registeredEvents) {
      participants.push(new Participant({
        event: event._id,
        fan: user._id,
        status: "registered"
      }));
    }
  }
  await Participant.insertMany(participants);

  console.log("Database seeded!");
  process.exit();
}

seed();