export function h(type, props = {}, ...children) {
  return { type, props, children };
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
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const max = Math.max(newChildren.length, oldChildren.length);
  for (let i = 0; i < max; i++) {
    updateElement(existing, newChildren[i], oldChildren[i], i);
  }
}

export function patchProps(el, newProps, oldProps) {
  Object.keys(oldProps).forEach((k) => {
    if (!(k in newProps)) {
      if (k.startsWith("on"))
        el.removeEventListener(k.slice(2).toLowerCase(), oldProps[k]);
      else if (k === "disabled") el.disabled = false;
      else if (k === "value") el.value = "";
      else if (k === "style") el.removeAttribute("style");
      else if (k === "className") el.removeAttribute("class");
      else el.removeAttribute(k);
    }
  });

  Object.keys(newProps).forEach((k) => {
    const nv = newProps[k],
      ov = oldProps[k];
    if (nv === ov) return;

    if (k.startsWith("on") && typeof nv === "function") {
      if (typeof ov === "function")
        el.removeEventListener(k.slice(2).toLowerCase(), ov);
      el.addEventListener(k.slice(2).toLowerCase(), nv);
    } else if (k === "value") {
      if (el.value !== nv) el.value = nv;
    } else if (k === "disabled") {
      el.disabled = !!nv;
    } else if (k === "style" && typeof nv === "object") {
      el.removeAttribute("style");
      Object.assign(el.style, nv);
    } else if (k === "className") {
      el.setAttribute("class", nv);
    } else if (nv != null) {
      el.setAttribute(k, nv);
    }
  });
}
