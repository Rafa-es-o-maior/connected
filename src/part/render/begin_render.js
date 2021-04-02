function setup(app)
{
    function draw()
    {
        app.ctx.fillStyle = "#00000055";
        app.ctx.fillRect(0, 0, app.width, app.height);
    }

    app.event.addEventListener("draw", draw, 5);
}


export {setup};