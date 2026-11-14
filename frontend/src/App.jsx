import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp, ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check,
  CheckCircle2, ChevronDown, CircleHelp, Clock3, Compass, CreditCard,
  Globe2, Luggage, LockKeyhole, LogIn, Menu, Minus, Plane, Plus, Search,
  ShieldCheck, Sparkles, Ticket, UserRound, Users, X
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const STORAGE = {
  token: "aether_token",
  email: "aether_email",
  userId: "aether_user_id",
  trips: "aether_demo_trips",
};

async function api(path, { token, method = "GET", body, headers = {} } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { "x-access-token": token } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const message = payload?.error?.message || payload?.message || `Request failed (${response.status})`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return payload?.data ?? payload;
}

const currency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));

const dateLabel = (value, options = { weekday: "short", day: "numeric", month: "short" }) =>
  value ? new Date(value).toLocaleDateString("en-IN", options) : "—";

const timeLabel = (value) =>
  value ? new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "—";

const airportTitle = (airport) =>
  airport ? `${airport.code} · ${airport.City?.name || airport.city?.name || airport.name || "Airport"}` : "Select airport";

const getAirportCode = (flight, side) =>
  side === "from" ? flight.departureAirportId : flight.arrivalAirportId;

const getAirportName = (flight, side) => {
  const airport = side === "from" ? flight.departureAirport : flight.arrivalAirport;
  return airport?.City?.name || airport?.city?.name || airport?.name || getAirportCode(flight, side) || "—";
};

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE.token) || "");
  const [email, setEmail] = useState(() => localStorage.getItem(STORAGE.email) || "");
  const [userId, setUserId] = useState(() => localStorage.getItem(STORAGE.userId) || "");
  const [airports, setAirports] = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [departDate, setDepartDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [travellers, setTravellers] = useState(1);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [flights, setFlights] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sort, setSort] = useState("price_ASC");
  const [priceCeiling, setPriceCeiling] = useState(30000);

  const [page, setPage] = useState("home");
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [travellerDetails, setTravellerDetails] = useState([]);
  const [checkoutStep, setCheckoutStep] = useState("details");
  const [booking, setBooking] = useState(null);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [localTrips, setLocalTrips] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE.trips) || "[]"); }
    catch { return []; }
  });
  const [confirmation, setConfirmation] = useState(null);

  const today = new Date().toISOString().slice(0, 10);
  const sortedFlights = useMemo(() => {
    const filtered = flights.filter((flight) => Number(flight.price || 0) <= priceCeiling);
    return filtered.sort((a, b) => {
      if (sort === "price_DESC") return Number(b.price) - Number(a.price);
      if (sort === "departureTime_ASC") return new Date(a.departureTime) - new Date(b.departureTime);
      return Number(a.price) - Number(b.price);
    });
  }, [flights, priceCeiling, sort]);

  async function loadAirports(activeToken = token) {
    if (!activeToken) return;
    setAirportsLoading(true);
    try {
      const result = await api("/flightsService/api/v1/airports", { token: activeToken });
      const list = Array.isArray(result) ? result : [];
      setAirports(list);
      if (list.length) {
        setFromCode((current) => current || list[0].code);
        setToCode((current) => current || list.find((a) => a.code !== list[0].code)?.code || "");
      }
    } catch (error) {
      setSearchError(`Could not load airports: ${error.message}`);
    } finally {
      setAirportsLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadAirports(token);
  // Load airports once when an existing session is restored.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function signOut() {
    Object.values(STORAGE).forEach((key) => {
      if (key !== STORAGE.trips) localStorage.removeItem(key);
    });
    setToken("");
    setEmail("");
    setUserId("");
    setAirports([]);
    setFlights([]);
    setHasSearched(false);
    setPage("home");
  }

  async function handleAuth(event) {
    event.preventDefault();
    setAuthError("");
    setAuthBusy(true);
    const form = new FormData(event.currentTarget);
    const nextEmail = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    try {
      let createdUser = null;
      if (authMode === "signup") {
        createdUser = await api("/api/v1/user/signup", {
          method: "POST", body: { email: nextEmail, password },
        });
      }
      const jwt = await api("/api/v1/user/signin", {
        method: "POST", body: { email: nextEmail, password },
      });
      if (typeof jwt !== "string") throw new Error("The sign-in response did not contain a JWT token.");
      const id = createdUser?.id || userId;
      setToken(jwt);
      setEmail(nextEmail);
      if (id) setUserId(String(id));
      localStorage.setItem(STORAGE.token, jwt);
      localStorage.setItem(STORAGE.email, nextEmail);
      if (id) localStorage.setItem(STORAGE.userId, String(id));
      setAuthOpen(false);
      await loadAirports(jwt);
      setAuthError("");
    } catch (error) {
      setAuthError(error.message || "Unable to authenticate.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function searchFlights(event) {
    event?.preventDefault();
    setSearchError("");
    if (!token) {
      setAuthMode("signin");
      setAuthOpen(true);
      setSearchError("Sign in to search the live flight inventory.");
      return;
    }
    if (!fromCode || !toCode) {
      setSearchError("Choose both departure and arrival airports.");
      return;
    }
    if (fromCode === toCode) {
      setSearchError("Departure and arrival airports must be different.");
      return;
    }
    setSearchBusy(true);
    setHasSearched(true);
    setFlights([]);
    try {
      const params = new URLSearchParams({
        trips: `${fromCode}-${toCode}`,
        travellers: String(travellers),
        tripDate: departDate,
        sort,
      });
      const result = await api(`/flightsService/api/v1/flights?${params.toString()}`, { token });
      setFlights(Array.isArray(result) ? result : []);
      setPriceCeiling(30000);
      setPage("home");
      setTimeout(() => document.getElementById("flight-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (error) {
      setSearchError(error.message || "Flight search failed.");
    } finally {
      setSearchBusy(false);
    }
  }

  function beginBooking(flight) {
    if (!token) {
      setAuthMode("signin");
      setAuthOpen(true);
      return;
    }
    setSelectedFlight(flight);
    setTravellerDetails(Array.from({ length: travellers }, (_, index) => ({
      fullName: index === 0 ? "" : "",
      type: "Adult",
    })));
    setBooking(null);
    setCheckoutStep("details");
    setCheckoutError("");
    setPaymentError("");
    setPage("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateTraveller(index, field, value) {
    setTravellerDetails((current) => current.map((person, i) => i === index ? { ...person, [field]: value } : person));
  }

  async function createReservation(event) {
    event.preventDefault();
    setCheckoutError("");
    if (!userId) {
      setCheckoutError("Your account ID was not returned by signup. Sign out and create a new demo account, or sign in with an account created through this frontend.");
      return;
    }
    if (travellerDetails.some((person) => !person.fullName.trim())) {
      setCheckoutError("Enter the full name for every traveller.");
      return;
    }
    setBookingBusy(true);
    try {
      const result = await api("/bookingService/api/v1/bookings", {
        token,
        method: "POST",
        body: { flightId: selectedFlight.id, userId: Number(userId), noofSeats: travellers },
      });
      setBooking(result);
      setCheckoutStep("payment");
    } catch (error) {
      setCheckoutError(error.message || "We couldn't create this reservation.");
    } finally {
      setBookingBusy(false);
    }
  }

  async function completePayment() {
    if (!booking) return;
    setPaymentError("");
    setPaymentBusy(true);
    const key = booking._aetherIdempotencyKey || makeIdempotencyKey();
    const paymentBooking = { ...booking, _aetherIdempotencyKey: key };
    setBooking(paymentBooking);
    try {
      await api("/bookingService/api/v1/bookings/payments", {
        token,
        method: "POST",
        headers: { "x-idempotency-key": key },
        body: {
          totalCost: Number(booking.totalCost),
          userId: Number(userId),
          bookingId: Number(booking.id),
        },
      });
      const record = {
        bookingId: booking.id,
        flightId: selectedFlight.id,
        flightNumber: selectedFlight.flightNumber,
        from: getAirportCode(selectedFlight, "from"),
        to: getAirportCode(selectedFlight, "to"),
        fromName: getAirportName(selectedFlight, "from"),
        toName: getAirportName(selectedFlight, "to"),
        departureTime: selectedFlight.departureTime,
        arrivalTime: selectedFlight.arrivalTime,
        travellers,
        totalCost: Number(booking.totalCost),
        bookedAt: new Date().toISOString(),
        passengerNames: travellerDetails.map((person) => person.fullName),
        demoOnly: true,
      };
      const updated = [record, ...localTrips.filter((trip) => trip.bookingId !== record.bookingId)];
      setLocalTrips(updated);
      localStorage.setItem(STORAGE.trips, JSON.stringify(updated));
      setConfirmation(record);
      setPage("confirmation");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setPaymentError(`${error.message} If the server may have processed the payment before the connection failed, check the booking state before retrying.`);
    } finally {
      setPaymentBusy(false);
    }
  }

  function resetToSearch() {
    setPage("home");
    setSelectedFlight(null);
    setBooking(null);
    setConfirmation(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const selectedFrom = airports.find((airport) => airport.code === fromCode);
  const selectedTo = airports.find((airport) => airport.code === toCode);

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-ink">
      <header className="site-header">
        <div className="nav-shell">
          <button className="brand" onClick={resetToSearch} aria-label="Aether home">
            <span className="brand-mark"><Plane size={17} strokeWidth={1.8} /></span>
            <span>AETHER<span className="brand-sub">TRAVEL, THOUGHTFULLY</span></span>
          </button>
          <nav className={`main-nav ${mobileMenu ? "nav-open" : ""}`}>
            <button className={page === "home" ? "nav-link active" : "nav-link"} onClick={() => { resetToSearch(); setMobileMenu(false); }}>Explore</button>
            <button className={page === "trips" ? "nav-link active" : "nav-link"} onClick={() => { setPage("trips"); setMobileMenu(false); }}>My trips</button>
            <a className="nav-link" href="#footer" onClick={() => setMobileMenu(false)}>Our promise</a>
          </nav>
          <div className="nav-actions">
            {token ? (
              <div className="account-menu">
                <span className="account-avatar"><UserRound size={16} /></span>
                <span className="account-email">{email}</span>
                <button className="text-button" onClick={signOut}>Sign out</button>
              </div>
            ) : (
              <button className="signin-link" onClick={() => { setAuthMode("signin"); setAuthOpen(true); }}>
                Sign in <ArrowUpRight size={15} />
              </button>
            )}
          </div>
          <button className="mobile-menu-button" onClick={() => setMobileMenu((value) => !value)} aria-label="Toggle menu">
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {page === "home" && (
        <>
          <main>
            <section className="hero">
              <div className="hero-image" />
              <div className="hero-shade" />
              <div className="hero-content">
                <div className="eyebrow light"><span /> THE ART OF GETTING THERE</div>
                <h1>Go somewhere<br /><em>beautiful.</em></h1>
                <p className="hero-copy">The journey is part of the story.<br />Make every mile feel considered.</p>
                <div className="hero-note"><Compass size={16} /> A more thoughtful way to fly</div>
              </div>
              <div className="hero-bottom"><span>01 / DISCOVER</span><span>WANDER WELL, ARRIVE BETTER</span></div>
            </section>

            <section className="search-wrap" id="search">
              <div className="search-card">
                <div className="search-heading">
                  <div><span className="section-kicker">YOUR NEXT CHAPTER</span><h2>Where to next?</h2></div>
                  <div className="trip-type"> <span className="trip-dot" /> One way <ChevronDown size={14} /></div>
                </div>
                <form onSubmit={searchFlights}>
                  <div className="search-fields">
                    <label className="field-block">
                      <span className="field-label">FROM</span>
                      <span className="field-value"><Plane className="field-icon rotate-plane" size={18} />
                        <select value={fromCode} onChange={(e) => setFromCode(e.target.value)} disabled={!token || airportsLoading || !airports.length}>
                          {!token && <option value="">Sign in to load airports</option>}
                          {token && airports.length === 0 && <option value="">{airportsLoading ? "Loading airports…" : "No airports found"}</option>}
                          {airports.map((airport) => <option key={airport.id || airport.code} value={airport.code}>{airportTitle(airport)}</option>)}
                        </select>
                      </span>
                    </label>
                    <button type="button" className="swap-button" title="Swap airports" onClick={() => { setFromCode(toCode); setToCode(fromCode); }}><ArrowDownUp size={16} /></button>
                    <label className="field-block">
                      <span className="field-label">TO</span>
                      <span className="field-value"><MapPinIcon />
                        <select value={toCode} onChange={(e) => setToCode(e.target.value)} disabled={!token || airportsLoading || !airports.length}>
                          {!token && <option value="">Sign in to load airports</option>}
                          {token && airports.length === 0 && <option value="">{airportsLoading ? "Loading airports…" : "No airports found"}</option>}
                          {airports.map((airport) => <option key={airport.id || airport.code} value={airport.code}>{airportTitle(airport)}</option>)}
                        </select>
                      </span>
                    </label>
                    <label className="field-block date-field">
                      <span className="field-label">DEPARTURE</span>
                      <span className="field-value"><CalendarDays size={18} className="field-icon" />
                        <input type="date" min={today} value={departDate} onChange={(e) => setDepartDate(e.target.value)} required />
                      </span>
                    </label>
                    <label className="field-block traveller-field">
                      <span className="field-label">TRAVELLERS</span>
                      <span className="field-value"><Users size={18} className="field-icon" />
                        <select value={travellers} onChange={(e) => setTravellers(Number(e.target.value))}>
                          {[1,2,3,4,5,6].map((number) => <option value={number} key={number}>{number} {number === 1 ? "traveller" : "travellers"}</option>)}
                        </select>
                      </span>
                    </label>
                  </div>
                  {searchError && <div className="inline-alert">{searchError}</div>}
                  <div className="search-submit-row">
                    <span className="search-assurance"><ShieldCheck size={15} /> Secure booking · No hidden fees</span>
                    <button className="primary-button search-button" type="submit" disabled={searchBusy}>
                      {searchBusy ? "Searching…" : "Find flights"} <ArrowRight size={17} />
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {hasSearched && (
              <section className="results-section content-shell" id="flight-results">
                <div className="results-top">
                  <div><span className="section-kicker">THE POSSIBILITIES</span><h2>Your flights, thoughtfully found.</h2>
                    <p>{selectedFrom?.City?.name || selectedFrom?.name || fromCode} to {selectedTo?.City?.name || selectedTo?.name || toCode} · {dateLabel(departDate)}</p>
                  </div>
                  <div className="result-controls">
                    <label className="sort-control">Sort by
                      <select value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="price_ASC">Price: low to high</option>
                        <option value="price_DESC">Price: high to low</option>
                        <option value="departureTime_ASC">Departure time</option>
                      </select>
                    </label>
                  </div>
                </div>
                {searchBusy ? <LoadingState label="Finding the right way there…" /> :
                  sortedFlights.length ? (
                    <div className="flight-layout">
                      <aside className="filter-card">
                        <div className="filter-title">Refine your search <span>01</span></div>
                        <label className="range-label">Maximum price <strong>{currency(priceCeiling)}</strong></label>
                        <input className="price-range" type="range" min="1000" max="30000" step="500" value={priceCeiling} onChange={(e) => setPriceCeiling(Number(e.target.value))} />
                        <div className="range-ends"><span>₹1,000</span><span>₹30,000+</span></div>
                        <div className="filter-divider" />
                        <div className="filter-note"><Sparkles size={15} /> Prices shown are returned by your local flight inventory.</div>
                      </aside>
                      <div className="flight-list">
                        {sortedFlights.map((flight) => <FlightCard key={flight.id} flight={flight} onChoose={() => beginBooking(flight)} />)}
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state"><div className="empty-icon"><Plane size={23} /></div><h3>No flights found for this journey.</h3><p>Try another date or route. Results are taken directly from the connected Flight Service.</p><button className="outline-button" onClick={() => document.getElementById("search")?.scrollIntoView({ behavior: "smooth" })}>Change search</button></div>
                  )}
              </section>
            )}

            {!hasSearched && <section className="benefits content-shell">
              <div className="benefit-intro"><span className="section-kicker">THE AETHER DIFFERENCE</span><h2>Travel should feel<br /><em>like a privilege.</em></h2></div>
              <div className="benefit-item"><span className="benefit-number">01</span><Globe2 size={22} /><h3>Room to discover</h3><p>Thoughtful journeys begin with the freedom to explore somewhere new.</p></div>
              <div className="benefit-item"><span className="benefit-number">02</span><ShieldCheck size={22} /><h3>Clarity at every step</h3><p>See the details that matter, with transparent fares and a clear checkout.</p></div>
              <div className="benefit-item"><span className="benefit-number">03</span><Sparkles size={22} /><h3>Details, considered</h3><p>A calmer booking experience, designed to keep the journey in focus.</p></div>
            </section>}
          </main>
          <Footer />
        </>
      )}

      {page === "checkout" && selectedFlight && (
        <main className="checkout-page content-shell">
          <button className="back-link" onClick={resetToSearch}><ArrowLeft size={16} /> Back to flights</button>
          <div className="checkout-heading"><span className="section-kicker">YOUR JOURNEY, COMING TOGETHER</span><h1>Almost <em>there.</em></h1><p>A few details, then the world is yours.</p></div>
          <div className="checkout-steps">
            <div className={checkoutStep === "details" ? "checkout-step current" : "checkout-step done"}><span>{checkoutStep === "details" ? "01" : <Check size={15} />}</span> Traveller details</div>
            <div className="step-line" />
            <div className={checkoutStep === "payment" ? "checkout-step current" : "checkout-step"}><span>02</span> Payment</div>
          </div>
          <div className="checkout-grid">
            <section className="checkout-main">
              {checkoutStep === "details" ? (
                <form className="panel checkout-panel" onSubmit={createReservation}>
                  <div className="panel-heading"><div><span className="section-kicker">THE PEOPLE ON THIS JOURNEY</span><h2>Traveller details</h2></div><Users size={21} /></div>
                  <p className="muted-copy">Enter each traveller's full name as it appears on their government-issued ID.</p>
                  {travellerDetails.map((person, index) => (
                    <div className="traveller-form" key={index}>
                      <div className="traveller-form-title"><span className="traveller-index">0{index + 1}</span><strong>Traveller {index + 1}</strong><span className="adult-pill">Adult</span></div>
                      <label className="form-label">Full name
                        <input className="text-input" value={person.fullName} onChange={(e) => updateTraveller(index, "fullName", e.target.value)} placeholder="As shown on your ID" autoComplete="name" required />
                      </label>
                    </div>
                  ))}
                  <div className="notice-box"><LockKeyhole size={17} /><span><strong>About traveller details</strong> The current Booking API accepts seat count but does not yet expose a passenger-details endpoint. These names stay in this browser checkout and are not saved to the backend.</span></div>
                  {checkoutError && <div className="inline-alert">{checkoutError}</div>}
                  <button className="primary-button full-button" type="submit" disabled={bookingBusy}>{bookingBusy ? "Holding your seats…" : "Continue to payment"} <ArrowRight size={17} /></button>
                </form>
              ) : (
                <div className="panel checkout-panel payment-panel">
                  <div className="panel-heading"><div><span className="section-kicker">A SIMPLE, SECURE DEMO</span><h2>Payment</h2></div><CreditCard size={22} /></div>
                  <div className="payment-demo"><div className="payment-icon"><ShieldCheck size={24} /></div><div><strong>Simulated payment</strong><p>This local demo marks the booking as paid through the existing Booking Service. No card details are collected and no real money moves.</p></div></div>
                  <div className="payment-lines"><span>Booking reference</span><strong>#{booking?.id ?? "—"}</strong><span>Amount due</span><strong className="amount-large">{currency(booking?.totalCost)}</strong></div>
                  {paymentError && <div className="inline-alert">{paymentError}</div>}
                  <button className="primary-button full-button" onClick={completePayment} disabled={paymentBusy}>{paymentBusy ? "Confirming payment…" : `Confirm demo payment · ${currency(booking?.totalCost)}`} <ArrowRight size={17} /></button>
                  <button className="back-link payment-back" onClick={() => setCheckoutStep("details")}><ArrowLeft size={15} /> Back to traveller details</button>
                </div>
              )}
            </section>
            <aside className="panel itinerary-panel">
              <span className="section-kicker">YOUR ITINERARY</span><h3>Flight summary</h3>
              <div className="itinerary-route">
                <div><strong>{getAirportCode(selectedFlight, "from")}</strong><span>{getAirportName(selectedFlight, "from")}</span><small>{timeLabel(selectedFlight.departureTime)}</small></div>
                <div className="itinerary-middle"><span className="route-rule" /><Plane size={17} /><span className="route-rule" /></div>
                <div><strong>{getAirportCode(selectedFlight, "to")}</strong><span>{getAirportName(selectedFlight, "to")}</span><small>{timeLabel(selectedFlight.arrivalTime)}</small></div>
              </div>
              <div className="summary-row"><span>Flight</span><strong>{selectedFlight.flightNumber}</strong></div>
              <div className="summary-row"><span>Date</span><strong>{dateLabel(selectedFlight.departureTime)}</strong></div>
              <div className="summary-row"><span>Travellers</span><strong>{travellers}</strong></div>
              <div className="summary-row"><span>Aircraft</span><strong>{selectedFlight.airplaneDetail?.modelNumber || "—"}</strong></div>
              <div className="summary-total"><span>Total {booking ? "to pay" : "estimated"}</span><strong>{currency(booking?.totalCost ?? Number(selectedFlight.price) * travellers)}</strong></div>
              <p className="small-note">Seat availability and fare are supplied by the connected Flight Service. Your reservation is created when you continue to payment.</p>
            </aside>
          </div>
        </main>
      )}

      {page === "confirmation" && confirmation && (
        <main className="confirmation-page content-shell">
          <div className="confirmation-card">
            <div className="success-mark"><Check size={28} /></div>
            <span className="section-kicker">A JOURNEY TO LOOK FORWARD TO</span>
            <h1>It's <em>happening.</em></h1>
            <p className="confirmation-copy">Your demo booking has been confirmed by the Booking Service. Here's the summary for your records.</p>
            <div className="confirmation-ref"><span>BOOKING REFERENCE</span><strong>#{confirmation.bookingId}</strong></div>
            <div className="confirmation-route">
              <div><span>{confirmation.from}</span><strong>{confirmation.fromName}</strong><small>{timeLabel(confirmation.departureTime)}</small></div>
              <div className="confirmation-plane"><Plane size={20} /></div>
              <div><span>{confirmation.to}</span><strong>{confirmation.toName}</strong><small>{timeLabel(confirmation.arrivalTime)}</small></div>
            </div>
            <div className="confirmation-details"><div><span>Flight</span><strong>{confirmation.flightNumber}</strong></div><div><span>Date</span><strong>{dateLabel(confirmation.departureTime)}</strong></div><div><span>Travellers</span><strong>{confirmation.travellers}</strong></div><div><span>Total</span><strong>{currency(confirmation.totalCost)}</strong></div></div>
            <div className="notice-box"><InfoIcon /><span>This project uses a simulated payment. Traveller names and this trip summary are stored only in this browser; the backend does not yet expose a ticket or booking-history endpoint.</span></div>
            <div className="confirmation-actions"><button className="primary-button" onClick={() => { setPage("trips"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>View my trips <ArrowRight size={17} /></button><button className="outline-button" onClick={resetToSearch}>Explore more flights</button></div>
          </div>
        </main>
      )}

      {page === "trips" && (
        <main className="trips-page content-shell">
          <div className="checkout-heading"><span className="section-kicker">YOUR TRAVEL JOURNAL</span><h1>My <em>trips.</em></h1><p>Your recent bookings from this browser.</p></div>
          {!token ? (
            <div className="empty-state"><div className="empty-icon"><UserRound size={23} /></div><h3>Sign in to view your journey.</h3><p>Your demo sessions are stored in this browser.</p><button className="primary-button" onClick={() => { setAuthMode("signin"); setAuthOpen(true); }}>Sign in <ArrowRight size={16} /></button></div>
          ) : localTrips.length ? (
            <div className="trips-list">{localTrips.map((trip) => <article className="trip-card" key={trip.bookingId}>
              <div className="trip-card-top"><span className="trip-status"><CheckCircle2 size={14} /> Payment accepted · Demo</span><span className="trip-reference">REF #{trip.bookingId}</span></div>
              <div className="trip-route"><div><strong>{trip.from}</strong><span>{trip.fromName}</span><small>{timeLabel(trip.departureTime)}</small></div><div className="trip-route-line"><Plane size={17} /></div><div><strong>{trip.to}</strong><span>{trip.toName}</span><small>{timeLabel(trip.arrivalTime)}</small></div></div>
              <div className="trip-card-bottom"><span>{trip.flightNumber} · {dateLabel(trip.departureTime)} · {trip.travellers} traveller(s)</span><strong>{currency(trip.totalCost)}</strong></div>
            </article>)}</div>
          ) : (
            <div className="empty-state"><div className="empty-icon"><Ticket size={23} /></div><h3>Nothing on the itinerary. Yet.</h3><p>Find a flight and your completed demo bookings will appear here.</p><button className="primary-button" onClick={resetToSearch}>Find a flight <ArrowRight size={16} /></button></div>
          )}
          <p className="local-history-note"><LockKeyhole size={14} /> This is browser-local demo history. The current backend does not provide a booking-history API.</p>
        </main>
      )}

      <Footer />
      {authOpen && <AuthModal mode={authMode} setMode={(mode) => { setAuthMode(mode); setAuthError(""); }} error={authError} busy={authBusy} onClose={() => setAuthOpen(false)} onSubmit={handleAuth} />}
    </div>
  );
}

function MapPinIcon() {
  return <span className="map-pin-icon">⌖</span>;
}

function FlightCard({ flight, onChoose }) {
  const from = getAirportCode(flight, "from");
  const to = getAirportCode(flight, "to");
  return (
    <article className="flight-card">
      <div className="flight-card-top"><div className="airline-mark"><Plane size={17} /></div><div className="flight-identity"><strong>{flight.airplaneDetail?.modelNumber || "Scheduled flight"}</strong><span>{flight.flightNumber} · Flight inventory</span></div><span className="live-inventory"><span /> Available inventory</span></div>
      <div className="flight-card-middle">
        <div className="flight-point"><strong>{timeLabel(flight.departureTime)}</strong><span>{from}</span><small>{getAirportName(flight, "from")}</small></div>
        <div className="flight-duration"><span>Journey</span><div><i /><Plane size={15} /><i /></div><small>{dateLabel(flight.departureTime, { day: "numeric", month: "short", year: "numeric" })}</small></div>
        <div className="flight-point destination"><strong>{timeLabel(flight.arrivalTime)}</strong><span>{to}</span><small>{getAirportName(flight, "to")}</small></div>
        <div className="flight-fare"><span>FARE / PERSON</span><strong>{currency(flight.price)}</strong><small>{flight.totalSeats} seats shown</small></div>
      </div>
      <div className="flight-card-bottom"><span><ShieldCheck size={14} /> Fare and seat count from live local API</span><button className="choose-button" onClick={onChoose}>Select flight <ArrowRight size={15} /></button></div>
    </article>
  );
}

function AuthModal({ mode, setMode, error, busy, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="auth-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={19} /></button>
        <div className="auth-brand"><span className="brand-mark"><Plane size={16} /></span><span>AETHER</span></div>
        <span className="section-kicker">{mode === "signin" ? "WELCOME BACK" : "A NEW WAY TO GO"}</span>
        <h2>{mode === "signin" ? "Your next journey awaits." : "Let's get you going."}</h2>
        <p>{mode === "signin" ? "Sign in to access the live flight inventory." : "Create an account to begin exploring flights."}</p>
        <form onSubmit={onSubmit}>
          <label className="form-label">Email address<input className="text-input" type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
          <label className="form-label">Password<input className="text-input" type="password" name="password" minLength="4" autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="Enter your password" required /></label>
          {error && <div className="inline-alert">{error}</div>}
          <button className="primary-button full-button" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in securely" : "Create account"} <ArrowRight size={16} /></button>
        </form>
        <div className="auth-switch">{mode === "signin" ? "New to Aether?" : "Already have an account?"} <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "Create an account" : "Sign in"}</button></div>
        <div className="auth-security"><LockKeyhole size={13} /> Your credentials are sent directly to your local API Gateway.</div>
      </div>
    </div>
  );
}

function LoadingState({ label }) {
  return <div className="loading-state"><span className="loading-orbit"><Plane size={19} /></span><strong>{label}</strong><p>Checking the connected Flight Service inventory.</p></div>;
}

function Footer() {
  return <footer className="site-footer" id="footer">
    <div className="footer-shell"><div className="footer-brand"><div className="brand"><span className="brand-mark"><Plane size={17} /></span><span>AETHER<span className="brand-sub">TRAVEL, THOUGHTFULLY</span></span></div><p>For the love of getting there.</p></div>
      <div className="footer-right"><span>MADE FOR MEANINGFUL MILES</span><span>DEMO EXPERIENCE · LOCAL FLIGHT INVENTORY</span></div>
    </div>
  </footer>;
}

function InfoIcon() {
  return <CircleHelp size={17} />;
}

function makeIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `aether-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default App;
