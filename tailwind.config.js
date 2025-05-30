/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./src/components/ui/**/*.{js,jsx,ts,tsx}", // Path to shadcn/ui components
    ],
    theme: {
        container: { // Optional: From shadcn docs, good practice
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            keyframes: {
                "accordion-down": {
                    from: { height: "0px" }, // Changed from "0" to "0px" for stricter CSS
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0px" }, // Changed from "0" to "0px"
                },
                "content-show": {
                    from: { opacity: "0", transform: "translateY(-10px) scale(0.98)" }, // Slightly different animation
                    to: { opacity: "1", transform: "translateY(0px) scale(1)" },
                },
                "content-hide": {
                    from: { opacity: "1", transform: "translateY(0px) scale(1)" },
                    to: { opacity: "0", transform: "translateY(-10px) scale(0.98)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "content-show": "content-show 0.2s ease-out",
                "content-hide": "content-hide 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}