import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import resourceService from "../services/resourceService";
import bookingService from "../services/bookingService";

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const API_ROOT = (process.env.REACT_APP_API_URL || "http://localhost:8081/api").replace(/\/api\/?$/, "");
const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${API_ROOT}${url.startsWith("/") ? "" : "/"}${url}`;
};
const toLocalIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function ResourceDetail() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const [resourceData, bookingsData] = await Promise.all([
          resourceService.getById(id),
          bookingService.getUpcomingByResource(id, 7),
        ]);
        setResource(resourceData);
        setUpcomingBookings(bookingsData || []);
      } catch (e) {
        setError(e?.response?.data?.error || "Failed to load resource details.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-8 text-slate-500">Loading details...</div>;
  if (error) return <div className="max-w-5xl mx-auto px-4 py-8 text-rose-700 font-semibold">{error}</div>;
  if (!resource) return null;

  const amenities = Array.isArray(resource.amenities) && resource.amenities.length > 0
    ? resource.amenities
    : ["WiFi", "Power outlets", "Projector support"];

  const weeklySlots = Array.isArray(resource.weeklySlots) ? resource.weeklySlots : [];
  const hasWeeklySlots = weeklySlots.length > 0;

  const nextSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const iso = toLocalIsoDate(date);
    const dayName = DAY_NAMES[date.getDay()];
    const daySlots = weeklySlots
      .filter((slot) => String(slot?.day || "").toUpperCase() === dayName)
      .map((slot) => ({ from: slot.from, to: slot.to }))
      .filter((slot) => slot.from && slot.to)
      .sort((a, b) => String(a.from).localeCompare(String(b.from)));

    const dayBookings = upcomingBookings
      .filter((b) => b.date === iso)
      .sort((a, b) => String(a.startTime || "").localeCompare(String(b.startTime || "")));

    const fallbackWindow = resource.availableFrom && resource.availableTo
      ? [{ from: resource.availableFrom, to: resource.availableTo }]
      : [];

    const configuredSlots = hasWeeklySlots ? daySlots : fallbackWindow;
    const unavailable = configuredSlots.length === 0;

    return { iso, label: WEEK[date.getDay()], dayBookings, configuredSlots, unavailable };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/facilities" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
        Back to catalogue
      </Link>

      <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            {resource.imageUrl ? (
              <img src={resolveImageUrl(resource.imageUrl)} alt={resource.name} className="h-64 w-full object-cover rounded-xl" />
            ) : (
              <div className="h-64 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                Photo gallery
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{resource.name}</h1>
            <p className="mt-1 text-slate-500">{String(resource.type || "").replaceAll("_", " ")} - {resource.location}</p>
            <p className="mt-2 text-sm text-slate-600">Capacity: {resource.capacity ?? "N/A"}</p>
            <p className="mt-2">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${resource.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                {resource.status === "ACTIVE" ? "🟢 Available" : "🔴 Out of Service"}
              </span>
            </p>

            <div className="mt-4">
              <h2 className="font-bold text-slate-900">Amenities</h2>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
                {amenities.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link to="/bookings" className="text-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
                Request Booking
              </Link>
              <Link to="/tickets" className="text-center px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50">
                Report an Issue
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-lg font-black text-slate-900">Upcoming Availability Preview</h2>
        <p className="text-sm text-slate-500 mt-1">
          Shows configured daily slots with real booking usage for the next 7 days.
        </p>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-7 gap-2">
          {nextSevenDays.map((day) => (
            <div key={day.iso} className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-bold text-slate-500 uppercase">{day.label}</p>
              <p className="text-[11px] text-slate-400">{day.iso}</p>
              {day.unavailable ? (
                <p className="text-xs text-slate-500 font-semibold mt-2">Unavailable</p>
              ) : (
                <>
                  <div className="mt-1 space-y-1">
                    {day.configuredSlots.slice(0, 2).map((slot, idx) => (
                      <p key={`${day.iso}-slot-${idx}`} className="text-[11px] text-slate-600">
                        Slot {String(slot.from).slice(0, 5)}-{String(slot.to).slice(0, 5)}
                      </p>
                    ))}
                    {day.configuredSlots.length > 2 && (
                      <p className="text-[11px] text-slate-500">+{day.configuredSlots.length - 2} slots</p>
                    )}
                  </div>
                  {day.dayBookings.length === 0 ? (
                    <p className="text-xs text-emerald-600 font-semibold mt-1">Free</p>
                  ) : (
                    <div className="mt-1 space-y-1">
                      {day.dayBookings.slice(0, 2).map((b) => (
                        <p key={b.id} className="text-xs text-rose-600 font-semibold">
                          Busy {String(b.startTime || "").slice(0, 5)}-{String(b.endTime || "").slice(0, 5)}
                        </p>
                      ))}
                      {day.dayBookings.length > 2 && (
                        <p className="text-[11px] text-slate-500">+{day.dayBookings.length - 2} bookings</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
