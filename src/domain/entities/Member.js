class Member {
    /**
     * @param {string} name - The name of the member.
     * @param {string} birthday - The birthday of the member in 'YYYY-MM-DD' or 'MM-DD' format.
     * @param {string|number|null} id - Optional ID for the member.
     */
    constructor(name, birthday, id = null) {
        this.id = id || `member-${name.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 9)}`; // Auto-generate ID if not provided
        this.name = name;
        this.birthday = birthday; // Store as 'YYYY-MM-DD' or 'MM-DD'
    }

    // Example method: Get the birth month and day
    getBirthMonthDay() {
        if (this.birthday.length === 10) { // YYYY-MM-DD
            return this.birthday.substring(5); // MM-DD
        }
        return this.birthday; // Assumes MM-DD
    }

    // Example method: Check if birthday is today (ignoring year)
    isBirthdayToday() {
        const today = new Date();
        const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
        const currentDay = today.getDate().toString().padStart(2, '0');
        const todayMonthDay = `${currentMonth}-${currentDay}`;

        return this.getBirthMonthDay() === todayMonthDay;
    }
}

export default Member;
