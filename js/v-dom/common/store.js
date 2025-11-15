let state = {};
let listeners = [];

export function initState(initial) {
  state = initial;
}

export function getState() {
  return state;
}

export function setState(update) {
  state = { ...state, ...update };
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.push(fn);
}
