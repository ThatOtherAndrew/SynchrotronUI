const FIRST_VISIT_KEY = "first_visit";

export function isFirstVisit(): boolean {
    try {
        const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
        return hasVisited === null;
    } catch (error) {
        console.warn("localStorage not available:", error);
        // assume not first visit by default
        return false;
    }
}

export function markAsVisited(): void {
    try {
        localStorage.setItem(FIRST_VISIT_KEY, "true");
    } catch (error) {
        console.warn("Could not save visit status to localStorage:", error);
    }
}
