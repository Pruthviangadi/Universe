"use client";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
}

type CalendarChangeParams = Parameters<NonNullable<React.ComponentProps<typeof Calendar>["onChange"]>>;

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  const eventsForDay = events.filter((event) => {
    const eventDate = new Date(event.start);
    return (
      eventDate.getFullYear() === selectedDate.getFullYear() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getDate() === selectedDate.getDate()
    );
  });

  const handleCalendarChange = (...[value]: CalendarChangeParams) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  // Events for the next 15 days
  const today = new Date();
  const fifteenDaysFromNow = new Date(today);
  fifteenDaysFromNow.setDate(today.getDate() + 15);
  const eventsNext15Days = events
    .filter((event) => {
      const eventDate = new Date(event.start);
      return eventDate >= today && eventDate <= fifteenDaysFromNow;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Event Calendar</h1>
      <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
        <div className="bg-card p-4 rounded shadow">
          <Calendar
            onChange={handleCalendarChange}
            value={selectedDate}
            selectRange={false}
            tileContent={({ date, view }) => {
              if (view === 'month' && events.some(
                (event) =>
                  new Date(event.start).getFullYear() === date.getFullYear() &&
                  new Date(event.start).getMonth() === date.getMonth() &&
                  new Date(event.start).getDate() === date.getDate()
              )) {
                return <span className="block mx-auto mt-1 w-2 h-2 rounded-full bg-blue-500" />;
              }
              return undefined;
            }}
          />
        </div>
        <div className="flex-1 w-full">
          <h2 className="text-xl font-semibold mb-4 text-center md:text-left">
            Events on {selectedDate
              ? `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`
              : "-"}
          </h2>
          {loading ? (
            <div>Loading events...</div>
          ) : eventsForDay.length === 0 ? (
            <div className="text-muted-foreground text-center">No events for this day.</div>
          ) : (
            <ul className="space-y-4">
              {eventsForDay.map((event) => (
                <li key={event.id} className="bg-card p-4 rounded shadow">
                  <div className="font-bold text-lg">{event.title}</div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {event.end &&
                      ` - ${new Date(event.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                  </div>
                  {event.location && <div className="text-sm mb-1">📍 {event.location}</div>}
                  {event.description && <div className="text-sm">{event.description}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Next 15 days events */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-center md:text-left">Events in the Next 15 Days</h2>
        {eventsNext15Days.length === 0 ? (
          <div className="text-muted-foreground text-center">No events scheduled in the next 15 days.</div>
        ) : (
          <ul className="space-y-4">
            {eventsNext15Days.map((event) => (
              <li key={event.id} className="bg-card p-4 rounded shadow flex flex-col md:flex-row md:items-center md:gap-6">
                <div className="font-bold text-lg flex-1">{event.title}</div>
                <div className="text-sm text-muted-foreground mb-1 md:mb-0">
                  {new Date(event.start).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  {" "}
                  {new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {event.end &&
                    ` - ${new Date(event.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                </div>
                {event.location && <div className="text-sm mb-1 md:mb-0">📍 {event.location}</div>}
                {event.description && <div className="text-sm text-muted-foreground">{event.description}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 