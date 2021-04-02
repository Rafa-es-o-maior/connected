function setup(app, container)
{
    container.addToast = function(text)
    {
        toast_lifespan = 1000;
        toast_name = text;
        toast_width = calculateWidth(text);
    }

    function calculateWidth(text)
    {
        app.ctx.font = toast_size + 'px serif';

        let metrics = app.ctx.measureText(text);

        return metrics.width;
    }

    let toast_lifespan = 0;
    let toast_width = null;
    let toast_name = "";
    let toast_size = 50;

    function draw(ev)
    {
        toast_lifespan = Math.max(0, toast_lifespan - ev.delta);

        if(toast_lifespan > 0)
        {
            app.ctx.font = toast_size + 'px serif';
            app.ctx.textAlign = "center";
            app.ctx.textBaseline = "top";

            app.ctx.fillStyle = "#000000";

            let ypos = app.mouseY / app.height > 0.5 ? app.height * 0.1 - toast_size : app.height * 0.9;

            app.ctx.fillRect(app.width / 2 - toast_width / 2, ypos, toast_width, toast_size);

            app.ctx.fillStyle = "white";

            app.ctx.fillText(toast_name, app.width / 2, ypos);
        }
    }

    app.event.addEventListener("draw", draw, 0);
}


export {setup};