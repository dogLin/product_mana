/**
 * 获取触发事件鼠标相对于canvas本身的x,y坐标值
 * @param event 事件
 *@param  currentElement 当前元素
 */
export function getRelativeMouse(event,currentElement) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while (currentElement = currentElement.offsetParent)

    canvasX = event.clientX - totalOffsetX;
    canvasY = event.clientY - totalOffsetY;

    console.log({ x: canvasX, y: canvasY })
    return { x: canvasX, y: canvasY }
}