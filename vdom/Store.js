let state = {};
let subscribers = []; // 전체 업데이트용
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

  // 키 watcher
  Object.keys(update).forEach((key) => {
    if (listeners[key]) {
      listeners[key].forEach((fn) => fn(state[key], prevState[key]));
    }
  });

  // 전체 업데이트 구독자 실행
  subscribers.forEach((fn) => fn(state, prevState));
}

export function subscribe(fn) {
  subscribers.push(fn);

  // 반환된 함수를 호출하면 해당 구독을 해제한다.
  return () => {
    subscribers = subscribers.filter((sub) => sub !== fn);
  };
}
