function setup(app, container)
{
    container.screenToPosition = function(x, y)
    {
        return {x: Math.floor((x - app.pan.x) / app.tilesize), y: Math.floor((y - app.pan.y) / app.tilesize)};
    }

    container.positionToScreen = function(x, y)
    {
        return {x: app.pan.x + x * app.tilesize, y: app.pan.y + y * app.tilesize};
    }

    container.visibleBounds = function()
    {
        let bounds = {};

        let TL = container.screenToPosition(0, 0);
        let BR = container.screenToPosition(app.width + app.tilesize - 1, app.height + app.tilesize - 1);

        bounds.top = TL.y;
        bounds.left = TL.x;
        bounds.right = BR.x;
        bounds.bottom = BR.y;

        return bounds;
    }
}


export {setup};