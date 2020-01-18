window.sDebug = true;
class SpeedIndex {
  constructor() {
    this.pixels =
      Math.max(document.documentElement.clientWidth, window.innerWidth || 0) *
      Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    this.rects = [
      {
        area: 0,
        time: Date.now()
      }
    ];
    this.callback = this.callback.bind(this);
    this.getArea = this.getArea.bind(this);
    this.dfs = this.dfs.bind(this);
    this.observe = this.observe.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.calculate = this.calculate.bind(this);
    this.observer = new MutationObserver(this.callback);
  }
  observe(target) {
    this.dfs(target);
    this.observer.observe(target, { childList: true, subtree: true });
  }
  disconnect() {
    this.observer.disconnect();
  }
  calculate() {
    let mark = 0;
    for (let i = 1; i < this.rects.length; i++) {
      let timeSpan = this.rects[i].time - this.rects[i - 1].time;
      mark += (1 - this.rects[i].area / this.pixels) * timeSpan;
    }
    console.log(this.rects);
    return mark;
  }
  callback(mutations) {
    let isChange = mutations.find(i => i.addedNodes.length > 0);
    if (isChange) {
      let area = this.dfs(document.body);
      this.rects.push({
        area,
        time: Date.now()
      });
    }
  }
  /**
   *
   * @param {Element} ele
   */
  dfs(ele) {
    let tagName = ele.tagName;
    if (
      "SCRIPT" === tagName ||
      "STYLE" === tagName ||
      "META" === tagName ||
      "HEAD" === tagName
    ) {
      return 0;
    }

    let curArea = this.getArea(ele);

    // 剪枝
    if (ele.nodeType === 1 && curArea === 0) {
      return 0;
    }

    // 如果有文字
    if (ele.nodeValue) {
      // 换行符直接0
      if (ele.nodeValue.indexOf("\n") >= 0) {
        return 0;
      }
      // 如果type为 1
      if (ele.nodeType === 1) {
        if (sDebug) {
          console.log(ele);
        }
        return curArea;
      } else if (ele.parentNode && ele.parentNode.tagName !== "BODY") {
        if (sDebug) {
          console.log(ele.parentNode);
        }
        return this.getArea(ele.parentNode);
      } else {
        return 0;
      }
    }

    // 其他视觉元素
    if (
      tagName === "IMG" ||
      tagName === "SVG" ||
      tagName === "VIDEO" ||
      tagName === "CANVAS"
    ) {
      if (sDebug) {
        console.log(ele);
      }
      return curArea;
    }

    let childs = ele.childNodes;

    //计算子元素综合
    let area = 0;

    for (let i = 0; i < childs.length; i++) {
      area += this.dfs(childs[i]);
    }

    return Math.min(area, curArea);
  }
  getArea(el) {
    if (el.getBoundingClientRect) {
      var elRect = el.getBoundingClientRect();
      var intersect = {
        top: Math.max(elRect.top, 0),
        left: Math.max(elRect.left, 0),
        bottom: Math.min(
          elRect.bottom,
          window.innerHeight || document.documentElement.clientHeight
        ),
        right: Math.min(
          elRect.right,
          window.innerWidth || document.documentElement.clientWidth
        )
      };
      if (
        intersect.bottom <= intersect.top ||
        intersect.right <= intersect.left
      ) {
        return 0;
      } else {
        return (
          (intersect.bottom - intersect.top) *
          (intersect.right - intersect.left)
        );
      }
    }
    return 0;
  }
}
