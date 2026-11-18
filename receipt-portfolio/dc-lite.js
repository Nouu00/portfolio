/* dc-lite: tiny standalone runtime for the exported .dc.html pages */
(function () {
  class DCLogic {
    constructor() { this.props = {}; this.state = this.state || {}; }
    setState(p) { this.state = Object.assign({}, this.state, typeof p === 'function' ? p(this.state) : p); DCLite.update(this); }
    forceUpdate() { DCLite.update(this); }
  }
  const EVT = { onclick: 'click', onscroll: 'scroll', onmousemove: 'mousemove', onmousedown: 'mousedown', onmouseleave: 'mouseleave', onwheel: 'wheel', ontouchstart: 'touchstart', onpointerdown: 'pointerdown', onmouseenter: 'mouseenter', onpointermove: 'pointermove', onpointerup: 'pointerup' };
  const get = (vals, path) => path.trim().split('.').reduce((o, k) => (o == null ? o : o[k]), vals);
  const fill = (str, vals) => str.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, p) => { const v = get(vals, p); return v == null ? '' : String(v); });
  const DCLite = {
    mount(Comp, props, tplHtml, host) {
      const c = new Comp();
      c.props = props || {};
      c._dyn = [];
      let vals = c.renderVals();
      const wrap = document.createElement('div');
      wrap.innerHTML = tplHtml;
      // sc-for
      wrap.querySelectorAll('sc-for').forEach((f) => {
        const list = get(vals, (f.getAttribute('list') || '').replace(/[{}]/g, '')) || [];
        const as = f.getAttribute('as') || 'item';
        const inner = f.innerHTML;
        const frag = document.createElement('div');
        frag.innerHTML = list.map((it, i) => fill(inner, Object.assign({}, vals, { [as]: it, $index: i }))).join('');
        f.replaceWith(...frag.childNodes);
      });
      const all = [wrap].concat(Array.from(wrap.querySelectorAll('*')));
      all.forEach((el) => {
        if (el === wrap) return;
        Array.from(el.attributes).forEach((a) => {
          if (a.value.indexOf('{{') < 0) return;
          const name = a.name.toLowerCase();
          const key = a.value.replace(/[{}\s]/g, '');
          if (name === 'ref') { el.removeAttribute(a.name); c._refs = c._refs || []; c._refs.push([el, key]); return; }
          if (EVT[name]) { el.removeAttribute(a.name); el.addEventListener(EVT[name], (e) => { const fn = get(c.renderVals(), key); if (typeof fn === 'function') fn(e); }, name === 'onwheel' || name === 'ontouchstart' ? { passive: true } : false); return; }
          c._dyn.push([el, a.name, a.value]);
          el.setAttribute(a.name, fill(a.value, vals));
        });
      });
      const walker = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT);
      const texts = []; let n; while ((n = walker.nextNode())) if (n.nodeValue.indexOf('{{') >= 0) texts.push(n);
      texts.forEach((t) => { c._dyn.push([t, null, t.nodeValue]); t.nodeValue = fill(t.nodeValue, vals); });
      while (wrap.firstChild) host.appendChild(wrap.firstChild);
      (c._refs || []).forEach(([el, key]) => { const fn = get(vals, key); if (typeof fn === 'function') fn(el); });
      if (c.componentDidMount) c.componentDidMount();
      return c;
    },
    update(c) {
      if (!c._dyn) return;
      const vals = c.renderVals();
      c._dyn.forEach(([el, attr, tpl]) => { if (attr) el.setAttribute(attr, fill(tpl, vals)); else el.nodeValue = fill(tpl, vals); });
    }
  };
  window.DCLogic = DCLogic;
  window.DCLite = DCLite;
})();
