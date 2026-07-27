export type TourPlacement = "top" | "bottom" | "left" | "right" | "center";

export interface TourStep {
  id: string;
  // null = stay on whatever page the tour is already on (used by the
  // centered welcome/finish steps, which don't anchor to any page).
  route: string | null;
  // null = centered on screen, no spotlight (welcome/finish only).
  target: string | null;
  // Shown instead of `target` when the primary selector isn't in the DOM
  // (e.g. Analytics/Coach before a YouTube channel is connected) — the
  // tour points at the real Connect-YouTube prompt with different copy
  // rather than pretending the gated content exists.
  fallbackTarget?: string;
  placement: TourPlacement;
  title: string;
  body: string;
  fallbackBody?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    route: "/dashboard",
    target: null,
    placement: "center",
    title: "Hi, I'm Nova",
    body: "I'll walk you through CreatorOS — every stage from a first idea to a published video, in about a minute. You can skip anytime.",
  },
  {
    id: "nav",
    route: "/dashboard",
    target: '[data-tour="nav"]',
    placement: "bottom",
    title: "Your navigation",
    body: "Hover here anytime to jump between Dashboard, Analytics, Growth Coach, Idea Lab, Script Studio, and Pipeline.",
  },
  {
    id: "dashboard-quick-access",
    route: "/dashboard",
    target: '[data-tour="quick-access"]',
    placement: "top",
    title: "Quick access",
    body: "Your channel health at a glance, plus one click into whichever tool you need next.",
  },
  {
    id: "ideas",
    route: "/ideas",
    target: '[data-tour="idea-form"]',
    placement: "right",
    title: "Idea Lab",
    body: "Capture a video idea the moment you have it. You can also group ideas into a recurring series right from this form.",
  },
  {
    id: "scripts",
    route: "/scripts",
    target: '[data-tour="script-form"]',
    placement: "right",
    title: "Script Studio",
    body: "Write and version your scripts here, optionally linked back to the idea they came from.",
  },
  {
    id: "pipeline",
    route: "/pipeline",
    target: '[data-tour="pipeline-board"]',
    placement: "top",
    title: "Pipeline",
    body: "Every card moves through Idea → Scripted → Filming → Editing → Published. Drag a card between columns as it progresses.",
  },
  {
    id: "analytics",
    route: "/analytics",
    target: '[data-tour="range-picker"]',
    fallbackTarget: '[data-tour="connect-youtube"]',
    placement: "bottom",
    title: "Analytics",
    body: "Real numbers from your channel — pick a range and see views, subscribers, and watch time bucketed to match it.",
    fallbackBody:
      "Once you connect your YouTube channel, this is where your real views, subscribers, and watch time will show up.",
  },
  {
    id: "coach",
    route: "/coach",
    target: '[data-tour="coach-recommendations"]',
    fallbackTarget: '[data-tour="connect-youtube"]',
    placement: "top",
    title: "Growth Coach",
    body: "Recommendations grounded in your actual data, each labeled by how confident it is — never dressed up as more certain than it is.",
    fallbackBody:
      "Once you connect your YouTube channel, Growth Coach will turn your real data into recommendations here.",
  },
  {
    id: "finish",
    route: "/dashboard",
    target: null,
    placement: "center",
    title: "That's the whole system",
    body: "You're all set. Replay this tour anytime from the ? icon in your nav.",
  },
];
