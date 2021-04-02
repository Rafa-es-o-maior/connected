function setup(app)
{
    function draw()
    {
        let bounds = app.world.math.visibleBounds();

        app.ctx.lineWidth = 1;
        app.ctx.strokeStyle = "#000000";
        app.ctx.fillStyle = "#aaaaaa";

        for(let y = Math.max(bounds.top, 0); y < Math.min(bounds.bottom, app.world.loadedWorld.map.height); y++)
        {
            for(let x = Math.max(bounds.left, 0); x < Math.min(bounds.right, app.world.loadedWorld.map.width); x++)
            {
                let r = [app.pan.x + x * app.tilesize, app.pan.y + y * app.tilesize, app.tilesize, app.tilesize];
                app.ctx.fillRect(...r);
                app.ctx.strokeRect(...r);
            }
        }

        app.ctx.strokeStyle = "#00ff00";

        app.ctx.beginPath();
        app.ctx.moveTo(app.pan.x - 10, app.pan.y);
        app.ctx.lineTo(app.pan.x + 10, app.pan.y);
        app.ctx.moveTo(app.pan.x, app.pan.y - 10);
        app.ctx.lineTo(app.pan.x, app.pan.y + 10);
        app.ctx.stroke();
    }

    app.event.addEventListener("draw", draw, 4);
}


export {setup};