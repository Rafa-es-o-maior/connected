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

        bounds.top = Math.max(TL.y, 0);
        bounds.left = Math.max(TL.x, 0);
        bounds.right = Math.min(BR.x, app.world.loadedWorld.map.width);
        bounds.bottom = Math.min(BR.y, app.world.loadedWorld.map.height);

        return bounds;
    }
}


export {setup};