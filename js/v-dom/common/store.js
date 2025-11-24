let state = {};
let listeners = {}; // key: state field, value: callbacks[]

export function initState(initial) {
  state = initial;
  listeners = {};
}

export function getState() {
  return state;
}

// 특정 키에 대한 watcher 등록
export function watch(key, fn) {
  if (!listeners[key]) {
    listeners[key] = [];
  }
  listeners[key].push(fn);
}

// setState 개선
export function setState(update) {
  const prevState = state;
  state = { ...state, ...update };

  // 바뀐 필드만 콜백 실행
  Object.keys(update).forEach((key) => {
    if (listeners[key]) {
      listeners[key].forEach((fn) => fn(state[key], prevState[key]));
    }
  });
}
