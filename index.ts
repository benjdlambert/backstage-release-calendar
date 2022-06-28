import * as luxon from "luxon";
const ical = require("node-ical");

interface Event {
  type: string;
  summary: string;
  rrule?: {
    between: (date: Date, date2: Date) => Date[];
  };
  start: Date;
}
const main = async () => {
  const communityEventsCalendar: Record<string, Event> =
    await ical.async.fromURL(
      "https://calendar.google.com/calendar/ical/c_qup9gbhn9sqpuao6trttd8mk5s%40group.calendar.google.com/public/basic.ics"
    );

  const communityEvents = Object.values(communityEventsCalendar)
    .filter(
      (e) => e.type === "VEVENT" && e.summary.includes("Adopters") && e.rrule
    )
    .flatMap((e) =>
      e.rrule?.between(
        luxon.DateTime.local().toJSDate(),
        luxon.DateTime.local().plus({ years: 1 }).toJSDate()
      )
    )
    .filter((e): e is Date => Boolean(e))
    .map((e) => luxon.DateTime.fromJSDate(e).toISODate());

  const today = luxon.DateTime.local();

  // get the closest tuesday.
  const tuesday = today.plus({ day: 2 - today.weekday });

  // for every tuesday throughout the year
  for (let i = 0; i < 52; i++) {
    const current = tuesday.plus({ weeks: i });
    const wednesday = current.plus({ days: 1 });

    const isMainlineRelease = communityEvents.includes(wednesday.toISODate());
    console.log("isMainline", wednesday.toISODate(), isMainlineRelease);
  }
};

main();
