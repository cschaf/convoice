class Event {
    constructor(id, title, date, startTime, endTime, type, description = '', location = '', memberName = null) {
        this.id = id;
        this.title = title;
        this.date = date; // Expected format: 'YYYY-MM-DD'
        this.startTime = startTime; // Expected format: 'HH:MM'
        this.endTime = endTime; // Expected format: 'HH:MM'
        this.type = type; // 'chorprobe', 'event', 'geburtstag'
        this.description = description;
        this.location = location;
        this.memberName = memberName; // For birthday events
    }

    // Example method: Check if the event is in the future
    isUpcoming() {
        const now = new Date();
        const eventDate = new Date(this.date + 'T' + this.startTime); // Combine date and time
        // Set hours, minutes, seconds, and ms to 0 for today for date-only comparison if needed
        // For upcoming check, full date-time is usually better.
        return eventDate > now;
    }

    // Example method: Get a formatted date string (simple version)
    getFormattedDate(locale = 'de-DE') {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(this.date).toLocaleDateString(locale, options);
    }

    // Example method: Get event duration in minutes
    getDurationInMinutes() {
        if (!this.startTime || !this.endTime) {
            return 0;
        }
        const [startHours, startMinutes] = this.startTime.split(':').map(Number);
        const [endHours, endMinutes] = this.endTime.split(':').map(Number);

        const startDate = new Date(0, 0, 0, startHours, startMinutes);
        const endDate = new Date(0, 0, 0, endHours, endMinutes);

        let diff = endDate.getTime() - startDate.getTime(); // difference in milliseconds
        if (diff < 0) { // Handles events that cross midnight, assumes it's on the same logical day for simplicity
            diff += 24 * 60 * 60 * 1000; // Add 24 hours
        }
        return Math.round(diff / (1000 * 60));
    }
}

export default Event;
