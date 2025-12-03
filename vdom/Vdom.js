export function h(type, props = {}, ...children) {
  return { type, props, children };
}

export function p(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children.flat(),
  };
}

export function createDom(node) {
  if (node == null) return document.createTextNode("");
  if (typeof node === "string" || typeof node === "number") {
    return document.createTextNode(String(node));
  }

  const el = document.createElement(node.type);
  const props = node.props || {};

  Object.keys(props).forEach((k) => {
    const v = props[k];
    if (k.startsWith("on") && typeof v === "function") {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === "value") {
      el.value = v;
    } else if (k === "className") {
      el.setAttribute("class", v);
    } else if (k === "disabled") {
      el.disabled = !!v;
    } else if (k === "style" && typeof v === "object") {
      Object.assign(el.style, v);
    } else if (v != null) {
      el.setAttribute(k, v);
    }
  });

  (node.children || []).forEach((c) => el.appendChild(createDom(c)));
  return el;
}

export function changed(a, b) {
  if (a == null || b == null) return a !== b;
  if (typeof a !== typeof b) return true;
  if (typeof a === "string" || typeof a === "number") return a !== b;
  return a.type !== b.type;
}

export function updateElement(parent, newNode, oldNode, index = 0) {
  if (!parent) return;
  const existing = parent.childNodes ? parent.childNodes[index] : null;

  if (newNode == null) {
    if (existing) parent.removeChild(existing);
    return;
  }

  if (oldNode == null) {
    if (parent.nodeType !== Node.TEXT_NODE)
      parent.appendChild(createDom(newNode));
    return;
  }

  if (changed(newNode, oldNode)) {
    if (existing) parent.replaceChild(createDom(newNode), existing);
    else parent.appendChild(createDom(newNode));
    return;
  }

  if (typeof newNode === "string" || typeof newNode === "number") {
    if (existing && existing.nodeType === Node.TEXT_NODE) {
      if (existing.nodeValue !== String(newNode))
        existing.nodeValue = String(newNode);
    }
    return;
  }

  if (!existing || existing.nodeType !== Node.ELEMENT_NODE) return;

  patchProps(existing, newNode.props || {}, oldNode.props || {});
  // const newChildren = newNode.children || [];
  // const oldChildren = oldNode.children || [];
  // const max = Math.max(newChildren.length, oldChildren.length);
  // for (let i = 0; i < max; i++) {
  //   updateElement(existing, newChildren[i], oldChildren[i], i);
  // }

  // ==============================
  //   ⭐ Key 기반 children diff
  // ==============================
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];

  // oldChildren keyMap 생성
  const oldKeyMap = {};
  oldChildren.forEach((child, idx) => {
    const key = child?.props?.key;
    if (key != null) {
      oldKeyMap[key] = { vnode: child, index: idx };
    }
  });

  let lastPlacedIndex = 0;

  newChildren.forEach((newChild, newIdx) => {
    const key = newChild?.props?.key;

    // key가 없으면 fallback: index diff
    if (key == null) {
      updateElement(existing, newChild, oldChildren[newIdx], newIdx);
      return;
    }

    // key로 oldChild 찾기
    const mapped = oldKeyMap[key];
    if (mapped) {
      const oldIdx = mapped.index;
      const oldChild = mapped.vnode;

      // 기존 요소 diff
      updateElement(existing, newChild, oldChild, oldIdx);

      // 필요한 경우 DOM 위치 교체(앞에 이동 등)
      if (oldIdx < lastPlacedIndex) {
        const nodeToMove = existing.childNodes[oldIdx];
        const referenceNode = existing.childNodes[newIdx] || null;
        existing.insertBefore(nodeToMove, referenceNode);
      }

      lastPlacedIndex = Math.max(lastPlacedIndex, oldIdx);
    } else {
      // 새로운 노드 → 추가
      updateElement(existing, newChild, null, newIdx);
    }
  });

  // old 중에서 new에 없는 key → 삭제
  oldChildren.forEach((oldChild, oldIdx) => {
    const key = oldChild?.props?.key;
    if (key != null && !newChildren.some((n) => n?.props?.key === key)) {
      updateElement(existing, null, oldChild, oldIdx);
    }
  });
}

export function patchProps(el, newProps, oldProps) {
  // 1) oldProps 제거
  Object.keys(oldProps).forEach((k) => {
    if (!(k in newProps)) {
      if (k.startsWith("on"))
        el.removeEventListener(k.slice(2).toLowerCase(), oldProps[k]);
      else if (k === "disabled") {
        el.removeAttribute("disabled");
        el.disabled = false;
      } else if (k === "value") {
        el.value = "";
      } else if (k === "style") {
        el.removeAttribute("style");
      } else if (k === "className") {
        el.removeAttribute("class");
      } else {
        el.removeAttribute(k);
      }
    }
  });

  // 2) newProps 추가/업데이트
  // 2) newProps 추가/업데이트
  Object.keys(newProps).forEach((k) => {
    const nv = newProps[k],
      ov = oldProps[k];
    if (nv === ov) return;

    if (k.startsWith("on") && typeof nv === "function") {
      if (typeof ov === "function") {
        el.removeEventListener(k.slice(2).toLowerCase(), ov);
      }
      el.addEventListener(k.slice(2).toLowerCase(), nv);
    } else if (k === "value") {
      // 🔥 input/textarea 값 강제 동기화
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        if (el.value !== nv) el.value = nv;
      }
      // textarea는 textContent도 동기화 필요
      if (el.tagName === "TEXTAREA") {
        if (el.textContent !== nv) el.textContent = nv;
      }
    } else if (k === "disabled") {
      if (nv) {
        el.setAttribute("disabled", "");
        el.disabled = true;
      } else {
        el.removeAttribute("disabled");
        el.disabled = false;
      }
    } else if (k === "style") {
      el.removeAttribute("style"); // 🔥 style 완전 삭제 후,
      if (nv && typeof nv === "object") {
        for (const [key, value] of Object.entries(nv)) {
          el.style[key] = value; // 필요한 스타일만 다시 적용
        }
      }
    } else if (k === "className") {
      el.setAttribute("class", nv);
    } else if (nv != null) {
      el.setAttribute(k, nv);
    }
  });
}

export function render(vnode, container) {
  const oldVNode = container._prevVNode;

  if (!oldVNode) {
    // 최초 렌더 (전체 생성)
    const dom = createDom(vnode);
    container.appendChild(dom);
  } else {
    // diff & patch
    updateElement(container, vnode, oldVNode);
  }

  // 새 vnode 기억
  container._prevVNode = vnode;
}
