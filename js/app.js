import { DONOR_DB, MOCK_DB_LAST_UPDATED } from './donations.js';

const SHOW_RUNNER_ANIMATION = false; // Toggle true/false to show/hide running avatar

function getRelativeTimeString(previousTimestamp) {
    const current = new Date().getTime(); // Synced standard clock runtime lock
    const elapsed = current - previousTimestamp;

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    if (elapsed < msPerMinute) {
        return 'Just now';
    } else if (elapsed < msPerHour) {
        const mins = Math.round(elapsed / msPerMinute);
        return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    } else if (elapsed < msPerDay) {
        const hours = Math.round(elapsed / msPerHour);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (elapsed < msPerMonth) {
        const days = Math.round(elapsed / msPerDay);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (elapsed < msPerYear) {
        const months = Math.round(elapsed / msPerMonth);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
        const years = Math.round(elapsed / msPerYear);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }
}

function getFormattedLocalTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/New_York',
        timeZoneName: 'short',
    });
}

// ----------------------------------------------------
// ✨ COMPREHENSIVE THEME AND COLOR SCHEME ENGINE
// ----------------------------------------------------
function updateThemeControllerUI(mode) {
    const pill = document.getElementById("theme-pill");
    const lightBtn = document.getElementById("theme-btn-light");
    const systemBtn = document.getElementById("theme-btn-system");
    const darkBtn = document.getElementById("theme-btn-dark");

    // Reset text states
    lightBtn.classList.remove("text-slate-800", "dark:text-white");
    systemBtn.classList.remove("text-slate-800", "dark:text-white");
    darkBtn.classList.remove("text-slate-800", "dark:text-white");

    if (mode === "light") {
        pill.style.left = "2px";
        lightBtn.classList.add("text-slate-800", "dark:text-white");
    } else if (mode === "system") {
        pill.style.left = "calc(33.333% + 0.5px)";
        systemBtn.classList.add("text-slate-800", "dark:text-white");
    } else if (mode === "dark") {
        pill.style.left = "calc(66.666% - 1.5px)";
        darkBtn.classList.add("text-slate-800", "dark:text-white");
    }
}

function setThemeMode(mode) {
    localStorage.setItem("manoaj_theme", mode);
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    if (mode === "dark" || (mode === "system" && darkQuery.matches)) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }

    updateThemeControllerUI(mode);
}

// Connect listener to track live changes in macOS / System themes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    const currentSetting = localStorage.getItem("manoaj_theme") || "system";
    if (currentSetting === "system") {
        if (e.matches) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }
});

// Initialize configuration during page DOM layout execution
function initThemeConfiguration() {
    const activeSetting = localStorage.getItem("manoaj_theme") || "system";
    setThemeMode(activeSetting);
}

// ----------------------------------------------------
// ACCORDION TOGGLING ENGINE
// ----------------------------------------------------
function toggleAccordion(id) {
    const panel = document.getElementById(`panel-${id}`);
    const chevron = document.getElementById(`chevron-${id}`);
    const isExpanded = panel.classList.contains("hidden");

    if (isExpanded) {
        panel.classList.remove("hidden");
        chevron.classList.add("rotate-180");
    } else {
        panel.classList.add("hidden");
        chevron.classList.remove("rotate-180");
    }
}

// ----------------------------------------------------
// DYNAMIC DATA SYNCHRONIZATION PIPELINE
// ----------------------------------------------------
async function syncDonationsData() {
    const syncBadge = document.getElementById("sync-badge");
    const syncStatusText = document.getElementById("sync-status-text");
    const syncSpinner = document.getElementById("sync-spinner");
    const feedUpdateTime = document.getElementById("feed-update-time");

    // Visual indicator that fetch is actively loading
    syncBadge.className = "bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 shrink-0 self-start sm:self-auto flex items-center gap-1.5 transition-all animate-pulse";
    syncStatusText.innerText = "Syncing Donor Registry...";

    setTimeout(() => {
        // Transition Skeletons off and reveal main contents
        document.getElementById("stats-skeleton").classList.add("hidden");
        document.getElementById("stats-content").classList.remove("hidden");

        // Set verified status representing colocated ledger source of truth
        syncSpinner.classList.add("hidden");
        syncBadge.className = "bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 shrink-0 self-start sm:self-auto flex items-center gap-1.5";
        syncStatusText.innerText = "Verified Records";

        feedUpdateTime.innerText = `Registry last updated: ${getFormattedLocalTime(new Date(MOCK_DB_LAST_UPDATED).getTime())}`;

        initDonationMetrics();
    }, 1000); // 1-second delay for premium animation pacing
}

function initDonationMetrics() {
    const totalRaised = DONOR_DB.reduce((acc, curr) => acc + curr.amount, 0);
    const targetGoal = 2500;
    const progressPercent = Math.min((totalRaised / targetGoal) * 100, 100);
    const backerCount = DONOR_DB.length;

    document.getElementById("progress-raised-text").innerText = `$${totalRaised.toLocaleString()}`;
    document.getElementById("progress-percent-text").innerText = `${progressPercent.toFixed(1)}% Complete`;
    document.getElementById("progress-backers-text").innerText = `${backerCount} donor${backerCount != 1 ? 's' : ''} backed`;

    setTimeout(() => {
        document.getElementById("progress-bar").style.width = `${progressPercent}%`;

        // Handle runner visibility according to local user configuration
        const runner = document.getElementById("runner-indicator");
        if (runner) {
            if (SHOW_RUNNER_ANIMATION) {
                runner.style.display = "block";
            } else {
                runner.style.display = "none";
            }
        }
    }, 100);

    renderDonationFeed();
}

function renderDonationFeed() {
    const feedContainer = document.getElementById("donations-feed");
    feedContainer.innerHTML = ""; // Clear loader skeletons

    DONOR_DB.forEach((donation) => {
        const donationCard = document.createElement("div");
        donationCard.className = "flex items-start justify-between gap-4 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors duration-200";

        const initials = donation.name === "Anonymous" ? "?" : donation.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
        const calculatedRelativeTime = donation.timestamp ? getRelativeTimeString(new Date(donation.timestamp).getTime()) : '';

        donationCard.innerHTML = `
          <div class="flex items-start gap-3.5">
            <span class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0 select-none transition-colors">
              ${initials}
            </span>
            <div class="space-y-1 self-center">
              <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 transition-colors">${escapeHTML(donation.name)}</h4>
              ${donation.message ? `<p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic pr-4 transition-colors">"${escapeHTML(donation.message)}"</p>` : ''}
              <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">${calculatedRelativeTime}</span>
            </div>
          </div>
          <div class="text-right shrink-0">
            <span class="text-base font-black text-emerald-600 dark:text-emerald-400">$${donation.amount}</span>
          </div>
        `;
        feedContainer.appendChild(donationCard);
    });
}

// Protection helper for sanitizing DOM injection strings
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// ----------------------------------------------------
// LIVE DYNAMIC COUNTDOWN ENGINE
// ----------------------------------------------------
// Target: Chicago Marathon (Oct 11, 2026, 08:00:00 Central Standard Time)
const chicagoMarathonDate = new Date("2026-10-11T08:00:00-05:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = chicagoMarathonDate - now;

    if (distance < 0) {
        document.getElementById("countdown-container").innerHTML = `
          <div class="col-span-4 bg-emerald-500/10 border border-emerald-500/20 py-3 rounded-xl text-xs font-bold text-emerald-400 uppercase tracking-wider text-center">
            Race Day is Here!
          </div>
        `;
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("countdown-days").innerText = String(days).padStart(2, '0');
    document.getElementById("countdown-hours").innerText = String(hours).padStart(2, '0');
    document.getElementById("countdown-mins").innerText = String(minutes).padStart(2, '0');
    document.getElementById("countdown-secs").innerText = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ----------------------------------------------------
// RESPONSIVE DIALOG/DRAWER CONTROLLER
// ----------------------------------------------------
const modal = document.getElementById("donation-modal");
const backdrop = document.getElementById("modal-backdrop");
const card = document.getElementById("modal-card");

function openDonationModal() {
    modal.classList.remove("invisible");
    modal.classList.add("flex"); // Force flex-centered layout on all screens
    document.body.classList.add("modal-open");

    setTimeout(() => {
        backdrop.classList.add("opacity-100");
        card.classList.remove("scale-95", "translate-y-4", "opacity-0");
        card.classList.add("scale-100", "translate-y-0", "opacity-100");
    }, 10);
}

function closeDonationModal() {
    backdrop.classList.remove("opacity-100");
    card.classList.add("scale-95", "translate-y-4", "opacity-0");
    card.classList.remove("scale-100", "translate-y-0", "opacity-100");

    setTimeout(() => {
        modal.classList.add("invisible");
        modal.classList.remove("flex");
        document.body.classList.remove("modal-open");
    }, 150); // Crisp, snappy transition timing aligned with JS trigger (150ms)
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("invisible")) {
        closeDonationModal();
    }
});


document.getElementById('theme-btn-light').addEventListener('click', () => { setThemeMode('light') });
document.getElementById('theme-btn-system').addEventListener('click', () => { setThemeMode('system') });
document.getElementById('theme-btn-dark').addEventListener('click', () => { setThemeMode('dark') });
document.getElementById('donate-now').addEventListener('click', () => { openDonationModal() });
document.getElementById('back-this-runner').addEventListener('click', () => { openDonationModal() });
document.getElementById('modal-backdrop').addEventListener('click', () => { closeDonationModal() });
document.getElementById('close-modal-dialog').addEventListener('click', () => { closeDonationModal() });
document.getElementById('go-back-to-page').addEventListener('click', () => { closeDonationModal() });
document.getElementById('toggle-chicago').addEventListener('click', () => { toggleAccordion('chicago') });
document.getElementById('toggle-nyc').addEventListener('click', () => { toggleAccordion('nyc') });

// Run setup sequences
window.onload = function () {
    initThemeConfiguration();
    syncDonationsData();
}