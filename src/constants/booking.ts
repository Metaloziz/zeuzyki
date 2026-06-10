export const PHONE_REGEX =
  /^\+375\s?\(?\d{2}\)?\s?\d{3}-?\d{2}-?\d{2}$/;

export const BOOKING_LIMITS = {
  maxPeople: 20,
  maxKids: 10,
  minPeople: 1,
} as const;
